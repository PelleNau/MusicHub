import type { SessionTrack, DeviceInstance, InstrumentType } from "@/types/studio";
import { isInstrumentType } from "@/types/studio";
import { supabase } from "@/integrations/supabase/client";
import { AudioScheduler, type AudioGraph } from "./AudioScheduler";
import { WorkletManager, type MeterData, type PhaseData } from "./WorkletManager";
import { createInstrument, type Instrument } from "./instruments";

export type PlaybackState = "stopped" | "playing" | "paused";

export interface TrackMeterData {
  rms: Float32Array;
  peak: Float32Array;
}

interface TrackNode {
  gain: GainNode;
  panner: StereoPannerNode;
  sendGains: Map<string, GainNode>;
  deviceNodes: AudioNode[];
  meterNode: AudioWorkletNode | null;
  instrument: Instrument | null;
}

interface ChainedAudioNode extends AudioNode {
  __lastNode?: AudioNode;
}

/**
 * Pure-JS audio engine — zero React dependencies.
 *
 * Architecture:
 *  - AudioEngine owns the Web Audio graph (tracks, effects, routing)
 *  - AudioScheduler owns all time-critical scheduling (metronome, MIDI, clips, loops)
 *  - rAF loop is used ONLY for UI position updates (~15fps throttled)
 */
export class AudioEngine {
  // ── Web Audio core ──
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  // ── Transport state ──
  private _playbackState: PlaybackState = "stopped";
  private _currentBeat = 0;
  private rafId = 0;

  // ── Graph ──
  private trackNodes = new Map<string, TrackNode>();
  private returnNodes = new Map<string, GainNode>();
  private bufferCache = new Map<string, AudioBuffer>();
  private tracks: SessionTrack[] = [];

  // ── Worklet manager ──
  private workletManager = new WorkletManager();
  private _trackMeters = new Map<string, TrackMeterData>();
  private _masterMeter: TrackMeterData = { rms: new Float32Array(2), peak: new Float32Array(2) };
  private _masterPhase: PhaseData = { correlation: 1, balance: 0 };
  private masterMeterNode: AudioWorkletNode | null = null;
  private masterPhaseNode: AudioWorkletNode | null = null;
  private _workletsReady = false;

  // ── Config ──
  private _tempo = 120;
  private _beatsPerBar = 4;

  // ── Loop ──
  private _loopEnabled = false;
  private _loopStart = 0;
  private _loopEnd = 8;

  // ── Metronome ──
  private _metronomeEnabled = false;

  // ── Note audition ──
  private auditActive: { osc: OscillatorNode; gain: GainNode } | null = null;

  // ── Scheduler ──
  private scheduler: AudioScheduler | null = null;

  // ── Subscribers ──
  private _subscribers = new Set<() => void>();
  private _lastNotifyTime = 0;

  /* ════════════════════════════════════════════
   *  Public getters
   * ════════════════════════════════════════════ */

  get playbackState() { return this._playbackState; }
  get currentBeat() { return this._currentBeat; }
  get tempo() { return this._tempo; }
  get audioContext() { return this.ctx; }
  get master() { return this.masterGain; }
  get loopEnabled() { return this._loopEnabled; }
  get loopStart() { return this._loopStart; }
  get loopEnd() { return this._loopEnd; }
  get metronomeEnabled() { return this._metronomeEnabled; }
  get workletsReady() { return this._workletsReady; }

  /** Per-track meter data (rms/peak) — updated at ~60fps from worklet thread */
  get trackMeters(): ReadonlyMap<string, TrackMeterData> { return this._trackMeters; }
  /** Master bus meter data */
  get masterMeterData(): Readonly<TrackMeterData> { return this._masterMeter; }
  /** Master stereo phase correlation & balance */
  get masterPhaseData(): Readonly<PhaseData> { return this._masterPhase; }
  /** Get meter data for a specific track */
  getTrackMeter(trackId: string): TrackMeterData | undefined { return this._trackMeters.get(trackId); }

  private get beatsPerSecond() { return this._tempo / 60; }
  private get secondsPerBeat() { return 60 / this._tempo; }

  /* ════════════════════════════════════════════
   *  Subscribe / notify (for React bridge)
   * ════════════════════════════════════════════ */

  subscribe(fn: () => void) {
    this._subscribers.add(fn);
    return () => {
      this._subscribers.delete(fn);
    };
  }

  private notifyImmediate() {
    for (const listener of this._subscribers) listener();
  }

  private notifyThrottled() {
    const now = performance.now();
    if (now - this._lastNotifyTime < 64) return;
    this._lastNotifyTime = now;
    for (const listener of this._subscribers) listener();
  }

  /* ════════════════════════════════════════════
   *  AudioContext (lazy init)
   * ════════════════════════════════════════════ */

  private getCtx(): AudioContext {
    if (!this.ctx || this.ctx.state === "closed") {
      if (this.ctx) {
        this.purgeAllNodes();
      }
      const ctx = new AudioContext();
      this.ctx = ctx;
      const master = ctx.createGain();
      master.connect(ctx.destination);
      this.masterGain = master;

      // Update worklet manager context
      this.workletManager.updateContext(ctx);
      this._workletsReady = false;

      // Update scheduler context if it exists
      if (this.scheduler) {
        this.scheduler.updateContext(ctx);
      }
    }
    return this.ctx;
  }

  /* ════════════════════════════════════════════
   *  Scheduler initialization
   * ════════════════════════════════════════════ */

  private ensureScheduler(): AudioScheduler {
    if (this.scheduler) return this.scheduler;

    const ctx = this.getCtx();
    const graph = this.createGraphInterface();

    this.scheduler = new AudioScheduler(ctx, graph, {
      tempo: this._tempo,
      beatsPerBar: this._beatsPerBar,
      loopEnabled: this._loopEnabled,
      loopStart: this._loopStart,
      loopEnd: this._loopEnd,
      metronomeEnabled: this._metronomeEnabled,
    });

    this.scheduler.updateTracks(this.tracks);
    return this.scheduler;
  }

  /** Create the AudioGraph interface that the scheduler uses to connect nodes */
  private createGraphInterface(): AudioGraph {
    return {
      connectToTrack: (trackId: string, node: AudioNode) => {
        const tn = this.trackNodes.get(trackId);
        if (!tn) throw new Error(`Track ${trackId} not found`);
        this.safeConnect(node, tn.panner);
      },
      connectToMaster: (node: AudioNode) => {
        const master = this.masterGain;
        if (!master) throw new Error("Master gain not available");
        this.safeConnect(node, master);
      },
      fetchBuffer: (url: string) => this.fetchBuffer(url),
      getTrackInstrument: (trackId: string) => {
        const tn = this.trackNodes.get(trackId);
        return tn?.instrument ?? null;
      },
    };
  }

  /** Push current config state to the scheduler */
  private syncSchedulerConfig() {
    if (!this.scheduler) return;
    this.scheduler.updateConfig({
      tempo: this._tempo,
      beatsPerBar: this._beatsPerBar,
      loopEnabled: this._loopEnabled,
      loopStart: this._loopStart,
      loopEnd: this._loopEnd,
      metronomeEnabled: this._metronomeEnabled,
    });
  }

  /* ════════════════════════════════════════════
   *  Safe connect — verifies same AudioContext
   * ════════════════════════════════════════════ */

  private safeConnect(source: AudioNode, destination: AudioNode) {
    if (source.context !== destination.context) {
      throw new InvalidContextError(
        `safeConnect: source context !== destination context`
      );
    }
    source.connect(destination);
  }

  /* ════════════════════════════════════════════
   *  Purge cached nodes (context mismatch recovery)
   * ════════════════════════════════════════════ */

  private purgeAllNodes() {
    for (const tn of this.trackNodes.values()) {
      try { tn.panner.disconnect(); } catch { /* ok */ }
      try { tn.gain.disconnect(); } catch { /* ok */ }
      for (const dn of tn.deviceNodes) {
        try { dn.disconnect(); } catch { /* ok */ }
        const last = this.getLastNode(dn);
        if (last !== dn) try { last.disconnect(); } catch { /* ok */ }
      }
      for (const sg of tn.sendGains.values()) try { sg.disconnect(); } catch { /* ok */ }
    }
    this.trackNodes.clear();
    for (const rn of this.returnNodes.values()) try { rn.disconnect(); } catch { /* ok */ }
    this.returnNodes.clear();
  }

  private purgeStaleNodes(ctx: AudioContext) {
    let stale = false;
    for (const tn of this.trackNodes.values()) {
      if (tn.gain.context !== ctx) { stale = true; break; }
    }
    if (!stale) {
      for (const rn of this.returnNodes.values()) {
        if (rn.context !== ctx) { stale = true; break; }
      }
    }
    if (stale) {
      console.warn("[AudioEngine] Stale nodes detected — purging graph");
      this.purgeAllNodes();
    }
  }

  /* ════════════════════════════════════════════
   *  Configuration setters
   * ════════════════════════════════════════════ */

  setTempo(bpm: number) {
    this._tempo = bpm;
    this.syncSchedulerConfig();
  }

  setBeatsPerBar(bpb: number) {
    this._beatsPerBar = bpb;
    this.syncSchedulerConfig();
  }

  setMasterVolume(linear: number) {
    if (this.masterGain) this.masterGain.gain.value = linear;
  }

  /* ── Loop ── */

  setLoop(enabled: boolean, start?: number, end?: number) {
    this._loopEnabled = enabled;
    if (start !== undefined) this._loopStart = start;
    if (end !== undefined) this._loopEnd = end;
    this.syncSchedulerConfig();
    this.notifyImmediate();
  }

  setLoopRegion(start: number, end: number) {
    this._loopStart = start;
    this._loopEnd = end;
    this.syncSchedulerConfig();
    this.notifyImmediate();
  }

  toggleLoop() {
    this._loopEnabled = !this._loopEnabled;
    this.syncSchedulerConfig();
    this.notifyImmediate();
  }

  /* ── Metronome ── */

  setMetronome(enabled: boolean) {
    this._metronomeEnabled = enabled;
    this.syncSchedulerConfig();
    this.notifyImmediate();
  }

  toggleMetronome() {
    this._metronomeEnabled = !this._metronomeEnabled;
    this.syncSchedulerConfig();
    this.notifyImmediate();
  }

  /* ════════════════════════════════════════════
   *  Note audition (not scheduled — immediate)
   * ════════════════════════════════════════════ */

  playAuditionNote(pitch: number, velocity: number = 100) {
    this.stopAuditionNote();
    const ctx = this.getCtx();
    if (ctx.state === "suspended") ctx.resume();

    const freq = 440 * Math.pow(2, (pitch - 69) / 12);
    const vol = (velocity / 127) * 0.15;

    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.value = freq;

    const gain = ctx.createGain();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(vol * 0.6, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain || ctx.destination);
    osc.start();

    this.auditActive = { osc, gain };

    const releaseTime = now + 0.3;
    gain.gain.setValueAtTime(vol * 0.6, releaseTime);
    gain.gain.exponentialRampToValueAtTime(0.001, releaseTime + 0.15);
    osc.stop(releaseTime + 0.16);

    const ref = this.auditActive;
    setTimeout(() => {
      if (this.auditActive === ref) this.auditActive = null;
    }, 500);
  }

  stopAuditionNote() {
    if (!this.auditActive) return;
    try {
      const { osc, gain } = this.auditActive;
      const now = gain.context.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      osc.stop(now + 0.03);
    } catch { /* already stopped */ }
    this.auditActive = null;
  }

  /* ════════════════════════════════════════════
   *  Device node creation
   * ════════════════════════════════════════════ */

  private createDeviceNode(ctx: AudioContext, device: DeviceInstance): AudioNode | null {
    if (!device.enabled) return null;
    const p = device.params;

    switch (device.type) {
      case "eq3": {
        const low = ctx.createBiquadFilter();
        low.type = "lowshelf";
        low.frequency.value = p.lowFreq ?? 250;
        low.gain.value = p.lowGain ?? 0;

        const mid = ctx.createBiquadFilter();
        mid.type = "peaking";
        mid.frequency.value = Math.sqrt((p.lowFreq ?? 250) * (p.highFreq ?? 4000));
        mid.Q.value = 0.7;
        mid.gain.value = p.midGain ?? 0;

        const high = ctx.createBiquadFilter();
        high.type = "highshelf";
        high.frequency.value = p.highFreq ?? 4000;
        high.gain.value = p.highGain ?? 0;

        low.connect(mid);
        mid.connect(high);
        (low as ChainedAudioNode).__lastNode = high;
        return low;
      }

      case "compressor": {
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = p.threshold ?? -24;
        comp.ratio.value = p.ratio ?? 4;
        comp.attack.value = p.attack ?? 0.003;
        comp.release.value = p.release ?? 0.25;
        comp.knee.value = p.knee ?? 10;
        return comp;
      }

      case "reverb": {
        const mix = p.mix ?? 0.3;
        const decay = p.decay ?? 2;
        const input = ctx.createGain();
        const dry = ctx.createGain();
        const wet = ctx.createGain();
        const output = ctx.createGain();
        const delay1 = ctx.createDelay(5);
        const feedback = ctx.createGain();

        dry.gain.value = 1 - mix;
        wet.gain.value = mix;
        delay1.delayTime.value = 0.03;
        feedback.gain.value = Math.min(0.95, 1 - (1 / (decay * 2)));

        input.connect(dry);
        input.connect(delay1);
        delay1.connect(feedback);
        feedback.connect(delay1);
        delay1.connect(wet);
        dry.connect(output);
        wet.connect(output);

        (input as ChainedAudioNode).__lastNode = output;
        return input;
      }

      case "delay": {
        const mix = p.mix ?? 0.3;
        const time = p.time ?? 0.375;
        const fb = p.feedback ?? 0.4;
        const input = ctx.createGain();
        const dry = ctx.createGain();
        const wet = ctx.createGain();
        const output = ctx.createGain();
        const delayNode = ctx.createDelay(5);
        const fbGain = ctx.createGain();

        dry.gain.value = 1 - mix;
        wet.gain.value = mix;
        delayNode.delayTime.value = time;
        fbGain.gain.value = fb;

        input.connect(dry);
        input.connect(delayNode);
        delayNode.connect(fbGain);
        fbGain.connect(delayNode);
        delayNode.connect(wet);
        dry.connect(output);
        wet.connect(output);

        (input as ChainedAudioNode).__lastNode = output;
        return input;
      }

      case "gain": {
        const g = ctx.createGain();
        g.gain.value = Math.pow(10, (p.gain ?? 0) / 20);
        return g;
      }

      default:
        return null;
    }
  }

  private getLastNode(node: AudioNode): AudioNode {
    return (node as ChainedAudioNode).__lastNode || node;
  }

  private rebuildDeviceChain(ctx: AudioContext, tn: TrackNode, devices: DeviceInstance[]) {
    if (tn.panner.context !== ctx || tn.gain.context !== ctx) {
      throw new InvalidContextError("rebuildDeviceChain: track node context mismatch");
    }

    tn.panner.disconnect();
    for (const dn of tn.deviceNodes) {
      try { dn.disconnect(); } catch { /* ok */ }
      const last = this.getLastNode(dn);
      if (last !== dn) try { last.disconnect(); } catch { /* ok */ }
    }
    tn.deviceNodes = [];

    let prevNode: AudioNode = tn.panner;
    for (const device of devices) {
      const node = this.createDeviceNode(ctx, device);
      if (node) {
        this.safeConnect(this.getLastNode(prevNode), node);
        tn.deviceNodes.push(node);
        prevNode = node;
      }
    }
    this.safeConnect(this.getLastNode(prevNode), tn.gain);

    // Reconnect sends
    for (const [, sg] of tn.sendGains) {
      if (sg.context !== ctx) continue;
      try { this.safeConnect(tn.panner, sg); } catch { /* already connected */ }
    }
  }

  /* ════════════════════════════════════════════
   *  Audio graph build / rebuild
   * ════════════════════════════════════════════ */

  buildGraph(tracks: SessionTrack[]) {
    try {
      this.buildGraphInternal(tracks);
    } catch (err) {
      const isContextMismatch =
        err instanceof InvalidContextError ||
        (err instanceof DOMException && err.name === "InvalidAccessError") ||
        (err instanceof Error && err.message.toLowerCase().includes("different audio context"));

      if (!isContextMismatch) throw err;

      console.warn("[AudioEngine] Context mismatch during buildGraph — hard-resetting graph and retrying once", err);
      this.purgeAllNodes();
      this.buildGraphInternal(tracks);
    }
  }

  private buildGraphInternal(tracks: SessionTrack[]) {
    const ctx = this.getCtx();
    const master = this.masterGain!;

    this.purgeStaleNodes(ctx);
    this.tracks = tracks;

    const existingTrackIds = new Set(this.trackNodes.keys());
    const existingReturnIds = new Set(this.returnNodes.keys());

    const returnTracks = tracks.filter(t => t.type === "return");
    const nonReturnTracks = tracks.filter(t => t.type !== "return");

    // Return tracks
    for (const rt of returnTracks) {
      if (!this.returnNodes.has(rt.id)) {
        const gain = ctx.createGain();
        gain.gain.value = rt.is_muted ? 0 : rt.volume;
        this.safeConnect(gain, master);
        this.returnNodes.set(rt.id, gain);
      } else {
        const gain = this.returnNodes.get(rt.id)!;
        gain.gain.value = rt.is_muted ? 0 : rt.volume;
      }
      existingReturnIds.delete(rt.id);
    }

    for (const id of existingReturnIds) {
      this.returnNodes.get(id)?.disconnect();
      this.returnNodes.delete(id);
    }

    const effectiveSoloTrackId =
      nonReturnTracks.find((t) => t.is_soloed)?.id ?? null;

    // Non-return tracks
    for (const track of nonReturnTracks) {
      let tn = this.trackNodes.get(track.id);
      if (!tn) {
        const gain = ctx.createGain();
        const panner = ctx.createStereoPanner();
        this.safeConnect(panner, gain);
        this.safeConnect(gain, master);
        tn = { gain, panner, sendGains: new Map(), deviceNodes: [], meterNode: null, instrument: null };
        this.trackNodes.set(track.id, tn);
      }

      const hasSoloSelection = effectiveSoloTrackId !== null;
      const isEffectiveSolo = hasSoloSelection && track.id === effectiveSoloTrackId;
      const shouldMute = track.is_muted || (hasSoloSelection && !isEffectiveSolo);
      tn.gain.gain.value = shouldMute ? 0 : track.volume;
      tn.panner.pan.value = track.pan;

      // ── Instrument management ──
      // Find the first instrument device in the chain
      const instrumentDevice = (track.device_chain || []).find(
        (d) => d.enabled && isInstrumentType(d.type)
      );

      if (instrumentDevice) {
        const instrType = instrumentDevice.type as InstrumentType;
        // Create or update instrument
        if (!tn.instrument || tn.instrument.type !== instrType) {
          // Dispose old instrument
          if (tn.instrument) tn.instrument.dispose();
          // Create new one and connect to the track's panner input
          const inst = createInstrument(ctx, instrType, instrumentDevice.params);
          if (inst) {
            this.safeConnect(inst.output, tn.panner);
            tn.instrument = inst;
          }
        } else {
          // Update params on existing instrument
          tn.instrument.setParams(instrumentDevice.params);
        }
      } else if (tn.instrument) {
        // No instrument device — dispose
        tn.instrument.dispose();
        tn.instrument = null;
      }

      // Build effect chain (exclude instrument devices)
      const effectDevices = (track.device_chain || []).filter(
        (d) => !isInstrumentType(d.type)
      );
      this.rebuildDeviceChain(ctx, tn, effectDevices);

      // Sends
      const activeSendIds = new Set<string>();
      for (const send of track.sends || []) {
        activeSendIds.add(send.return_track_id);
        let sendGain = tn.sendGains.get(send.return_track_id);
        const returnNode = this.returnNodes.get(send.return_track_id);
        if (!returnNode) continue;

        if (!sendGain) {
          sendGain = ctx.createGain();
          this.safeConnect(tn.panner, sendGain);
          this.safeConnect(sendGain, returnNode);
          tn.sendGains.set(send.return_track_id, sendGain);
        }
        sendGain.gain.value = send.level;
      }

      for (const [rtId, sg] of tn.sendGains) {
        if (!activeSendIds.has(rtId)) {
          sg.disconnect();
          tn.sendGains.delete(rtId);
        }
      }

      existingTrackIds.delete(track.id);
    }

    // Cleanup stale tracks
    for (const id of existingTrackIds) {
      const tn = this.trackNodes.get(id);
      if (tn) {
        tn.panner.disconnect();
        tn.gain.disconnect();
        for (const sg of tn.sendGains.values()) sg.disconnect();
        this.trackNodes.delete(id);
      }
    }

    // Keep scheduler in sync with track data
    if (this.scheduler) {
      this.scheduler.updateTracks(tracks);
    }
  }

  /* ════════════════════════════════════════════
   *  Buffer fetching (cached)
   * ════════════════════════════════════════════ */

  async fetchBuffer(audioUrl: string): Promise<AudioBuffer | null> {
    if (this.bufferCache.has(audioUrl)) {
      return this.bufferCache.get(audioUrl)!;
    }
    try {
      const ctx = this.getCtx();
      let url = audioUrl;

      if (audioUrl.includes("/storage/v1/object/public/audio-clips/")) {
        const path = audioUrl.split("/audio-clips/")[1];
        if (path) {
          const { data } = await supabase.storage
            .from("audio-clips")
            .createSignedUrl(path, 3600);
          if (data?.signedUrl) url = data.signedUrl;
        }
      }

      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      this.bufferCache.set(audioUrl, audioBuffer);
      return audioBuffer;
    } catch (err) {
      console.warn("Failed to fetch audio buffer:", audioUrl, err);
      return null;
    }
  }

  /* ════════════════════════════════════════════
   *  rAF tick — UI position updates ONLY
   *  No scheduling happens here.
   * ════════════════════════════════════════════ */

  private tick = () => {
    if (this._playbackState !== "playing" || !this.scheduler) return;

    // Read sample-accurate beat position from scheduler
    this._currentBeat = this.scheduler.currentBeat;
    this.notifyThrottled();
    this.rafId = requestAnimationFrame(this.tick);
  };

  /* ════════════════════════════════════════════
   *  Transport controls
   * ════════════════════════════════════════════ */

  async play() {
    const ctx = this.getCtx();
    if (ctx.state === "suspended") await ctx.resume();

    // Initialize worklets on first play (async, non-blocking)
    if (!this._workletsReady) {
      this.initWorklets().catch((err) =>
        console.warn("[AudioEngine] Worklet init failed (non-fatal):", err)
      );
    }

    const scheduler = this.ensureScheduler();
    const fromBeat = this._currentBeat;

    this._playbackState = "playing";
    this.notifyImmediate();

    // Start scheduler (handles metronome, MIDI, clips)
    scheduler.start(fromBeat);

    // Start rAF for UI updates only
    this.rafId = requestAnimationFrame(this.tick);
  }

  pause() {
    if (!this.scheduler) return;
    const beat = this.scheduler.pause();
    this._currentBeat = beat;
    this._playbackState = "paused";
    cancelAnimationFrame(this.rafId);
    this.notifyImmediate();
  }

  stop() {
    if (this.scheduler) {
      this.scheduler.stopScheduler();
    }
    this._currentBeat = 0;
    this._playbackState = "stopped";
    cancelAnimationFrame(this.rafId);
    this.notifyImmediate();
  }

  seekToBeat(beat: number) {
    this._currentBeat = beat;
    if (this._playbackState === "playing" && this.scheduler) {
      this.scheduler.seekTo(beat);
    } else if (this.scheduler) {
      this.scheduler.seekTo(beat);
    }
    this.notifyImmediate();
  }

  /* ════════════════════════════════════════════
   *  Cleanup
   * ════════════════════════════════════════════ */

  dispose() {
    cancelAnimationFrame(this.rafId);
    if (this.scheduler) {
      this.scheduler.dispose();
      this.scheduler = null;
    }
    this.workletManager.dispose();
    this.masterMeterNode = null;
    this.masterPhaseNode = null;
    this._trackMeters.clear();
    this.stopAuditionNote();
    this.purgeAllNodes();
    this.bufferCache.clear();
    this.tracks = [];
    try { this.ctx?.close(); } catch { /* ok */ }
    this.ctx = null;
    this.masterGain = null;
    this._subscribers.clear();
  }

  /* ════════════════════════════════════════════
   *  Worklet integration — async meter wiring
   * ════════════════════════════════════════════ */

  /**
   * Load worklet modules and wire meter nodes into the signal chain.
   * Called after buildGraph or on play(). Safe to call multiple times.
   */
  async initWorklets() {
    if (this._workletsReady || !this.ctx || !this.masterGain) return;
    if (!WorkletManager.isSupported) {
      console.info("[AudioEngine] AudioWorklet not supported — metering disabled");
      return;
    }

    const loaded = await this.workletManager.ensureAllModules();
    if (!loaded) return;

    // ── Master meter ──
    if (!this.masterMeterNode) {
      const meterNode = await this.workletManager.createMeterNode(
        "__master__",
        (data) => { this._masterMeter = data; },
      );
      if (meterNode && this.masterGain) {
        // Insert between masterGain and destination
        try {
          this.masterGain.disconnect();
          this.safeConnect(this.masterGain, meterNode);
          this.safeConnect(meterNode, this.ctx!.destination);
          this.masterMeterNode = meterNode;
        } catch (err) {
          console.warn("[AudioEngine] Failed to wire master meter:", err);
          // Reconnect directly on failure
          try { this.masterGain.connect(this.ctx!.destination); } catch { /* ok */ }
        }
      }
    }

    // ── Master phase scope ──
    if (!this.masterPhaseNode && this.masterMeterNode) {
      const phaseNode = await this.workletManager.createPhaseScopeNode(
        "__master_phase__",
        (data) => { this._masterPhase = data; },
      );
      if (phaseNode) {
        try {
          // Tap off the master meter output
          this.safeConnect(this.masterMeterNode, phaseNode);
          // Phase node output goes nowhere — it's analysis only,
          // but we still need to connect output to keep it alive
          this.masterPhaseNode = phaseNode;
        } catch { /* ok */ }
      }
    }

    // ── Per-track meters ──
    for (const [trackId, tn] of this.trackNodes) {
      if (tn.meterNode) continue; // already wired

      const meterNode = await this.workletManager.createMeterNode(
        `track:${trackId}`,
        (data) => { this._trackMeters.set(trackId, data); },
      );
      if (meterNode) {
        try {
          // Insert between track gain and its current destination (master)
          tn.gain.disconnect();
          this.safeConnect(tn.gain, meterNode);
          this.safeConnect(meterNode, this.masterGain!);
          tn.meterNode = meterNode;
        } catch (err) {
          console.warn(`[AudioEngine] Failed to wire meter for track ${trackId}:`, err);
          // Reconnect directly on failure
          try { this.safeConnect(tn.gain, this.masterGain!); } catch { /* ok */ }
        }
      }
    }

    this._workletsReady = true;
  }
}

/**
 * Custom error class to distinguish context-mismatch errors
 * from other DOMExceptions.
 */
class InvalidContextError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "InvalidContextError";
  }
}
