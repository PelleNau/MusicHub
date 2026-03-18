/**
 * MockPluginHost — simulates the native plugin-host backend for development.
 * Matches the frozen protocol exactly so the UI can be built without the native app.
 */

import type {
  HostEnvelope,
  HealthResponse,
  PluginsResponse,
  HostPlugin,
  ScanResponse,
  ChainLoadRequest,
  ChainLoadResponse,
  ChainNode,
  RenderPreviewRequest,
  RenderPreviewResponse,
  ChainParamsResponse,
  ChainParamNode,
  PluginParam,
  PluginPresetsResponse,
  PluginPresetLoadResponse,
  PluginStateSaveResponse,
  PluginStateRestoreRequest,
  PluginStateRestoreResponse,
  EditorOpenRequest,
  EditorOpenResponse,
  EditorCloseRequest,
  BounceRequest,
  BounceResponse,
  MidiDevicesResponse,
  MidiDevice,
  MidiRouteRequest,
  AudioConfigRequest,
  AudioConfigResponse,
  RecordArmRequest,
  MonitorTrackRequest,
  FileBrowserRequest,
  FileBrowserResponse,
} from "@/services/pluginHostClient";

import type {
  InboundMessage,
  MeterUpdateEvent,
  TransportStateEvent,
  MeterLevel,
  OutboundMessage,
} from "@/services/pluginHostSocket";
import type { HostGraphTrack } from "@/services/pluginHostContracts";

/* ── Mock plugin catalog ── */

const ts = new Date().toISOString();

const MOCK_PLUGINS: HostPlugin[] = [
  { id: "serum-vst3", name: "Serum", vendor: "Xfer Records", version: "1.36b2", format: "VST3", category: "Instrument", path: "/Library/Audio/Plug-Ins/VST3/Serum.vst3", tags: ["Wavetable", "Synth"], installed: true, latencySamples: 0, supportsStateRestore: true, lastScanned: ts },
  { id: "proq3-vst3", name: "Pro-Q 3", vendor: "FabFilter", version: "3.22", format: "VST3", category: "Effect", path: "/Library/Audio/Plug-Ins/VST3/Pro-Q 3.vst3", tags: ["EQ"], installed: true, latencySamples: 0, supportsStateRestore: true, lastScanned: ts },
  { id: "pror2-vst3", name: "Pro-R 2", vendor: "FabFilter", version: "2.04", format: "VST3", category: "Effect", path: "/Library/Audio/Plug-Ins/VST3/Pro-R 2.vst3", tags: ["Reverb"], installed: true, latencySamples: 0, supportsStateRestore: true, lastScanned: ts },
  { id: "proc2-vst3", name: "Pro-C 2", vendor: "FabFilter", version: "2.16", format: "VST3", category: "Effect", path: "/Library/Audio/Plug-Ins/VST3/Pro-C 2.vst3", tags: ["Compressor"], installed: true, latencySamples: 0, supportsStateRestore: true, lastScanned: ts },
  { id: "vital-vst3", name: "Vital", vendor: "Matt Tytel", version: "1.5.5", format: "VST3", category: "Instrument", path: "/Library/Audio/Plug-Ins/VST3/Vital.vst3", tags: ["Wavetable", "Synth"], installed: true, latencySamples: 0, supportsStateRestore: true, lastScanned: ts },
  { id: "valhalla-room-au", name: "Valhalla Room", vendor: "Valhalla DSP", version: "1.6.5", format: "AU", category: "Effect", path: "/Library/Audio/Plug-Ins/Components/ValhallaRoom.component", tags: ["Reverb"], installed: true, latencySamples: 0, supportsStateRestore: true, lastScanned: ts },
  { id: "decapitator-au", name: "Decapitator", vendor: "Soundtoys", version: "5.4.1", format: "AU", category: "Effect", path: "/Library/Audio/Plug-Ins/Components/Decapitator.component", tags: ["Saturation"], installed: true, latencySamples: 0, supportsStateRestore: true, lastScanned: ts },
  { id: "ozone11-vst3", name: "Ozone 11", vendor: "iZotope", version: "11.0.1", format: "VST3", category: "Effect", path: "/Library/Audio/Plug-Ins/VST3/Ozone 11.vst3", tags: ["Mastering"], installed: true, latencySamples: 128, supportsStateRestore: true, lastScanned: ts },
];

/* ── Helper: wrap response in HostEnvelope ── */

let _reqCounter = 0;
function envelope<T>(operation: string, data: T): HostEnvelope<T> {
  return {
    requestId: `mock-${++_reqCounter}`,
    operation,
    elapsedMs: Math.round(Math.random() * 50 + 5),
    data,
  };
}

/* ── Mock chain state ── */

const mockChains = new Map<string, ChainNode[]>();
const mockSavedStates = new Map<string, string>();

function generateChainNodes(pluginIds: string[]): ChainNode[] {
  return pluginIds.map((pid, i) => {
    const plugin = MOCK_PLUGINS.find(p => p.id === pid);
    return {
      index: i,
      pluginId: pid,
      pluginName: plugin?.name ?? pid,
      vendor: plugin?.vendor ?? "Unknown",
      format: plugin?.format ?? "VST3",
      bypass: false,
      stateRestored: true,
      paramCount: 8 + Math.floor(Math.random() * 20),
      latencySamples: plugin?.latencySamples ?? 0,
      status: plugin ? "loaded" as const : "missing" as const,
    };
  });
}

/* ── Mock param generation ── */

function generateParams(pluginName: string, count: number): PluginParam[] {
  const paramNames = ["Mix", "Gain", "Frequency", "Resonance", "Attack", "Release", "Threshold", "Ratio", "Drive", "Depth", "Rate", "Feedback", "Width", "Tone", "Amount", "Decay", "Pre-Delay", "Damping", "Size", "Mod Depth"];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name: paramNames[i % paramNames.length],
    value: Math.random(),
    min: 0,
    max: 1,
    label: `${Math.round(Math.random() * 100)}%`,
    automatable: true,
  }));
}

/* ── Mock MIDI devices ── */

const MOCK_MIDI_DEVICES: MidiDevice[] = [
  { id: "midi-in-1", name: "Arturia KeyLab 61", type: "input", connected: true },
  { id: "midi-in-2", name: "Akai MPD226", type: "input", connected: true },
  { id: "midi-out-1", name: "IAC Driver Bus 1", type: "output", connected: true },
];

/* ── Transport simulation state ── */

interface MockTransportState {
  state: "playing" | "paused" | "stopped";
  beat: number;
  bpm: number;
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
}

/* ── Mock Host class ── */

export type MockEventListener = (msg: InboundMessage) => void;

export class MockPluginHost {
  private transport: MockTransportState = {
    state: "stopped",
    beat: 0,
    bpm: 120,
    loopEnabled: false,
    loopStart: 0,
    loopEnd: 16,
  };

  private listeners = new Set<MockEventListener>();
  private meterInterval: ReturnType<typeof setInterval> | null = null;
  private transportInterval: ReturnType<typeof setInterval> | null = null;
  private analysisInterval: ReturnType<typeof setInterval> | null = null;
  private trackIds: string[] = ["track-1", "track-2", "track-3"];

  /* ── Event subscription ── */

  onMessage(fn: MockEventListener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(msg: InboundMessage) {
    this.listeners.forEach(fn => fn(msg));
  }

  /* ── HTTP endpoint mocks ── */

  async health(): Promise<HostEnvelope<HealthResponse>> {
    return envelope("health", {
      status: "ok",
      version: "0.2.0-mock",
      os: "Mock OS",
      uptime: Math.floor(Date.now() / 1000) % 86400,
      sampleRate: 48000,
      bufferSize: 256,
      pluginCount: MOCK_PLUGINS.length,
      scanCacheValid: true,
      wsConnected: true,
    });
  }

  async plugins(): Promise<HostEnvelope<PluginsResponse>> {
    return envelope("plugins", {
      plugins: MOCK_PLUGINS,
      scanCacheAge: 120,
    });
  }

  async scan(): Promise<HostEnvelope<ScanResponse>> {
    await new Promise(r => setTimeout(r, 800));
    return envelope("scan", {
      scanId: `scan-${Date.now()}`,
      status: "complete",
      pluginCount: MOCK_PLUGINS.length,
      newPlugins: 0,
      removedPlugins: 0,
      failedPlugins: [],
      elapsedMs: 750,
    });
  }

  async loadChain(req: ChainLoadRequest): Promise<HostEnvelope<ChainLoadResponse>> {
    await new Promise(r => setTimeout(r, 300));
    const chainId = `chain-${Date.now()}`;
    const pluginIds = ["proq3-vst3", "proc2-vst3", "pror2-vst3"];
    const nodes = generateChainNodes(pluginIds);
    mockChains.set(chainId, nodes);

    return envelope("chains/load", {
      chainId,
      name: "Mock Chain",
      sampleRate: 48000,
      blockSize: 256,
      nodeCount: nodes.length,
      nodes,
      loadedCount: nodes.filter(n => n.status === "loaded").length,
      missingCount: nodes.filter(n => n.status === "missing").length,
      errorCount: nodes.filter(n => n.status === "error").length,
      totalLatencySamples: nodes.reduce((s, n) => s + n.latencySamples, 0),
      elapsedMs: 280,
    });
  }

  async renderPreview(req: RenderPreviewRequest): Promise<HostEnvelope<RenderPreviewResponse>> {
    await new Promise(r => setTimeout(r, 500));
    const dur = req.durationMs ?? 2000;
    const peaks = Array.from({ length: 200 }, () => Math.random() * 0.8);

    return envelope("render/preview", {
      renderId: `render-${Date.now()}`,
      sampleRate: 48000,
      channels: 2,
      durationMs: dur,
      peakAmplitude: 0.82,
      rmsLevel: -12.3,
      waveformPeaks: peaks,
      dcOffset: 0.001,
      clipped: false,
      silentOutput: false,
      perPluginMetrics: [],
      elapsedMs: 450,
    });
  }

  async chainParams(chainId: string): Promise<HostEnvelope<ChainParamsResponse>> {
    const nodes = mockChains.get(chainId);
    const paramNodes: ChainParamNode[] = (nodes ?? generateChainNodes(["proq3-vst3", "proc2-vst3"])).map(n => ({
      nodeIndex: n.index,
      pluginName: n.pluginName,
      params: generateParams(n.pluginName, n.paramCount),
    }));

    return envelope("chains/params", {
      chainId,
      nodes: paramNodes,
    });
  }

  async pluginPresets(chainId: string, nodeIndex: number): Promise<HostEnvelope<PluginPresetsResponse>> {
    return envelope("plugins.presets", {
      presets: [
        { index: 0, name: "Default" },
        { index: 1, name: "Wide" },
        { index: 2, name: "Bright" },
      ],
      currentIndex: 0,
    });
  }

  async loadPluginPreset(chainId: string, nodeIndex: number, index: number): Promise<HostEnvelope<PluginPresetLoadResponse>> {
    const presetNames = ["Default", "Wide", "Bright"];
    return envelope("plugins.presets.load", {
      loaded: true,
      name: presetNames[index] ?? `Preset ${index}`,
    });
  }

  async savePluginState(chainId: string, nodeIndex: number): Promise<HostEnvelope<PluginStateSaveResponse>> {
    const stateId = `mock-state-${chainId}-${nodeIndex}-${Date.now()}`;
    mockSavedStates.set(`${chainId}:${nodeIndex}`, stateId);
    return envelope("plugins.state.save", {
      stateId,
      pluginId: mockChains.get(chainId)?.[nodeIndex]?.pluginId ?? "unknown",
      sizeBytes: 4096,
      saved: true,
    });
  }

  async restorePluginState(
    chainId: string,
    nodeIndex: number,
    req: PluginStateRestoreRequest,
  ): Promise<HostEnvelope<PluginStateRestoreResponse>> {
    return envelope("plugins.state.restore", {
      restored: Boolean(req.stateId || mockSavedStates.get(`${chainId}:${nodeIndex}`)),
    });
  }

  async syncAudioGraph(tracks: HostGraphTrack[]): Promise<HostEnvelope<{ accepted: boolean }>> {
    this.trackIds = tracks.map((track) => track.id).slice(0, 20);
    return envelope("session/audio-graph", { accepted: true });
  }

  /* ── Extension HTTP mocks ── */

  async openEditorHttp(req: EditorOpenRequest): Promise<HostEnvelope<EditorOpenResponse>> {
    const chain = mockChains.values().next().value;
    const node = chain?.[req.nodeIndex];
    return envelope("plugins/editor/open", {
      opened: true,
      pluginId: node?.pluginId ?? "unknown",
      pluginName: node?.pluginName ?? "Unknown Plugin",
      windowId: `window-${Date.now()}`,
    });
  }

  async closeEditorHttp(req: EditorCloseRequest): Promise<HostEnvelope<{ closed: boolean }>> {
    return envelope("plugins/editor/close", { closed: true });
  }

  async bounce(req: BounceRequest): Promise<HostEnvelope<BounceResponse>> {
    const renderId = `bounce-${Date.now()}`;

    // Simulate progress events
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 0.1 + Math.random() * 0.1;
      if (progress >= 1) {
        progress = 1;
        clearInterval(progressInterval);
        this.emit({
          type: "render.complete",
          renderId,
          filePath: `/exports/bounce-${Date.now()}.${req.format}`,
          durationMs: 3500,
          fileSizeBytes: 24_000_000,
        });
      } else {
        this.emit({
          type: "render.progress",
          renderId,
          progress,
          elapsedMs: Math.round(progress * 3500),
        });
      }
    }, 350);

    return envelope("render/bounce", {
      renderId,
      estimatedMs: 3500,
    });
  }

  async midiDevices(): Promise<HostEnvelope<MidiDevicesResponse>> {
    return envelope("midi/devices", { devices: MOCK_MIDI_DEVICES });
  }

  async midiRoute(req: MidiRouteRequest): Promise<HostEnvelope<{ routed: boolean }>> {
    return envelope("midi/route", { routed: true });
  }

  async audioConfig(req?: AudioConfigRequest): Promise<HostEnvelope<AudioConfigResponse>> {
    return envelope("audio/config", {
      inputDevice: { id: "built-in-mic", name: "Built-in Microphone", type: "input", channels: 2, sampleRates: [44100, 48000, 96000] },
      outputDevice: { id: "built-in-out", name: "Built-in Output", type: "output", channels: 2, sampleRates: [44100, 48000, 96000] },
      sampleRate: req?.sampleRate ?? 48000,
      bufferSize: req?.bufferSize ?? 256,
      availableDevices: [
        { id: "built-in-mic", name: "Built-in Microphone", type: "input", channels: 2, sampleRates: [44100, 48000, 96000] },
        { id: "built-in-out", name: "Built-in Output", type: "output", channels: 2, sampleRates: [44100, 48000, 96000] },
        { id: "scarlett-in", name: "Scarlett 2i2 USB", type: "input", channels: 2, sampleRates: [44100, 48000, 88200, 96000, 192000] },
        { id: "scarlett-out", name: "Scarlett 2i2 USB", type: "output", channels: 2, sampleRates: [44100, 48000, 88200, 96000, 192000] },
      ],
    });
  }

  async recordArm(req: RecordArmRequest): Promise<HostEnvelope<{ armed: boolean }>> {
    return envelope("record/arm", { armed: req.armed });
  }

  async monitorTrack(req: MonitorTrackRequest): Promise<HostEnvelope<{ monitoring: boolean }>> {
    return envelope("audio/tracks/monitor", { monitoring: req.monitoring });
  }

  async fileBrowser(req: FileBrowserRequest): Promise<HostEnvelope<FileBrowserResponse>> {
    await new Promise(r => setTimeout(r, 200));
    return envelope("system/fileBrowser", {
      cancelled: false,
      path: "/Users/mock/Music/project.wav",
    });
  }

  /* ── WebSocket command handler ── */

  handleCommand(msg: OutboundMessage): void {
    switch (msg.type) {
      case "transport.play":
        this.transport.state = "playing";
        this.transport.beat = msg.fromBeat;
        this.startTransportTick();
        this.emitTransportState();
        break;

      case "transport.pause":
        this.transport.state = "paused";
        this.stopTransportTick();
        this.emitTransportState();
        break;

      case "transport.stop":
        this.transport.state = "stopped";
        this.transport.beat = 0;
        this.stopTransportTick();
        this.emitTransportState();
        break;

      case "transport.seek":
        this.transport.beat = msg.beat;
        this.emitTransportState();
        break;

      case "transport.tempo":
        this.transport.bpm = msg.bpm;
        this.emitTransportState();
        break;

      case "transport.loop":
        this.transport.loopEnabled = msg.enabled;
        this.transport.loopStart = msg.start;
        this.transport.loopEnd = msg.end;
        break;

      case "plugin.setParam":
        this.emit({
          type: "plugin.paramChanged",
          chainId: msg.chainId,
          nodeIndex: msg.nodeIndex,
          paramId: msg.paramId,
          value: msg.value,
        });
        break;

      case "plugin.bypass": {
        const chain = mockChains.get(msg.chainId);
        if (chain && chain[msg.nodeIndex]) {
          chain[msg.nodeIndex] = { ...chain[msg.nodeIndex], bypass: msg.bypass };
          this.emit({ type: "chain.state", chainId: msg.chainId, nodes: chain });
        }
        break;
      }

      case "chain.reorder": {
        const chain = mockChains.get(msg.chainId);
        if (chain) {
          const [node] = chain.splice(msg.fromIndex, 1);
          chain.splice(msg.toIndex, 0, node);
          chain.forEach((n, i) => n.index = i);
          this.emit({ type: "chain.state", chainId: msg.chainId, nodes: chain });
        }
        break;
      }

      case "chain.remove": {
        const chain = mockChains.get(msg.chainId);
        if (chain) {
          chain.splice(msg.nodeIndex, 1);
          chain.forEach((n, i) => n.index = i);
          this.emit({ type: "chain.state", chainId: msg.chainId, nodes: chain });
        }
        break;
      }

      case "chain.add": {
        const chain = mockChains.get(msg.chainId) ?? [];
        const nodes = generateChainNodes([msg.pluginId]);
        chain.splice(msg.atIndex, 0, nodes[0]);
        chain.forEach((n, i) => n.index = i);
        mockChains.set(msg.chainId, chain);
        this.emit({ type: "chain.state", chainId: msg.chainId, nodes: chain });
        break;
      }

      case "session.setTracks":
        this.trackIds = (msg.tracks as Array<{ id: string }>).map(t => t.id);
        break;

      case "editor.open":
        // Simulate editor opened, then auto-close after 5s
        setTimeout(() => {
          this.emit({
            type: "plugin.editorClosed",
            chainId: msg.chainId,
            nodeIndex: msg.nodeIndex,
          });
        }, 5000);
        break;

      case "editor.close":
        this.emit({
          type: "plugin.editorClosed",
          chainId: msg.chainId,
          nodeIndex: msg.nodeIndex,
        });
        break;

      case "midi.learn.start":
        // Simulate a captured CC after 2s
        setTimeout(() => {
          this.emit({
            type: "midi.learn.captured",
            deviceId: "midi-in-1",
            deviceName: "Arturia KeyLab 61",
            channel: 1,
            cc: 74,
            chainId: msg.chainId,
            nodeIndex: msg.nodeIndex,
            paramId: msg.paramId,
          });
        }, 2000);
        break;

      case "midi.learn.cancel":
        break;

      case "midi.sendNote":
        // Echo back as session.trackMidi for UI feedback
        this.emit({
          type: "session.trackMidi",
          trackId: msg.trackId,
          note: msg.note,
          velocity: msg.velocity,
          channel: msg.channel ?? 1,
          noteOn: msg.velocity > 0,
        });
        break;

      case "midi.sendCC":
        // No-op in mock — CC is applied silently
        break;

      case "analysis.start":
        this.startAnalysisEmit();
        break;

      case "analysis.stop":
        this.stopAnalysisEmit();
        break;

      case "record.start":
        // Simulate record levels
        this.startRecordLevelEmit();
        this.emit({ type: "audio.record.state" as const, recording: true, trackId: this.trackIds[0], durationMs: 0 } as InboundMessage);
        break;

      case "record.stop":
        this.stopRecordLevelEmit();
        this.emit({ type: "audio.record.state" as const, recording: false } as InboundMessage);
        break;
    }
  }

  /* ── Transport tick simulation ── */

  private startTransportTick() {
    this.stopTransportTick();
    const fps = 30;
    const msPerTick = 1000 / fps;
    const beatsPerMs = this.transport.bpm / 60000;

    // Emit engine state on playback start
    this.emit({
      type: "audio.engine.state",
      sampleRate: 48000,
      bufferSize: 256,
      cpuLoad: 8 + Math.random() * 5,
      outputDevice: "Built-in Output",
    } as InboundMessage);

    // Emit session state
    this.emit({
      type: "session.state",
      sessionId: "mock-session",
      tracks: this.trackIds.map(id => ({ id })),
      tempo: this.transport.bpm,
      loopEnabled: this.transport.loopEnabled,
      loopStart: this.transport.loopStart,
      loopEnd: this.transport.loopEnd,
    } as InboundMessage);

    // Emit midi device list
    this.emit({
      type: "midi.deviceChange",
      devices: MOCK_MIDI_DEVICES.map(d => ({
        id: d.id,
        name: d.name,
        input: d.type === "input",
        output: d.type === "output",
      })),
    } as InboundMessage);

    this.transportInterval = setInterval(() => {
      if (this.transport.state !== "playing") return;
      this.transport.beat += beatsPerMs * msPerTick;

      if (this.transport.loopEnabled && this.transport.beat >= this.transport.loopEnd) {
        this.transport.beat = this.transport.loopStart;
      }

      this.emitTransportState();
    }, msPerTick);

    this.startMeters();
  }

  private stopTransportTick() {
    if (this.transportInterval) {
      clearInterval(this.transportInterval);
      this.transportInterval = null;
    }
    this.stopMeters();
  }

  private emitTransportState() {
    const e: TransportStateEvent = {
      type: "transport.state",
      state: this.transport.state,
      beat: this.transport.beat,
      bpm: this.transport.bpm,
    };
    this.emit(e);
  }

  /* ── Meter simulation ── */

  private meterWalk = new Map<string, MeterLevel>();

  private randomWalk(prev: MeterLevel, active: boolean): MeterLevel {
    if (!active) return { peak: -60, rms: -60 };
    const walkPeak = prev.peak + (Math.random() - 0.52) * 4;
    const walkRms = prev.rms + (Math.random() - 0.52) * 2;
    return {
      peak: Math.max(-60, Math.min(0, walkPeak)),
      rms: Math.max(-60, Math.min(-3, walkRms)),
    };
  }

  private startMeters() {
    this.stopMeters();
    const active = this.transport.state === "playing";

    if (!this.meterWalk.has("master")) {
      this.meterWalk.set("master", { peak: -12, rms: -18 });
      this.trackIds.forEach(id => this.meterWalk.set(id, { peak: -15, rms: -22 }));
    }

    this.meterInterval = setInterval(() => {
      const playing = this.transport.state === "playing";
      const master = this.randomWalk(this.meterWalk.get("master")!, playing);
      this.meterWalk.set("master", master);

      const tracks: Record<string, MeterLevel> = {};
      for (const id of this.trackIds) {
        const prev = this.meterWalk.get(id) ?? { peak: -20, rms: -30 };
        const next = this.randomWalk(prev, playing);
        this.meterWalk.set(id, next);
        tracks[id] = next;
      }

      const e: MeterUpdateEvent = { type: "meter.update", master, tracks };
      this.emit(e);
    }, 1000 / 30);
  }

  private stopMeters() {
    if (this.meterInterval) {
      clearInterval(this.meterInterval);
      this.meterInterval = null;
    }
  }

  /* ── Analysis simulation ── */

  private startAnalysisEmit() {
    this.stopAnalysisEmit();
    this.analysisInterval = setInterval(() => {
      // Emit FFT spectrum (128 bins)
      const bins = Array.from({ length: 128 }, (_, i) => {
        const freq = (i / 128) * 24000;
        // Simulate a natural spectral shape: louder at low freq, decaying at high
        const base = -20 - (i / 128) * 40;
        return base + (Math.random() - 0.5) * 6;
      });
      this.emit({
        type: "analysis.spectrum",
        bins,
        fftSize: 4096,
        sampleRate: 48000,
      });

      // Emit LUFS
      this.emit({
        type: "analysis.lufs",
        momentary: -14 + (Math.random() - 0.5) * 4,
        shortTerm: -14 + (Math.random() - 0.5) * 2,
        integrated: -14 + (Math.random() - 0.5) * 0.5,
      });
    }, 1000 / 30);
  }

  private stopAnalysisEmit() {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
  }

  /* ── Record level simulation ── */

  private recordLevelInterval: ReturnType<typeof setInterval> | null = null;

  private startRecordLevelEmit() {
    this.stopRecordLevelEmit();
    this.recordLevelInterval = setInterval(() => {
      for (const id of this.trackIds) {
        this.emit({
          type: "record.level",
          trackId: id,
          peak: -12 + (Math.random() - 0.5) * 8,
          rms: -18 + (Math.random() - 0.5) * 4,
        });
      }
    }, 1000 / 30);
  }

  private stopRecordLevelEmit() {
    if (this.recordLevelInterval) {
      clearInterval(this.recordLevelInterval);
      this.recordLevelInterval = null;
    }
  }

  /* ── Cleanup ── */

  dispose() {
    this.stopTransportTick();
    this.stopMeters();
    this.stopAnalysisEmit();
    this.stopRecordLevelEmit();
    this.listeners.clear();
    mockChains.clear();
  }
}

/** Singleton for convenience */
export const mockHost = new MockPluginHost();
