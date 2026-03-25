import type {
  AudioConfigRequest,
  AudioConfigResponse,
  BounceRequest,
  BounceResponse,
  ChainLoadRequest,
  ChainLoadResponse,
  ChainParamsResponse,
  EditorCloseResponse,
  EditorCloseRequest,
  EditorOpenRequest,
  EditorOpenResponse,
  FileBrowserRequest,
  FileBrowserResponse,
  HealthResponse,
  HostEnvelope,
  MidiDevicesResponse,
  MidiRouteRequest,
  MonitorTrackRequest,
  PluginHostClient,
  PluginPresetLoadResponse,
  PluginPresetsResponse,
  PluginStateRestoreRequest,
  PluginStateRestoreResponse,
  PluginStateSaveResponse,
  PluginsResponse,
  RecordArmRequest,
  RenderPreviewRequest,
  RenderPreviewResponse,
  ScanRequest,
  ScanResponse,
} from "@/services/pluginHostClient";
import type { MockPluginHost } from "@/services/mockPluginHost";
import type { HostGraphTrack } from "@/services/pluginHostContracts";
import type { OutboundMessage } from "@/services/pluginHostSocket";

type ConnectorApiDeps = {
  httpClient: PluginHostClient;
  mock: MockPluginHost;
  useMock: () => boolean;
  send: (message: OutboundMessage) => void;
};

function callHost<T>(
  deps: ConnectorApiDeps,
  realCall: () => Promise<HostEnvelope<T>>,
  mockCall: () => Promise<HostEnvelope<T>>,
): Promise<HostEnvelope<T>> {
  return deps.useMock() ? mockCall() : realCall();
}

export function createConnectorApi(deps: ConnectorApiDeps) {
  return {
    health(): Promise<HostEnvelope<HealthResponse>> {
      return callHost(deps, () => deps.httpClient.health(), () => deps.mock.health());
    },
    plugins(): Promise<HostEnvelope<PluginsResponse>> {
      return callHost(deps, () => deps.httpClient.plugins(), () => deps.mock.plugins());
    },
    scan(opts?: ScanRequest): Promise<HostEnvelope<ScanResponse>> {
      return callHost(deps, () => deps.httpClient.scan(opts), () => deps.mock.scan());
    },
    loadChain(req: ChainLoadRequest): Promise<HostEnvelope<ChainLoadResponse>> {
      return callHost(deps, () => deps.httpClient.loadChain(req), () => deps.mock.loadChain(req));
    },
    renderPreview(req: RenderPreviewRequest): Promise<HostEnvelope<RenderPreviewResponse>> {
      return callHost(deps, () => deps.httpClient.renderPreview(req), () => deps.mock.renderPreview(req));
    },
    chainParams(chainId: string): Promise<HostEnvelope<ChainParamsResponse>> {
      return callHost(deps, () => deps.httpClient.chainParams(chainId), () => deps.mock.chainParams(chainId));
    },
    pluginPresets(chainId: string, nodeIndex: number): Promise<HostEnvelope<PluginPresetsResponse>> {
      return callHost(
        deps,
        () => deps.httpClient.pluginPresets(chainId, nodeIndex),
        () => deps.mock.pluginPresets(chainId, nodeIndex),
      );
    },
    loadPluginPreset(chainId: string, nodeIndex: number, index: number): Promise<HostEnvelope<PluginPresetLoadResponse>> {
      return callHost(
        deps,
        () => deps.httpClient.loadPluginPreset(chainId, nodeIndex, index),
        () => deps.mock.loadPluginPreset(chainId, nodeIndex, index),
      );
    },
    savePluginState(chainId: string, nodeIndex: number): Promise<HostEnvelope<PluginStateSaveResponse>> {
      return callHost(
        deps,
        () => deps.httpClient.savePluginState(chainId, nodeIndex),
        () => deps.mock.savePluginState(chainId, nodeIndex),
      );
    },
    restorePluginState(
      chainId: string,
      nodeIndex: number,
      req: PluginStateRestoreRequest,
    ): Promise<HostEnvelope<PluginStateRestoreResponse>> {
      return callHost(
        deps,
        () => deps.httpClient.restorePluginState(chainId, nodeIndex, req),
        () => deps.mock.restorePluginState(chainId, nodeIndex, req),
      );
    },
    syncAudioGraph(tracks: HostGraphTrack[]): Promise<HostEnvelope<{ accepted: boolean }>> {
      return callHost(
        deps,
        () => deps.httpClient.syncAudioGraph(tracks),
        () => deps.mock.syncAudioGraph(tracks),
      );
    },
    openEditorHttp(req: EditorOpenRequest): Promise<HostEnvelope<EditorOpenResponse>> {
      return callHost(deps, () => deps.httpClient.openEditor(req), () => deps.mock.openEditorHttp(req));
    },
    closeEditorHttp(req: EditorCloseRequest): Promise<HostEnvelope<EditorCloseResponse>> {
      return callHost(deps, () => deps.httpClient.closeEditor(req), () => deps.mock.closeEditorHttp(req));
    },
    bounce(req: BounceRequest): Promise<HostEnvelope<BounceResponse>> {
      return callHost(deps, () => deps.httpClient.bounce(req), () => deps.mock.bounce(req));
    },
    midiDevices(): Promise<HostEnvelope<MidiDevicesResponse>> {
      return callHost(deps, () => deps.httpClient.midiDevices(), () => deps.mock.midiDevices());
    },
    midiRoute(req: MidiRouteRequest): Promise<HostEnvelope<{ routed: boolean }>> {
      return callHost(deps, () => deps.httpClient.midiRoute(req), () => deps.mock.midiRoute(req));
    },
    audioConfig(req?: AudioConfigRequest): Promise<HostEnvelope<AudioConfigResponse>> {
      return callHost(deps, () => deps.httpClient.audioConfig(req), () => deps.mock.audioConfig(req));
    },
    recordArm(req: RecordArmRequest): Promise<HostEnvelope<{ armed: boolean }>> {
      return callHost(deps, () => deps.httpClient.recordArm(req), () => deps.mock.recordArm(req));
    },
    monitorTrack(req: MonitorTrackRequest): Promise<HostEnvelope<{ monitoring: boolean }>> {
      return callHost(deps, () => deps.httpClient.monitorTrack(req), () => deps.mock.monitorTrack(req));
    },
    async startRecording(sessionId?: string): Promise<HostEnvelope<{ recording: boolean }>> {
      if (deps.useMock()) {
        deps.send({ type: "record.start" });
        return {
          requestId: "mock-record-start",
          operation: "audio/record/start",
          elapsedMs: 0,
          data: { recording: true },
        };
      }

      return deps.httpClient.recordStart(sessionId);
    },
    async stopRecording(): Promise<HostEnvelope<{ clipIds?: string[]; filePath?: string; recording: boolean }>> {
      if (deps.useMock()) {
        deps.send({ type: "record.stop" });
        return {
          requestId: "mock-record-stop",
          operation: "audio/record/stop",
          elapsedMs: 0,
          data: { recording: false },
        };
      }

      return deps.httpClient.recordStop();
    },
    fileBrowser(req: FileBrowserRequest): Promise<HostEnvelope<FileBrowserResponse>> {
      return callHost(deps, () => deps.httpClient.fileBrowser(req), () => deps.mock.fileBrowser(req));
    },
  };
}
