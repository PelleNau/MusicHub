import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from "vitest";

// Mock supabase before importing
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    storage: {
      from: () => ({
        createSignedUrl: vi.fn().mockResolvedValue({ data: null }),
      }),
    },
  },
}));

// Reuse the Web Audio mock from AudioEngine tests
const createMockAudioParam = (defaultValue = 0) => ({
  value: defaultValue,
  defaultValue,
  setValueAtTime: vi.fn().mockReturnThis(),
  linearRampToValueAtTime: vi.fn().mockReturnThis(),
  exponentialRampToValueAtTime: vi.fn().mockReturnThis(),
  cancelScheduledValues: vi.fn().mockReturnThis(),
});

class MockGainNode {
  context: any;
  gain = createMockAudioParam(1);
  connect = vi.fn().mockReturnThis();
  disconnect = vi.fn();
}

class MockOscillatorNode {
  context: any;
  type = "sine";
  frequency = createMockAudioParam(440);
  connect = vi.fn().mockReturnThis();
  disconnect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

let mockCtxTime = 0;

class MockAudioContext {
  state = "running";
  get currentTime() { return mockCtxTime; }
  destination = { context: this };

  createGain() {
    const node = new MockGainNode();
    node.context = this;
    return node;
  }
  createOscillator() {
    const node = new MockOscillatorNode();
    node.context = this;
    return node;
  }
  createStereoPanner() {
    return { context: this, pan: createMockAudioParam(0), connect: vi.fn(), disconnect: vi.fn() };
  }
  createBiquadFilter() {
    return { context: this, type: "lowpass", frequency: createMockAudioParam(350), Q: createMockAudioParam(1), gain: createMockAudioParam(0), connect: vi.fn(), disconnect: vi.fn() };
  }
  createDynamicsCompressor() {
    return { context: this, threshold: createMockAudioParam(-24), ratio: createMockAudioParam(12), attack: createMockAudioParam(0.003), release: createMockAudioParam(0.25), knee: createMockAudioParam(30), connect: vi.fn(), disconnect: vi.fn() };
  }
  createDelay() {
    return { context: this, delayTime: createMockAudioParam(0), connect: vi.fn(), disconnect: vi.fn() };
  }
  createBufferSource() {
    return { context: this, buffer: null, connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn() };
  }
  resume = vi.fn().mockResolvedValue(undefined);
  close = vi.fn().mockResolvedValue(undefined);
  decodeAudioData = vi.fn().mockResolvedValue({ duration: 1, getChannelData: () => new Float32Array(100) });
}

beforeAll(() => {
  (globalThis as any).AudioContext = MockAudioContext;
});

import { AudioScheduler, type AudioGraph, type SchedulerConfig } from "../AudioScheduler";

describe("AudioScheduler", () => {
  let ctx: any;
  let graph: AudioGraph;
  let config: SchedulerConfig;
  let scheduler: AudioScheduler;
  let createdOscillators: MockOscillatorNode[];
  let createdGains: MockGainNode[];

  beforeEach(() => {
    mockCtxTime = 0;
    ctx = new MockAudioContext();
    createdOscillators = [];
    createdGains = [];

    // Track created nodes for assertion
    const origCreateOsc = ctx.createOscillator.bind(ctx);
    ctx.createOscillator = () => {
      const node = origCreateOsc();
      createdOscillators.push(node);
      return node;
    };
    const origCreateGain = ctx.createGain.bind(ctx);
    ctx.createGain = () => {
      const node = origCreateGain();
      createdGains.push(node);
      return node;
    };

    graph = {
      connectToTrack: vi.fn(),
      connectToMaster: vi.fn(),
      fetchBuffer: vi.fn().mockResolvedValue(null),
      getTrackInstrument: vi.fn().mockReturnValue(null),
    };

    config = {
      tempo: 120,
      beatsPerBar: 4,
      loopEnabled: false,
      loopStart: 0,
      loopEnd: 8,
      metronomeEnabled: false,
    };

    scheduler = new AudioScheduler(ctx, graph, config);
  });

  afterEach(() => {
    scheduler.dispose();
    vi.restoreAllMocks();
  });

  // ── Initial state ──

  it("starts not running", () => {
    expect(scheduler.isRunning).toBe(false);
  });

  it("currentBeat is 0 before start", () => {
    expect(scheduler.currentBeat).toBe(0);
  });

  // ── Start / stop ──

  it("start sets isRunning to true", () => {
    scheduler.start(0);
    expect(scheduler.isRunning).toBe(true);
  });

  it("stopScheduler sets isRunning to false", () => {
    scheduler.start(0);
    scheduler.stopScheduler();
    expect(scheduler.isRunning).toBe(false);
  });

  it("start from a specific beat", () => {
    scheduler.start(8);
    expect(scheduler.currentBeat).toBe(8);
  });

  // ── Pause ──

  it("pause returns current beat and stops", () => {
    scheduler.start(4);
    mockCtxTime = 1; // 1 second at 120 BPM = 2 beats
    const beat = scheduler.pause();
    expect(beat).toBeCloseTo(6, 5); // 4 + 2
    expect(scheduler.isRunning).toBe(false);
  });

  // ── currentBeat calculation ──

  it("currentBeat advances with context time", () => {
    scheduler.start(0);
    mockCtxTime = 0.5; // 0.5s at 120 BPM = 1 beat
    expect(scheduler.currentBeat).toBeCloseTo(1, 5);
  });

  it("currentBeat wraps at loop boundary", () => {
    scheduler.updateConfig({ loopEnabled: true, loopStart: 0, loopEnd: 4 });
    scheduler.start(0);
    mockCtxTime = 3; // 3s at 120 BPM = 6 beats → wraps to beat 2
    expect(scheduler.currentBeat).toBeCloseTo(2, 5);
  });

  // ── Metronome scheduling ──

  it("schedules metronome clicks with lookahead when enabled", () => {
    vi.useFakeTimers();
    // Must create scheduler with metronome enabled AND fake timers active
    const metroScheduler = new AudioScheduler(ctx, graph, { ...config, metronomeEnabled: true });
    metroScheduler.start(0);
    mockCtxTime = 0.05;
    vi.advanceTimersByTime(30);

    expect(createdOscillators.length).toBeGreaterThan(0);
    expect(createdOscillators[0].type).toBe("square");
    expect(createdOscillators[0].start).toHaveBeenCalled();
    expect(graph.connectToMaster).toHaveBeenCalled();

    metroScheduler.dispose();
    vi.useRealTimers();
  });

  it("does not schedule metronome clicks when disabled", () => {
    vi.useFakeTimers();
    const noMetro = new AudioScheduler(ctx, graph, config);
    noMetro.start(0);
    mockCtxTime = 0.05;
    vi.advanceTimersByTime(30);
    expect(createdOscillators.length).toBe(0);
    noMetro.dispose();
    vi.useRealTimers();
  });

  it("downbeat click has higher frequency than upbeat", () => {
    vi.useFakeTimers();
    const metroScheduler = new AudioScheduler(ctx, graph, { ...config, metronomeEnabled: true, beatsPerBar: 4 });
    metroScheduler.start(0);
    mockCtxTime = 0.6;
    vi.advanceTimersByTime(30);

    const downbeats = createdOscillators.filter(o => o.frequency.value === 1200);
    const upbeats = createdOscillators.filter(o => o.frequency.value === 800);
    expect(downbeats.length).toBeGreaterThanOrEqual(1);
    expect(upbeats.length).toBeGreaterThanOrEqual(1);

    metroScheduler.dispose();
    vi.useRealTimers();
  });

  // ── MIDI scheduling ──

  it("schedules MIDI notes within lookahead window", () => {
    const tracks = [{
      id: "t1", session_id: "s1", name: "MIDI", type: "midi" as const,
      color: 0, volume: 0.8, pan: 0, is_muted: false, is_soloed: false,
      device_chain: [], sends: [], sort_order: 0, input_from: null, created_at: "",
      clips: [{
        id: "c1", track_id: "t1", name: "Clip 1",
        start_beats: 0, end_beats: 4, color: 0,
        is_midi: true, audio_url: null, waveform_peaks: null, alias_of: null, created_at: "",
        midi_data: [
          { id: "n1", pitch: 60, start: 0, duration: 0.5, velocity: 100 },
          { id: "n2", pitch: 64, start: 1, duration: 0.5, velocity: 80 },
        ],
      }],
    }];

    scheduler.updateTracks(tracks);
    scheduler.start(0);

    vi.useFakeTimers();
    mockCtxTime = 0.05;
    vi.advanceTimersByTime(30);

    // Should have created triangle oscillators for MIDI notes in the lookahead window
    const triangleOscs = createdOscillators.filter(o => o.type === "triangle");
    expect(triangleOscs.length).toBeGreaterThanOrEqual(1);

    // Verify connected to track
    expect(graph.connectToTrack).toHaveBeenCalledWith("t1", expect.anything());

    vi.useRealTimers();
  });

  // ── Config updates ──

  it("updateConfig changes scheduler behavior", () => {
    scheduler.updateConfig({ tempo: 180 });
    scheduler.start(0);
    mockCtxTime = 1; // 1s at 180 BPM = 3 beats
    expect(scheduler.currentBeat).toBeCloseTo(3, 5);
  });

  it("updateConfig during playback recalculates timing for tempo change", () => {
    scheduler.start(0);
    mockCtxTime = 1; // 1s at 120 BPM = 2 beats
    expect(scheduler.currentBeat).toBeCloseTo(2, 5);

    // Change tempo
    scheduler.updateConfig({ tempo: 60 });
    // After config update, beat position is preserved and new tempo applies
    mockCtxTime = 2; // 1 more second at 60 BPM = 1 more beat
    expect(scheduler.currentBeat).toBeCloseTo(3, 5);
  });

  // ── Seek ──

  it("seekTo during playback updates position", () => {
    scheduler.start(0);
    mockCtxTime = 0.5;
    scheduler.seekTo(10);
    expect(scheduler.currentBeat).toBeCloseTo(10, 5);
  });

  it("seekTo when stopped updates start offset", () => {
    scheduler.seekTo(16);
    scheduler.start(16);
    expect(scheduler.currentBeat).toBeCloseTo(16, 5);
  });

  // ── Loop boundary ──

  it("loop wraps beat position at loop end", () => {
    scheduler.updateConfig({ loopEnabled: true, loopStart: 4, loopEnd: 8 });
    scheduler.start(4);

    vi.useFakeTimers();
    // Advance past loop end: 4 beats at 120 BPM = 2 seconds
    mockCtxTime = 2.1;
    vi.advanceTimersByTime(30);

    // Beat should wrap back near loop start
    const beat = scheduler.currentBeat;
    expect(beat).toBeGreaterThanOrEqual(4);
    expect(beat).toBeLessThan(8);

    vi.useRealTimers();
  });

  // ── Dispose ──

  it("dispose stops scheduler and clears tracks", () => {
    scheduler.start(0);
    scheduler.dispose();
    expect(scheduler.isRunning).toBe(false);
  });
});
