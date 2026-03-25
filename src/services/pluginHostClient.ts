import type { HostGraphTrack } from "@/services/pluginHostContracts";
import { resolvePluginHostBaseUrl } from "@/services/pluginHostConfig";

/**
 * PluginHostClient — typed HTTP client for the local plugin-host backend.
 *
 * Default endpoint: http://127.0.0.1:8080
 * All methods throw on network error; callers handle error state.
 */

/* ── Response envelope (matches backend response format) ── */

export interface HostEnvelope<T = unknown> {
  requestId: string;
  operation: string;
  elapsedMs: number;
  data: T;
  error?: string | HostErrorPayload;
}

export interface HostErrorPayload {
  code?: string;
  message?: string;
  stage?: string;
  plugin?: {
    id?: string;
    path?: string;
    name?: string;
    format?: string;
    manufacturer?: string;
  };
  detail?: string;
}

/* ── GET /health ── */

export interface HealthResponse {
  status: "ok" | "degraded" | "error";
  version: string;
  os: string;
  uptime: number;        // seconds
  sampleRate: number;
  bufferSize: number;
  pluginCount: number;
  scanCacheValid: boolean;
  wsConnected?: boolean;
}

/* ── GET /chains/:chainId/params ── */

export interface PluginParam {
  id: number;
  name: string;
  value: number;
  min: number;
  max: number;
  label: string;
  automatable: boolean;
}

export interface ChainParamNode {
  nodeIndex: number;
  pluginName: string;
  params: PluginParam[];
}

export interface ChainParamsResponse {
  chainId: string;
  nodes: ChainParamNode[];
}

/* ── GET /plugins/:chainId/:nodeIndex/presets ── */

export interface PluginPreset {
  index: number;
  name: string;
}

export interface PluginPresetsResponse {
  presets: PluginPreset[];
  currentIndex: number;
}

export interface PluginPresetLoadResponse {
  loaded: boolean;
  name: string;
}

/* ── POST /plugins/:chainId/:nodeIndex/state/save|restore ── */

export interface PluginStateSaveResponse {
  stateId: string;
  pluginId: string;
  sizeBytes: number;
  saved: boolean;
}

export interface PluginStateRestoreRequest {
  stateId: string;
}

export interface PluginStateRestoreResponse {
  restored: boolean;
}

/* ── GET /plugins ── */

export interface HostPlugin {
  id: string;
  name: string;
  vendor: string;
  version: string;
  format: "VST3" | "AU" | "VST" | "AAX" | "CLAP";
  category: "Instrument" | "Effect" | "MIDI Effect" | "Analyzer";
  path: string;
  tags: string[];
  installed: boolean;
  latencySamples: number;
  supportsStateRestore: boolean;
  lastScanned: string;
  /* Extended diagnostic fields — nullable for backward compat */
  supportsMidi?: boolean;
  numAudioInputs?: number;
  numAudioOutputs?: number;
  numMidiInputs?: number;
  numMidiOutputs?: number;
  scanStatus?: "ok" | "warning" | "failed" | "quarantined";
  scanError?: string;
  quarantined?: boolean;
  quarantineReason?: string;
  failureHistory?: PluginFailureEntry[];
}

export interface PluginFailureEntry {
  timestamp: string;
  stage: "scan" | "load" | "render" | "state-restore" | "parameter";
  error: string;
  recovered: boolean;
}

export interface PluginsResponse {
  plugins: HostPlugin[];
  scanCacheAge: number;  // seconds since last scan
}

/* ── POST /scan ── */

export interface ScanRequest {
  paths?: string[];       // optional override scan paths
  force?: boolean;        // ignore cache
}

export interface ScanResponse {
  scanId: string;
  status: "complete" | "partial" | "error";
  pluginCount: number;
  newPlugins: number;
  removedPlugins: number;
  failedPlugins: ScanFailure[];
  elapsedMs: number;
}

export interface ScanFailure {
  path: string;
  name?: string;
  vendor?: string;
  format?: string;
  error: string;
  stage: "discovery" | "load" | "validation";
}

/* ── POST /chains/load ── */

export interface ChainLoadRequest {
  manifestPath?: string;
  manifest?: object;      // inline manifest JSON
}

export interface ChainNode {
  index: number;
  pluginId: string;
  pluginName: string;
  vendor: string;
  format: string;
  bypass: boolean;
  supportsEditor?: boolean;
  stateRestored: boolean;
  paramCount: number;
  latencySamples: number;
  status: "loaded" | "missing" | "error";
  error?: string;
}

export interface ChainLoadResponse {
  chainId: string;
  name: string;
  sampleRate: number;
  blockSize: number;
  nodeCount: number;
  nodes: ChainNode[];
  loadedCount: number;
  missingCount: number;
  errorCount: number;
  totalLatencySamples: number;
  elapsedMs: number;
}

type RawChainNode = Partial<ChainNode> & {
  id?: string;
  name?: string;
  manufacturer?: string;
  restoredStateBytes?: number;
  parameterCount?: number;
  nodeIndex?: number;
  status?: string;
};

type RawLoadedChain = {
  sampleRate?: number;
  blockSize?: number;
  plugins?: RawChainNode[];
};

type RawChainLoadResponse = Partial<ChainLoadResponse> & {
  loadedChain?: RawLoadedChain;
  manifest?: { name?: string };
  nodes?: RawChainNode[];
};

/* ── POST /render/preview ── */

export interface RenderPreviewRequest {
  chainId?: string;
  manifestPath?: string;
  inputType?: "impulse" | "midi" | "silence";
  midiNote?: number;
  midiVelocity?: number;
  durationMs?: number;
}

export interface RenderPreviewResponse {
  renderId: string;
  sampleRate: number;
  channels: number;
  durationMs: number;
  peakAmplitude: number;
  rmsLevel: number;
  waveformPeaks: number[];
  dcOffset: number;
  clipped: boolean;
  silentOutput: boolean;
  perPluginMetrics: PluginRenderMetric[];
  elapsedMs: number;
}

export interface PluginRenderMetric {
  index: number;
  pluginName: string;
  peakOut: number;
  rmsOut: number;
  latencySamples: number;
  cpuTimeMs: number;
  clipped: boolean;
  silent: boolean;
}

/* ── POST /plugins/editor/open ── */

export interface EditorOpenRequest {
  chainId: string;
  nodeIndex: number;
}

export interface EditorOpenResponse {
  opened: boolean;
  pluginId: string;
  pluginName: string;
  windowId?: string;
}

/* ── POST /plugins/editor/close ── */

export interface EditorCloseRequest {
  chainId: string;
  nodeIndex: number;
}

export interface EditorCloseResponse {
  closed: boolean;
  alreadyClosed?: boolean;
}

/* ── POST /render/bounce ── */

export interface BounceRequest {
  sessionId: string;
  format: "wav" | "aiff" | "mp3" | "flac";
  sampleRate: 44100 | 48000 | 88200 | 96000;
  bitDepth: 16 | 24 | 32;
  normalize: boolean;
  tailMs?: number;
  trackIds?: string[];  // null = full mix
}

export interface BounceResponse {
  renderId: string;
  estimatedMs: number;
}

/* ── GET /midi/devices ── */

export interface MidiDevice {
  id: string;
  name: string;
  type: "input" | "output";
  connected: boolean;
}

export interface MidiDevicesResponse {
  devices: MidiDevice[];
}

/* ── POST /midi/route ── */

export interface MidiRouteRequest {
  deviceId: string;
  trackId: string;
  channel?: number;  // 1-16, null = omni
}

/* ── POST /audio/config ── */

export interface AudioConfigRequest {
  inputDeviceId?: string;
  outputDeviceId?: string;
  sampleRate?: number;
  bufferSize?: number;
}

export interface AudioDevice {
  id: string;
  name: string;
  type: "input" | "output";
  channels: number;
  sampleRates: number[];
}

export interface AudioConfigResponse {
  inputDevice: AudioDevice | null;
  outputDevice: AudioDevice | null;
  sampleRate: number;
  bufferSize: number;
  availableDevices: AudioDevice[];
}

interface NativeAudioDevicesResponse {
  deviceTypes: Array<{
    type: string;
    inputs: string[];
    outputs: string[];
  }>;
  current: {
    inputDeviceName: string;
    outputDeviceName: string;
    sampleRate: number;
    bufferSize: number;
    inputChannels: number;
    outputChannels: number;
  };
  engineState?: {
    sampleRate?: number;
    bufferSize?: number;
  };
}

/* ── POST /record/arm ── */

export interface RecordArmRequest {
  trackId: string;
  armed: boolean;
  inputChannel?: number;
}

export interface MonitorTrackRequest {
  trackId: string;
  monitoring: boolean;
}

/* ── POST /system/fileBrowser ── */

export interface FileBrowserRequest {
  mode: "open" | "save";
  title?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  defaultPath?: string;
}

export interface FileBrowserResponse {
  cancelled: boolean;
  path: string | null;
  paths?: string[];
}

/* ── Diagnostics aggregate ── */

export interface DiagnosticEntry {
  timestamp: string;
  level: "info" | "warning" | "error";
  stage: string;
  pluginName?: string;
  pluginId?: string;
  message: string;
  detail?: string;
}

/* ── Client ── */

const DEFAULT_BASE = resolvePluginHostBaseUrl();
const TIMEOUT_MS = 30_000;

export function normalizeChainLoadRequest(req: ChainLoadRequest): Record<string, unknown> {
  return {
    ...(req.manifestPath ? { manifest_path: req.manifestPath } : {}),
    ...(req.manifest ? { manifest: req.manifest } : {}),
  };
}

function normalizeChainNodeStatus(status: string | undefined): ChainNode["status"] {
  if (status === "missing" || status === "error") {
    return status;
  }

  return "loaded";
}

function normalizeChainNodeIndex(node: RawChainNode, fallbackIndex: number): number {
  if (typeof node.index === "number" && node.index >= 0) {
    return node.index;
  }

  if (typeof node.nodeIndex === "number" && node.nodeIndex >= 0) {
    return node.nodeIndex;
  }

  return fallbackIndex;
}

export function normalizeChainNodes(rawNodes: RawChainNode[]): ChainNode[] {
  return rawNodes.map((node, index) => {
    const restoredStateBytes = typeof node.restoredStateBytes === "number" ? node.restoredStateBytes : 0;
    const parameterCount =
      typeof node.parameterCount === "number"
        ? node.parameterCount
        : (typeof node.paramCount === "number" ? node.paramCount : 0);

    return {
      index: normalizeChainNodeIndex(node, index),
      pluginId: String(node.pluginId ?? node.id ?? ""),
      pluginName: String(node.pluginName ?? node.name ?? ""),
      vendor: String(node.vendor ?? node.manufacturer ?? ""),
      format: String(node.format ?? ""),
      bypass: Boolean(node.bypass),
      supportsEditor: typeof (node as { supportsEditor?: unknown }).supportsEditor === "boolean"
        ? Boolean((node as { supportsEditor?: unknown }).supportsEditor)
        : undefined,
      stateRestored: Boolean(node.stateRestored ?? (restoredStateBytes > 0)),
      paramCount: parameterCount,
      latencySamples: typeof node.latencySamples === "number" ? node.latencySamples : 0,
      status: normalizeChainNodeStatus(node.status),
      error: typeof node.error === "string" ? node.error : undefined,
    };
  });
}

export function normalizeChainLoadResponseData(response: RawChainLoadResponse, elapsedMs: number): ChainLoadResponse {
  const loadedChain = response.loadedChain;
  const rawNodes = response.nodes ?? loadedChain?.plugins ?? [];
  const nodes = normalizeChainNodes(rawNodes);

  return {
    chainId: String(response.chainId ?? ""),
    name: String(response.name ?? response.manifest?.name ?? ""),
    sampleRate: Number(response.sampleRate ?? loadedChain?.sampleRate ?? 48000),
    blockSize: Number(response.blockSize ?? loadedChain?.blockSize ?? 512),
    nodeCount: Number(response.nodeCount ?? nodes.length),
    nodes,
    loadedCount: Number(response.loadedCount ?? nodes.filter((node) => node.status === "loaded").length),
    missingCount: Number(response.missingCount ?? nodes.filter((node) => node.status === "missing").length),
    errorCount: Number(response.errorCount ?? nodes.filter((node) => node.status === "error").length),
    totalLatencySamples: Number(response.totalLatencySamples ?? nodes.reduce((sum, node) => sum + node.latencySamples, 0)),
    elapsedMs: Number(response.elapsedMs ?? elapsedMs ?? 0),
  };
}

export function normalizeRenderPreviewRequest(req: RenderPreviewRequest): Record<string, unknown> {
  const overrides: Record<string, unknown> = {};

  if (req.inputType) {
    overrides.input_mode = req.inputType === "midi" ? "midi_note" : req.inputType;
  }
  if (typeof req.midiNote === "number") {
    overrides.midi_note = req.midiNote;
  }
  if (typeof req.midiVelocity === "number") {
    overrides.midi_velocity = req.midiVelocity;
  }
  if (typeof req.durationMs === "number") {
    overrides.duration_seconds = req.durationMs / 1000;
  }

  return {
    ...(req.chainId ? { chain_id: req.chainId } : {}),
    ...(req.manifestPath ? { manifest_path: req.manifestPath } : {}),
    ...(Object.keys(overrides).length > 0 ? { overrides } : {}),
  };
}

function formatEnvelopeError(error: HostEnvelope<unknown>["error"], status: number): string {
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (error && typeof error === "object") {
    const payload = error as HostErrorPayload;
    const message = payload.message?.trim();
    const stage = payload.stage?.trim();

    if (message && stage) return `${message} (${stage})`;
    if (message) return message;
    if (payload.code?.trim()) return payload.code;
  }

  return `HTTP ${status}`;
}

async function request<T>(
  base: string,
  method: "GET" | "POST",
  path: string,
  body?: unknown,
): Promise<HostEnvelope<T>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const envelope = (await res.json()) as HostEnvelope<T>;

    if (!res.ok) {
      throw new HostError(
        formatEnvelopeError(envelope.error, res.status),
        res.status,
        envelope.operation,
        envelope.requestId,
      );
    }

    return envelope;
  } catch (err) {
    if (err instanceof HostError) throw err;
    if ((err as Error).name === "AbortError") {
      throw new HostError("Request timed out", 408, path, "");
    }
    throw new HostError(
      (err as Error).message || "Network error",
      0,
      path,
      "",
    );
  } finally {
    clearTimeout(timer);
  }
}

export class HostError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly operation: string,
    public readonly requestId: string,
  ) {
    super(message);
    this.name = "HostError";
  }
}

export class PluginHostClient {
  constructor(public baseUrl: string = DEFAULT_BASE) {}

  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  private normalizeAudioDevices(data: NativeAudioDevicesResponse): AudioConfigResponse {
    const availableDevices: AudioDevice[] = [];

    for (const deviceType of data.deviceTypes ?? []) {
      for (const name of deviceType.inputs ?? []) {
        availableDevices.push({
          id: name,
          name,
          type: "input",
          channels: Math.max(1, data.current.inputChannels || 2),
          sampleRates: [44100, 48000, 96000],
        });
      }

      for (const name of deviceType.outputs ?? []) {
        availableDevices.push({
          id: name,
          name,
          type: "output",
          channels: Math.max(1, data.current.outputChannels || 2),
          sampleRates: [44100, 48000, 96000],
        });
      }
    }

    const inputDevice =
      availableDevices.find((device) => device.type === "input" && device.name === data.current.inputDeviceName) ?? null;
    const outputDevice =
      availableDevices.find((device) => device.type === "output" && device.name === data.current.outputDeviceName) ?? null;

    return {
      inputDevice,
      outputDevice,
      sampleRate: data.current.sampleRate || data.engineState?.sampleRate || 48000,
      bufferSize: data.current.bufferSize || data.engineState?.bufferSize || 512,
      availableDevices,
    };
  }

  /* GET /health */
  async health(): Promise<HostEnvelope<HealthResponse>> {
    return request<HealthResponse>(this.baseUrl, "GET", "/health");
  }

  /* GET /plugins */
  async plugins(): Promise<HostEnvelope<PluginsResponse>> {
    return request<PluginsResponse>(this.baseUrl, "GET", "/plugins");
  }

  /* POST /scan */
  async scan(opts?: ScanRequest): Promise<HostEnvelope<ScanResponse>> {
    return request<ScanResponse>(this.baseUrl, "POST", "/scan", opts ?? {});
  }

  /* POST /chains/load */
  async loadChain(req: ChainLoadRequest): Promise<HostEnvelope<ChainLoadResponse>> {
    const response = await request<RawChainLoadResponse>(this.baseUrl, "POST", "/chains/load", normalizeChainLoadRequest(req));
    return {
      ...response,
      data: normalizeChainLoadResponseData(response.data, response.elapsedMs ?? 0),
    };
  }

  /* POST /render/preview */
  async renderPreview(req: RenderPreviewRequest): Promise<HostEnvelope<RenderPreviewResponse>> {
    return request<RenderPreviewResponse>(this.baseUrl, "POST", "/render/preview", normalizeRenderPreviewRequest(req));
  }

  /* GET /chains/:chainId/params */
  async chainParams(chainId: string): Promise<HostEnvelope<ChainParamsResponse>> {
    return request<ChainParamsResponse>(this.baseUrl, "GET", `/chains/${chainId}/params`);
  }

  /* GET /plugins/:chainId/:nodeIndex/presets */
  async pluginPresets(chainId: string, nodeIndex: number): Promise<HostEnvelope<PluginPresetsResponse>> {
    return request<PluginPresetsResponse>(this.baseUrl, "GET", `/plugins/${chainId}/${nodeIndex}/presets`);
  }

  /* POST /plugins/:chainId/:nodeIndex/presets/load */
  async loadPluginPreset(
    chainId: string,
    nodeIndex: number,
    index: number,
  ): Promise<HostEnvelope<PluginPresetLoadResponse>> {
    return request<PluginPresetLoadResponse>(this.baseUrl, "POST", `/plugins/${chainId}/${nodeIndex}/presets/load`, { index });
  }

  /* POST /plugins/:chainId/:nodeIndex/state/save */
  async savePluginState(chainId: string, nodeIndex: number): Promise<HostEnvelope<PluginStateSaveResponse>> {
    return request<PluginStateSaveResponse>(this.baseUrl, "POST", `/plugins/${chainId}/${nodeIndex}/state/save`, {});
  }

  /* POST /plugins/:chainId/:nodeIndex/state/restore */
  async restorePluginState(
    chainId: string,
    nodeIndex: number,
    req: PluginStateRestoreRequest,
  ): Promise<HostEnvelope<PluginStateRestoreResponse>> {
    return request<PluginStateRestoreResponse>(this.baseUrl, "POST", `/plugins/${chainId}/${nodeIndex}/state/restore`, req);
  }

  /* POST /session/audio-graph */
  async syncAudioGraph(tracks: HostGraphTrack[]): Promise<HostEnvelope<{ accepted: boolean }>> {
    return request<{ accepted: boolean }>(this.baseUrl, "POST", "/session/audio-graph", { tracks });
  }

  /* POST /plugins/editor/open */
  async openEditor(req: EditorOpenRequest): Promise<HostEnvelope<EditorOpenResponse>> {
    return request<EditorOpenResponse>(this.baseUrl, "POST", "/plugins/editor/open", req);
  }

  /* POST /plugins/editor/close */
  async closeEditor(req: EditorCloseRequest): Promise<HostEnvelope<EditorCloseResponse>> {
    return request<EditorCloseResponse>(this.baseUrl, "POST", "/plugins/editor/close", req);
  }

  /* POST /render/bounce */
  async bounce(req: BounceRequest): Promise<HostEnvelope<BounceResponse>> {
    return request<BounceResponse>(this.baseUrl, "POST", "/render/bounce", req);
  }

  /* GET /midi/devices */
  async midiDevices(): Promise<HostEnvelope<MidiDevicesResponse>> {
    return request<MidiDevicesResponse>(this.baseUrl, "GET", "/midi/devices");
  }

  /* POST /midi/route */
  async midiRoute(req: MidiRouteRequest): Promise<HostEnvelope<{ routed: boolean }>> {
    return request<{ routed: boolean }>(this.baseUrl, "POST", "/midi/route", req);
  }

  /* GET /audio/devices + POST /audio/engine/config */
  async audioConfig(req?: AudioConfigRequest): Promise<HostEnvelope<AudioConfigResponse>> {
    if (req) {
      const current = await request<NativeAudioDevicesResponse>(this.baseUrl, "GET", "/audio/devices");
      const resolvedSampleRate = req.sampleRate ?? current.data.current.sampleRate ?? 48000;
      const resolvedBufferSize = req.bufferSize ?? current.data.current.bufferSize ?? 512;
      const hasInput = Boolean(req.inputDeviceId);
      const hasOutput = Boolean(req.outputDeviceId);

      await request<unknown>(this.baseUrl, "POST", "/audio/engine/config", {
        inputDeviceName: req.inputDeviceId,
        outputDeviceName: req.outputDeviceId,
        sampleRate: resolvedSampleRate,
        bufferSize: resolvedBufferSize,
        inputChannels: hasInput ? 2 : 0,
        outputChannels: hasOutput ? 2 : 0,
      });
    }

    const envelope = await request<NativeAudioDevicesResponse>(this.baseUrl, "GET", "/audio/devices");
    return {
      ...envelope,
      data: this.normalizeAudioDevices(envelope.data),
    };
  }

  /* POST /audio/tracks/arm */
  async recordArm(req: RecordArmRequest): Promise<HostEnvelope<{ armed: boolean }>> {
    return request<{ armed: boolean }>(this.baseUrl, "POST", "/audio/tracks/arm", req);
  }

  /* POST /audio/tracks/monitor */
  async monitorTrack(req: MonitorTrackRequest): Promise<HostEnvelope<{ monitoring: boolean }>> {
    return request<{ monitoring: boolean }>(this.baseUrl, "POST", "/audio/tracks/monitor", req);
  }

  /* POST /audio/record/start */
  async recordStart(sessionId?: string): Promise<HostEnvelope<{ recording: boolean }>> {
    return request<{ recording: boolean }>(this.baseUrl, "POST", "/audio/record/start", sessionId ? { sessionId } : {});
  }

  /* POST /audio/record/stop */
  async recordStop(): Promise<HostEnvelope<{ clipIds?: string[]; filePath?: string; recording: boolean }>> {
    return request<{ clipIds?: string[]; filePath?: string; recording: boolean }>(this.baseUrl, "POST", "/audio/record/stop");
  }

  /* POST /system/fileBrowser */
  async fileBrowser(req: FileBrowserRequest): Promise<HostEnvelope<FileBrowserResponse>> {
    return request<FileBrowserResponse>(this.baseUrl, "POST", "/system/fileBrowser", req);
  }
}

export const pluginHost = new PluginHostClient();
