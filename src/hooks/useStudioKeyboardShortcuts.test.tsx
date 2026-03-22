import { createRef } from "react";
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useStudioKeyboardShortcuts } from "@/hooks/useStudioKeyboardShortcuts";

function TestHarness({
  selectedClipIds = new Set<string>(["clip-1"]),
  showPianoRoll = true,
}: {
  selectedClipIds?: Set<string>;
  showPianoRoll?: boolean;
}) {
  const timelineRef = createRef<HTMLDivElement>();

  useStudioKeyboardShortcuts({
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
      gridMode: "adaptive",
      snapBeats: 0.25,
    },
    totalBeats: 16,
    tracks: [],
    selectedClipIds,
    clearSelectedClipIds: clearSelectedClipIds,
    bottomTab: "editor",
    showPianoRoll,
    playbackState: "stopped",
    history: {
      undo: vi.fn(),
      redo: vi.fn(),
      canUndo: false,
      canRedo: false,
      reset: vi.fn(),
    },
    commands: {
      play: vi.fn(),
      pause: vi.fn(),
      deleteClip: deleteClip,
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
  });

  return (
    <div ref={timelineRef}>
      <div data-piano-roll-root="true">
        <button type="button">Piano Roll Button</button>
      </div>
      <button type="button">Outside Button</button>
    </div>
  );
}

const deleteClip = vi.fn();
const clearSelectedClipIds = vi.fn();

describe("useStudioKeyboardShortcuts", () => {
  it("does not delete selected clips when delete originates inside the piano roll", () => {
    const { getByRole } = render(<TestHarness />);
    const pianoRollButton = getByRole("button", { name: "Piano Roll Button" });

    pianoRollButton.focus();
    fireEvent.keyDown(pianoRollButton, { key: "Delete" });

    expect(deleteClip).not.toHaveBeenCalled();
    expect(clearSelectedClipIds).not.toHaveBeenCalled();
  });

  it("does not delete selected clips while the piano roll is open, even if focus is outside its subtree", () => {
    const { getByRole } = render(<TestHarness showPianoRoll />);
    const outsideButton = getByRole("button", { name: "Outside Button" });

    outsideButton.focus();
    fireEvent.keyDown(outsideButton, { key: "Delete" });

    expect(deleteClip).not.toHaveBeenCalled();
    expect(clearSelectedClipIds).not.toHaveBeenCalled();
  });

  it("still deletes selected clips outside the piano roll when the piano roll is closed", () => {
    const { getByRole } = render(<TestHarness showPianoRoll={false} />);
    const outsideButton = getByRole("button", { name: "Outside Button" });

    outsideButton.focus();
    fireEvent.keyDown(outsideButton, { key: "Delete" });

    expect(deleteClip).toHaveBeenCalledWith("clip-1");
    expect(clearSelectedClipIds).toHaveBeenCalled();
  });
});
