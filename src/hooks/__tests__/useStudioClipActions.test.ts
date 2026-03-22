import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useStudioClipActions } from "@/hooks/useStudioClipActions";

const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({}),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

describe("useStudioClipActions", () => {
  beforeEach(() => {
    toastSuccess.mockReset();
    toastError.mockReset();
  });

  function createBaseOptions() {
    const createClip = {
      mutateAsync: vi.fn().mockResolvedValue({ id: "new-clip" }),
    };

    return {
      createClip,
      options: {
        activeSessionId: "session-1",
        tracks: [],
        sessionDomainModel: {
          trackIndex: {
            clipById: {
              "clip-1": {
                id: "clip-1",
                track_id: "track-1",
                name: "Lead",
                start_beats: 4,
                end_beats: 12,
                color: 3,
                is_midi: true,
                is_muted: false,
                audio_url: null,
                waveform_peaks: null,
                midi_data: { notes: [{ pitch: 60, start: 0, duration: 1, velocity: 100 }] },
                alias_of: null,
                created_at: "now",
              },
            },
            allClips: [],
            trackIdByClipId: {},
          },
        },
        createClip,
        updateClip: {
          mutate: vi.fn(),
          mutateAsync: vi.fn().mockResolvedValue(undefined),
        },
        deleteClip: {
          mutate: vi.fn(),
        },
        history: {
          push: vi.fn(),
        },
      },
    };
  }

  it("duplicates clips through the shared createClip mutation", async () => {
    const { options, createClip } = createBaseOptions();
    const { result } = renderHook(() => useStudioClipActions(options as never));

    await act(async () => {
      await result.current.handleDuplicateClip("clip-1");
    });

    expect(createClip.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        track_id: "track-1",
        start_beats: 12,
        end_beats: 20,
        name: "Lead (copy)",
      }),
    );
    expect(toastSuccess).toHaveBeenCalledWith("Clip duplicated");
  });

  it("creates linked duplicates through the shared createClip mutation", async () => {
    const { options, createClip } = createBaseOptions();
    const { result } = renderHook(() => useStudioClipActions(options as never));

    await act(async () => {
      await result.current.handleCreateLinkedDuplicate("clip-1");
    });

    expect(createClip.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        track_id: "track-1",
        alias_of: "clip-1",
        name: "Lead (linked)",
      }),
    );
    expect(toastSuccess).toHaveBeenCalledWith("Linked duplicate created");
  });

  it("splits clips by updating the original and creating the right-hand clip", async () => {
    const { options, createClip } = createBaseOptions();
    const { result } = renderHook(() => useStudioClipActions(options as never));

    await act(async () => {
      await result.current.handleSplitClip("clip-1", 8);
    });

    expect(options.updateClip.mutateAsync).toHaveBeenCalledWith({
      clipId: "clip-1",
      updates: expect.objectContaining({ end_beats: 8 }),
    });
    expect(createClip.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        track_id: "track-1",
        start_beats: 8,
        end_beats: 12,
      }),
    );
    expect(toastSuccess).toHaveBeenCalledWith("Clip split");
  });
});
