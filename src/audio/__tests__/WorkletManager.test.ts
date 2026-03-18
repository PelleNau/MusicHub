import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";

// Mock supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    storage: {
      from: () => ({
        createSignedUrl: vi.fn().mockResolvedValue({ data: null }),
      }),
    },
  },
}));

// Mock AudioWorkletNode
class MockAudioWorkletNode {
  port = {
    postMessage: vi.fn(),
    onmessage: null as ((e: any) => void) | null,
  };
  connect = vi.fn().mockReturnThis();
  disconnect = vi.fn();
  context: any;

  constructor(ctx: any, _name: string, _options?: any) {
    this.context = ctx;
  }

  /** Simulate a message from the worklet processor */
  _simulateMessage(data: any) {
    if (this.port.onmessage) {
      this.port.onmessage({ data });
    }
  }
}

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

  audioWorklet = {
    addModule: vi.fn().mockResolvedValue(undefined),
  };

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
  (globalThis as any).AudioWorkletNode = MockAudioWorkletNode;
  // Ensure prototype has audioWorklet so isSupported check passes
  MockAudioContext.prototype.audioWorklet = { addModule: vi.fn() } as any;
});

import { WorkletManager } from "../WorkletManager";

describe("WorkletManager", () => {
  let ctx: any;
  let manager: WorkletManager;

  beforeEach(() => {
    mockCtxTime = 0;
    ctx = new MockAudioContext();
    manager = new WorkletManager();
    manager.updateContext(ctx);
  });

  it("reports isSupported when AudioWorkletNode exists", () => {
    expect(WorkletManager.isSupported).toBe(true);
  });

  it("loads a module via audioWorklet.addModule", async () => {
    const loaded = await manager.ensureModule("meter-processor");
    expect(loaded).toBe(true);
    expect(ctx.audioWorklet.addModule).toHaveBeenCalledWith("/worklets/meter-processor.js");
  });

  it("does not double-load the same module", async () => {
    await manager.ensureModule("meter-processor");
    await manager.ensureModule("meter-processor");
    expect(ctx.audioWorklet.addModule).toHaveBeenCalledTimes(1);
  });

  it("reloads modules after context change", async () => {
    await manager.ensureModule("meter-processor");
    const newCtx = new MockAudioContext();
    manager.updateContext(newCtx as any);
    await manager.ensureModule("meter-processor");
    // First ctx + second ctx
    expect(ctx.audioWorklet.addModule).toHaveBeenCalledTimes(1);
    expect(newCtx.audioWorklet.addModule).toHaveBeenCalledTimes(1);
  });

  it("creates a meter node and receives data", async () => {
    const onMeter = vi.fn();
    const node = await manager.createMeterNode("test-meter", onMeter);

    expect(node).not.toBeNull();
    expect(node!.port.postMessage).toHaveBeenCalledWith({ type: "set-interval", value: 16 });

    // Simulate message from worklet
    const mockData = { type: "meter", rms: new Float32Array([0.1, 0.2]), peak: new Float32Array([0.5, 0.6]) };
    (node as any)._simulateMessage(mockData);

    expect(onMeter).toHaveBeenCalledWith({ rms: mockData.rms, peak: mockData.peak });
  });

  it("creates a waveform node with custom width", async () => {
    const onWaveform = vi.fn();
    const node = await manager.createWaveformNode("test-waveform", onWaveform, 512, 50);

    expect(node).not.toBeNull();
    expect(node!.port.postMessage).toHaveBeenCalledWith({ type: "set-width", value: 512 });
    expect(node!.port.postMessage).toHaveBeenCalledWith({ type: "set-interval", value: 50 });
  });

  it("creates a phase scope node and receives correlation data", async () => {
    const onPhase = vi.fn();
    const node = await manager.createPhaseScopeNode("test-phase", onPhase);

    expect(node).not.toBeNull();

    (node as any)._simulateMessage({ type: "phase", correlation: 0.95, balance: -0.1 });
    expect(onPhase).toHaveBeenCalledWith({ correlation: 0.95, balance: -0.1 });
  });

  it("disposes nodes by label", async () => {
    const onMeter = vi.fn();
    const node = await manager.createMeterNode("track:1", onMeter);
    await manager.createMeterNode("track:2", vi.fn());

    manager.disposeNode("track:1");

    expect(node!.port.postMessage).toHaveBeenCalledWith({ type: "dispose" });
    expect(node!.disconnect).toHaveBeenCalled();
    expect(manager.getNodesByLabel("track:1")).toHaveLength(0);
    expect(manager.getNodesByLabel("track:2")).toHaveLength(1);
  });

  it("disposeAllNodes cleans up everything", async () => {
    await manager.createMeterNode("a", vi.fn());
    await manager.createMeterNode("b", vi.fn());

    manager.disposeAllNodes();

    expect(manager.getNodesByLabel("a")).toHaveLength(0);
    expect(manager.getNodesByLabel("b")).toHaveLength(0);
  });

  it("ensureAllModules loads all processors", async () => {
    const result = await manager.ensureAllModules();
    expect(result).toBe(true);
    expect(ctx.audioWorklet.addModule).toHaveBeenCalledTimes(3);
  });

  it("handles addModule failure gracefully", async () => {
    ctx.audioWorklet.addModule = vi.fn().mockRejectedValue(new Error("Network error"));
    const loaded = await manager.ensureModule("meter-processor");
    expect(loaded).toBe(false);
  });

  it("returns null when creating node if module fails to load", async () => {
    ctx.audioWorklet.addModule = vi.fn().mockRejectedValue(new Error("fail"));
    const node = await manager.createMeterNode("x", vi.fn());
    expect(node).toBeNull();
  });

  it("dispose clears all state", async () => {
    await manager.createMeterNode("test", vi.fn());
    manager.dispose();
    expect(manager.getNodesByLabel("test")).toHaveLength(0);
  });
});
