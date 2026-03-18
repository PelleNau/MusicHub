/**
 * WorkletManager — loads, instantiates, and manages AudioWorkletNodes.
 *
 * Responsibilities:
 *  - Lazy-loads worklet processor modules via audioContext.audioWorklet.addModule()
 *  - Caches loaded module state per AudioContext to avoid double-loading
 *  - Creates typed AudioWorkletNode instances with message routing
 *  - Provides graceful fallback to AnalyserNode when AudioWorklet is unsupported
 *  - Handles lifecycle (dispose, context changes)
 */

/* ── Types ── */

export interface MeterData {
  rms: Float32Array;
  peak: Float32Array;
}

export interface WaveformData {
  data: Float32Array; // interleaved min/max pairs
}

export interface PhaseData {
  correlation: number; // -1 to +1
  balance: number;     // -1 to +1
}

export type MeterCallback = (data: MeterData) => void;
export type WaveformCallback = (data: WaveformData) => void;
export type PhaseCallback = (data: PhaseData) => void;

export type WorkletProcessorName =
  | "meter-processor"
  | "waveform-processor"
  | "phase-scope-processor";

const PROCESSOR_URLS: Record<WorkletProcessorName, string> = {
  "meter-processor": "/worklets/meter-processor.js",
  "waveform-processor": "/worklets/waveform-processor.js",
  "phase-scope-processor": "/worklets/phase-scope-processor.js",
};

/* ── Tracked worklet node ── */

interface ManagedWorkletNode {
  node: AudioWorkletNode;
  processorName: WorkletProcessorName;
  label: string;
}

/* ════════════════════════════════════════════
 *  WorkletManager
 * ════════════════════════════════════════════ */

export class WorkletManager {
  private ctx: AudioContext | null = null;
  private loadedModules = new Set<string>(); // keyed by "contextId:processorName"
  private managedNodes: ManagedWorkletNode[] = [];
  private contextGeneration = 0;

  /** Whether the browser supports AudioWorklet */
  static get isSupported(): boolean {
    return typeof AudioWorkletNode !== "undefined" &&
      typeof AudioContext !== "undefined" &&
      "audioWorklet" in AudioContext.prototype;
  }

  /* ── Context management ── */

  updateContext(ctx: AudioContext) {
    if (ctx === this.ctx) return;
    // New context — invalidate loaded modules and dispose old nodes
    this.disposeAllNodes();
    this.ctx = ctx;
    this.contextGeneration++;
    this.loadedModules.clear();
  }

  /* ── Module loading ── */

  /**
   * Ensure a processor module is loaded into the current AudioContext.
   * Safe to call multiple times — will only load once per context.
   */
  async ensureModule(processorName: WorkletProcessorName): Promise<boolean> {
    if (!this.ctx || !WorkletManager.isSupported) return false;

    const key = `${this.contextGeneration}:${processorName}`;
    if (this.loadedModules.has(key)) return true;

    try {
      await this.ctx.audioWorklet.addModule(PROCESSOR_URLS[processorName]);
      this.loadedModules.add(key);
      return true;
    } catch (err) {
      console.warn(`[WorkletManager] Failed to load ${processorName}:`, err);
      return false;
    }
  }

  /** Load all standard processor modules */
  async ensureAllModules(): Promise<boolean> {
    const results = await Promise.all([
      this.ensureModule("meter-processor"),
      this.ensureModule("waveform-processor"),
      this.ensureModule("phase-scope-processor"),
    ]);
    return results.every(Boolean);
  }

  /* ── Node creation ── */

  /**
   * Create a meter worklet node.
   * Returns an AudioWorkletNode that can be inserted into a signal chain.
   * Calls `onMeter` with RMS/peak data at ~60fps.
   */
  async createMeterNode(
    label: string,
    onMeter: MeterCallback,
    reportIntervalMs = 16,
  ): Promise<AudioWorkletNode | null> {
    if (!this.ctx) return null;

    const loaded = await this.ensureModule("meter-processor");
    if (!loaded) return null;

    try {
      const node = new AudioWorkletNode(this.ctx, "meter-processor", {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [2],
      });

      node.port.onmessage = (e) => {
        if (e.data.type === "meter") {
          onMeter({ rms: e.data.rms, peak: e.data.peak });
        }
      };

      node.port.postMessage({ type: "set-interval", value: reportIntervalMs });

      this.managedNodes.push({ node, processorName: "meter-processor", label });
      return node;
    } catch (err) {
      console.warn(`[WorkletManager] Failed to create meter node "${label}":`, err);
      return null;
    }
  }

  /**
   * Create a waveform capture worklet node.
   * Returns an AudioWorkletNode for live waveform visualization.
   */
  async createWaveformNode(
    label: string,
    onWaveform: WaveformCallback,
    width = 256,
    reportIntervalMs = 33,
  ): Promise<AudioWorkletNode | null> {
    if (!this.ctx) return null;

    const loaded = await this.ensureModule("waveform-processor");
    if (!loaded) return null;

    try {
      const node = new AudioWorkletNode(this.ctx, "waveform-processor", {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [2],
      });

      node.port.onmessage = (e) => {
        if (e.data.type === "waveform") {
          onWaveform({ data: e.data.data });
        }
      };

      node.port.postMessage({ type: "set-width", value: width });
      node.port.postMessage({ type: "set-interval", value: reportIntervalMs });

      this.managedNodes.push({ node, processorName: "waveform-processor", label });
      return node;
    } catch (err) {
      console.warn(`[WorkletManager] Failed to create waveform node "${label}":`, err);
      return null;
    }
  }

  /**
   * Create a phase scope worklet node for stereo correlation analysis.
   */
  async createPhaseScopeNode(
    label: string,
    onPhase: PhaseCallback,
    reportIntervalMs = 50,
  ): Promise<AudioWorkletNode | null> {
    if (!this.ctx) return null;

    const loaded = await this.ensureModule("phase-scope-processor");
    if (!loaded) return null;

    try {
      const node = new AudioWorkletNode(this.ctx, "phase-scope-processor", {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [2],
      });

      node.port.onmessage = (e) => {
        if (e.data.type === "phase") {
          onPhase({
            correlation: e.data.correlation,
            balance: e.data.balance,
          });
        }
      };

      node.port.postMessage({ type: "set-interval", value: reportIntervalMs });

      this.managedNodes.push({ node, processorName: "phase-scope-processor", label });
      return node;
    } catch (err) {
      console.warn(`[WorkletManager] Failed to create phase scope node "${label}":`, err);
      return null;
    }
  }

  /* ── Node management ── */

  /** Get all managed nodes with a given label */
  getNodesByLabel(label: string): AudioWorkletNode[] {
    return this.managedNodes
      .filter((m) => m.label === label)
      .map((m) => m.node);
  }

  /** Dispose a specific node by label */
  disposeNode(label: string) {
    const toRemove = this.managedNodes.filter((m) => m.label === label);
    for (const managed of toRemove) {
      managed.node.port.postMessage({ type: "dispose" });
      try { managed.node.disconnect(); } catch { /* ok */ }
    }
    this.managedNodes = this.managedNodes.filter((m) => m.label !== label);
  }

  /** Dispose all managed nodes */
  disposeAllNodes() {
    for (const managed of this.managedNodes) {
      managed.node.port.postMessage({ type: "dispose" });
      try { managed.node.disconnect(); } catch { /* ok */ }
    }
    this.managedNodes = [];
  }

  /** Full cleanup */
  dispose() {
    this.disposeAllNodes();
    this.loadedModules.clear();
    this.ctx = null;
  }
}
