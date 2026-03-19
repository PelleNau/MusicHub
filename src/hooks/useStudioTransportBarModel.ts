import type { StudioConnectionSummary } from "@/domain/studio/studioViewContracts";
import type { MeterLevel } from "@/services/pluginHostSocket";
import type { ConnectionState } from "@/services/hostConnector";
import type { StudioCommandDispatchResult } from "@/hooks/useStudioCommandDispatch";
import type { useUndoRedo } from "@/hooks/useUndoRedo";
import type { StudioConnectionActionsModelResult } from "@/hooks/useStudioConnectionActionsModel";

interface UseStudioTransportBarModelOptions {
  tempo: number;
  timeSignature: string;
  currentBeat: number;
  playbackState: "playing" | "paused" | "stopped";
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
  connectionSummary: StudioConnectionSummary;
  masterMeter: MeterLevel | null;
  commandDispatch: StudioCommandDispatchResult;
  history: ReturnType<typeof useUndoRedo>;
  connectionActionsModel: StudioConnectionActionsModelResult;
}

export function useStudioTransportBarModel({
  tempo,
  timeSignature,
  currentBeat,
  playbackState,
  loopEnabled,
  loopStart,
  loopEnd,
  connectionSummary,
  masterMeter,
  commandDispatch,
  history,
  connectionActionsModel,
}: UseStudioTransportBarModelOptions) {
  return {
    tempo,
    timeSignature,
    currentBeat,
    playbackState,
    loopEnabled,
    connectionState: connectionSummary.connectionState as ConnectionState,
    isMock: connectionSummary.isMock,
    inShell: connectionSummary.inShell,
    sidecarStatus: connectionSummary.sidecarStatus,
    masterMeter,
    syncStatus: connectionSummary.syncStatus,
    onPlay: commandDispatch.play,
    onPause: commandDispatch.pause,
    onStop: commandDispatch.stop,
    onTempoChange: commandDispatch.setTempo,
    onLoopToggle: () => commandDispatch.setLoop(!loopEnabled, loopStart, loopEnd),
    onUndo: history.undo,
    onRedo: history.redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    onConnect: connectionActionsModel.onConnect,
    onDisconnect: connectionActionsModel.onDisconnect,
    onRestartShellHost: connectionActionsModel.onRestartShellHost,
    recording: connectionSummary.recording,
    onRecordToggle: connectionSummary.canUseNativeControls ? commandDispatch.toggleRecord : undefined,
  };
}
