/**
 * FMSynth — 4-operator FM synthesizer.
 *
 * Supports 4 algorithms:
 *   0: [Op4→Op3→Op2→Op1] (serial — classic brass/bells)
 *   1: [Op3→Op2]→Op1, Op4→Op1 (parallel modulators)
 *   2: Op2→Op1, Op4→Op3, mix (dual carrier)
 *   3: Op1+Op2+Op3+Op4 (additive, all carriers)
 *
 * Each operator is a sine oscillator with:
 *  - Frequency ratio (relative to fundamental)
 *  - Level (modulation index for modulators, output level for carriers)
 *  - Shared ADSR amplitude envelope
 */

import type { Instrument, NoteEvent } from "./Instrument";

const MAX_VOICES = 8;

interface FMVoice {
  pitch: number;
  ops: OscillatorNode[];
  opGains: GainNode[];
  ampEnv: GainNode;
  startTime: number;
  releaseTime: number | null;
  stopTimeout: ReturnType<typeof setTimeout> | null;
}

export class FMSynth implements Instrument {
  readonly type = "fm";
  readonly output: GainNode;
  private ctx: AudioContext;
  private voices: FMVoice[] = [];
  private params: Record<string, number>;

  constructor(ctx: AudioContext, initialParams: Record<string, number> = {}) {
    this.ctx = ctx;
    this.output = ctx.createGain();

    this.params = {
      op1Level: 1, op2Level: 0.5, op3Level: 0, op4Level: 0,
      op1Ratio: 1, op2Ratio: 2, op3Ratio: 3, op4Ratio: 4,
      mod21: 2, mod31: 0, mod42: 0,
      algorithm: 0,
      ampAttack: 0.005, ampDecay: 0.3, ampSustain: 0.5, ampRelease: 0.3,
      volume: 0.6,
      ...initialParams,
    };

    this.output.gain.value = this.params.volume;
  }

  private createVoice(pitch: number, velocity: number, when: number): FMVoice {
    const ctx = this.ctx;
    const baseFreq = 440 * Math.pow(2, (pitch - 69) / 12);
    const vol = (velocity / 127) * (this.params.volume ?? 0.6);
    const algo = Math.round(this.params.algorithm ?? 0);

    // Create 4 operators
    const ops: OscillatorNode[] = [];
    const opGains: GainNode[] = [];
    const ratios = [
      this.params.op1Ratio ?? 1,
      this.params.op2Ratio ?? 2,
      this.params.op3Ratio ?? 3,
      this.params.op4Ratio ?? 4,
    ];
    const levels = [
      this.params.op1Level ?? 1,
      this.params.op2Level ?? 0.5,
      this.params.op3Level ?? 0,
      this.params.op4Level ?? 0,
    ];

    for (let i = 0; i < 4; i++) {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq * ratios[i], when);
      ops.push(osc);

      const g = ctx.createGain();
      g.gain.setValueAtTime(levels[i] * baseFreq * ratios[i], when);
      opGains.push(g);
    }

    // Amp envelope on output
    const ampEnv = ctx.createGain();
    const a = this.params.ampAttack ?? 0.005;
    const d = this.params.ampDecay ?? 0.3;
    const s = this.params.ampSustain ?? 0.5;

    ampEnv.gain.setValueAtTime(0, when);
    ampEnv.gain.linearRampToValueAtTime(vol, when + a);
    ampEnv.gain.linearRampToValueAtTime(vol * s, when + a + d);

    // Wire algorithm
    const mod21 = (this.params.mod21 ?? 2) * baseFreq;
    const mod31 = (this.params.mod31 ?? 0) * baseFreq;
    const mod42 = (this.params.mod42 ?? 0) * baseFreq;

    switch (algo) {
      case 0: {
        // Serial: 4→3→2→1→out
        ops[3].connect(opGains[3]);
        opGains[3].gain.setValueAtTime(levels[3] * baseFreq, when);
        opGains[3].connect(ops[2].frequency);

        ops[2].connect(opGains[2]);
        opGains[2].gain.setValueAtTime(levels[2] * baseFreq, when);
        opGains[2].connect(ops[1].frequency);

        ops[1].connect(opGains[1]);
        opGains[1].gain.setValueAtTime(mod21, when);
        opGains[1].connect(ops[0].frequency);

        const carrierGain = ctx.createGain();
        carrierGain.gain.setValueAtTime(levels[0], when);
        ops[0].connect(carrierGain);
        carrierGain.connect(ampEnv);
        break;
      }
      case 1: {
        // 3→2→1, 4→1
        ops[2].connect(opGains[2]);
        opGains[2].gain.setValueAtTime(mod31, when);
        opGains[2].connect(ops[1].frequency);

        ops[1].connect(opGains[1]);
        opGains[1].gain.setValueAtTime(mod21, when);
        opGains[1].connect(ops[0].frequency);

        ops[3].connect(opGains[3]);
        opGains[3].gain.setValueAtTime(mod42, when);
        opGains[3].connect(ops[0].frequency);

        const cg = ctx.createGain();
        cg.gain.setValueAtTime(levels[0], when);
        ops[0].connect(cg);
        cg.connect(ampEnv);
        break;
      }
      case 2: {
        // Dual carrier: 2→1, 4→3
        ops[1].connect(opGains[1]);
        opGains[1].gain.setValueAtTime(mod21, when);
        opGains[1].connect(ops[0].frequency);

        ops[3].connect(opGains[3]);
        opGains[3].gain.setValueAtTime(mod42, when);
        opGains[3].connect(ops[2].frequency);

        const c1 = ctx.createGain();
        c1.gain.setValueAtTime(levels[0] * 0.5, when);
        ops[0].connect(c1);
        c1.connect(ampEnv);

        const c2 = ctx.createGain();
        c2.gain.setValueAtTime(levels[2] * 0.5, when);
        ops[2].connect(c2);
        c2.connect(ampEnv);
        break;
      }
      case 3:
      default: {
        // All carriers (additive)
        for (let i = 0; i < 4; i++) {
          const cg = ctx.createGain();
          cg.gain.setValueAtTime(levels[i] * 0.25, when);
          ops[i].connect(cg);
          cg.connect(ampEnv);
        }
        break;
      }
    }

    ampEnv.connect(this.output);

    for (const osc of ops) osc.start(when);

    return {
      pitch, ops, opGains, ampEnv,
      startTime: when,
      releaseTime: null,
      stopTimeout: null,
    };
  }

  private releaseVoice(voice: FMVoice, when: number) {
    if (voice.releaseTime !== null) return;
    voice.releaseTime = when;

    const r = this.params.ampRelease ?? 0.3;
    voice.ampEnv.gain.cancelScheduledValues(when);
    voice.ampEnv.gain.setValueAtTime(voice.ampEnv.gain.value, when);
    voice.ampEnv.gain.linearRampToValueAtTime(0, when + r);

    const stopTime = when + r + 0.05;
    for (const osc of voice.ops) {
      try { osc.stop(stopTime); } catch { /* ok */ }
    }

    voice.stopTimeout = setTimeout(() => {
      this.removeVoice(voice);
    }, (r + 0.1) * 1000);
  }

  private removeVoice(voice: FMVoice) {
    for (const osc of voice.ops) try { osc.disconnect(); } catch { /* ok */ }
    for (const g of voice.opGains) try { g.disconnect(); } catch { /* ok */ }
    try { voice.ampEnv.disconnect(); } catch { /* ok */ }
    if (voice.stopTimeout) clearTimeout(voice.stopTimeout);
    this.voices = this.voices.filter(v => v !== voice);
  }

  private stealVoiceIfNeeded() {
    if (this.voices.length >= MAX_VOICES) {
      const oldest = this.voices[0];
      if (oldest) this.removeVoice(oldest);
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
    for (const voice of this.voices) {
      if (voice.pitch === pitch && voice.releaseTime === null) {
        this.releaseVoice(voice, this.ctx.currentTime);
        break;
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
    for (const [k, v] of Object.entries(params)) this.params[k] = v;
    if (params.volume !== undefined) {
      this.output.gain.setValueAtTime(params.volume, this.ctx.currentTime);
    }
  }

  dispose() {
    for (const voice of [...this.voices]) this.removeVoice(voice);
    try { this.output.disconnect(); } catch { /* ok */ }
  }
}
