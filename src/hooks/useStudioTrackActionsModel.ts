import { useCallback } from "react";
import type { SessionTrack, TrackSend, AutomationPoint } from "@/types/studio";
import type { StudioCommandDispatchResult } from "@/hooks/useStudioCommandDispatch";
import type { StudioTrackViewState } from "@/domain/studio/studioViewContracts";

interface UseStudioTrackActionsModelOptions {
  commandDispatch: StudioCommandDispatchResult;
  trackViewStateById: Record<string, StudioTrackViewState>;
  onVolumeChange: (trackId: string, volume: number) => void;
  onPanChange: (trackId: string, pan: number) => void;
  onSendChange: (trackId: string, sends: TrackSend[]) => void;
  onClipMove: (clipId: string, newStartBeats: number, targetTrackId?: string) => void;
  onClipResize: (clipId: string, newStartBeats: number, newEndBeats: number) => void;
  onReorderTrack: (trackId: string, direction: "up" | "down") => void;
  onAutomationChange: (trackId: string, laneId: string, points: AutomationPoint[]) => void;
  onAutomationAdd: (trackId: string, target: string, label: string) => void;
  onAutomationRemove: (trackId: string, laneId: string) => void;
  onSplitClip: (clipId: string, beatPosition: number) => void;
  onAudioUploadOpen: () => void;
  onCreateTrack: {
    audio: () => void;
    midi: () => void;
    return: () => void;
  };
  onCreateMidiClip: (trackId: string, startBeat: number) => void;
  onMoveTimelineClip: (clipId: string, sourceTrackId: string, newStartBeats: number, deltaY?: number) => void;
  onLoopToSelection: (primaryClipId?: string) => void;
  onSelectTrack: (trackId: string) => void;
  onSelectClip: (clipId: string, trackId: string) => void;
  onClickClip: (clipId: string, trackId: string, event: React.MouseEvent) => void;
}

export function useStudioTrackActionsModel({
  commandDispatch,
  trackViewStateById,
  onVolumeChange,
  onPanChange,
  onSendChange,
  onClipMove,
  onClipResize,
  onReorderTrack,
  onAutomationChange,
  onAutomationAdd,
  onAutomationRemove,
  onSplitClip,
  onAudioUploadOpen,
  onCreateTrack,
  onCreateMidiClip,
  onMoveTimelineClip,
  onLoopToSelection,
  onSelectTrack,
  onSelectClip,
  onClickClip,
}: UseStudioTrackActionsModelOptions) {
  const toggleTrackMute = useCallback(
    (trackId: string) => {
      commandDispatch.updateTrack(trackId, {
        muted: !(trackViewStateById[trackId]?.muted ?? false),
      });
    },
    [commandDispatch, trackViewStateById],
  );

  const toggleTrackSolo = useCallback(
    (trackId: string) => {
      commandDispatch.updateTrack(trackId, {
        solo: !(trackViewStateById[trackId]?.solo ?? false),
      });
    },
    [commandDispatch, trackViewStateById],
  );

  const renameTrack = useCallback(
    (trackId: string, name: string) => commandDispatch.updateTrack(trackId, { name }),
    [commandDispatch],
  );

  const recolorTrack = useCallback(
    (trackId: string, color: number) => commandDispatch.updateTrack(trackId, { color }),
    [commandDispatch],
  );

  const deleteTrack = useCallback(
    (trackId: string) => commandDispatch.deleteTrack(trackId),
    [commandDispatch],
  );

  const renameClip = useCallback(
    (clipId: string, name: string) => commandDispatch.updateClip(clipId, { name }),
    [commandDispatch],
  );

  const recolorClip = useCallback(
    (clipId: string, color: number) => commandDispatch.updateClip(clipId, { color }),
    [commandDispatch],
  );

  const muteClip = useCallback(
    (clipId: string) => commandDispatch.updateClip(clipId, { muted: true }),
    [commandDispatch],
  );

  const deleteClip = useCallback(
    (clipId: string) => commandDispatch.deleteClip(clipId),
    [commandDispatch],
  );

  const duplicateClip = useCallback(
    (clipId: string) => commandDispatch.duplicateClip(clipId, false),
    [commandDispatch],
  );

  const linkedDuplicateClip = useCallback(
    (clipId: string) => commandDispatch.duplicateClip(clipId, true),
    [commandDispatch],
  );

  const openTrackDetail = useCallback(
    (trackId: string) => commandDispatch.select({ trackId, panel: "detail" }),
    [commandDispatch],
  );

  const toggleTrackMonitoring = useCallback(
    (trackId: string, monitoring: boolean) =>
      commandDispatch.updateTrack(trackId, { monitoring: monitoring ? "in" : "off" }),
    [commandDispatch],
  );

  const toggleTrackArmed = useCallback(
    (trackId: string, armed: boolean) =>
      commandDispatch.updateTrack(trackId, { armed }),
    [commandDispatch],
  );

  return {
    track: {
      onSelect: onSelectTrack,
      onMuteToggle: toggleTrackMute,
      onSoloToggle: toggleTrackSolo,
      onNativeMonitorToggle: toggleTrackMonitoring,
      onNativeArmToggle: toggleTrackArmed,
      onVolumeChange,
      onPanChange,
      onSendChange,
      onRenameTrack: renameTrack,
      onDeleteTrack: deleteTrack,
      onColorChange: recolorTrack,
      onClipMove: onMoveTimelineClip,
      onClipResize,
      onReorder: onReorderTrack,
      onClipSelect: onSelectClip,
      onClipClick: onClickClip,
      onCreateMidiClip,
      onAutomationChange,
      onAutomationAdd,
      onAutomationRemove,
      onDeleteClip: deleteClip,
      onDuplicateClip: duplicateClip,
      onLinkedDuplicateClip: linkedDuplicateClip,
      onRenameClip: renameClip,
      onClipColorChange: recolorClip,
      onSplitClip,
      onMuteClip: muteClip,
      onSetAsLoop: onLoopToSelection,
    },
    mixer: {
      onMuteToggle: toggleTrackMute,
      onSoloToggle: toggleTrackSolo,
      onNativeMonitorToggle: toggleTrackMonitoring,
      onNativeArmToggle: toggleTrackArmed,
      onVolumeChange,
      onPanChange,
      onSendChange,
      onSelectTrack,
      onInsertClick: openTrackDetail,
      onRenameTrack: renameTrack,
      onDeleteTrack: deleteTrack,
      onColorChange: recolorTrack,
    },
    timelineHeader: {
      createAudioTrack: onCreateTrack.audio,
      createMidiTrack: onCreateTrack.midi,
      createReturnTrack: onCreateTrack.return,
      openAudioUpload: onAudioUploadOpen,
    },
    clip: {
      onMove: onClipMove,
      onResize: onClipResize,
    },
  };
}

export type StudioTrackActionsModelResult = ReturnType<typeof useStudioTrackActionsModel>;
