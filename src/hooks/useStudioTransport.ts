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
  setLoop: (enabled: boolean, start?: number, end?: number) => void;
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
  setLoop,
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
  const canPlay = effectivePlaybackState !== "playing";
  const canPause = effectivePlaybackState === "playing";
  const canStop = effectivePlaybackState !== "stopped" || effectiveBeat > 0.001;

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

  const handleSetLoop = useCallback((enabled: boolean, start: number, end: number) => {
    if (isBackendDriven) {
      hostActions.setLoop(enabled, start, end);
      return;
    }

    setLoop(enabled, start, end);
  }, [hostActions, isBackendDriven, setLoop]);

  const handleLoopChange = useCallback((start: number, end: number) => {
    handleSetLoop(loopEnabled, start, end);
  }, [handleSetLoop, loopEnabled]);

  const handleLoopToggle = useCallback(() => {
    handleSetLoop(!loopEnabled, loopStart, loopEnd);
  }, [handleSetLoop, loopEnabled, loopEnd, loopStart]);

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
    canPlay,
    canPause,
    canStop,
    handleSetLoop,
    handlePlay,
    handlePause,
    handleStop,
    handleSeek,
    handleLoopChange,
    handleLoopToggle,
    handleTempoChange,
  };
}
