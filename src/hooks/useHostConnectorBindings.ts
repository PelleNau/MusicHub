import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { HostConnector, ConnectionState } from "@/services/hostConnector";
import type {
  MeterLevel,
  TransportStateEvent,
  PlaybackStateEvent,
  ChainStateEvent,
  EditorClosedEvent,
  HostErrorEvent,
  RenderProgressEvent,
  RenderCompleteEvent,
  AnalysisSpectrumEvent,
  AnalysisLufsEvent,
  RecordLevelEvent,
  SessionStateEvent,
  AudioEngineStateEvent,
  AudioRecordStateEvent,
} from "@/services/pluginHostSocket";
import type { ShellInfo, SidecarStatus } from "@/services/tauriShell";
import type {
  AnalysisData,
  BounceProgress,
  NativePlaybackState,
  NativeTransportState,
  SyncStatus,
} from "@/hooks/hostConnectorTypes";

interface UseHostConnectorBindingsOptions {
  connector: HostConnector;
  resetLiveHostState: () => void;
  setConnectionState: Dispatch<SetStateAction<ConnectionState>>;
  setIsMock: Dispatch<SetStateAction<boolean>>;
  setReadySequence: Dispatch<SetStateAction<number>>;
  setShellInfo: Dispatch<SetStateAction<ShellInfo | null>>;
  setSidecarStatus: Dispatch<SetStateAction<SidecarStatus | null>>;
  setTransport: Dispatch<SetStateAction<NativeTransportState | null>>;
  setPlayback: Dispatch<SetStateAction<NativePlaybackState | null>>;
  setMasterMeter: Dispatch<SetStateAction<MeterLevel | null>>;
  setTrackMeters: Dispatch<SetStateAction<Record<string, MeterLevel>>>;
  setNativeChains: Dispatch<SetStateAction<Record<string, ChainNode[]>>>;
  setOpenEditors: Dispatch<SetStateAction<Record<string, boolean>>>;
  setLastError: Dispatch<SetStateAction<HostErrorEvent | null>>;
  setErrors: Dispatch<SetStateAction<HostErrorEvent[]>>;
  setBounceProgress: Dispatch<SetStateAction<BounceProgress>>;
  setAnalysisData: Dispatch<SetStateAction<AnalysisData>>;
  setRecordLevels: Dispatch<SetStateAction<Record<string, { peak: number; rms: number }>>>;
  setSessionState: Dispatch<SetStateAction<SessionStateEvent | null>>;
  setAudioEngineState: Dispatch<SetStateAction<AudioEngineStateEvent | null>>;
  setRecording: Dispatch<SetStateAction<boolean>>;
  setAnalysisActive: Dispatch<SetStateAction<boolean>>;
  setSyncStatus: Dispatch<SetStateAction<SyncStatus>>;
}

export function useHostConnectorBindings({
  connector,
  resetLiveHostState,
  setConnectionState,
  setIsMock,
  setReadySequence,
  setShellInfo,
  setSidecarStatus,
  setTransport,
  setPlayback,
  setMasterMeter,
  setTrackMeters,
  setNativeChains,
  setOpenEditors,
  setLastError,
  setErrors,
  setBounceProgress,
  setAnalysisData,
  setRecordLevels,
  setSessionState,
  setAudioEngineState,
  setRecording,
  setAnalysisActive,
  setSyncStatus,
}: UseHostConnectorBindingsOptions) {
  useEffect(() => {
    const unsubs: Array<() => void> = [];

    unsubs.push(connector.on("connectionStateChange", (state) => {
      setConnectionState((previous) => {
        if (state === "disconnected" || state === "connecting") {
          resetLiveHostState();
        }

        if ((previous === "disconnected" || previous === "connecting") && state === "connected") {
          resetLiveHostState();
        }

        return state;
      });
      setIsMock(connector.isMock);
    }));

    unsubs.push(connector.on("ready", () => {
      setReadySequence((value) => value + 1);
    }));

    unsubs.push(connector.on("shell.info", (info) => {
      setShellInfo(info);
    }));

    unsubs.push(connector.on("sidecar.status", (status) => {
      setSidecarStatus(status);
    }));

    unsubs.push(connector.on("transport.state", (event: TransportStateEvent) => {
      setTransport({ state: event.state, beat: event.beat, bpm: event.bpm, receivedAtMs: performance.now() });
    }));

    unsubs.push(connector.on("playback.state", (event: PlaybackStateEvent) => {
      setPlayback({
        state: event.state,
        currentBeat: event.currentBeat,
        bpm: event.bpm,
        receivedAtMs: performance.now(),
        tracks: event.tracks,
      });
    }));

    unsubs.push(connector.on("meter.update", (event) => {
      setMasterMeter(event.master);
      setTrackMeters(event.tracks);
    }));

    unsubs.push(connector.on("chain.state", (event: ChainStateEvent) => {
      setNativeChains((previous) => ({ ...previous, [event.chainId]: event.nodes }));
    }));

    unsubs.push(connector.on("plugin.editorClosed", (event: EditorClosedEvent) => {
      const key = `${event.chainId}:${event.nodeIndex}`;
      setOpenEditors((previous) => {
        if (!previous[key]) return previous;
        const next = { ...previous };
        delete next[key];
        return next;
      });
    }));

    unsubs.push(connector.on("error", (event: HostErrorEvent) => {
      setLastError(event);
      setErrors((previous) => [event, ...previous].slice(0, 50));
    }));

    unsubs.push(connector.on("render.progress", (event: RenderProgressEvent) => {
      setBounceProgress((previous) => ({ ...previous, renderId: event.renderId, progress: event.progress }));
    }));

    unsubs.push(connector.on("render.complete", (event: RenderCompleteEvent) => {
      setBounceProgress({ renderId: event.renderId, progress: 1, complete: true, filePath: event.filePath });
    }));

    unsubs.push(connector.on("analysis.spectrum", (event: AnalysisSpectrumEvent) => {
      setAnalysisData((previous) => ({
        ...previous,
        spectrum: { bins: event.bins, fftSize: event.fftSize, sampleRate: event.sampleRate },
      }));
    }));

    unsubs.push(connector.on("analysis.lufs", (event: AnalysisLufsEvent) => {
      setAnalysisData((previous) => ({
        ...previous,
        lufs: {
          momentary: event.momentary,
          shortTerm: event.shortTerm,
          integrated: event.integrated,
        },
      }));
    }));

    unsubs.push(connector.on("record.level", (event: RecordLevelEvent) => {
      setRecordLevels((previous) => ({ ...previous, [event.trackId]: { peak: event.peak, rms: event.rms } }));
    }));

    unsubs.push(connector.on("session.state", (event: SessionStateEvent) => {
      setSessionState(event);
    }));

    unsubs.push(connector.on("audio.engine.state", (event: AudioEngineStateEvent) => {
      setAudioEngineState(event);
    }));

    unsubs.push(connector.on("audio.record.state", (event: AudioRecordStateEvent) => {
      setRecording(event.recording);
    }));

    connector.connect();

    return () => {
      unsubs.forEach((unsubscribe) => unsubscribe());
    };
  }, [
    connector,
    resetLiveHostState,
    setAnalysisActive,
    setAnalysisData,
    setAudioEngineState,
    setBounceProgress,
    setConnectionState,
    setErrors,
    setIsMock,
    setLastError,
    setMasterMeter,
    setNativeChains,
    setOpenEditors,
    setPlayback,
    setReadySequence,
    setRecordLevels,
    setRecording,
    setSessionState,
    setShellInfo,
    setSidecarStatus,
    setSyncStatus,
    setTrackMeters,
    setTransport,
  ]);
}
