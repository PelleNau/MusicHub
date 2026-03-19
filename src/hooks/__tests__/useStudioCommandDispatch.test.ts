import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useStudioCommandDispatch } from "@/hooks/useStudioCommandDispatch";

function createBaseOptions() {
  return {
    sessionId: "session-1",
    projectId: "project-1",
    currentBeat: 0,
    loopEnabled: false,
    loopStart: 0,
    loopEnd: 4,
    recording: false,
    selectedClipIds: new Set<string>(),
    onPlay: vi.fn(),
    onPause: vi.fn(),
    onStop: vi.fn(),
    onSeek: vi.fn(),
    onSetLoop: vi.fn(),
    onToggleLoop: vi.fn(),
    onSetTempo: vi.fn(),
    onToggleRecord: vi.fn(),
    onUpdateTrack: vi.fn(),
    setSelectedTrackId: vi.fn(),
    setSelectedClipIds: vi.fn(),
    setBottomTab: vi.fn(),
  } as const;
}

describe("useStudioCommandDispatch", () => {
  it("records a transport.toggleRecord command through the Studio command log seam", () => {
    const options = createBaseOptions();
    const onCommandRecorded = vi.fn();

    const { result } = renderHook(() =>
      useStudioCommandDispatch({
        ...options,
        onCommandRecorded,
      }),
    );

    let ack;
    act(() => {
      ack = result.current.toggleRecord();
    });

    expect(options.onToggleRecord).toHaveBeenCalledTimes(1);
    expect(ack).toMatchObject({
      accepted: true,
      status: "applied_local",
    });
    expect(onCommandRecorded).toHaveBeenCalledWith(
      expect.objectContaining({ type: "transport.toggleRecord" }),
      expect.objectContaining({ status: "applied_local" }),
    );
  });

  it("passes armed and monitoring changes through studio.updateTrack", () => {
    const options = createBaseOptions();

    const { result } = renderHook(() =>
      useStudioCommandDispatch(options),
    );

    act(() => {
      result.current.updateTrack("track-a", {
        armed: true,
        monitoring: "in",
      });
    });

    expect(options.onUpdateTrack).toHaveBeenCalledWith("track-a", {
      armed: true,
      monitoring: "in",
    });
  });
});
