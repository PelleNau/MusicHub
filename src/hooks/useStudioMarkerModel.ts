import { useCallback, useEffect, useMemo, useState } from "react";
import type { StudioMarker } from "@/types/musicHubStudioMarkers";

const STORAGE_KEY_PREFIX = "music-hub-studio-markers:";
const MARKER_COLORS = [
  "#ff7b72",
  "#5eead4",
  "#facc15",
  "#60a5fa",
  "#c084fc",
  "#fb7185",
  "#4ade80",
  "#f97316",
] as const;

interface UseStudioMarkerModelOptions {
  sessionId: string | null;
  beatsPerBar: number;
  getCurrentBeat: () => number;
  onSeek: (beat: number) => void;
}

function getStorageKey(sessionId: string | null) {
  return sessionId ? `${STORAGE_KEY_PREFIX}${sessionId}` : null;
}

function normalizeMarkerBeat(beat: number) {
  return Math.max(0, Math.round(beat * 4) / 4);
}

function createMarkerName(index: number) {
  return `Marker ${index + 1}`;
}

function formatBarsBeats(beat: number, beatsPerBar: number) {
  const bar = Math.floor(beat / beatsPerBar) + 1;
  const beatWithinBar = Math.floor(beat % beatsPerBar) + 1;
  return `${bar}.${beatWithinBar}`;
}

export function useStudioMarkerModel({
  sessionId,
  beatsPerBar,
  getCurrentBeat,
  onSeek,
}: UseStudioMarkerModelOptions) {
  const storageKey = getStorageKey(sessionId);
  const [markers, setMarkers] = useState<StudioMarker[]>([]);

  useEffect(() => {
    if (!storageKey) {
      setMarkers([]);
      return;
    }

    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        setMarkers([]);
        return;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        setMarkers([]);
        return;
      }

      setMarkers(
        parsed.filter((marker): marker is StudioMarker => {
          return (
            marker !== null &&
            typeof marker === "object" &&
            typeof marker.id === "string" &&
            typeof marker.name === "string" &&
            typeof marker.beat === "number" &&
            typeof marker.color === "string"
          );
        }),
      );
    } catch {
      setMarkers([]);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!storageKey) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(markers));
    } catch {
      // Marker persistence is assistive UI state. Ignore storage failures.
    }
  }, [markers, storageKey]);

  const sortedMarkers = useMemo(
    () => [...markers].sort((left, right) => left.beat - right.beat),
    [markers],
  );

  const addMarkerAtBeat = useCallback(
    (beat?: number) => {
      setMarkers((current) => {
        const markerBeat = normalizeMarkerBeat(beat ?? getCurrentBeat());
        const nextIndex = current.length;
        return [
          ...current,
          {
            id: crypto.randomUUID(),
            name: createMarkerName(nextIndex),
            beat: markerBeat,
            color: MARKER_COLORS[nextIndex % MARKER_COLORS.length],
          },
        ];
      });
    },
    [getCurrentBeat],
  );

  const renameMarker = useCallback((markerId: string, name: string) => {
    const nextName = name.trim();
    if (!nextName) return;

    setMarkers((current) =>
      current.map((marker) =>
        marker.id === markerId
          ? {
              ...marker,
              name: nextName,
            }
          : marker,
      ),
    );
  }, []);

  const deleteMarker = useCallback((markerId: string) => {
    setMarkers((current) => current.filter((marker) => marker.id !== markerId));
  }, []);

  const jumpToMarker = useCallback(
    (markerId: string) => {
      const marker = sortedMarkers.find((entry) => entry.id === markerId);
      if (!marker) return;
      onSeek(marker.beat);
    },
    [onSeek, sortedMarkers],
  );

  return {
    markers,
    sortedMarkers,
    addMarkerAtCurrentBeat: () => addMarkerAtBeat(),
    addMarkerAtBeat,
    renameMarker,
    deleteMarker,
    jumpToMarker,
    formatMarkerPosition: (beat: number) => formatBarsBeats(beat, beatsPerBar),
  };
}

export type StudioMarkerModelResult = ReturnType<typeof useStudioMarkerModel>;
