import { useHostConnector } from "@/hooks/useHostConnector";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { useStudioActions } from "@/hooks/useStudioActions";
import { useStudioTransport } from "@/hooks/useStudioTransport";
import { useStudioSessionState } from "@/hooks/useStudioSessionState";
import { useStudioDerivedRuntimeModels } from "@/hooks/useStudioDerivedRuntimeModels";
import type { useUndoRedo } from "@/hooks/useUndoRedo";

interface UseStudioRuntimeCoreOptions {
  activeSessionId: string | null;
  history: ReturnType<typeof useUndoRedo>;
}

export function useStudioRuntimeCore({
  activeSessionId,
  history,
}: UseStudioRuntimeCoreOptions) {
  const sessionState = useStudioSessionState(activeSessionId);
  const [hostState, hostActions] = useHostConnector();

  const derivedRuntimeModels = useStudioDerivedRuntimeModels({
    sessionDomainModel: sessionState.sessionDomainModel,
    hostState,
  });

  const audioRuntime = useAudioEngine(
    derivedRuntimeModels.sessionMetrics.tempo,
    derivedRuntimeModels.sessionMetrics.beatsPerBar,
    derivedRuntimeModels.hostModeModel.browserAudioEnabled,
  );

  const actions = useStudioActions({
    activeSessionId,
    tracks: sessionState.tracks,
    sessionDomainModel: sessionState.sessionDomainModel,
    addTrack: sessionState.addTrack,
    createClip: sessionState.createClip,
    updateTrack: sessionState.updateTrack,
    deleteTrack: sessionState.deleteTrack,
    updateClip: sessionState.updateClip,
    deleteClip: sessionState.deleteClip,
    updateSession: sessionState.updateSession,
    createSession: sessionState.createSession,
    selectedTrackId: sessionState.selectedTrackId,
    history,
  });

  const transport = useStudioTransport({
    isMock: hostState.isMock,
    playbackState: audioRuntime.playbackState,
    currentBeat: audioRuntime.currentBeat,
    play: audioRuntime.play,
    pause: audioRuntime.pause,
    stop: audioRuntime.stop,
    seekToBeat: audioRuntime.seekToBeat,
    loopEnabled: audioRuntime.loopEnabled,
    loopStart: audioRuntime.loopStart,
    loopEnd: audioRuntime.loopEnd,
    setLoop: audioRuntime.setLoop,
    setLoopRegion: audioRuntime.setLoopRegion,
    toggleLoop: audioRuntime.toggleLoop,
    hostState,
    hostActions,
    onTempoChangeLocal: actions.handleTempoChange,
  });

  return {
    ...sessionState,
    hostState,
    hostActions,
    ...derivedRuntimeModels,
    ...audioRuntime,
    actions,
    transport,
  };
}

export type StudioRuntimeCoreResult = ReturnType<typeof useStudioRuntimeCore>;
