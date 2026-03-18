import { describe, it, expect, vi, beforeEach, afterEach, beforeAll } from "vitest";

// Mock supabase before importing AudioEngine
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    storage: {
      from: () => ({
        createSignedUrl: vi.fn().mockResolvedValue({ data: null }),
      }),
    },
  },
}));

// Minimal Web Audio API mock for jsdom
beforeAll(() => {
  const createMockAudioParam = (defaultValue = 0) => ({
    value: defaultValue,
    defaultValue,
    setValueAtTime: vi.fn().mockReturnThis(),
    linearRampToValueAtTime: vi.fn().mockReturnThis(),
    exponentialRampToValueAtTime: vi.fn().mockReturnThis(),
    cancelScheduledValues: vi.fn().mockReturnThis(),
  });

  const createMockNode = (ctx: any) => ({
    context: ctx,
    connect: vi.fn().mockReturnThis(),
    disconnect: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });

  class MockGainNode {
    context: any;
    gain = createMockAudioParam(1);
    connect = vi.fn().mockReturnThis();
    disconnect = vi.fn();
  }

  class MockStereoPannerNode {
    context: any;
    pan = createMockAudioParam(0);
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

  class MockBiquadFilterNode {
    context: any;
    type = "lowpass";
    frequency = createMockAudioParam(350);
    Q = createMockAudioParam(1);
    gain = createMockAudioParam(0);
    connect = vi.fn().mockReturnThis();
    disconnect = vi.fn();
  }

  class MockDynamicsCompressorNode {
    context: any;
    threshold = createMockAudioParam(-24);
    ratio = createMockAudioParam(12);
    attack = createMockAudioParam(0.003);
    release = createMockAudioParam(0.25);
    knee = createMockAudioParam(30);
    connect = vi.fn().mockReturnThis();
    disconnect = vi.fn();
  }

  class MockDelayNode {
    context: any;
    delayTime = createMockAudioParam(0);
    connect = vi.fn().mockReturnThis();
    disconnect = vi.fn();
  }

  class MockAudioContext {
    state = "running";
    currentTime = 0;
    destination = { context: this };

    createGain() {
      const node = new MockGainNode();
      node.context = this;
      return node;
    }
    createStereoPanner() {
      const node = new MockStereoPannerNode();
      node.context = this;
      return node;
    }
    createOscillator() {
      const node = new MockOscillatorNode();
      node.context = this;
      return node;
    }
    createBiquadFilter() {
      const node = new MockBiquadFilterNode();
      node.context = this;
      return node;
    }
    createDynamicsCompressor() {
      const node = new MockDynamicsCompressorNode();
      node.context = this;
      return node;
    }
    createDelay() {
      const node = new MockDelayNode();
      node.context = this;
      return node;
    }
    createBufferSource() {
      return {
        context: this,
        buffer: null,
        connect: vi.fn().mockReturnThis(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      };
    }
    resume = vi.fn().mockResolvedValue(undefined);
    close = vi.fn().mockResolvedValue(undefined);
    decodeAudioData = vi.fn().mockResolvedValue({ duration: 1, getChannelData: () => new Float32Array(100) });
  }

  (globalThis as any).AudioContext = MockAudioContext;
});

import { AudioEngine } from "../AudioEngine";

describe("AudioEngine", () => {
  let engine: AudioEngine;

  beforeEach(() => {
    engine = new AudioEngine();
  });

  afterEach(() => {
    engine.dispose();
  });

  // ── Initial state ──

  it("starts in stopped state at beat 0", () => {
    expect(engine.playbackState).toBe("stopped");
    expect(engine.currentBeat).toBe(0);
  });

  it("has default tempo of 120", () => {
    expect(engine.tempo).toBe(120);
  });

  it("has loop disabled by default", () => {
    expect(engine.loopEnabled).toBe(false);
    expect(engine.loopStart).toBe(0);
    expect(engine.loopEnd).toBe(8);
  });

  it("has metronome disabled by default", () => {
    expect(engine.metronomeEnabled).toBe(false);
  });

  // ── Configuration ──

  it("setTempo updates tempo", () => {
    engine.setTempo(140);
    expect(engine.tempo).toBe(140);
  });

  // ── Loop controls ──

  it("toggleLoop flips loop state", () => {
    expect(engine.loopEnabled).toBe(false);
    engine.toggleLoop();
    expect(engine.loopEnabled).toBe(true);
    engine.toggleLoop();
    expect(engine.loopEnabled).toBe(false);
  });

  it("setLoopRegion updates start and end", () => {
    engine.setLoopRegion(4, 16);
    expect(engine.loopStart).toBe(4);
    expect(engine.loopEnd).toBe(16);
  });

  it("setLoop sets enabled, start and end", () => {
    engine.setLoop(true, 2, 10);
    expect(engine.loopEnabled).toBe(true);
    expect(engine.loopStart).toBe(2);
    expect(engine.loopEnd).toBe(10);
  });

  it("setLoop with only enabled preserves existing region", () => {
    engine.setLoopRegion(4, 16);
    engine.setLoop(true);
    expect(engine.loopStart).toBe(4);
    expect(engine.loopEnd).toBe(16);
  });

  // ── Metronome ──

  it("toggleMetronome flips metronome state", () => {
    expect(engine.metronomeEnabled).toBe(false);
    engine.toggleMetronome();
    expect(engine.metronomeEnabled).toBe(true);
    engine.toggleMetronome();
    expect(engine.metronomeEnabled).toBe(false);
  });

  it("setMetronome sets explicit state", () => {
    engine.setMetronome(true);
    expect(engine.metronomeEnabled).toBe(true);
    engine.setMetronome(false);
    expect(engine.metronomeEnabled).toBe(false);
  });

  // ── Multi-subscriber pattern ──

  it("supports multiple subscribers", () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    engine.subscribe(fn1);
    engine.subscribe(fn2);

    engine.toggleLoop(); // triggers notifyImmediate

    expect(fn1).toHaveBeenCalled();
    expect(fn2).toHaveBeenCalled();
  });

  it("unsubscribe removes only that listener", () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    const unsub1 = engine.subscribe(fn1);
    engine.subscribe(fn2);

    unsub1();
    engine.toggleLoop();

    expect(fn1).not.toHaveBeenCalled();
    expect(fn2).toHaveBeenCalled();
  });

  it("subscribe returns a cleanup function", () => {
    const fn = vi.fn();
    const unsub = engine.subscribe(fn);
    expect(typeof unsub).toBe("function");
    unsub();
    engine.toggleMetronome();
    expect(fn).not.toHaveBeenCalled();
  });

  // ── Transport state transitions ──

  it("play transitions to playing state", async () => {
    await engine.play();
    expect(engine.playbackState).toBe("playing");
  });

  it("pause from playing transitions to paused", async () => {
    await engine.play();
    engine.pause();
    expect(engine.playbackState).toBe("paused");
  });

  it("stop resets to stopped at beat 0", async () => {
    await engine.play();
    engine.stop();
    expect(engine.playbackState).toBe("stopped");
    expect(engine.currentBeat).toBe(0);
  });

  it("pause preserves beat position (non-zero after play)", async () => {
    await engine.play();
    // Simulate some time passing by seeking
    engine.seekToBeat(8);
    engine.pause();
    expect(engine.playbackState).toBe("paused");
    expect(engine.currentBeat).toBe(8);
  });

  it("stop always resets beat to 0", async () => {
    await engine.play();
    engine.seekToBeat(16);
    engine.stop();
    expect(engine.currentBeat).toBe(0);
  });

  // ── Seek ──

  it("seekToBeat updates currentBeat", () => {
    engine.seekToBeat(12);
    expect(engine.currentBeat).toBe(12);
  });

  it("seekToBeat notifies subscribers", () => {
    const fn = vi.fn();
    engine.subscribe(fn);
    engine.seekToBeat(4);
    expect(fn).toHaveBeenCalled();
  });

  // ── Dispose ──

  it("dispose clears subscribers", () => {
    const fn = vi.fn();
    engine.subscribe(fn);
    engine.dispose();
    // After dispose, no notifications
    expect(fn).not.toHaveBeenCalled();
  });

  it("dispose sets context to null", () => {
    // Force context creation
    engine.seekToBeat(0);
    engine.dispose();
    expect(engine.audioContext).toBeNull();
    expect(engine.master).toBeNull();
  });

  // ── buildGraph with empty tracks ──

  it("buildGraph with empty array does not throw", () => {
    expect(() => engine.buildGraph([])).not.toThrow();
  });

  it("buildGraph with basic track creates nodes", () => {
    engine.buildGraph([
      {
        id: "t1",
        session_id: "s1",
        name: "Track 1",
        type: "audio",
        color: 0,
        volume: 0.8,
        pan: 0,
        is_muted: false,
        is_soloed: false,
        device_chain: [],
        sends: [],
        clips: [],
        sort_order: 0,
        input_from: null,
        created_at: "",
      },
    ]);
    // Should not throw and engine should still be functional
    expect(engine.playbackState).toBe("stopped");
  });

  it("treats solo as exclusive even if stale state contains multiple soloed tracks", () => {
    engine.buildGraph([
      {
        id: "t1",
        session_id: "s1",
        name: "Track 1",
        type: "audio",
        color: 0,
        volume: 0.8,
        pan: 0,
        is_muted: false,
        is_soloed: true,
        device_chain: [],
        sends: [],
        clips: [],
        sort_order: 0,
        input_from: null,
        created_at: "",
      },
      {
        id: "t2",
        session_id: "s1",
        name: "Track 2",
        type: "audio",
        color: 0,
        volume: 0.6,
        pan: 0,
        is_muted: false,
        is_soloed: true,
        device_chain: [],
        sends: [],
        clips: [],
        sort_order: 1,
        input_from: null,
        created_at: "",
      },
    ]);

    const trackNodes = (engine as unknown as { trackNodes: Map<string, { gain: { gain: { value: number } } }> }).trackNodes;
    expect(trackNodes.get("t1")?.gain.gain.value).toBe(0.8);
    expect(trackNodes.get("t2")?.gain.gain.value).toBe(0);
  });
});
