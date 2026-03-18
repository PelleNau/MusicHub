import { useCallback, useRef, useMemo } from "react";
import type { MidiNote } from "@/components/studio/PianoRollTransforms";

interface MinimapProps {
  notes: MidiNote[];
  clipDuration: number;
  minPitch: number;
  maxPitch: number;
  width: number;
  scrollLeft: number;
  viewportWidth: number;
  totalContentWidth: number;
  onScrollTo: (fraction: number) => void;
}

const MINIMAP_HEIGHT = 20;

export function PianoRollMinimap({
  notes,
  clipDuration,
  minPitch,
  maxPitch,
  width,
  scrollLeft,
  viewportWidth,
  totalContentWidth,
  onScrollTo,
}: MinimapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const pitchRange = maxPitch - minPitch || 1;

  const noteRects = useMemo(() => {
    if (clipDuration <= 0) return [];
    return notes.map((n) => ({
      x: (n.start / clipDuration) * width,
      y: ((maxPitch - n.pitch) / pitchRange) * MINIMAP_HEIGHT,
      w: Math.max((n.duration / clipDuration) * width, 1),
      h: Math.max(MINIMAP_HEIGHT / pitchRange, 1),
    }));
  }, [notes, clipDuration, width, maxPitch, pitchRange]);

  // Viewport indicator
  const vpLeft = totalContentWidth > 0 ? (scrollLeft / totalContentWidth) * width : 0;
  const vpWidth = totalContentWidth > 0 ? Math.min((viewportWidth / totalContentWidth) * width, width) : width;

  const handleClick = useCallback((e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const fraction = x / width;
    onScrollTo(fraction);
  }, [width, onScrollTo]);

  return (
    <div
      ref={ref}
      className="relative shrink-0 cursor-pointer"
      style={{ height: MINIMAP_HEIGHT, width, backgroundColor: "hsl(var(--muted) / 0.55)", borderBottom: "1px solid hsl(var(--foreground) / 0.06)" }}
      onClick={handleClick}
    >
      {/* Note dots */}
      {noteRects.map((r, i) => (
        <div
          key={i}
          className="absolute rounded-[0.5px] pointer-events-none"
          style={{
            left: r.x,
            top: r.y,
            width: r.w,
            height: r.h,
            backgroundColor: "hsl(var(--primary) / 0.5)",
          }}
        />
      ))}
      {/* Viewport rectangle */}
      <div
        className="absolute top-0 h-full pointer-events-none"
        style={{
          left: vpLeft,
          width: vpWidth,
          backgroundColor: "hsl(var(--foreground) / 0.08)",
          border: "1px solid hsl(var(--foreground) / 0.15)",
          borderRadius: 1,
        }}
      />
    </div>
  );
}
