import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useStudioBottomPaneModel } from "@/hooks/useStudioBottomPaneModel";

describe("useStudioBottomPaneModel", () => {
  it("opens the mixer panel when switching to the mixer tab", () => {
    const openPanel = vi.fn();

    const { result } = renderHook(() =>
      useStudioBottomPaneModel({
        panelState: {
          selectedTrackId: null,
          selectedClipIds: new Set(),
          activeClipId: null,
          bottomTab: "editor",
          showPianoRoll: false,
          showMixer: false,
          showBottomWorkspace: false,
        },
        commandDispatch: {
          openPanel,
        } as never,
      }),
    );

    act(() => {
      result.current.setBottomTab("mixer");
    });

    expect(openPanel).toHaveBeenCalledWith("mixer");
  });

  it("reopens the piano roll when switching back to the editor tab from a piano-roll state", () => {
    const openPanel = vi.fn();

    const { result } = renderHook(() =>
      useStudioBottomPaneModel({
        panelState: {
          selectedTrackId: "track-1",
          selectedClipIds: new Set(["clip-1"]),
          activeClipId: "clip-1",
          bottomTab: "mixer",
          showPianoRoll: true,
          showMixer: true,
          showBottomWorkspace: true,
        },
        commandDispatch: {
          openPanel,
        } as never,
      }),
    );

    act(() => {
      result.current.setBottomTab("editor");
    });

    expect(openPanel).toHaveBeenCalledWith("pianoRoll");
  });

  it("opens detail when switching back to the editor tab without a piano roll selection", () => {
    const openPanel = vi.fn();

    const { result } = renderHook(() =>
      useStudioBottomPaneModel({
        panelState: {
          selectedTrackId: "track-1",
          selectedClipIds: new Set(),
          activeClipId: null,
          bottomTab: "mixer",
          showPianoRoll: false,
          showMixer: true,
          showBottomWorkspace: true,
        },
        commandDispatch: {
          openPanel,
        } as never,
      }),
    );

    act(() => {
      result.current.setBottomTab("editor");
    });

    expect(openPanel).toHaveBeenCalledWith("detail");
  });
});
