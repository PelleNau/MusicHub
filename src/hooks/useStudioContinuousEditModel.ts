import { useCallback, useMemo } from "react";
import type { AutomationPoint, TrackSend } from "@/types/studio";
import type { MusicHubContinuousEdit } from "@/types/musicHubContinuousEdits";

interface UseStudioContinuousEditModelOptions {
  sessionId: string | null;
  recordEdit: (entry: Omit<MusicHubContinuousEdit, "id" | "occurredAt">) => MusicHubContinuousEdit;
  onVolumeChange: (trackId: string, volume: number) => void;
  onPanChange: (trackId: string, pan: number) => void;
  onSendChange: (trackId: string, sends: TrackSend[]) => void;
  onClipMove: (clipId: string, newStartBeats: number, targetTrackId?: string) => void;
  onClipResize: (clipId: string, newStartBeats: number, newEndBeats: number) => void;
  onReorderTrack: (trackId: string, direction: "up" | "down") => void;
  onAutomationChange: (trackId: string, laneId: string, points: AutomationPoint[]) => void;
  onAutomationAdd: (trackId: string, target: string, label: string) => void;
  onAutomationRemove: (trackId: string, laneId: string) => void;
}

export function useStudioContinuousEditModel({
  sessionId,
  recordEdit,
  onVolumeChange,
  onPanChange,
  onSendChange,
  onClipMove,
  onClipResize,
  onReorderTrack,
  onAutomationChange,
  onAutomationAdd,
  onAutomationRemove,
}: UseStudioContinuousEditModelOptions) {
  const volumeChange = useCallback(
    (trackId: string, volume: number) => {
      recordEdit({
        kind: "track.volume",
        sessionId,
        trackId,
        payload: { volume },
      });
      onVolumeChange(trackId, volume);
    },
    [onVolumeChange, recordEdit, sessionId],
  );

  const panChange = useCallback(
    (trackId: string, pan: number) => {
      recordEdit({
        kind: "track.pan",
        sessionId,
        trackId,
        payload: { pan },
      });
      onPanChange(trackId, pan);
    },
    [onPanChange, recordEdit, sessionId],
  );

  const sendChange = useCallback(
    (trackId: string, sends: TrackSend[]) => {
      recordEdit({
        kind: "track.sends",
        sessionId,
        trackId,
        payload: { sends },
      });
      onSendChange(trackId, sends);
    },
    [onSendChange, recordEdit, sessionId],
  );

  const clipMove = useCallback(
    (clipId: string, newStartBeats: number, targetTrackId?: string) => {
      recordEdit({
        kind: "clip.move",
        sessionId,
        clipId,
        trackId: targetTrackId,
        payload: { newStartBeats, targetTrackId },
      });
      onClipMove(clipId, newStartBeats, targetTrackId);
    },
    [onClipMove, recordEdit, sessionId],
  );

  const clipResize = useCallback(
    (clipId: string, newStartBeats: number, newEndBeats: number) => {
      recordEdit({
        kind: "clip.resize",
        sessionId,
        clipId,
        payload: { newStartBeats, newEndBeats },
      });
      onClipResize(clipId, newStartBeats, newEndBeats);
    },
    [onClipResize, recordEdit, sessionId],
  );

  const reorderTrack = useCallback(
    (trackId: string, direction: "up" | "down") => {
      recordEdit({
        kind: "track.reorder",
        sessionId,
        trackId,
        payload: { direction },
      });
      onReorderTrack(trackId, direction);
    },
    [onReorderTrack, recordEdit, sessionId],
  );

  const automationChange = useCallback(
    (trackId: string, laneId: string, points: AutomationPoint[]) => {
      recordEdit({
        kind: "automation.change",
        sessionId,
        trackId,
        laneId,
        payload: { points },
      });
      onAutomationChange(trackId, laneId, points);
    },
    [onAutomationChange, recordEdit, sessionId],
  );

  const automationAdd = useCallback(
    (trackId: string, target: string, label: string) => {
      recordEdit({
        kind: "automation.add",
        sessionId,
        trackId,
        payload: { target, label },
      });
      onAutomationAdd(trackId, target, label);
    },
    [onAutomationAdd, recordEdit, sessionId],
  );

  const automationRemove = useCallback(
    (trackId: string, laneId: string) => {
      recordEdit({
        kind: "automation.remove",
        sessionId,
        trackId,
        laneId,
        payload: { laneId },
      });
      onAutomationRemove(trackId, laneId);
    },
    [onAutomationRemove, recordEdit, sessionId],
  );

  return useMemo(
    () => ({
      onVolumeChange: volumeChange,
      onPanChange: panChange,
      onSendChange: sendChange,
      onClipMove: clipMove,
      onClipResize: clipResize,
      onReorderTrack: reorderTrack,
      onAutomationChange: automationChange,
      onAutomationAdd: automationAdd,
      onAutomationRemove: automationRemove,
    }),
    [
      automationAdd,
      automationChange,
      automationRemove,
      clipMove,
      clipResize,
      panChange,
      reorderTrack,
      sendChange,
      volumeChange,
    ],
  );
}

export type StudioContinuousEditModelResult = ReturnType<typeof useStudioContinuousEditModel>;
