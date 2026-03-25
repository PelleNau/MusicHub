import type { HostPlugin, MidiDevice, BounceRequest, MidiRouteRequest, AudioConfigRequest, RecordArmRequest, MonitorTrackRequest, FileBrowserRequest, FileBrowserResponse, ChainLoadRequest, ChainLoadResponse, ChainParamsResponse, ChainNode, PluginPresetsResponse, PluginPresetLoadResponse, PluginStateSaveResponse, EditorOpenResponse, EditorCloseResponse } from "@/services/pluginHostClient";
import type { ShellInfo, SidecarStatus } from "@/services/tauriShell";
import type { HostGraphTrack, NativePlaybackTrackState } from "@/services/pluginHostContracts";
import type {
  MeterLevel,
  PluginParamChangedEvent,
  ChainStateEvent,
  HostErrorEvent,
  EditorClosedEvent,
  MidiInputEvent,
  MidiLearnCapturedEvent,
  SystemFileDropEvent,
  SessionStateEvent,
  AudioEngineStateEvent,
} from "@/services/pluginHostSocket";
import type { ConnectionState } from "@/services/hostConnector";

export interface NativeTransportState {
  state: "playing" | "paused" | "stopped";
  beat: number;
  bpm: number;
  receivedAtMs: number;
}

export interface NativePlaybackState {
  state: "playing" | "paused" | "stopped";
  currentBeat: number;
  bpm: number;
  receivedAtMs: number;
  tracks: NativePlaybackTrackState[];
}

export interface SyncStatus {
  state: "idle" | "syncing" | "synced" | "error";
  lastSyncAt: string | null;
  error: string | null;
}

export interface BounceProgress {
  renderId: string | null;
  progress: number;
  complete: boolean;
  filePath: string | null;
}

export interface AnalysisData {
  spectrum: { bins: number[]; fftSize: number; sampleRate: number } | null;
  lufs: { momentary: number; shortTerm: number; integrated: number } | null;
}

export interface HostConnectorState {
  connectionState: ConnectionState;
  isMock: boolean;
  inShell: boolean;
  readySequence: number;
  shellInfo: ShellInfo | null;
  sidecarStatus: SidecarStatus | null;
  transport: NativeTransportState | null;
  playback: NativePlaybackState | null;
  masterMeter: MeterLevel | null;
  trackMeters: Record<string, MeterLevel>;
  nativeChains: Record<string, ChainNode[]>;
  openEditors: Record<string, boolean>;
  lastError: HostErrorEvent | null;
  errors: HostErrorEvent[];
  syncStatus: SyncStatus;
  midiDevices: MidiDevice[];
  bounceProgress: BounceProgress;
  analysisData: AnalysisData;
  analysisActive: boolean;
  recording: boolean;
  recordLevels: Record<string, { peak: number; rms: number }>;
  sessionState: SessionStateEvent | null;
  audioEngineState: AudioEngineStateEvent | null;
}

export interface HostConnectorActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  restartShellHost: () => Promise<boolean>;
  play: (fromBeat?: number) => void;
  pause: () => void;
  stop: () => void;
  seek: (beat: number) => void;
  setTempo: (bpm: number) => void;
  setLoop: (enabled: boolean, start: number, end: number) => void;
  setParam: (chainId: string, nodeIndex: number, paramId: number, value: number) => void;
  bypass: (chainId: string, nodeIndex: number, bypass: boolean) => void;
  reorderChain: (chainId: string, fromIndex: number, toIndex: number) => void;
  removeFromChain: (chainId: string, nodeIndex: number) => void;
  addToChain: (chainId: string, pluginId: string, atIndex: number) => void;
  openEditor: (chainId: string, nodeIndex: number) => Promise<EditorOpenResponse | null>;
  closeEditor: (chainId: string, nodeIndex: number) => Promise<EditorCloseResponse | null>;
  fetchPluginPresets: (chainId: string, nodeIndex: number) => Promise<PluginPresetsResponse | null>;
  loadPluginPreset: (chainId: string, nodeIndex: number, index: number) => Promise<PluginPresetLoadResponse | null>;
  savePluginState: (chainId: string, nodeIndex: number) => Promise<PluginStateSaveResponse | null>;
  restorePluginState: (chainId: string, nodeIndex: number, stateId: string) => Promise<boolean>;
  startBounce: (req: BounceRequest) => Promise<void>;
  fetchMidiDevices: () => Promise<MidiDevice[]>;
  routeMidi: (req: MidiRouteRequest) => Promise<boolean>;
  startMidiLearn: (chainId: string, nodeIndex: number, paramId: number) => void;
  cancelMidiLearn: () => void;
  sendNote: (trackId: string, note: number, velocity: number, channel?: number) => void;
  sendCC: (trackId: string, cc: number, value: number, channel?: number) => void;
  fetchAudioConfig: (req?: AudioConfigRequest) => Promise<void>;
  armRecord: (req: RecordArmRequest) => Promise<boolean>;
  monitorTrack: (req: MonitorTrackRequest) => Promise<boolean>;
  startRecording: (sessionId?: string) => Promise<void>;
  stopRecording: () => Promise<void>;
  startAnalysis: (source: "master" | "track", trackId?: string) => void;
  stopAnalysis: () => void;
  openFileBrowser: (req: FileBrowserRequest) => Promise<FileBrowserResponse | null>;
  fetchPlugins: () => Promise<HostPlugin[]>;
  loadChain: (req: ChainLoadRequest) => Promise<ChainLoadResponse | null>;
  fetchChainParams: (chainId: string) => Promise<ChainParamsResponse | null>;
  syncAudioGraph: (tracks: HostGraphTrack[]) => Promise<void>;
  onParamChanged: (fn: (e: PluginParamChangedEvent) => void) => () => void;
  onChainState: (fn: (e: ChainStateEvent) => void) => () => void;
  onEditorClosed: (fn: (e: EditorClosedEvent) => void) => () => void;
  onMidiInput: (fn: (e: MidiInputEvent) => void) => () => void;
  onMidiLearnCaptured: (fn: (e: MidiLearnCapturedEvent) => void) => () => void;
  onFileDrop: (fn: (e: SystemFileDropEvent) => void) => () => void;
}
