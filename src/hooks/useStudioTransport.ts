import { useCallback } from "react";
import type { HostConnectorActions, HostConnectorState } from "@/hooks/useHostConnector";

export type StudioPlaybackState = "playing" | "paused" | "stopped";

interface UseStudioTransportOptions {
  isMock: boolean;
  playbackState: StudioPlaybackState;
  currentBeat: number;
  play: () => void | Promise<void>;
  pause: () => void;
  stop: () => void;
  seekToBeat: (beat: number) => void;
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
  setLoopRegion: (start: number, end: number) => void;
  toggleLoop: () => void;
  hostState: HostConnectorState;
  hostActions: HostConnectorActions;
  onTempoChangeLocal: (tempo: number) => void;
}

export function useStudioTransport({
  isMock,
  playbackState,
  currentBeat,
  play,
  pause,
  stop,
  seekToBeat,
  loopEnabled,
  loopStart,
  loopEnd,
  setLoopRegion,
  toggleLoop,
  hostState,
  hostActions,
  onTempoChangeLocal,
}: UseStudioTransportOptions) {
  const getConnectedPlaybackState = useCallback((): StudioPlaybackState => {
    if (hostState.transport) {
      return hostState.transport.state as StudioPlaybackState;
    }

    if (hostState.playback) {
      return hostState.playback.state as StudioPlaybackState;
    }

    return "stopped";
  }, [hostState.playback, hostState.transport]);

  const getConnectedBeat = useCallback(() => {
    const nowMs = performance.now();

    if (hostState.transport) {
      const baseBeat = hostState.transport.beat;
      if (hostState.transport.state !== "playing") return baseBeat;

      const elapsedMinutes = Math.max(0, nowMs - hostState.transport.receivedAtMs) / 60000;
      return baseBeat + elapsedMinutes * hostState.transport.bpm;
    }

    if (hostState.playback) {
      const baseBeat = hostState.playback.currentBeat;
      if (hostState.playback.state !== "playing") return baseBeat;

      const elapsedMinutes = Math.max(0, nowMs - hostState.playback.receivedAtMs) / 60000;
      return baseBeat + elapsedMinutes * hostState.playback.bpm;
    }

    return 0;
  }, [hostState.playback, hostState.transport]);

  const isBackendDriven = !isMock;

  const effectivePlaybackState: StudioPlaybackState =
    isBackendDriven ? getConnectedPlaybackState() : playbackState;

  const effectiveBeat = isBackendDriven ? getConnectedBeat() : currentBeat;
  const playheadBeatGetter = isBackendDriven ? getConnectedBeat : undefined;

  const handlePlay = useCallback(() => {
    if (isBackendDriven) {
      hostActions.play(effectiveBeat);
    } else {
      void play();
    }
  }, [isBackendDriven, hostActions, effectiveBeat, play]);

  const handlePause = useCallback(() => {
    if (isBackendDriven) hostActions.pause();
    else pause();
  }, [isBackendDriven, hostActions, pause]);

  const handleStop = useCallback(() => {
    if (isBackendDriven) hostActions.stop();
    else stop();
  }, [isBackendDriven, hostActions, stop]);

  const handleSeek = useCallback((beat: number) => {
    if (isBackendDriven) hostActions.seek(beat);
    else seekToBeat(beat);
  }, [isBackendDriven, hostActions, seekToBeat]);

  const handleLoopChange = useCallback((start: number, end: number) => {
    setLoopRegion(start, end);
    if (isBackendDriven) hostActions.setLoop(loopEnabled, start, end);
  }, [setLoopRegion, isBackendDriven, hostActions, loopEnabled]);

  const handleLoopToggle = useCallback(() => {
    const newEnabled = !loopEnabled;
    toggleLoop();
    if (isBackendDriven) hostActions.setLoop(newEnabled, loopStart, loopEnd);
  }, [toggleLoop, isBackendDriven, hostActions, loopEnabled, loopStart, loopEnd]);

  const handleTempoChange = useCallback((tempo: number) => {
    onTempoChangeLocal(tempo);
    if (isBackendDriven) hostActions.setTempo(tempo);
  }, [hostActions, isBackendDriven, onTempoChangeLocal]);

  return {
    mode: isMock ? "standalone" : "connected",
    getConnectedPlaybackState,
    getConnectedBeat,
    effectivePlaybackState,
    effectiveBeat,
    playheadBeatGetter,
    handlePlay,
    handlePause,
    handleStop,
    handleSeek,
    handleLoopChange,
    handleLoopToggle,
    handleTempoChange,
  };
}
