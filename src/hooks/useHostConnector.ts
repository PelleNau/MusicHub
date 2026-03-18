import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  HostConnector,
  hostConnector,
  type ConnectionState,
} from "@/services/hostConnector";
import type { MeterLevel, HostErrorEvent, SessionStateEvent, AudioEngineStateEvent } from "@/services/pluginHostSocket";
import type { ChainNode, MidiDevice } from "@/services/pluginHostClient";
import type { ShellInfo, SidecarStatus } from "@/services/tauriShell";
import { useHostConnectorBindings } from "@/hooks/useHostConnectorBindings";
import { useHostConnectorActions } from "@/hooks/useHostConnectorActions";
import type {
  AnalysisData,
  BounceProgress,
  HostConnectorActions,
  HostConnectorState,
  NativePlaybackState,
  NativeTransportState,
  SyncStatus,
} from "@/hooks/hostConnectorTypes";
export type {
  AnalysisData,
  BounceProgress,
  HostConnectorActions,
  HostConnectorState,
  NativePlaybackState,
  NativeTransportState,
  SyncStatus,
} from "@/hooks/hostConnectorTypes";

/* ── Hook ── */

export function useHostConnector(): [HostConnectorState, HostConnectorActions] {
  const connectorRef = useRef<HostConnector>(hostConnector);
  const connector = connectorRef.current;

  const [connectionState, setConnectionState] = useState<ConnectionState>(connector.connectionState);
  const [isMock, setIsMock] = useState(connector.isMock);
  const [shellInfo, setShellInfo] = useState<ShellInfo | null>(null);
  const [sidecarStatus, setSidecarStatus] = useState<SidecarStatus | null>(null);
  const [readySequence, setReadySequence] = useState(0);
  const [transport, setTransport] = useState<NativeTransportState | null>(null);
  const [playback, setPlayback] = useState<NativePlaybackState | null>(null);
  const [masterMeter, setMasterMeter] = useState<MeterLevel | null>(null);
  const [trackMeters, setTrackMeters] = useState<Record<string, MeterLevel>>({});
  const [nativeChains, setNativeChains] = useState<Record<string, ChainNode[]>>({});
  const [openEditors, setOpenEditors] = useState<Record<string, boolean>>({});
  const [lastError, setLastError] = useState<HostErrorEvent | null>(null);
  const [errors, setErrors] = useState<HostErrorEvent[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ state: "idle", lastSyncAt: null, error: null });
  const [midiDevices, setMidiDevices] = useState<MidiDevice[]>([]);
  const [bounceProgress, setBounceProgress] = useState<BounceProgress>({ renderId: null, progress: 0, complete: false, filePath: null });
  const [analysisData, setAnalysisData] = useState<AnalysisData>({ spectrum: null, lufs: null });
  const [analysisActive, setAnalysisActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordLevels, setRecordLevels] = useState<Record<string, { peak: number; rms: number }>>({});
  const [sessionState, setSessionState] = useState<SessionStateEvent | null>(null);
  const [audioEngineState, setAudioEngineState] = useState<AudioEngineStateEvent | null>(null);

  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioConfigAttemptedRef = useRef(false);

  const resetLiveHostState = useCallback(() => {
    setTransport(null);
    setPlayback(null);
    setMasterMeter(null);
    setTrackMeters({});
    setNativeChains({});
    setOpenEditors({});
    setSessionState(null);
    setAudioEngineState(null);
    setRecordLevels({});
    setRecording(false);
    setAnalysisActive(false);
    setAnalysisData({ spectrum: null, lufs: null });
    setSyncStatus({ state: "idle", lastSyncAt: null, error: null });
  }, []);

  useHostConnectorBindings({
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
  });

  useEffect(() => {
    if ((connectionState !== "connected" && connectionState !== "degraded") || connector.isMock) {
      audioConfigAttemptedRef.current = false;
      return;
    }

    if (!audioEngineState || audioEngineState.outputDevice) {
      audioConfigAttemptedRef.current = false;
      return;
    }

    if (audioConfigAttemptedRef.current)
      return;

    audioConfigAttemptedRef.current = true;

    void (async () => {
      try {
        const config = await connector.audioConfig();
        const outputDevice =
          config.data.outputDevice ??
          config.data.availableDevices.find((device) => device.type === "output") ??
          null;

        if (!outputDevice)
          return;

        await connector.audioConfig({
          outputDeviceId: outputDevice.id,
          sampleRate: config.data.sampleRate || 48000,
          bufferSize: config.data.bufferSize || 512,
        });
      } catch {
        audioConfigAttemptedRef.current = false;
      }
    })();
  }, [audioEngineState, connectionState, connector]);

  /* ── Actions ── */

  const actions = useHostConnectorActions({
    connector,
    syncTimerRef,
    setOpenEditors,
    setBounceProgress,
    setMidiDevices,
    setRecording,
    setAnalysisActive,
    setAnalysisData,
    setNativeChains,
    setSyncStatus,
  });

  const state: HostConnectorState = {
    connectionState,
    isMock,
    inShell: connector.inShell,
    readySequence,
    shellInfo,
    sidecarStatus,
    transport,
    playback,
    masterMeter,
    trackMeters,
    nativeChains,
    openEditors,
    lastError,
    errors,
    syncStatus,
    midiDevices,
    bounceProgress,
    analysisData,
    analysisActive,
    recording,
    recordLevels,
    sessionState,
    audioEngineState,
  };

  return [state, actions];
}
