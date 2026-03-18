import type {
  InboundMessage,
  MeterUpdateEvent,
  TransportStateEvent,
  PluginParamChangedEvent,
  ChainStateEvent,
  HostErrorEvent,
  EditorClosedEvent,
  RenderProgressEvent,
  RenderCompleteEvent,
  RenderErrorEvent,
  MidiInputEvent,
  MidiDeviceChangeEvent,
  MidiLearnCapturedEvent,
  MidiLearnAssignedEvent,
  RecordLevelEvent,
  SessionStateEvent,
  AudioEngineStateEvent,
  AudioRecordStateEvent,
  PlaybackStateEvent,
  SessionTrackMidiEvent,
  AnalysisSpectrumEvent,
  AnalysisLufsEvent,
  SystemFileDropEvent,
} from "@/services/pluginHostSocket";
import type { ShellInfo, SidecarStatus } from "@/services/tauriShell";

export type ConnectionState = "disconnected" | "connecting" | "connected" | "degraded";

export type ConnectorEventType =
  | "connectionStateChange"
  | "sidecar.status"
  | "shell.info"
  | "ready"
  | "transport.state"
  | "meter.update"
  | "plugin.paramChanged"
  | "chain.state"
  | "error"
  | "plugin.editorClosed"
  | "render.progress"
  | "render.complete"
  | "render.error"
  | "midi.input"
  | "midi.deviceChange"
  | "midi.learn.captured"
  | "midi.learn.assigned"
  | "record.level"
  | "session.state"
  | "audio.engine.state"
  | "audio.record.state"
  | "playback.state"
  | "session.trackMidi"
  | "analysis.spectrum"
  | "analysis.lufs"
  | "system.fileDrop";

export type ConnectorListenerMap = {
  connectionStateChange: (state: ConnectionState) => void;
  "sidecar.status": (status: SidecarStatus) => void;
  "shell.info": (info: ShellInfo) => void;
  ready: () => void;
  "transport.state": (event: TransportStateEvent) => void;
  "meter.update": (event: MeterUpdateEvent) => void;
  "plugin.paramChanged": (event: PluginParamChangedEvent) => void;
  "chain.state": (event: ChainStateEvent) => void;
  error: (event: HostErrorEvent) => void;
  "plugin.editorClosed": (event: EditorClosedEvent) => void;
  "render.progress": (event: RenderProgressEvent) => void;
  "render.complete": (event: RenderCompleteEvent) => void;
  "render.error": (event: RenderErrorEvent) => void;
  "midi.input": (event: MidiInputEvent) => void;
  "midi.deviceChange": (event: MidiDeviceChangeEvent) => void;
  "midi.learn.captured": (event: MidiLearnCapturedEvent) => void;
  "midi.learn.assigned": (event: MidiLearnAssignedEvent) => void;
  "record.level": (event: RecordLevelEvent) => void;
  "session.state": (event: SessionStateEvent) => void;
  "audio.engine.state": (event: AudioEngineStateEvent) => void;
  "audio.record.state": (event: AudioRecordStateEvent) => void;
  "playback.state": (event: PlaybackStateEvent) => void;
  "session.trackMidi": (event: SessionTrackMidiEvent) => void;
  "analysis.spectrum": (event: AnalysisSpectrumEvent) => void;
  "analysis.lufs": (event: AnalysisLufsEvent) => void;
  "system.fileDrop": (event: SystemFileDropEvent) => void;
};

export type ConnectorInboundEventType = InboundMessage["type"];

export function dispatchConnectorInbound(
  message: InboundMessage,
  emit: <K extends ConnectorInboundEventType>(
    event: K,
    data: Parameters<ConnectorListenerMap[K]>[0],
  ) => void,
) {
  switch (message.type) {
    case "transport.state":
      emit("transport.state", message);
      break;
    case "meter.update":
      emit("meter.update", message);
      break;
    case "plugin.paramChanged":
      emit("plugin.paramChanged", message);
      break;
    case "chain.state":
      emit("chain.state", message);
      break;
    case "error":
      emit("error", message);
      break;
    case "plugin.editorClosed":
      emit("plugin.editorClosed", message);
      break;
    case "render.progress":
      emit("render.progress", message);
      break;
    case "render.complete":
      emit("render.complete", message);
      break;
    case "render.error":
      emit("render.error", message);
      break;
    case "midi.input":
      emit("midi.input", message);
      break;
    case "midi.deviceChange":
      emit("midi.deviceChange", message);
      break;
    case "midi.learn.captured":
      emit("midi.learn.captured", message);
      break;
    case "midi.learn.assigned":
      emit("midi.learn.assigned", message);
      break;
    case "record.level":
      emit("record.level", message);
      break;
    case "session.state":
      emit("session.state", message);
      break;
    case "audio.engine.state":
      emit("audio.engine.state", message);
      break;
    case "audio.record.state":
      emit("audio.record.state", message);
      break;
    case "playback.state":
      emit("playback.state", message);
      break;
    case "session.trackMidi":
      emit("session.trackMidi", message);
      break;
    case "analysis.spectrum":
      emit("analysis.spectrum", message);
      break;
    case "analysis.lufs":
      emit("analysis.lufs", message);
      break;
    case "system.fileDrop":
      emit("system.fileDrop", message);
      break;
  }
}
