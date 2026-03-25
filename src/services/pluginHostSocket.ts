import type { ChainNode } from "@/services/pluginHostClient";
import type { HostGraphTrack, NativePlaybackClipState } from "@/services/pluginHostContracts";
import { resolvePluginHostWsUrl } from "@/services/pluginHostConfig";

/**
 * PluginHostSocket — typed WebSocket client for the local plugin-host backend.
 *
 * Connects to ws://127.0.0.1:8080/ws with auto-reconnect.
 * Emits typed events for transport state, meter data, plugin changes, and errors.
 */

/* ── Message types: Frontend → Native ── */

export interface TransportPlayMsg {
  type: "transport.play";
  fromBeat: number;
}

export interface TransportPauseMsg {
  type: "transport.pause";
}

export interface TransportStopMsg {
  type: "transport.stop";
}

export interface TransportSeekMsg {
  type: "transport.seek";
  beat: number;
}

export interface TransportLoopMsg {
  type: "transport.loop";
  enabled: boolean;
  start: number;
  end: number;
}

export interface TransportTempoMsg {
  type: "transport.tempo";
  bpm: number;
}

export interface PluginSetParamMsg {
  type: "plugin.setParam";
  chainId: string;
  nodeIndex: number;
  paramId: number;
  value: number;
}

export interface PluginBypassMsg {
  type: "plugin.bypass";
  chainId: string;
  nodeIndex: number;
  bypass: boolean;
}

export interface ChainReorderMsg {
  type: "chain.reorder";
  chainId: string;
  fromIndex: number;
  toIndex: number;
}

export interface ChainRemoveMsg {
  type: "chain.remove";
  chainId: string;
  nodeIndex: number;
}

export interface ChainAddMsg {
  type: "chain.add";
  chainId: string;
  pluginId: string;
  atIndex: number;
}

export interface SessionLoadMsg {
  type: "session.load";
  sessionId: string;
}

export interface SessionSetTracksMsg {
  type: "session.setTracks";
  tracks: HostGraphTrack[];
}

/* ── Extension outbound messages ── */

export interface EditorOpenMsg {
  type: "editor.open";
  chainId: string;
  nodeIndex: number;
}

export interface EditorCloseMsg {
  type: "editor.close";
  chainId: string;
  nodeIndex: number;
}

export interface RecordStartMsg {
  type: "record.start";
}

export interface RecordStopMsg {
  type: "record.stop";
}

export interface MidiLearnStartMsg {
  type: "midi.learn.start";
  chainId: string;
  nodeIndex: number;
  paramId: number;
}

export interface MidiLearnCancelMsg {
  type: "midi.learn.cancel";
}

export interface MidiSendNoteMsg {
  type: "midi.sendNote";
  trackId: string;
  note: number;
  velocity: number;
  channel?: number;
}

export interface MidiSendCCMsg {
  type: "midi.sendCC";
  trackId: string;
  cc: number;
  value: number;
  channel?: number;
}

export interface AnalysisStartMsg {
  type: "analysis.start";
  source: "master" | "track";
  trackId?: string;
  fftSize?: 1024 | 2048 | 4096 | 8192;
}

export interface AnalysisStopMsg {
  type: "analysis.stop";
}

export type OutboundMessage =
  | TransportPlayMsg
  | TransportPauseMsg
  | TransportStopMsg
  | TransportSeekMsg
  | TransportLoopMsg
  | TransportTempoMsg
  | PluginSetParamMsg
  | PluginBypassMsg
  | ChainReorderMsg
  | ChainRemoveMsg
  | ChainAddMsg
  | SessionLoadMsg
  | SessionSetTracksMsg
  | EditorOpenMsg
  | EditorCloseMsg
  | RecordStartMsg
  | RecordStopMsg
  | MidiLearnStartMsg
  | MidiLearnCancelMsg
  | MidiSendNoteMsg
  | MidiSendCCMsg
  | AnalysisStartMsg
  | AnalysisStopMsg;

/* ── Message types: Native → Frontend ── */

export interface MeterLevel {
  peak: number;
  rms: number;
}

export interface MeterUpdateEvent {
  type: "meter.update";
  master: MeterLevel;
  tracks: Record<string, MeterLevel>;
}

export interface TransportStateEvent {
  type: "transport.state";
  state: "playing" | "paused" | "stopped";
  beat: number;
  bpm: number;
}

export interface PluginParamChangedEvent {
  type: "plugin.paramChanged";
  chainId: string;
  nodeIndex: number;
  paramId: number;
  value: number;
}

export interface ChainStateEvent {
  type: "chain.state";
  chainId: string;
  nodes: ChainNode[];
}

export interface HostErrorEvent {
  type: "error";
  source: string;
  message: string;
  detail?: string;
}

/* ── Extension inbound messages ── */

export interface EditorClosedEvent {
  type: "plugin.editorClosed";
  chainId: string;
  nodeIndex: number;
}

export interface RenderProgressEvent {
  type: "render.progress";
  renderId: string;
  progress: number;  // 0-1
  elapsedMs: number;
}

export interface RenderCompleteEvent {
  type: "render.complete";
  renderId: string;
  filePath: string;
  durationMs: number;
  fileSizeBytes: number;
}


export interface RenderErrorEvent {
  type: "render.error";
  renderId: string;
  message: string;
  detail?: string;
}

export interface MidiInputEvent {
  type: "midi.input";
  deviceId: string;
  channel: number;
  cc?: number;
  note?: number;
  velocity?: number;
  value?: number;
}

export interface MidiDeviceChangeEvent {
  type: "midi.deviceChange";
  devices: { id: string; name: string; input: boolean; output: boolean }[];
}

export interface MidiLearnCapturedEvent {
  type: "midi.learn.captured";
  deviceId: string;
  deviceName: string;
  channel: number;
  cc: number;
  chainId: string;
  nodeIndex: number;
  paramId: number;
}

export interface MidiLearnAssignedEvent {
  type: "midi.learn.assigned";
  deviceId: string;
  deviceName: string;
  channel: number;
  cc: number;
  chainId: string;
  nodeIndex: number;
  paramId: number;
}

export interface RecordLevelEvent {
  type: "record.level";
  trackId: string;
  peak: number;
  rms: number;
}

export interface NativeSessionTrackState {
  id?: string;
  trackId?: string;
  chainId?: string;
}

export interface SessionStateEvent {
  type: "session.state";
  sessionId: string;
  tracks: NativeSessionTrackState[];
  tempo: number;
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
}

export interface AudioEngineStateEvent {
  type: "audio.engine.state";
  sampleRate: number;
  bufferSize: number;
  cpuLoad: number;
  outputDevice: string;
}

export interface AudioRecordStateEvent {
  type: "audio.record.state";
  recording: boolean;
  trackId?: string;
  durationMs?: number;
}

export interface PlaybackTrackState {
  trackId: string;
  status: "idle" | "monitoring" | "playing";
  activeClips?: NativePlaybackClipState[];
}

export interface PlaybackStateEvent {
  type: "playback.state";
  state: "playing" | "paused" | "stopped";
  currentBeat: number;
  bpm: number;
  tracks: PlaybackTrackState[];
}

export interface SessionTrackMidiEvent {
  type: "session.trackMidi";
  trackId: string;
  note: number;
  velocity: number;
  channel: number;
  noteOn: boolean;
}

export interface AnalysisSpectrumEvent {
  type: "analysis.spectrum";
  bins: number[];
  fftSize: number;
  sampleRate: number;
}

export interface AnalysisLufsEvent {
  type: "analysis.lufs";
  momentary: number;
  shortTerm: number;
  integrated: number;
}

export interface SystemFileDropEvent {
  type: "system.fileDrop";
  paths: string[];
  x: number;
  y: number;
}

export type InboundMessage =
  | MeterUpdateEvent
  | TransportStateEvent
  | PluginParamChangedEvent
  | ChainStateEvent
  | HostErrorEvent
  | EditorClosedEvent
  | RenderProgressEvent
  | RenderCompleteEvent
  | RenderErrorEvent
  | MidiInputEvent
  | MidiDeviceChangeEvent
  | MidiLearnCapturedEvent
  | MidiLearnAssignedEvent
  | RecordLevelEvent
  | SessionStateEvent
  | AudioEngineStateEvent
  | AudioRecordStateEvent
  | PlaybackStateEvent
  | SessionTrackMidiEvent
  | AnalysisSpectrumEvent
  | AnalysisLufsEvent
  | SystemFileDropEvent;

/* ── Event listener types ── */

export type InboundMessageType = InboundMessage["type"];

type ListenerMap = {
  "meter.update": (e: MeterUpdateEvent) => void;
  "transport.state": (e: TransportStateEvent) => void;
  "plugin.paramChanged": (e: PluginParamChangedEvent) => void;
  "chain.state": (e: ChainStateEvent) => void;
  error: (e: HostErrorEvent) => void;
  connectionChange: (connected: boolean) => void;
  "plugin.editorClosed": (e: EditorClosedEvent) => void;
  "render.progress": (e: RenderProgressEvent) => void;
  "render.complete": (e: RenderCompleteEvent) => void;
  "render.error": (e: RenderErrorEvent) => void;
  "midi.input": (e: MidiInputEvent) => void;
  "midi.deviceChange": (e: MidiDeviceChangeEvent) => void;
  "midi.learn.captured": (e: MidiLearnCapturedEvent) => void;
  "midi.learn.assigned": (e: MidiLearnAssignedEvent) => void;
  "record.level": (e: RecordLevelEvent) => void;
  "session.state": (e: SessionStateEvent) => void;
  "audio.engine.state": (e: AudioEngineStateEvent) => void;
  "audio.record.state": (e: AudioRecordStateEvent) => void;
  "playback.state": (e: PlaybackStateEvent) => void;
  "session.trackMidi": (e: SessionTrackMidiEvent) => void;
  "analysis.spectrum": (e: AnalysisSpectrumEvent) => void;
  "analysis.lufs": (e: AnalysisLufsEvent) => void;
  "system.fileDrop": (e: SystemFileDropEvent) => void;
};

type EventType = keyof ListenerMap;

/* ── Socket client ── */

const DEFAULT_WS_URL = resolvePluginHostWsUrl();
const RECONNECT_INTERVAL = 3_000;

export class PluginHostSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private listeners = new Map<EventType, Set<ListenerMap[EventType]>>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private intentionalClose = false;
  private _connected = false;

  constructor(url: string = DEFAULT_WS_URL) {
    this.url = url;
  }

  setUrl(url: string): void {
    if (this.url === url) return;

    this.url = url;
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      this.disconnect();
    }
  }

  get connected(): boolean {
    return this._connected;
  }

  /* ── Connection lifecycle ── */

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.ws?.readyState === WebSocket.CONNECTING) {
      return;
    }

    this.intentionalClose = false;

    try {
      this.ws = new WebSocket(this.url);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.onopen = () => {
      this._connected = true;
      this.emit("connectionChange", true);
    };

    this.ws.onclose = () => {
      this._connected = false;
      this.emit("connectionChange", false);
      if (!this.intentionalClose) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      // onclose will fire after onerror
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as InboundMessage;
        this.emit(msg.type as EventType, msg);
      } catch {
        // ignore malformed messages
      }
    };
  }

  disconnect(): void {
    this.intentionalClose = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.ws?.close();
    this.ws = null;
    this._connected = false;
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, RECONNECT_INTERVAL);
  }

  /* ── Send commands ── */

  send(msg: OutboundMessage): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      console.warn("[PluginHostSocket] Cannot send — not connected");
      return;
    }
    this.ws.send(JSON.stringify(msg));
  }

  /* Transport helpers */
  play(fromBeat = 0) { this.send({ type: "transport.play", fromBeat }); }
  pause() { this.send({ type: "transport.pause" }); }
  stop() { this.send({ type: "transport.stop" }); }
  seek(beat: number) { this.send({ type: "transport.seek", beat }); }
  setTempo(bpm: number) { this.send({ type: "transport.tempo", bpm }); }
  setLoop(enabled: boolean, start: number, end: number) {
    this.send({ type: "transport.loop", enabled, start, end });
  }

  /* Plugin helpers */
  setParam(chainId: string, nodeIndex: number, paramId: number, value: number) {
    this.send({ type: "plugin.setParam", chainId, nodeIndex, paramId, value });
  }
  bypass(chainId: string, nodeIndex: number, bypass: boolean) {
    this.send({ type: "plugin.bypass", chainId, nodeIndex, bypass });
  }

  /* ── Event emitter ── */

  on<K extends EventType>(event: K, fn: ListenerMap[K]): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(fn);
    return () => this.listeners.get(event)?.delete(fn);
  }

  off<K extends EventType>(event: K, fn: ListenerMap[K]): void {
    this.listeners.get(event)?.delete(fn);
  }

  private emit<K extends EventType>(event: K, ...args: Parameters<ListenerMap[K]>): void {
    this.listeners.get(event)?.forEach((fn) => {
      (fn as ListenerMap[K])(...args);
    });
  }

  dispose(): void {
    this.disconnect();
    this.listeners.clear();
  }
}

export const pluginHostSocket = new PluginHostSocket();
