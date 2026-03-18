import { memo, useRef, useEffect, useState } from "react";
import type { AudioEngine } from "@/audio/AudioEngine";
import {
  beatToAbsoluteX,
  beatToContentX,
  toGridIndex,
  GRID_EPSILON,
} from "./timelineMath";
import { getDivisionBeats, type GridDivision } from "@/hooks/useTimelineGrid";

interface GridDebugOverlayProps {
  engine: AudioEngine;
  pixelsPerBeat: number;
  beatsPerBar: number;
  activeDivision: GridDivision;
  tripletMode: boolean;
  beatGetter?: () => number;
}

/**
 * Dev-only debug overlay showing alignment diagnostics.
 * Activated via `?debugGrid=1` query parameter.
 */
export const GridDebugOverlay = memo(function GridDebugOverlay({
  engine,
  pixelsPerBeat,
  beatsPerBar,
  activeDivision,
  tripletMode,
  beatGetter,
}: GridDebugOverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const [visible, setVisible] = useState(false);

  // Check query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setVisible(params.get("debugGrid") === "1");
  }, []);

  useEffect(() => {
    if (!visible) return;
    const panel = panelRef.current;
    const guide = guideRef.current;
    if (!panel) return;

    const tick = () => {
      const beat = beatGetter ? beatGetter() : engine.currentBeat;

      let divBeats = getDivisionBeats(activeDivision, beatsPerBar);
      if (tripletMode) divBeats = divBeats * (2 / 3);

      const gridIdx = toGridIndex(beat, divBeats);
      const nearestGridBeat = gridIdx * divBeats;
      const playheadX = beatToAbsoluteX(beat, pixelsPerBeat);
      const nearestGridX = beatToAbsoluteX(nearestGridBeat, pixelsPerBeat);
      const deltaX = playheadX - nearestGridX;

      panel.textContent =
        `beat: ${beat.toFixed(4)} | px: ${playheadX.toFixed(1)} | ` +
        `grid[${gridIdx}]: ${nearestGridBeat.toFixed(4)} | Δpx: ${deltaX.toFixed(2)}`;

      // Color-code the delta
      const absDelta = Math.abs(deltaX);
      panel.style.color =
        absDelta < 0.5
          ? "hsl(120 60% 60%)" // green = aligned
          : absDelta < 2
            ? "hsl(var(--warning))" // yellow = close
            : "hsl(0 70% 60%)"; // red = drifted

      // Guide line at nearest grid position
      if (guide) {
        guide.style.left = `${nearestGridX}px`;
        guide.style.borderColor =
          absDelta < 0.5 ? "hsl(120 60% 60% / 0.4)" : "hsl(0 70% 60% / 0.4)";
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [visible, engine, pixelsPerBeat, beatsPerBar, activeDivision, tripletMode, beatGetter]);

  if (!visible) return null;

  return (
    <>
      {/* Nearest-grid guide line */}
      <div
        ref={guideRef}
        className="absolute top-0 bottom-0 pointer-events-none z-40"
        style={{
          borderLeft: "1px dashed hsl(120 60% 60% / 0.4)",
          willChange: "left",
        }}
      />
      {/* Diagnostics panel */}
      <div
        ref={panelRef}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded font-mono text-[10px] pointer-events-none select-none"
        style={{
          backgroundColor: "hsl(0 0% 0% / 0.85)",
          color: "hsl(120 60% 60%)",
          backdropFilter: "blur(4px)",
        }}
      />
    </>
  );
});
