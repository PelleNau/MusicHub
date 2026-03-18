/**
 * SubtractiveSynth — classic analog-style polyphonic synthesizer.
 *
 * Architecture per voice:
 *   [Osc1] ──┐
 *             ├─ mix → [Filter] → [Amp Envelope] → output
 *   [Osc2] ──┘
 *
 * Features:
 *  - 2 oscillators with independent waveforms, detune, and octave shift
 *  - Low-pass filter with resonance + envelope modulation
 *  - ADSR amplitude envelope
 *  - ADSR filter envelope
 *  - Portamento/glide
 *  - 8-voice polyphony with voice stealing (oldest note)
 */

import type { Instrument, NoteEvent } from "./Instrument";
import { WAVE_TYPES } from "./Instrument";

const MAX_VOICES = 8;

interface Voice {
  pitch: number;
  osc1: OscillatorNode;
  osc2: OscillatorNode;
  osc1Gain: GainNode;
  osc2Gain: GainNode;
  filter: BiquadFilterNode;
  ampEnv: GainNode;
  startTime: number;
  releaseTime: number | null;
  stopTimeout: ReturnType<typeof setTimeout> | null;
}

export class SubtractiveSynth implements Instrument {
  readonly type = "subtractive";
  readonly output: GainNode;
  private ctx: AudioContext;
  private voices: Voice[] = [];
  private params: Record<string, number>;

  constructor(ctx: AudioContext, initialParams: Record<string, number> = {}) {
    this.ctx = ctx;
    this.output = ctx.createGain();
    this.output.gain.value = 0.7;

    this.params = {
      osc1Wave: 1,     // triangle
      osc2Wave: 2,     // sawtooth
      osc2Detune: 7,
      oscMix: 0.5,
      octave: 0,
      filterFreq: 4000,
      filterQ: 1,
      filterEnv: 2000,
      ampAttack: 0.005,
      ampDecay: 0.2,
      ampSustain: 0.7,
      ampRelease: 0.3,
      fltAttack: 0.005,
      fltDecay: 0.3,
      fltSustain: 0.2,
      volume: 0.7,
      glide: 0,
      ...initialParams,
    };

    this.output.gain.value = this.params.volume;
  }

  /* ── MIDI → frequency ── */
  private pitchToFreq(pitch: number): number {
    const octaveShift = this.params.octave ?? 0;
    return 440 * Math.pow(2, (pitch + octaveShift * 12 - 69) / 12);
  }

  /* ── Voice creation ── */
  private createVoice(pitch: number, velocity: number, when: number): Voice {
    const ctx = this.ctx;
    const freq = this.pitchToFreq(pitch);
    const vol = (velocity / 127) * (this.params.volume ?? 0.7);

    // Oscillators
    const osc1 = ctx.createOscillator();
    osc1.type = WAVE_TYPES[this.params.osc1Wave] ?? "triangle";
    osc1.frequency.setValueAtTime(freq, when);

    const osc2 = ctx.createOscillator();
    osc2.type = WAVE_TYPES[this.params.osc2Wave] ?? "sawtooth";
    osc2.frequency.setValueAtTime(freq, when);
    osc2.detune.setValueAtTime(this.params.osc2Detune ?? 7, when);

    // Osc mix gains
    const osc1Gain = ctx.createGain();
    const osc2Gain = ctx.createGain();
    const mix = this.params.oscMix ?? 0.5;
    osc1Gain.gain.setValueAtTime(1 - mix, when);
    osc2Gain.gain.setValueAtTime(mix, when);

    // Filter
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    const baseFreq = this.params.filterFreq ?? 4000;
    filter.Q.setValueAtTime(this.params.filterQ ?? 1, when);

    // Filter envelope
    const fltEnvAmount = this.params.filterEnv ?? 2000;
    const fltA = this.params.fltAttack ?? 0.005;
    const fltD = this.params.fltDecay ?? 0.3;
    const fltS = this.params.fltSustain ?? 0.2;
    const fltSustainFreq = baseFreq + fltEnvAmount * fltS;

    filter.frequency.setValueAtTime(baseFreq, when);
    filter.frequency.linearRampToValueAtTime(
      Math.min(20000, baseFreq + fltEnvAmount),
      when + fltA
    );
    filter.frequency.linearRampToValueAtTime(
      Math.max(20, fltSustainFreq),
      when + fltA + fltD
    );

    // Amp envelope
    const ampEnv = ctx.createGain();
    const a = this.params.ampAttack ?? 0.005;
    const d = this.params.ampDecay ?? 0.2;
    const s = this.params.ampSustain ?? 0.7;

    ampEnv.gain.setValueAtTime(0, when);
    ampEnv.gain.linearRampToValueAtTime(vol, when + a);
    ampEnv.gain.linearRampToValueAtTime(vol * s, when + a + d);

    // Connect: osc → gain → filter → ampEnv → output
    osc1.connect(osc1Gain);
    osc2.connect(osc2Gain);
    osc1Gain.connect(filter);
    osc2Gain.connect(filter);
    filter.connect(ampEnv);
    ampEnv.connect(this.output);

    osc1.start(when);
    osc2.start(when);

    return {
      pitch,
      osc1, osc2, osc1Gain, osc2Gain,
      filter, ampEnv,
      startTime: when,
      releaseTime: null,
      stopTimeout: null,
    };
  }

  /* ── Voice release ── */
  private releaseVoice(voice: Voice, when: number) {
    if (voice.releaseTime !== null) return; // already releasing
    voice.releaseTime = when;

    const r = this.params.ampRelease ?? 0.3;
    const now = when;

    voice.ampEnv.gain.cancelScheduledValues(now);
    voice.ampEnv.gain.setValueAtTime(voice.ampEnv.gain.value, now);
    voice.ampEnv.gain.linearRampToValueAtTime(0, now + r);

    // Also close filter during release
    voice.filter.frequency.cancelScheduledValues(now);
    voice.filter.frequency.setValueAtTime(voice.filter.frequency.value, now);
    voice.filter.frequency.linearRampToValueAtTime(
      this.params.filterFreq ?? 4000,
      now + r
    );

    const stopTime = now + r + 0.05;
    try { voice.osc1.stop(stopTime); } catch { /* ok */ }
    try { voice.osc2.stop(stopTime); } catch { /* ok */ }

    voice.stopTimeout = setTimeout(() => {
      this.removeVoice(voice);
    }, (r + 0.1) * 1000);
  }

  private removeVoice(voice: Voice) {
    try { voice.osc1.disconnect(); } catch { /* ok */ }
    try { voice.osc2.disconnect(); } catch { /* ok */ }
    try { voice.filter.disconnect(); } catch { /* ok */ }
    try { voice.ampEnv.disconnect(); } catch { /* ok */ }
    if (voice.stopTimeout) clearTimeout(voice.stopTimeout);
    this.voices = this.voices.filter(v => v !== voice);
  }

  /* ── Voice stealing ── */
  private stealVoiceIfNeeded() {
    if (this.voices.length >= MAX_VOICES) {
      // Steal oldest voice
      const oldest = this.voices[0];
      if (oldest) {
        this.removeVoice(oldest);
      }
    }
  }

  /* ══ Public API ══ */

  scheduleNote(event: NoteEvent) {
    this.stealVoiceIfNeeded();
    const voice = this.createVoice(event.pitch, event.velocity, event.when);
    this.voices.push(voice);
    this.releaseVoice(voice, event.when + event.duration);
  }

  noteOn(pitch: number, velocity: number) {
    this.stealVoiceIfNeeded();
    const voice = this.createVoice(pitch, velocity, this.ctx.currentTime);
    this.voices.push(voice);
  }

  noteOff(pitch: number) {
    const now = this.ctx.currentTime;
    for (const voice of this.voices) {
      if (voice.pitch === pitch && voice.releaseTime === null) {
        this.releaseVoice(voice, now);
        break; // only release one voice per noteOff
      }
    }
  }

  allNotesOff() {
    const now = this.ctx.currentTime;
    for (const voice of [...this.voices]) {
      this.releaseVoice(voice, now);
    }
  }

  setParam(key: string, value: number) {
    this.params[key] = value;
    if (key === "volume") {
      this.output.gain.setValueAtTime(value, this.ctx.currentTime);
    }
  }

  setParams(params: Record<string, number>) {
    for (const [key, value] of Object.entries(params)) {
      this.params[key] = value;
    }
    if (params.volume !== undefined) {
      this.output.gain.setValueAtTime(params.volume, this.ctx.currentTime);
    }
  }

  dispose() {
    for (const voice of [...this.voices]) {
      this.removeVoice(voice);
    }
    try { this.output.disconnect(); } catch { /* ok */ }
  }
}
