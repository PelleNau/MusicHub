/**
 * HostConnector — unified adapter combining HTTP + WebSocket
 * with 4-state connection tracking.
 *
 * Connection states:
 *   disconnected → connecting → connected | degraded
 *
 * "degraded" = partial connectivity (e.g., HTTP OK but WS dropped).
 */

import {
  PluginHostClient,
  pluginHost,
  type HostEnvelope,
  type HealthResponse,
  type PluginsResponse,
  type ScanResponse,
  type ScanRequest,
  type ChainLoadRequest,
  type ChainLoadResponse,
  type RenderPreviewRequest,
  type RenderPreviewResponse,
  type ChainParamsResponse,
  type PluginPresetsResponse,
  type PluginPresetLoadResponse,
  type PluginStateSaveResponse,
  type PluginStateRestoreRequest,
  type PluginStateRestoreResponse,
  type EditorOpenRequest,
  type EditorOpenResponse,
  type EditorCloseRequest,
  type BounceRequest,
  type BounceResponse,
  type MidiDevicesResponse,
  type MidiRouteRequest,
  type AudioConfigRequest,
  type AudioConfigResponse,
  type RecordArmRequest,
  type MonitorTrackRequest,
  type FileBrowserRequest,
  type FileBrowserResponse,
} from "@/services/pluginHostClient";

import {
  PluginHostSocket,
  pluginHostSocket,
  type OutboundMessage,
} from "@/services/pluginHostSocket";

import { MockPluginHost, mockHost } from "@/services/mockPluginHost";
import { createConnectorApi } from "@/services/hostConnectorApi";
import { createConnectorCommands } from "@/services/hostConnectorCommands";
import {
  isInTauriShell,
  tauriShell,
  type ShellInfo,
  type SidecarStatus,
} from "@/services/tauriShell";
import {
  resolveInitialConnectorMode,
  shouldReconnectSocket,
} from "@/services/hostConnectorMode";
import { wireTauriShellBridge } from "@/services/hostConnectorShell";
import {
  bindSocketEvents,
  deriveConnectionState,
  waitForSocketReady,
} from "@/services/hostConnectorRuntime";
import {
  dispatchConnectorInbound,
  type ConnectionState,
  type ConnectorEventType,
  type ConnectorListenerMap,
} from "@/services/hostConnectorEvents";
import type { HostGraphTrack } from "@/services/pluginHostContracts";

export type { ConnectionState, ConnectorEventType, ConnectorListenerMap };

/* ── Connector ── */

export class HostConnector {
  private httpClient: PluginHostClient;
  private wsClient: PluginHostSocket;
  private mock: MockPluginHost;
  private api: ReturnType<typeof createConnectorApi>;
  private commands: ReturnType<typeof createConnectorCommands>;

  private _state: ConnectionState = "disconnected";
  private _useMock = false;
  private _httpOk = false;
  private _wsOk = false;
  private _forceMock: boolean;
  private _inShell: boolean;

  private listeners = new Map<ConnectorEventType, Set<ConnectorListenerMap[ConnectorEventType]>>();
  private mockUnsub: (() => void) | null = null;
  private wsUnsubs: (() => void)[] = [];
  private healthTimer: ReturnType<typeof setInterval> | null = null;
  private realHostProbeTimer: ReturnType<typeof setInterval> | null = null;
  private tauriUnsubs: (() => void)[] = [];

  constructor(opts?: { forceMock?: boolean }) {
    this.httpClient = pluginHost;
    this.wsClient = pluginHostSocket;
    this.mock = mockHost;
    this._forceMock = opts?.forceMock ?? new URLSearchParams(window.location.search).has("mock");
    this._inShell = isInTauriShell();
    this.commands = createConnectorCommands((message) => this.send(message));
    this.api = createConnectorApi({
      httpClient: this.httpClient,
      mock: this.mock,
      useMock: () => this._useMock,
      send: (message) => this.send(message),
    });
  }

  get connectionState(): ConnectionState { return this._state; }
  get isMock(): boolean { return this._useMock; }
  get isConnected(): boolean { return this._state === "connected" || this._state === "degraded"; }
  get inShell(): boolean { return this._inShell; }

  /* ── Lifecycle ── */

  async connect(): Promise<void> {
    this.setState("connecting");
    this.wireTauriShell();

    try {
      await this.httpClient.health();
      this._httpOk = true;
    } catch {
      this._httpOk = false;
    }

    const mode = resolveInitialConnectorMode({
      forceMock: this._forceMock,
      inShell: this._inShell,
      httpOk: this._httpOk,
    });

    if (mode === "mock") {
      this.activateMock();
      return;
    }

    if (mode === "unavailable") {
      this._wsOk = false;
      this.setState("disconnected");
      this.startHealthPoll();
      return;
    }

    if (mode === "shell-degraded") {
      this._wsOk = false;
      this.setState("degraded");
      this.startHealthPoll();
      return;
    }

    this.wireWebSocket();
    this.wsClient.connect();
    this._wsOk = await waitForSocketReady(this.wsClient);
    const newState = deriveConnectionState(this._httpOk, this._wsOk);
    this.setState(newState);
    this.startHealthPoll();
    if (newState === "connected") this.emit("ready");
  }

  disconnect(): void {
    this.stopHealthPoll();
    this.stopRealHostProbe();
    this.tauriUnsubs.forEach((u) => u());
    this.tauriUnsubs = [];
    this.wsUnsubs.forEach(u => u());
    this.wsUnsubs = [];
    this.wsClient.disconnect();
    this.mockUnsub?.();
    this.mockUnsub = null;
    this.mock.dispose();
    this._httpOk = false;
    this._wsOk = false;
    this._useMock = false;
    this.setState("disconnected");
  }

  private activateMock(): void {
    this._useMock = true;
    this._httpOk = false;
    this._wsOk = false;
    this.mockUnsub = this.mock.onMessage((msg) => {
      this.dispatchInbound(msg);
    });
    this.setState("connected");
    this.startRealHostProbe();
  }

  private deactivateMock(): void {
    this.mockUnsub?.();
    this.mockUnsub = null;
    this._useMock = false;
    this.stopRealHostProbe();
  }

  private startRealHostProbe() {
    if (this._forceMock || this.realHostProbeTimer) return;

    this.realHostProbeTimer = setInterval(async () => {
      if (!this._useMock) return;

      try {
        await this.httpClient.health();
      } catch {
        return;
      }

      this.promoteToRealHost();
    }, 3000);
  }

  private stopRealHostProbe() {
    if (this.realHostProbeTimer) {
      clearInterval(this.realHostProbeTimer);
      this.realHostProbeTimer = null;
    }
  }

  private promoteToRealHost() {
    if (!this._useMock) return;

    this.deactivateMock();
    this.setState("connecting");
    this._httpOk = true;
    this.wireWebSocket();
    this.wsClient.connect();
    this.startHealthPoll();
  }

  /* ── State management ── */

  private setState(s: ConnectionState) {
    if (this._state === s) return;
    this._state = s;
    this.emit("connectionStateChange", s);
  }

  private wireTauriShell() {
    if (!this._inShell || this.tauriUnsubs.length > 0) return;

    void wireTauriShellBridge(
      (event, payload) => this.emit(event, payload),
      () => {
        if (!this._useMock) {
          this._httpOk = true;
        }
      },
    ).then((unsubs) => {
      this.tauriUnsubs.push(...unsubs);
    });
  }

  /* ── Health polling ── */

  private startHealthPoll() {
    this.stopHealthPoll();
    this.healthTimer = setInterval(async () => {
      if (this._useMock) return;

      try {
        await this.httpClient.health();
        this._httpOk = true;
      } catch {
        this._httpOk = false;
      }

      const wsOk = this.wsClient.connected;
      this.setState(deriveConnectionState(this._httpOk, wsOk));

      if (shouldReconnectSocket({ httpOk: this._httpOk, wsOk })) {
        this.wsClient.connect();
      }
    }, 5000);
  }

  private stopHealthPoll() {
    if (this.healthTimer) {
      clearInterval(this.healthTimer);
      this.healthTimer = null;
    }
  }

  /* ── WebSocket wiring ── */

  private wireWebSocket() {
    this.wsUnsubs.forEach(u => u());
    this.wsUnsubs = [];
    this.wsUnsubs = bindSocketEvents(
      this.wsClient,
      (event, data) => this.emit(event as ConnectorEventType, data),
      (connected) => {
        const wasConnected = this._wsOk;
        this._wsOk = connected;
        this.setState(deriveConnectionState(this._httpOk, this._wsOk));
        if (connected && this._httpOk && !wasConnected) this.emit("ready");
      }
    );
  }

  /* ── Send commands ── */

  send(msg: OutboundMessage): void {
    if (this._useMock) {
      this.mock.handleCommand(msg);
    } else {
      this.wsClient.send(msg);
    }
  }

  /* Transport helpers */
  play(fromBeat = 0) { this.commands.play(fromBeat); }
  pause() { this.commands.pause(); }
  stop() { this.commands.stop(); }
  seek(beat: number) { this.commands.seek(beat); }
  setTempo(bpm: number) { this.commands.setTempo(bpm); }
  setLoop(enabled: boolean, start: number, end: number) {
    this.commands.setLoop(enabled, start, end);
  }

  /* Plugin helpers */
  setParam(chainId: string, nodeIndex: number, paramId: number, value: number) {
    this.commands.setParam(chainId, nodeIndex, paramId, value);
  }
  bypass(chainId: string, nodeIndex: number, bypassState: boolean) {
    this.commands.bypass(chainId, nodeIndex, bypassState);
  }

  /* Chain helpers */
  reorderChain(chainId: string, fromIndex: number, toIndex: number) {
    this.commands.reorderChain(chainId, fromIndex, toIndex);
  }
  removeFromChain(chainId: string, nodeIndex: number) {
    this.commands.removeFromChain(chainId, nodeIndex);
  }
  addToChain(chainId: string, pluginId: string, atIndex: number) {
    this.commands.addToChain(chainId, pluginId, atIndex);
  }

  /* Editor helpers */
  openEditor(chainId: string, nodeIndex: number) {
    this.commands.openEditor(chainId, nodeIndex);
  }
  closeEditor(chainId: string, nodeIndex: number) {
    this.commands.closeEditor(chainId, nodeIndex);
  }

  /* Analysis helpers */
  startAnalysis(source: "master" | "track", trackId?: string, fftSize?: 1024 | 2048 | 4096 | 8192) {
    this.commands.startAnalysis(source, trackId, fftSize);
  }
  stopAnalysis() {
    this.commands.stopAnalysis();
  }

  /* MIDI learn helpers */
  startMidiLearn(chainId: string, nodeIndex: number, paramId: number) {
    this.commands.startMidiLearn(chainId, nodeIndex, paramId);
  }
  cancelMidiLearn() { this.commands.cancelMidiLearn(); }

  /* MIDI send helpers */
  sendNote(trackId: string, note: number, velocity: number, channel = 1) {
    this.commands.sendNote(trackId, note, velocity, channel);
  }
  sendCC(trackId: string, cc: number, value: number, channel = 1) {
    this.commands.sendCC(trackId, cc, value, channel);
  }

  /* ── HTTP methods ── */

  async health(): Promise<HostEnvelope<HealthResponse>> {
    return this.api.health();
  }

  async plugins(): Promise<HostEnvelope<PluginsResponse>> {
    return this.api.plugins();
  }

  async scan(opts?: ScanRequest): Promise<HostEnvelope<ScanResponse>> {
    return this.api.scan(opts);
  }

  async loadChain(req: ChainLoadRequest): Promise<HostEnvelope<ChainLoadResponse>> {
    return this.api.loadChain(req);
  }

  async renderPreview(req: RenderPreviewRequest): Promise<HostEnvelope<RenderPreviewResponse>> {
    return this.api.renderPreview(req);
  }

  async chainParams(chainId: string): Promise<HostEnvelope<ChainParamsResponse>> {
    return this.api.chainParams(chainId);
  }

  async pluginPresets(chainId: string, nodeIndex: number): Promise<HostEnvelope<PluginPresetsResponse>> {
    return this.api.pluginPresets(chainId, nodeIndex);
  }

  async loadPluginPreset(
    chainId: string,
    nodeIndex: number,
    index: number,
  ): Promise<HostEnvelope<PluginPresetLoadResponse>> {
    return this.api.loadPluginPreset(chainId, nodeIndex, index);
  }

  async savePluginState(chainId: string, nodeIndex: number): Promise<HostEnvelope<PluginStateSaveResponse>> {
    return this.api.savePluginState(chainId, nodeIndex);
  }

  async restorePluginState(
    chainId: string,
    nodeIndex: number,
    req: PluginStateRestoreRequest,
  ): Promise<HostEnvelope<PluginStateRestoreResponse>> {
    return this.api.restorePluginState(chainId, nodeIndex, req);
  }

  async syncAudioGraph(tracks: HostGraphTrack[]): Promise<HostEnvelope<{ accepted: boolean }>> {
    return this.api.syncAudioGraph(tracks);
  }

  async openEditorHttp(req: EditorOpenRequest): Promise<HostEnvelope<EditorOpenResponse>> {
    return this.api.openEditorHttp(req);
  }

  async closeEditorHttp(req: EditorCloseRequest): Promise<HostEnvelope<{ closed: boolean }>> {
    return this.api.closeEditorHttp(req);
  }

  async bounce(req: BounceRequest): Promise<HostEnvelope<BounceResponse>> {
    return this.api.bounce(req);
  }

  async midiDevices(): Promise<HostEnvelope<MidiDevicesResponse>> {
    return this.api.midiDevices();
  }

  async midiRoute(req: MidiRouteRequest): Promise<HostEnvelope<{ routed: boolean }>> {
    return this.api.midiRoute(req);
  }

  async audioConfig(req?: AudioConfigRequest): Promise<HostEnvelope<AudioConfigResponse>> {
    return this.api.audioConfig(req);
  }

  async recordArm(req: RecordArmRequest): Promise<HostEnvelope<{ armed: boolean }>> {
    return this.api.recordArm(req);
  }

  async monitorTrack(req: MonitorTrackRequest): Promise<HostEnvelope<{ monitoring: boolean }>> {
    return this.api.monitorTrack(req);
  }

  async startRecording(sessionId?: string): Promise<HostEnvelope<{ recording: boolean }>> {
    return this.api.startRecording(sessionId);
  }

  async stopRecording(): Promise<HostEnvelope<{ clipIds?: string[]; filePath?: string; recording: boolean }>> {
    return this.api.stopRecording();
  }

  async fileBrowser(req: FileBrowserRequest): Promise<HostEnvelope<FileBrowserResponse>> {
    return this.api.fileBrowser(req);
  }

  async getShellInfo(): Promise<ShellInfo | null> {
    if (!this._inShell) return null;
    try {
      return await tauriShell.getShellInfo();
    } catch {
      return null;
    }
  }

  async getSidecarStatus(): Promise<SidecarStatus | null> {
    if (!this._inShell) return null;
    try {
      return await tauriShell.getSidecarStatus();
    } catch {
      return null;
    }
  }

  async restartSidecar(): Promise<boolean> {
    if (!this._inShell) return false;
    try {
      await tauriShell.restartSidecar();
      return true;
    } catch {
      return false;
    }
  }

  /* ── Event emitter ── */

  on<K extends ConnectorEventType>(event: K, fn: ConnectorListenerMap[K]): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(fn);
    return () => this.listeners.get(event)?.delete(fn);
  }

  private emit<K extends ConnectorEventType>(event: K, ...args: Parameters<ConnectorListenerMap[K]>) {
    this.listeners.get(event)?.forEach((fn) => {
      (fn as ConnectorListenerMap[K])(...args);
    });
  }

  private dispatchInbound(message: Parameters<typeof dispatchConnectorInbound>[0]) {
    dispatchConnectorInbound(message, (event, data) => this.emit(event, data));
  }

  dispose() {
    this.disconnect();
    this.listeners.clear();
  }
}

export const hostConnector = new HostConnector();
