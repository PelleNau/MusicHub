import { useEffect, useRef } from "react";
import type { SessionTrack } from "@/types/studio";
import type { UndoRedoState } from "@/hooks/useUndoRedo";

interface LoopState {
  focused: boolean;
  start: number;
  end: number;
  enabled: boolean;
}

interface GridControls {
  narrowGrid: () => void;
  widenGrid: () => void;
  toggleTripletMode: () => void;
  toggleSnapEnabled: () => void;
  setGridMode: (mode: "adaptive" | "fixed") => void;
  zoomOutFull: (totalBeats: number, trackCount: number, viewportWidth: number, viewportHeight: number) => void;
  restoreZoom: () => void;
  zoomToSelection: (startBeat: number, endBeat: number, trackCount: number, viewportWidth: number, viewportHeight: number) => void;
  hasZoomMemory: boolean;
  gridMode: "adaptive" | "fixed";
  snapBeats: number;
}

interface StudioCommandSurfaceForShortcuts {
  play: () => void;
  pause: () => void;
  deleteClip: (clipId: string) => void;
  updateClip: (
    clipId: string,
    patch: Partial<{
      muted: boolean;
      name: string;
      color: number;
    }>,
  ) => void;
  openPanel: (panel: "detail" | "pianoRoll" | "mixer") => void;
  setLoop: (enabled: boolean, startBeat?: number, endBeat?: number) => void;
}

interface UseStudioKeyboardShortcutsOptions {
  timelineRef: React.RefObject<HTMLDivElement>;
  grid: GridControls;
  totalBeats: number;
  tracks: SessionTrack[];
  selectedClipIds: Set<string>;
  clearSelectedClipIds: () => void;
  bottomTab: "editor" | "mixer";
  showPianoRoll: boolean;
  playbackState: "playing" | "paused" | "stopped";
  history: UndoRedoState;
  commands: StudioCommandSurfaceForShortcuts;
  loopState: LoopState;
  markerCommands?: {
    addMarkerAtCurrentBeat: () => void;
  };
}

export function useStudioKeyboardShortcuts({
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
}: UseStudioKeyboardShortcutsOptions) {
  const playbackStateRef = useRef(playbackState);
  playbackStateRef.current = playbackState;

  const historyRef = useRef(history);
  historyRef.current = history;

  const gridRef = useRef(grid);
  gridRef.current = grid;

  const totalBeatsRef = useRef(totalBeats);
  totalBeatsRef.current = totalBeats;

  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;

  const selectedClipIdsRef = useRef(selectedClipIds);
  selectedClipIdsRef.current = selectedClipIds;

  const bottomTabRef = useRef(bottomTab);
  bottomTabRef.current = bottomTab;

  const showPianoRollRef = useRef(showPianoRoll);
  showPianoRollRef.current = showPianoRoll;

  const commandsRef = useRef(commands);
  commandsRef.current = commands;

  const loopStateRef = useRef(loopState);
  loopStateRef.current = loopState;

  const markerCommandsRef = useRef(markerCommands);
  markerCommandsRef.current = markerCommands;

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if (event.key === " " && !event.repeat && !isTyping) {
        event.preventDefault();
        if (playbackStateRef.current === "playing") commandsRef.current.pause();
        else commandsRef.current.play();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.code === "KeyL" && !isTyping) {
        event.preventDefault();
        const ids = selectedClipIdsRef.current;
        const allClips = tracksRef.current.flatMap((track) => track.clips || []);
        const selectedClips = allClips.filter((clip) => ids.has(clip.id));
        const loop = loopStateRef.current;

        if (selectedClips.length > 0) {
          const selectionStart = Math.min(...selectedClips.map((clip) => clip.start_beats));
          const selectionEnd = Math.max(...selectedClips.map((clip) => clip.end_beats));
          const matchesSelection =
            loop.enabled &&
            Math.abs(loop.start - selectionStart) < 0.001 &&
            Math.abs(loop.end - selectionEnd) < 0.001;

          if (matchesSelection) {
            commandsRef.current.setLoop(false, loop.start, loop.end);
          } else {
            commandsRef.current.setLoop(true, selectionStart, selectionEnd);
          }
        } else {
          commandsRef.current.setLoop(!loop.enabled, loop.start, loop.end);
        }
        return;
      }

      if ((event.metaKey || event.ctrlKey) && (event.key === "z" || event.key === "Z")) {
        event.preventDefault();
        if (event.shiftKey) historyRef.current.redo();
        else historyRef.current.undo();
        return;
      }

      if (event.key === "z" || event.key === "Z") {
        event.preventDefault();
        const currentGrid = gridRef.current;
        const element = timelineRef.current;
        const viewportWidth = element?.clientWidth ?? 800;
        const viewportHeight = element?.clientHeight ?? 400;

        if (event.shiftKey) {
          currentGrid.zoomOutFull(totalBeatsRef.current, tracksRef.current.length, viewportWidth, viewportHeight);
        } else if (currentGrid.hasZoomMemory) {
          currentGrid.restoreZoom();
        } else {
          currentGrid.zoomToSelection(0, totalBeatsRef.current, tracksRef.current.length, viewportWidth, viewportHeight);
        }
        return;
      }

      if ((event.key === "Delete" || event.key === "Backspace") && !isTyping) {
        const ids = selectedClipIdsRef.current;
        if (ids.size > 0) {
          event.preventDefault();
          for (const id of ids) commandsRef.current.deleteClip(id);
          clearSelectedClipIds();
          return;
        }
      }

      if (event.key === "m" && !isTyping && !(event.metaKey || event.ctrlKey)) {
        const ids = selectedClipIdsRef.current;
        event.preventDefault();
        if (ids.size > 0) {
          const allClips = tracksRef.current.flatMap((track) => track.clips || []);
          const selectedClips = allClips.filter((clip) => ids.has(clip.id));
          const nextMuted = selectedClips.some((clip) => !clip.is_muted);

          for (const id of ids) commandsRef.current.updateClip(id, { muted: nextMuted });
        } else {
          markerCommandsRef.current?.addMarkerAtCurrentBeat();
        }
        return;
      }

      const loop = loopStateRef.current;
      if (loop.focused && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
        event.preventDefault();
        const loopLength = loop.end - loop.start;
        const currentGrid = gridRef.current;
        const nudge = currentGrid.snapBeats || 1;
        const currentTotalBeats = totalBeatsRef.current;

        if (event.metaKey || event.ctrlKey) {
          if (event.key === "ArrowLeft") {
            commandsRef.current.setLoop(true, loop.start, Math.max(loop.start + nudge, loop.end - nudge));
          } else if (event.key === "ArrowRight") {
            commandsRef.current.setLoop(true, loop.start, Math.min(loop.end + nudge, currentTotalBeats));
          } else if (event.key === "ArrowUp") {
            commandsRef.current.setLoop(true, loop.start, Math.min(loop.start + loopLength * 2, currentTotalBeats));
          } else if (event.key === "ArrowDown" && loopLength > nudge) {
            commandsRef.current.setLoop(true, loop.start, loop.start + loopLength / 2);
          }
        } else {
          if (event.key === "ArrowLeft") {
            const nextStart = Math.max(0, loop.start - nudge);
            commandsRef.current.setLoop(true, nextStart, nextStart + loopLength);
          } else if (event.key === "ArrowRight") {
            const nextStart = Math.min(currentTotalBeats - loopLength, loop.start + nudge);
            commandsRef.current.setLoop(true, nextStart, nextStart + loopLength);
          } else if (event.key === "ArrowUp") {
            const nextStart = Math.min(currentTotalBeats - loopLength, loop.start + loopLength);
            commandsRef.current.setLoop(true, nextStart, nextStart + loopLength);
          } else if (event.key === "ArrowDown") {
            const nextStart = Math.max(0, loop.start - loopLength);
            commandsRef.current.setLoop(true, nextStart, nextStart + loopLength);
          }
        }
        return;
      }

      if (!(event.metaKey || event.ctrlKey)) return;

      const currentGrid = gridRef.current;
      switch (event.key) {
        case "1":
          event.preventDefault();
          currentGrid.narrowGrid();
          break;
        case "2":
          event.preventDefault();
          currentGrid.widenGrid();
          break;
        case "3":
          event.preventDefault();
          currentGrid.toggleTripletMode();
          break;
        case "4":
          event.preventDefault();
          currentGrid.toggleSnapEnabled();
          break;
        case "5":
          event.preventDefault();
          currentGrid.setGridMode(currentGrid.gridMode === "adaptive" ? "fixed" : "adaptive");
          break;
        case "m":
        case "M":
          event.preventDefault();
          if (bottomTabRef.current === "mixer") {
            commandsRef.current.openPanel(showPianoRollRef.current ? "pianoRoll" : "detail");
          } else {
            commandsRef.current.openPanel("mixer");
          }
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [clearSelectedClipIds, timelineRef]);
}
