import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStudioMarkerModel } from "@/hooks/useStudioMarkerModel";

const SESSION_ID = "session-123";
const STORAGE_KEY = `music-hub-studio-markers:${SESSION_ID}`;

describe("useStudioMarkerModel", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loads persisted markers for the active session", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        {
          id: "marker-a",
          name: "Intro",
          beat: 8,
          color: "#ff7b72",
        },
      ]),
    );

    const { result } = renderHook(() =>
      useStudioMarkerModel({
        sessionId: SESSION_ID,
        beatsPerBar: 4,
        getCurrentBeat: () => 0,
        onSeek: vi.fn(),
      }),
    );

    expect(result.current.sortedMarkers).toEqual([
      {
        id: "marker-a",
        name: "Intro",
        beat: 8,
        color: "#ff7b72",
      },
    ]);
  });

  it("adds a marker at the current beat and persists it", () => {
    const { result } = renderHook(() =>
      useStudioMarkerModel({
        sessionId: SESSION_ID,
        beatsPerBar: 4,
        getCurrentBeat: () => 7.12,
        onSeek: vi.fn(),
      }),
    );

    act(() => {
      result.current.addMarkerAtCurrentBeat();
    });

    expect(result.current.sortedMarkers).toHaveLength(1);
    expect(result.current.sortedMarkers[0].name).toBe("Marker 1");
    expect(result.current.sortedMarkers[0].beat).toBe(7);

    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    expect(persisted).toHaveLength(1);
    expect(persisted[0].beat).toBe(7);
  });

  it("renames and deletes markers", () => {
    const { result } = renderHook(() =>
      useStudioMarkerModel({
        sessionId: SESSION_ID,
        beatsPerBar: 4,
        getCurrentBeat: () => 4,
        onSeek: vi.fn(),
      }),
    );

    act(() => {
      result.current.addMarkerAtCurrentBeat();
    });

    const markerId = result.current.sortedMarkers[0].id;

    act(() => {
      result.current.renameMarker(markerId, "Verse");
    });

    expect(result.current.sortedMarkers[0].name).toBe("Verse");

    act(() => {
      result.current.deleteMarker(markerId);
    });

    expect(result.current.sortedMarkers).toEqual([]);
  });

  it("jumps to the selected marker beat", () => {
    const onSeek = vi.fn();
    const { result } = renderHook(() =>
      useStudioMarkerModel({
        sessionId: SESSION_ID,
        beatsPerBar: 4,
        getCurrentBeat: () => 12,
        onSeek,
      }),
    );

    act(() => {
      result.current.addMarkerAtCurrentBeat();
    });

    const markerId = result.current.sortedMarkers[0].id;

    act(() => {
      result.current.jumpToMarker(markerId);
    });

    expect(onSeek).toHaveBeenCalledWith(12);
  });
});
