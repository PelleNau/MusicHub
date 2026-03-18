import { useCallback } from "react";
import type React from "react";
import type { SessionTrack } from "@/types/studio";
import type { StudioCommandDispatchResult } from "@/hooks/useStudioCommandDispatch";
import type { SessionClip } from "@/types/studio";

interface UseStudioTimelineViewModelOptions {
  allClips: SessionClip[];
  displayTracks: SessionTrack[];
  selectedClipIds: Set<string>;
  trackHeight: number;
  commandDispatch: StudioCommandDispatchResult;
  onMoveClip: (clipId: string, newStartBeats: number, targetTrackId?: string) => void;
}

export function useStudioTimelineViewModel({
  allClips,
  displayTracks,
  selectedClipIds,
  trackHeight,
  commandDispatch,
  onMoveClip,
}: UseStudioTimelineViewModelOptions) {
  const selectTrack = useCallback(
    (trackId: string) => {
      commandDispatch.select({ trackId, mode: "replace" });
    },
    [commandDispatch],
  );

  const selectClip = useCallback(
    (clipId: string, trackId: string) => {
      commandDispatch.select({
        trackId,
        clipId,
        panel: "pianoRoll",
        mode: "replace",
      });
    },
    [commandDispatch],
  );

  const clickClip = useCallback(
    (clipId: string, trackId: string, event: React.MouseEvent) => {
      const mode =
        event.metaKey || event.ctrlKey
          ? "toggle"
          : event.shiftKey
            ? "add"
            : "replace";

      commandDispatch.select({ trackId, clipId, mode });
    },
    [commandDispatch],
  );

  const loopToSelection = useCallback(
    (primaryClipId?: string) => {
      const selectedClips =
        primaryClipId && !selectedClipIds.has(primaryClipId)
          ? allClips.filter((clip) => clip.id === primaryClipId)
          : allClips.filter((clip) => selectedClipIds.has(clip.id));

      if (selectedClips.length === 0) return;

      const startBeat = Math.min(...selectedClips.map((clip) => clip.start_beats));
      const endBeat = Math.max(...selectedClips.map((clip) => clip.end_beats));
      commandDispatch.setLoop(true, startBeat, endBeat);
    },
    [allClips, commandDispatch, selectedClipIds],
  );

  const moveClip = useCallback(
    (clipId: string, sourceTrackId: string, newStartBeats: number, deltaY?: number) => {
      if (deltaY && Math.abs(deltaY) > trackHeight / 2) {
        const sourceIndex = displayTracks.findIndex((track) => track.id === sourceTrackId);
        const targetOffset = Math.round(deltaY / trackHeight);
        const targetIndex = Math.max(0, Math.min(displayTracks.length - 1, sourceIndex + targetOffset));
        const targetTrack = displayTracks[targetIndex];
        if (targetTrack && targetTrack.id !== sourceTrackId) {
          onMoveClip(clipId, newStartBeats, targetTrack.id);
          return;
        }
      }

      onMoveClip(clipId, newStartBeats);
    },
    [displayTracks, onMoveClip, trackHeight],
  );

  return {
    selectTrack,
    selectClip,
    clickClip,
    loopToSelection,
    moveClip,
    createAudioTrack: () => commandDispatch.createTrack("audio"),
    createMidiTrack: () => commandDispatch.createTrack("midi"),
    createReturnTrack: () => commandDispatch.createTrack("return"),
    createMidiClip: (trackId: string, startBeat: number) => commandDispatch.createMidiClip(trackId, startBeat),
  };
}
