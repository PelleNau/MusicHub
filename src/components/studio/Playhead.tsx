import { memo, useRef, useEffect } from "react";
import type { AudioEngine } from "@/audio/AudioEngine";
import { beatToAbsoluteX, TRACK_HEADER_WIDTH } from "./timelineMath";

interface PlayheadProps {
  /** Pass the engine instance for direct rAF-driven reads (bypasses React state) */
  engine: AudioEngine;
  pixelsPerBeat: number;
  height?: string;
  /** Optional getter that overrides the engine's currentBeat (used in Connected Mode) */
  beatGetter?: () => number;
}

/**
 * Vertical playhead line rendered on the timeline.
 *
 * In Standalone mode, reads `currentBeat` directly from the AudioEngine.
 * In Connected mode, reads from the supplied `beatGetter` (native transport).
 * Both use requestAnimationFrame for buttery smooth updates.
 *
 * Position is computed each frame from the transport beat — no incremental
 * pixel accumulation — using the shared `beatToAbsoluteX` helper.
 */
export const Playhead = memo(function Playhead({
  engine,
  pixelsPerBeat,
  height = "100%",
  beatGetter,
}: PlayheadProps) {
  const lineRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const el = lineRef.current;
    if (!el) return;

    const tick = () => {
      const beat = beatGetter ? beatGetter() : engine.currentBeat;
      el.style.left = `${beatToAbsoluteX(beat, pixelsPerBeat)}px`;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [engine, pixelsPerBeat, beatGetter]);

  return (
    <div
      ref={lineRef}
      className="absolute top-0 pointer-events-none z-30"
      style={{
        left: TRACK_HEADER_WIDTH,
        height,
        willChange: "left",
      }}
    >
      {/* Triangle head */}
      <div
        className="absolute -top-0 -translate-x-1/2"
        style={{
          width: 0,
          height: 0,
          borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent",
          borderTop: "6px solid hsl(var(--playhead))",
        }}
      />
      {/* Vertical line */}
      <div className="absolute top-0 bottom-0 w-px -translate-x-[0.5px]" style={{ backgroundColor: "hsl(var(--playhead))" }} />
    </div>
  );
});
