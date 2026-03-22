import { describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useStudioTrackActionsModel } from "@/hooks/useStudioTrackActionsModel";

describe("useStudioTrackActionsModel", () => {
  it("toggles clip mute based on current clip state", () => {
    const updateClip = vi.fn();
    const { result, rerender } = renderHook(
      ({ muted }) =>
        useStudioTrackActionsModel({
          commandDispatch: {
            updateClip,
          } as never,
          allClips: [{ id: "clip-1", is_muted: muted }],
          trackViewStateById: {},
          onVolumeChange: vi.fn(),
          onPanChange: vi.fn(),
          onSendChange: vi.fn(),
          onClipMove: vi.fn(),
          onClipResize: vi.fn(),
          onReorderTrack: vi.fn(),
          onAutomationChange: vi.fn(),
          onAutomationAdd: vi.fn(),
          onAutomationRemove: vi.fn(),
          onSplitClip: vi.fn(),
          onAudioUploadOpen: vi.fn(),
          onCreateTrack: { audio: vi.fn(), midi: vi.fn(), return: vi.fn() },
          onCreateMidiClip: vi.fn(),
          onMoveTimelineClip: vi.fn(),
          onLoopToSelection: vi.fn(),
          onSelectTrack: vi.fn(),
          onSelectClip: vi.fn(),
          onClickClip: vi.fn(),
        }),
      {
        initialProps: { muted: false },
      },
    );

    result.current.track.onMuteClip("clip-1");
    expect(updateClip).toHaveBeenLastCalledWith("clip-1", { muted: true });

    rerender({ muted: true });
    result.current.track.onMuteClip("clip-1");
    expect(updateClip).toHaveBeenLastCalledWith("clip-1", { muted: false });
  });
});
