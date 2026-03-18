import { useRef, useCallback, useState, memo } from "react";
import { Move } from "lucide-react";

interface ZoomDragHandleProps {
  pixelsPerBeat: number;
  trackHeight: number;
  onZoomH: (newPpb: number) => void;
  onZoomV: (newTrackHeight: number) => void;
  minPxPerBeat?: number;
  maxPxPerBeat?: number;
  minTrackHeight?: number;
  maxTrackHeight?: number;
}

const SENSITIVITY = 1.006;

export const ZoomDragHandle = memo(function ZoomDragHandle({
  pixelsPerBeat,
  trackHeight,
  onZoomH,
  onZoomV,
  minPxPerBeat = 4,
  maxPxPerBeat = 200,
  minTrackHeight = 32,
  maxTrackHeight = 200,
}: ZoomDragHandleProps) {
  const [dragging, setDragging] = useState(false);
  const startRef = useRef({ x: 0, y: 0, ppb: 0, th: 0 });
  const onZoomHRef = useRef(onZoomH);
  onZoomHRef.current = onZoomH;
  const onZoomVRef = useRef(onZoomV);
  onZoomVRef.current = onZoomV;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startRef.current = { x: e.clientX, y: e.clientY, ppb: pixelsPerBeat, th: trackHeight };
    setDragging(true);

    const handleMove = (ev: PointerEvent) => {
      const dx = ev.clientX - startRef.current.x;
      const dy = ev.clientY - startRef.current.y;

      // Horizontal: right = zoom in, left = zoom out
      const newPpb = startRef.current.ppb * Math.pow(SENSITIVITY, dx);
      const clampedPpb = Math.max(minPxPerBeat, Math.min(maxPxPerBeat, newPpb));
      onZoomHRef.current(clampedPpb);

      // Vertical: up = zoom in (increase height), down = zoom out (decrease height)
      const newTh = startRef.current.th * Math.pow(SENSITIVITY, -dy);
      const clampedTh = Math.max(minTrackHeight, Math.min(maxTrackHeight, Math.round(newTh)));
      onZoomVRef.current(clampedTh);
    };

    const handleUp = () => {
      setDragging(false);
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }, [pixelsPerBeat, trackHeight, minPxPerBeat, maxPxPerBeat, minTrackHeight, maxTrackHeight]);

  return (
    <div
      className="w-52 shrink-0 border-r border-border/60 bg-card sticky left-0 z-10 flex items-center justify-center select-none touch-none"
      style={{ cursor: dragging ? "grabbing" : "grab" }}
      onPointerDown={handlePointerDown}
    >
      <Move className="h-3.5 w-3.5 text-foreground/25" />
    </div>
  );
});
