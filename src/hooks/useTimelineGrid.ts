import { useState, useCallback, useMemo, useRef } from "react";
import { TRACK_HEADER_WIDTH } from "@/components/studio/timelineMath";

/* ── Grid resolution definitions ── */
export type GridMode = "adaptive" | "fixed";
export type GridDivision = "1" | "1/2" | "1/4" | "1/8" | "1/16" | "1/32";

const DIVISION_VALUES: Record<GridDivision, number> = {
  "1": 4,      // 4/4 baseline
  "1/2": 2,
  "1/4": 1,
  "1/8": 0.5,
  "1/16": 0.25,
  "1/32": 0.125,
};

/** Convert a grid division label to beats for the current time signature. */
export function getDivisionBeats(division: GridDivision, beatsPerBar: number): number {
  const safeBeatsPerBar = Number.isFinite(beatsPerBar) && beatsPerBar > 0 ? beatsPerBar : 4;
  switch (division) {
    case "1": return safeBeatsPerBar;
    case "1/2": return safeBeatsPerBar / 2;
    case "1/4": return safeBeatsPerBar / 4;
    case "1/8": return safeBeatsPerBar / 8;
    case "1/16": return safeBeatsPerBar / 16;
    case "1/32": return safeBeatsPerBar / 32;
  }
}

const DIVISION_ORDER: GridDivision[] = ["1", "1/2", "1/4", "1/8", "1/16", "1/32"];

/** Compute the best grid division for the current zoom level */
function adaptiveDivision(pixelsPerBeat: number, beatsPerBar: number): GridDivision {
  const TARGET_MIN = 36;
  for (const div of DIVISION_ORDER) {
    const beatsPerDiv = getDivisionBeats(div, beatsPerBar);
    const px = beatsPerDiv * pixelsPerBeat;
    if (px >= TARGET_MIN) return div;
  }
  return "1/32";
}

/* ── Zoom constants ── */
const ZOOM_MIN = 4;
const ZOOM_MAX = 200;
const ZOOM_STEP = 1.15;
const TRACK_H_MIN = 32;
const TRACK_H_MAX = 200;
const TRACK_H_DEFAULT = 72;

export interface TimelineGridState {
  // Horizontal zoom
  pixelsPerBeat: number;
  zoomIn: () => void;
  zoomOut: () => void;
  setPixelsPerBeat: (ppb: number) => void;

  // Vertical zoom (track height)
  trackHeight: number;
  zoomInVertical: () => void;
  zoomOutVertical: () => void;
  setTrackHeight: (h: number) => void;

  // Wheel handler — cursor-anchored H zoom + Alt vertical zoom
  handleWheel: (e: WheelEvent) => void;

  // Zoom-to-selection & zoom memory
  zoomToSelection: (startBeat: number, endBeat: number, trackCount: number, viewportWidth: number, viewportHeight: number) => void;
  zoomOutFull: (totalBeats: number, totalTracks: number, viewportWidth: number, viewportHeight: number) => void;
  restoreZoom: () => void;
  hasZoomMemory: boolean;

  // Grid
  gridMode: GridMode;
  fixedDivision: GridDivision;
  snapEnabled: boolean;
  tripletMode: boolean;
  activeDivision: GridDivision;
  snapBeats: number;

  // Setters
  toggleSnapEnabled: () => void;
  toggleTripletMode: () => void;
  setGridMode: (mode: GridMode) => void;
  setFixedDivision: (div: GridDivision) => void;
  narrowGrid: () => void;
  widenGrid: () => void;
}

interface ZoomSnapshot {
  pixelsPerBeat: number;
  trackHeight: number;
  scrollLeft: number;
  scrollTop: number;
}

export function useTimelineGrid(beatsPerBar: number): TimelineGridState {
  const [pixelsPerBeat, setPixelsPerBeat] = useState(24);
  const [trackHeight, setTrackHeight] = useState(TRACK_H_DEFAULT);
  const [gridMode, setGridMode] = useState<GridMode>("adaptive");
  const [fixedDivision, setFixedDivision] = useState<GridDivision>("1/4");
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [tripletMode, setTripletMode] = useState(false);
  const [zoomMemory, setZoomMemory] = useState<ZoomSnapshot | null>(null);

  const activeDivision = useMemo(() => {
    if (gridMode === "fixed") return fixedDivision;
    return adaptiveDivision(pixelsPerBeat, beatsPerBar);
  }, [gridMode, fixedDivision, pixelsPerBeat, beatsPerBar]);

  const snapBeats = useMemo(() => {
    let base = getDivisionBeats(activeDivision, beatsPerBar);
    if (tripletMode) base = base * (2 / 3);
    return snapEnabled ? base : 0;
  }, [activeDivision, beatsPerBar, tripletMode, snapEnabled]);

  // ── Horizontal zoom ──
  const zoomIn = useCallback(() => {
    setPixelsPerBeat((prev) => Math.min(ZOOM_MAX, prev * ZOOM_STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setPixelsPerBeat((prev) => Math.max(ZOOM_MIN, prev / ZOOM_STEP));
  }, []);

  // ── Vertical zoom ──
  const zoomInVertical = useCallback(() => {
    setTrackHeight((prev) => Math.min(TRACK_H_MAX, Math.round(prev * ZOOM_STEP)));
  }, []);

  const zoomOutVertical = useCallback(() => {
    setTrackHeight((prev) => Math.max(TRACK_H_MIN, Math.round(prev / ZOOM_STEP)));
  }, []);

  // ── Wheel handler: Ctrl/Cmd+scroll = H zoom (cursor-anchored); Alt+scroll = V zoom ──
  // Ref for cursor-anchored zoom calculation (avoids pixelsPerBeat in deps)
  const ppbRef = useRef(pixelsPerBeat);
  ppbRef.current = pixelsPerBeat;

  const handleWheel = useCallback((e: WheelEvent) => {
    const isCtrl = e.ctrlKey || e.metaKey;
    const isAlt = e.altKey;

    if (isAlt && !isCtrl) {
      // Alt + scroll → vertical zoom (track height)
      e.preventDefault();
      const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
      setTrackHeight((prev) => Math.min(TRACK_H_MAX, Math.max(TRACK_H_MIN, Math.round(prev * factor))));
    } else if (isCtrl && !isAlt) {
      // Ctrl/Cmd + scroll → horizontal zoom, cursor-anchored
      e.preventDefault();
      const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;

      // Cursor-anchored: adjust scrollLeft so the beat under cursor stays put
      const container = (e.currentTarget as HTMLElement) || (e.target as HTMLElement)?.closest("[data-timeline]");
      const oldPpb = ppbRef.current;
      const newPpb = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, oldPpb * factor));

      setPixelsPerBeat(newPpb);

      if (container) {
        const rect = container.getBoundingClientRect();
        const cursorX = e.clientX - rect.left - TRACK_HEADER_WIDTH + container.scrollLeft;

        // Adjust scroll to keep cursor anchored
        requestAnimationFrame(() => {
          const beatUnderCursor = cursorX / oldPpb;
          const newCursorX = beatUnderCursor * newPpb;
          container.scrollLeft = newCursorX - (e.clientX - rect.left - TRACK_HEADER_WIDTH);
        });
      }
    }
  }, []);

  // ── Zoom to selection (Z key) ──
  const zoomToSelection = useCallback((
    startBeat: number,
    endBeat: number,
    trackCount: number,
    viewportWidth: number,
    viewportHeight: number,
  ) => {
    // Save current state
    setZoomMemory({ pixelsPerBeat, trackHeight, scrollLeft: 0, scrollTop: 0 });

    const availW = viewportWidth - TRACK_HEADER_WIDTH;
    const beatRange = endBeat - startBeat;
    if (beatRange > 0 && availW > 0) {
      setPixelsPerBeat(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, availW / beatRange)));
    }
    if (trackCount > 0 && viewportHeight > 0) {
      const rulerH = 24;
      const availH = viewportHeight - rulerH;
      setTrackHeight(Math.min(TRACK_H_MAX, Math.max(TRACK_H_MIN, Math.floor(availH / trackCount))));
    }
  }, [pixelsPerBeat, trackHeight]);

  // ── Zoom out full (Shift+Z) ──
  const zoomOutFull = useCallback((
    totalBeats: number,
    totalTracks: number,
    viewportWidth: number,
    viewportHeight: number,
  ) => {
    setZoomMemory({ pixelsPerBeat, trackHeight, scrollLeft: 0, scrollTop: 0 });

    const availW = viewportWidth - TRACK_HEADER_WIDTH;
    if (totalBeats > 0 && availW > 0) {
      setPixelsPerBeat(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, availW / totalBeats)));
    }
    if (totalTracks > 0 && viewportHeight > 0) {
      const rulerH = 24;
      const availH = viewportHeight - rulerH;
      setTrackHeight(Math.min(TRACK_H_MAX, Math.max(TRACK_H_MIN, Math.floor(availH / totalTracks))));
    }
  }, [pixelsPerBeat, trackHeight]);

  // ── Restore previous zoom (Z toggle) ──
  const restoreZoom = useCallback(() => {
    if (!zoomMemory) return;
    const current: ZoomSnapshot = { pixelsPerBeat, trackHeight, scrollLeft: 0, scrollTop: 0 };
    setPixelsPerBeat(zoomMemory.pixelsPerBeat);
    setTrackHeight(zoomMemory.trackHeight);
    setZoomMemory(current);
  }, [zoomMemory, pixelsPerBeat, trackHeight]);

  // ── Grid narrower / wider ──
  const narrowGrid = useCallback(() => {
    if (gridMode === "adaptive") {
      setGridMode("fixed");
      setFixedDivision(activeDivision);
    }
    const idx = DIVISION_ORDER.indexOf(fixedDivision);
    if (idx < DIVISION_ORDER.length - 1) setFixedDivision(DIVISION_ORDER[idx + 1]);
  }, [gridMode, activeDivision, fixedDivision]);

  const widenGrid = useCallback(() => {
    if (gridMode === "adaptive") {
      setGridMode("fixed");
      setFixedDivision(activeDivision);
    }
    const idx = DIVISION_ORDER.indexOf(fixedDivision);
    if (idx > 0) setFixedDivision(DIVISION_ORDER[idx - 1]);
  }, [gridMode, activeDivision, fixedDivision]);

  const toggleSnapEnabled = useCallback(() => setSnapEnabled((s) => !s), []);
  const toggleTripletMode = useCallback(() => setTripletMode((t) => !t), []);

  return {
    pixelsPerBeat,
    trackHeight,
    zoomIn,
    zoomOut,
    zoomInVertical,
    zoomOutVertical,
    setPixelsPerBeat,
    setTrackHeight,
    handleWheel,
    zoomToSelection,
    zoomOutFull,
    restoreZoom,
    hasZoomMemory: zoomMemory !== null,
    gridMode,
    fixedDivision,
    snapEnabled,
    tripletMode,
    activeDivision,
    snapBeats,
    toggleSnapEnabled,
    toggleTripletMode,
    setGridMode,
    setFixedDivision,
    narrowGrid,
    widenGrid,
  };
}

/** Snap a beat value to the nearest grid line */
export function snapToGrid(beat: number, snapBeats: number): number {
  if (snapBeats <= 0) return beat;
  return Math.round(beat / snapBeats) * snapBeats;
}

export { DIVISION_VALUES, DIVISION_ORDER };
