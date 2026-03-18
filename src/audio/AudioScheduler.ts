/**
 * AudioScheduler — sample-accurate lookahead scheduler.
 *
 * Uses the "two clocks" pattern (Chris Wilson, Web Audio spec):
 *  - A fast `setInterval` (~25ms) looks ahead into the future
 *  - Events are scheduled via Web Audio's `ctx.currentTime` with sample precision
 *  - rAF is used ONLY for UI updates (playhead position), never for timing
 *
 * The scheduler owns all time-critical concerns:
 *  - Metronome click scheduling (lookahead)
 *  - MIDI note scheduling (lookahead, per-note oscillators)
 *  - Audio clip scheduling (immediate, buffer-source start times)
 *  - Loop boundary detection and re-scheduling
 */

import type { SessionTrack } from "@/types/studio";
import type { Instrument } from "./instruments/Instrument";

/* ── Constants ── */

/** How far ahead (seconds) to schedule events */
const LOOKAHEAD_SEC = 0.1;

/** How often (ms) the scheduler interval fires */
const SCHEDULE_INTERVAL_MS = 25;

/* ── Types ── */

export interface SchedulerConfig {
  tempo: number;
  beatsPerBar: number;
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
  metronomeEnabled: boolean;
}

export interface ScheduledMidiNote {
  osc: OscillatorNode;
  gain: GainNode;
}

export interface ScheduledAudioSource {
  source: AudioBufferSourceNode;
  trackId: string;
}

/** Callback to connect a node into the correct track's signal chain */
export type ConnectToTrack = (trackId: string, node: AudioNode) => void;

/** Callback to connect a node to the master output */
export type ConnectToMaster = (node: AudioNode) => void;

/** Callback to get the instrument assigned to a track */
export type GetTrackInstrument = (trackId: string) => Instrument | null;

/**
 * Minimal interface for the audio graph that the scheduler needs.
 * This decouples the scheduler from the AudioEngine's internal structure.
 */
export interface AudioGraph {
  connectToTrack: ConnectToTrack;
  connectToMaster: ConnectToMaster;
  fetchBuffer: (url: string) => Promise<AudioBuffer | null>;
  getTrackInstrument: GetTrackInstrument;
}

/* ════════════════════════════════════════════
 *  AudioScheduler
 * ════════════════════════════════════════════ */

export class AudioScheduler {
  private ctx: AudioContext;
  private graph: AudioGraph;
  private config: SchedulerConfig;

  // ── Timer state ──
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private _isRunning = false;

  // ── Transport timing ──
  private _startContextTime = 0; // ctx.currentTime when play() was called
  private _startBeatOffset = 0;  // beat position at play() start

  // ── Scheduled events ──
  private scheduledMidi: ScheduledMidiNote[] = [];
  private scheduledAudio: ScheduledAudioSource[] = [];

  // ── Lookahead tracking ──
  private lastScheduledMetronomeBeat = -1;
  private lastScheduledUpToBeat = -1;

  // ── Track data ──
  private tracks: SessionTrack[] = [];

  // ── Loop wrap tracking ──
  private loopGeneration = 0;

  constructor(ctx: AudioContext, graph: AudioGraph, config: SchedulerConfig) {
    this.ctx = ctx;
    this.graph = graph;
    this.config = { ...config };
  }

  /* ── Public getters ── */

  get isRunning() { return this._isRunning; }

  /** Current beat position based on AudioContext clock (sample-accurate) */
  get currentBeat(): number {
    if (!this._isRunning) return this._startBeatOffset;
    const elapsed = this.ctx.currentTime - this._startContextTime;
    let beat = this._startBeatOffset + elapsed * (this.config.tempo / 60);

    // Apply loop wrapping for the getter too
    if (this.config.loopEnabled && this.config.loopEnd > this.config.loopStart) {
      const loopLen = this.config.loopEnd - this.config.loopStart;
      if (beat >= this.config.loopEnd) {
        beat = this.config.loopStart + ((beat - this.config.loopStart) % loopLen);
      }
    }
    return beat;
  }

  /* ── Configuration updates (safe during playback) ── */

  updateConfig(partial: Partial<SchedulerConfig>) {
    // If tempo changes during playback, recalculate startContextTime to keep beat position
    if (partial.tempo !== undefined && partial.tempo !== this.config.tempo && this._isRunning) {
      const currentBeat = this.currentBeat;
      this.config.tempo = partial.tempo;
      this._startBeatOffset = currentBeat;
      this._startContextTime = this.ctx.currentTime;
      // Reschedule from new position
      this.clearAllScheduled();
      this.scheduleClips(currentBeat);
    }

    Object.assign(this.config, partial);
  }

  updateTracks(tracks: SessionTrack[]) {
    this.tracks = tracks;
  }

  updateContext(ctx: AudioContext) {
    this.ctx = ctx;
  }

  /* ════════════════════════════════════════════
   *  Transport
   * ════════════════════════════════════════════ */

  start(fromBeat: number) {
    if (this._isRunning) this.stopScheduler();

    this._startBeatOffset = fromBeat;
    this._startContextTime = this.ctx.currentTime;
    this._isRunning = true;
    this.lastScheduledMetronomeBeat = Math.floor(fromBeat) - 1;
    this.lastScheduledUpToBeat = fromBeat;
    this.loopGeneration = 0;

    // Initial clip scheduling
    this.scheduleClips(fromBeat);

    // Fire an immediate tick so beat-0 events are scheduled before the clock advances
    this.schedulerTick();

    // Start lookahead interval
    this.intervalId = setInterval(() => this.schedulerTick(), SCHEDULE_INTERVAL_MS);
  }

  stopScheduler() {
    this._isRunning = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.clearAllScheduled();
  }

  pause(): number {
    const beat = this.currentBeat;
    this.stopScheduler();
    this._startBeatOffset = beat;
    return beat;
  }

  seekTo(beat: number) {
    if (this._isRunning) {
      this._startBeatOffset = beat;
      this._startContextTime = this.ctx.currentTime;
      this.lastScheduledMetronomeBeat = Math.floor(beat) - 1;
      this.lastScheduledUpToBeat = beat;
      this.clearAllScheduled();
      this.scheduleClips(beat);
    } else {
      this._startBeatOffset = beat;
    }
  }

  /* ════════════════════════════════════════════
   *  Core scheduler tick (runs on setInterval)
   * ════════════════════════════════════════════ */

  private schedulerTick() {
    if (!this._isRunning) return;

    const now = this.ctx.currentTime;
    const bps = this.config.tempo / 60;
    const elapsed = now - this._startContextTime;
    const currentBeat = this._startBeatOffset + elapsed * bps;

    // Calculate how far ahead to schedule (in beats)
    const lookaheadBeats = LOOKAHEAD_SEC * bps;
    const scheduleUpToBeat = currentBeat + lookaheadBeats;

    // ── Loop boundary detection ──
    if (this.config.loopEnabled && this.config.loopEnd > this.config.loopStart) {
      if (currentBeat >= this.config.loopEnd) {
        // Wrap back to loop start
        const loopLen = this.config.loopEnd - this.config.loopStart;
        const overshoot = currentBeat - this.config.loopEnd;
        const newBeat = this.config.loopStart + (overshoot % loopLen);

        this._startBeatOffset = newBeat;
        this._startContextTime = now;
        this.lastScheduledMetronomeBeat = Math.floor(newBeat) - 1;
        this.lastScheduledUpToBeat = newBeat;
        this.loopGeneration++;

        // Reschedule everything from loop start
        this.clearAllScheduled();
        this.scheduleClips(newBeat);
        return; // will pick up metronome on next tick
      }
    }

    // ── Metronome scheduling (lookahead) ──
    this.scheduleMetronome(currentBeat, scheduleUpToBeat, now);

    // ── MIDI scheduling (lookahead for notes in the window) ──
    this.scheduleMidiInWindow(this.lastScheduledUpToBeat, scheduleUpToBeat, now);

    this.lastScheduledUpToBeat = scheduleUpToBeat;
  }

  /* ════════════════════════════════════════════
   *  Metronome — sample-accurate lookahead
   * ════════════════════════════════════════════ */

  private scheduleMetronome(fromBeat: number, toBeat: number, contextNow: number) {
    if (!this.config.metronomeEnabled) return;

    const bps = this.config.tempo / 60;
    const startWholeBeat = Math.floor(fromBeat);
    const endWholeBeat = Math.floor(toBeat);

    for (let wholeBeat = startWholeBeat; wholeBeat <= endWholeBeat; wholeBeat++) {
      if (wholeBeat <= this.lastScheduledMetronomeBeat) continue;
      if (wholeBeat < 0) continue;

      // Loop bounds check
      if (this.config.loopEnabled) {
        if (wholeBeat >= this.config.loopEnd) break;
        if (wholeBeat < this.config.loopStart) continue;
      }

      this.lastScheduledMetronomeBeat = wholeBeat;

      // Calculate exact audioContext time for this beat
      const beatDelta = wholeBeat - this._startBeatOffset;
      const whenSec = this._startContextTime + beatDelta / bps;

      // Don't schedule far in the past (Web Audio handles slightly-past times gracefully)
      if (whenSec < contextNow - 0.5) continue;

      this.scheduleClick(whenSec, wholeBeat);
    }
  }

  private scheduleClick(when: number, beat: number) {
    const isDownbeat = beat % this.config.beatsPerBar === 0;
    const freq = isDownbeat ? 1200 : 800;
    const vol = isDownbeat ? 0.12 : 0.06;
    const dur = 0.02;

    const osc = this.ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = freq;

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + dur);

    osc.connect(g);
    this.graph.connectToMaster(g);
    osc.start(when);
    osc.stop(when + dur + 0.01);
  }

  /* ════════════════════════════════════════════
   *  MIDI note scheduling — lookahead window
   * ════════════════════════════════════════════ */

  private scheduleMidiInWindow(fromBeat: number, toBeat: number, contextNow: number) {
    const bps = this.config.tempo / 60;

    for (const track of this.tracks) {
      if (track.type === "return" || track.type === "master") continue;

      // Check if this track has an instrument
      const instrument = this.graph.getTrackInstrument(track.id);

      for (const clip of track.clips || []) {
        if (!clip.is_midi || !clip.midi_data) continue;

        const raw = clip.midi_data;
        const notes: Array<{ start?: number; duration?: number; pitch?: number; velocity?: number }> =
          Array.isArray(raw) ? raw
            : (typeof raw === "object" && raw !== null && "notes" in (raw as Record<string, unknown>))
              ? ((raw as Record<string, unknown>).notes as typeof notes)
              : [];

        for (const note of notes) {
          const absStart = clip.start_beats + (note.start ?? 0);
          const dur = note.duration ?? 0.25;
          const absEnd = absStart + dur;

          // Only schedule notes whose START falls in [fromBeat, toBeat)
          if (absStart < fromBeat || absStart >= toBeat) continue;
          if (absEnd <= fromBeat) continue;

          const pitch = note.pitch ?? 60;
          const vel = note.velocity ?? 100;

          const beatDelta = absStart - this._startBeatOffset;
          const noteWhen = this._startContextTime + beatDelta / bps;
          const noteDurSec = dur / bps;

          // Don't schedule in the past
          if (noteWhen + noteDurSec < contextNow) continue;

          if (instrument) {
            // Use the track's instrument for rendering
            instrument.scheduleNote({
              pitch,
              velocity: vel,
              when: Math.max(contextNow, noteWhen),
              duration: noteDurSec,
            });
          } else {
            // Fallback to basic oscillator
            this.scheduleOscNote(track.id, noteWhen, noteDurSec, pitch, vel);
          }
        }
      }
    }
  }

  private scheduleOscNote(trackId: string, when: number, durSec: number, pitch: number, velocity: number) {
    const freq = 440 * Math.pow(2, (pitch - 69) / 12);
    const vol = (velocity / 127) * 0.12;

    const osc = this.ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;

    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(vol, when + 0.003);

    const releaseTime = when + durSec;
    g.gain.setValueAtTime(vol, releaseTime - 0.005);
    g.gain.exponentialRampToValueAtTime(0.001, releaseTime + 0.02);

    osc.connect(g);

    try {
      this.graph.connectToTrack(trackId, g);
    } catch {
      // Fallback to master if track connection fails
      this.graph.connectToMaster(g);
    }

    osc.start(when);
    osc.stop(releaseTime + 0.03);

    this.scheduledMidi.push({ osc, gain: g });
  }

  /* ════════════════════════════════════════════
   *  Audio clip scheduling
   *  (Full-duration buffer sources — scheduled once
   *   with precise start times, not per-window)
   * ════════════════════════════════════════════ */

  private async scheduleClips(fromBeat: number) {
    // Clear existing audio sources
    for (const s of this.scheduledAudio) {
      try { s.source.stop(); } catch { /* ok */ }
    }
    this.scheduledAudio = [];

    const spb = 60 / this.config.tempo;
    const now = this.ctx.currentTime;

    for (const track of this.tracks) {
      if (track.type === "return" || track.type === "master") continue;

      for (const clip of track.clips || []) {
        if (!clip.audio_url || clip.is_midi) continue;

        const buffer = await this.graph.fetchBuffer(clip.audio_url);
        if (!buffer) continue;

        const clipStartSec = clip.start_beats * spb;
        const clipEndSec = clip.end_beats * spb;
        const fromSec = fromBeat * spb;

        if (clipEndSec <= fromSec) continue;

        const source = this.ctx.createBufferSource();
        source.buffer = buffer;

        try {
          this.graph.connectToTrack(track.id, source);
        } catch {
          continue; // skip if track connection fails
        }

        const offset = Math.max(0, fromSec - clipStartSec);
        const delay = Math.max(0, clipStartSec - fromSec);
        const duration = Math.min(buffer.duration - offset, clipEndSec - clipStartSec - offset);

        if (duration > 0) {
          source.start(now + delay, offset, duration);
          this.scheduledAudio.push({ source, trackId: track.id });
        }
      }
    }
  }

  /* ════════════════════════════════════════════
   *  Cleanup
   * ════════════════════════════════════════════ */

  private clearAllScheduled() {
    for (const s of this.scheduledAudio) {
      try { s.source.stop(); } catch { /* ok */ }
    }
    this.scheduledAudio = [];

    for (const m of this.scheduledMidi) {
      try { m.osc.stop(); } catch { /* ok */ }
    }
    this.scheduledMidi = [];
  }

  dispose() {
    this.stopScheduler();
    this.tracks = [];
  }
}
