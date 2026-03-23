import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useStudioKeyboardShortcuts } from "@/hooks/useStudioKeyboardShortcuts";

describe("useStudioKeyboardShortcuts", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mutes selected clips when any selected clip is currently unmuted", () => {
    const updateClip = vi.fn();
    renderKeyboardShortcuts({
      selectedClipIds: new Set(["clip-1", "clip-2"]),
      tracks: [
        {
          id: "track-1",
          clips: [
            { id: "clip-1", is_muted: false },
            { id: "clip-2", is_muted: true },
          ],
        },
      ],
      commands: {
        updateClip,
      },
    });

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "m" }));

    expect(updateClip).toHaveBeenNthCalledWith(1, "clip-1", { muted: true });
    expect(updateClip).toHaveBeenNthCalledWith(2, "clip-2", { muted: true });
  });

  it("unmutes selected clips when every selected clip is already muted", () => {
    const updateClip = vi.fn();
    renderKeyboardShortcuts({
      selectedClipIds: new Set(["clip-1", "clip-2"]),
      tracks: [
        {
          id: "track-1",
          clips: [
            { id: "clip-1", is_muted: true },
            { id: "clip-2", is_muted: true },
          ],
        },
      ],
      commands: {
        updateClip,
      },
    });

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "m" }));

    expect(updateClip).toHaveBeenNthCalledWith(1, "clip-1", { muted: false });
    expect(updateClip).toHaveBeenNthCalledWith(2, "clip-2", { muted: false });
  });

  it("duplicates selected clips with Cmd/Ctrl+D outside the piano roll", () => {
    const duplicateClip = vi.fn();
    renderKeyboardShortcuts({
      selectedClipIds: new Set(["clip-1", "clip-2"]),
      commands: {
        duplicateClip,
      },
    });

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "d", metaKey: true }));

    expect(duplicateClip).toHaveBeenNthCalledWith(1, "clip-1", false);
    expect(duplicateClip).toHaveBeenNthCalledWith(2, "clip-2", false);
  });

  it("clears clip selection on Escape outside the piano roll", () => {
    const clearSelection = vi.fn();
    const clearSelectedClipIds = vi.fn();
    renderKeyboardShortcuts({
      selectedClipIds: new Set(["clip-1"]),
      clearSelectedClipIds,
      commands: {
        clearSelection,
      },
    });

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(clearSelection).toHaveBeenCalledTimes(1);
    expect(clearSelectedClipIds).toHaveBeenCalledTimes(1);
  });
});

function renderKeyboardShortcuts(overrides: Record<string, unknown>) {
  const timelineRef = { current: document.createElement("div") } as React.RefObject<HTMLDivElement>;
  const defaults = {
    timelineRef,
    grid: {
      narrowGrid: vi.fn(),
      widenGrid: vi.fn(),
      toggleTripletMode: vi.fn(),
      toggleSnapEnabled: vi.fn(),
      setGridMode: vi.fn(),
      zoomOutFull: vi.fn(),
      restoreZoom: vi.fn(),
      zoomToSelection: vi.fn(),
      hasZoomMemory: false,
      gridMode: "adaptive" as const,
      snapBeats: 0.25,
    },
    totalBeats: 16,
    tracks: [],
    selectedClipIds: new Set<string>(),
    clearSelectedClipIds: vi.fn(),
    bottomTab: "editor" as const,
    showPianoRoll: false,
    playbackState: "stopped" as const,
    history: {
      undo: vi.fn(),
      redo: vi.fn(),
    },
    commands: {
      play: vi.fn(),
      pause: vi.fn(),
      deleteClip: vi.fn(),
      duplicateClip: vi.fn(),
      clearSelection: vi.fn(),
      updateClip: vi.fn(),
      openPanel: vi.fn(),
      setLoop: vi.fn(),
    },
    loopState: {
      focused: false,
      start: 0,
      end: 4,
      enabled: false,
    },
    markerCommands: {
      addMarkerAtCurrentBeat: vi.fn(),
    },
  };

  return renderHook(() =>
    useStudioKeyboardShortcuts({
      ...defaults,
      ...overrides,
      commands: {
        ...defaults.commands,
        ...(overrides.commands as object | undefined),
      },
    }),
  );
}
