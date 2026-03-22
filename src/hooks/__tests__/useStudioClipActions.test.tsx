import type { ReactNode } from "react";
import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { useStudioClipActions } from "@/hooks/useStudioClipActions";
import type { StudioSessionDomainRuntimeState } from "@/types/musicHubStudioRuntime";
import type { SessionClip, SessionTrack } from "@/types/studio";
import type {
  CreateClipMutation,
  DeleteClipMutation,
  UpdateClipMutation,
} from "@/hooks/studioMutationTypes";
import type { UndoRedoState } from "@/hooks/useUndoRedo";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

function createClip(overrides: Partial<SessionClip> = {}): SessionClip {
  return {
    id: "clip-1",
    track_id: "track-1",
    name: "Clip 1",
    start_beats: 0,
    end_beats: 4,
    color: 7,
    is_midi: true,
    is_muted: false,
    audio_url: null,
    waveform_peaks: null,
    midi_data: { notes: [{ id: "note-1", pitch: 60, start: 0, duration: 1, velocity: 100 }] },
    alias_of: null,
    created_at: "2026-03-22T18:00:00.000Z",
    ...overrides,
  };
}

function createTrack(clip: SessionClip): SessionTrack {
  return {
    id: "track-1",
    session_id: "session-1",
    name: "Track 1",
    type: "midi",
    color: 7,
    volume: 0.85,
    pan: 0,
    is_muted: false,
    is_soloed: false,
    sort_order: 0,
    device_chain: [],
    sends: [],
    input_from: null,
    created_at: "2026-03-22T18:00:00.000Z",
    clips: [clip],
    automation_lanes: [],
  };
}

function createSessionDomainModel(track: SessionTrack, clip: SessionClip): StudioSessionDomainRuntimeState {
  return {
    trackIndex: {
      trackById: { [track.id]: track },
      clipById: { [clip.id]: clip },
      trackIdByClipId: { [clip.id]: track.id },
      allClips: [clip],
    },
    sessionMetrics: {
      tempo: 120,
      timeSignature: "4/4",
      beatsPerBar: 4,
      totalBeats: 16,
    },
    selectedClip: clip,
    selectedTrack: track,
    selectedClipIsMidi: clip.is_midi,
    ghostNotes: [],
  };
}

function createHistory(): UndoRedoState {
  return {
    canUndo: false,
    canRedo: false,
    undoLabel: null,
    redoLabel: null,
    push: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
  };
}

function createMutations() {
  const createClip: CreateClipMutation = {
    mutateAsync: vi.fn().mockResolvedValue({ id: "new-clip" }),
    isPending: false,
  };
  const updateClip: UpdateClipMutation = {
    mutate: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue(undefined),
  };
  const deleteClip: DeleteClipMutation = {
    mutate: vi.fn(),
  };

  return { createClip, updateClip, deleteClip };
}

describe("useStudioClipActions", () => {
  it("routes linked duplicate creation through createClip", async () => {
    const clip = createClip();
    const track = createTrack(clip);
    const { createClip: createClipMutation, updateClip, deleteClip } = createMutations();

    const { result } = renderHook(
      () =>
        useStudioClipActions({
          activeSessionId: "session-1",
          tracks: [track],
          sessionDomainModel: createSessionDomainModel(track, clip),
          createClip: createClipMutation,
          updateClip,
          deleteClip,
          history: createHistory(),
        }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.handleCreateLinkedDuplicate("clip-1");
    });

    expect(createClipMutation.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        track_id: "track-1",
        name: "Clip 1 (linked)",
        start_beats: 4,
        end_beats: 8,
        alias_of: "clip-1",
      }),
    );
  });

  it("routes clip duplication through createClip", async () => {
    const clip = createClip({
      is_midi: false,
      name: "Audio Clip",
      audio_url: "https://example.com/audio.wav",
      waveform_peaks: [0.1, 0.4, 0.2],
    });
    const track = createTrack(clip);
    const { createClip: createClipMutation, updateClip, deleteClip } = createMutations();

    const { result } = renderHook(
      () =>
        useStudioClipActions({
          activeSessionId: "session-1",
          tracks: [track],
          sessionDomainModel: createSessionDomainModel(track, clip),
          createClip: createClipMutation,
          updateClip,
          deleteClip,
          history: createHistory(),
        }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.handleDuplicateClip("clip-1");
    });

    expect(createClipMutation.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        track_id: "track-1",
        name: "Audio Clip (copy)",
        start_beats: 4,
        end_beats: 8,
        audio_url: "https://example.com/audio.wav",
        waveform_peaks: [0.1, 0.4, 0.2],
      }),
    );
  });

  it("splits a clip by updating the original and creating the right-side clip through createClip", async () => {
    const clip = createClip({
      end_beats: 8,
      midi_data: {
        notes: [
          { id: "left", pitch: 60, start: 0, duration: 2, velocity: 100 },
          { id: "right", pitch: 64, start: 5, duration: 1, velocity: 90 },
        ],
      },
    });
    const track = createTrack(clip);
    const { createClip: createClipMutation, updateClip, deleteClip } = createMutations();

    const { result } = renderHook(
      () =>
        useStudioClipActions({
          activeSessionId: "session-1",
          tracks: [track],
          sessionDomainModel: createSessionDomainModel(track, clip),
          createClip: createClipMutation,
          updateClip,
          deleteClip,
          history: createHistory(),
        }),
      { wrapper: createWrapper() },
    );

    await act(async () => {
      await result.current.handleSplitClip("clip-1", 4);
    });

    expect(updateClip.mutateAsync).toHaveBeenCalledWith({
      clipId: "clip-1",
      updates: expect.objectContaining({
        end_beats: 4,
      }),
    });
    expect(createClipMutation.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        track_id: "track-1",
        name: "Clip 1",
        start_beats: 4,
        end_beats: 8,
      }),
    );
  });
});
