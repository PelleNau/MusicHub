import { useRef } from "react";
import { useTimelineGrid } from "@/hooks/useTimelineGrid";
import { useStudioKeyboardShortcuts } from "@/hooks/useStudioKeyboardShortcuts";
import { useStudioRuntimeCoordination } from "@/hooks/useStudioRuntimeCoordination";
import type { useUndoRedo } from "@/hooks/useUndoRedo";
import type { SessionTrack } from "@/types/studio";

interface UseStudioPageCoordinationOptions {
  beatsPerBar: number;
  totalBeats: number;
  tracks: SessionTrack[];
  selectedClipIds: Set<string>;
  clearSelectedClipIds: () => void;
  bottomTab: "editor" | "mixer";
  showPianoRoll: boolean;
  playbackState: "playing" | "paused" | "stopped";
  history: ReturnType<typeof useUndoRedo>;
  loopState: {
    loopEnabled: boolean;
    loopStart: number;
    loopEnd: number;
  };
  commands: {
    play: () => void;
    pause: () => void;
    deleteClip: (clipId: string) => void;
    updateClip: (clipId: string, patch: { name?: string; color?: number; muted?: boolean }) => void;
    openPanel: (panel: "detail" | "mixer" | "pianoRoll") => void;
    setLoop: (enabled: boolean, start: number, end: number) => void;
  };
  markerCommands?: {
    addMarkerAtCurrentBeat: () => void;
  };
  runtimeCoordination: {
    isMock: boolean;
    buildGraph: () => void;
  };
}

export function useStudioPageCoordination({
  beatsPerBar,
  totalBeats,
  tracks,
  selectedClipIds,
  clearSelectedClipIds,
  bottomTab,
  showPianoRoll,
  playbackState,
  history,
  loopState,
  commands,
  markerCommands,
  runtimeCoordination,
}: UseStudioPageCoordinationOptions) {
  const grid = useTimelineGrid(beatsPerBar);
  const timelineRef = useRef<HTMLDivElement>(null);

  useStudioRuntimeCoordination({
    timelineRef,
    handleTimelineWheel: grid.handleWheel,
    isMock: runtimeCoordination.isMock,
    tracks,
    buildGraph: runtimeCoordination.buildGraph,
  });

  useStudioKeyboardShortcuts({
    timelineRef,
    grid,
    totalBeats,
    tracks,
    selectedClipIds,
    clearSelectedClipIds,
    bottomTab,
    showPianoRoll,
    playbackState,
    history,
    commands,
    loopState,
    markerCommands,
  });

  return {
    grid,
    timelineRef,
  };
}

export type StudioPageCoordinationResult = ReturnType<typeof useStudioPageCoordination>;
