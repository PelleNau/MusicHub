import { useState, useCallback, useRef, useMemo } from "react";

export interface CCPoint {
  id: string;
  time: number; // beats
  value: number; // 0–127 for CC, -8192–8191 for pitch bend
}

interface CCLaneProps {
  points: CCPoint[];
  onChange: (points: CCPoint[]) => void;
  label: string;
  min: number;
  max: number;
  defaultValue: number;
  width: number;
  height: number;
  pxPerBeat: number;
  clipDuration: number;
}

const HANDLE_R = 4;

export function CCLane({
  points,
  onChange,
  label,
  min,
  max,
  defaultValue,
  width,
  height,
  pxPerBeat,
  clipDuration,
}: CCLaneProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ pointId: string; startX: number; startY: number; origTime: number; origValue: number } | null>(null);
  const [dragDelta, setDragDelta] = useState<{ dx: number; dy: number } | null>(null);

  const range = max - min;
  const centerY = ((defaultValue - min) / range) * height;

  const valueToY = useCallback((v: number) => height - ((v - min) / range) * height, [height, min, range]);
  const yToValue = useCallback((y: number) => Math.round(Math.max(min, Math.min(max, min + ((height - y) / height) * range))), [height, min, max, range]);
  const timeToX = useCallback((t: number) => t * pxPerBeat, [pxPerBeat]);
  const xToTime = useCallback((x: number) => Math.max(0, Math.min(clipDuration, x / pxPerBeat)), [pxPerBeat, clipDuration]);

  const sorted = useMemo(() => [...points].sort((a, b) => a.time - b.time), [points]);

  // Build polyline string
  const polyline = useMemo(() => {
    if (sorted.length === 0) return "";
    const pts: string[] = [`0,${valueToY(defaultValue)}`];
    for (const p of sorted) {
      pts.push(`${timeToX(p.time)},${valueToY(p.value)}`);
    }
    pts.push(`${width},${valueToY(sorted[sorted.length - 1].value)}`);
    return pts.join(" ");
  }, [sorted, valueToY, timeToX, defaultValue, width]);

  const handleSvgClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (dragRef.current) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Don't add if near existing point
    const hit = sorted.find(p => Math.abs(timeToX(p.time) - x) < 8 && Math.abs(valueToY(p.value) - y) < 8);
    if (hit) return;
    const newPoint: CCPoint = { id: crypto.randomUUID(), time: xToTime(x), value: yToValue(y) };
    onChange([...points, newPoint]);
  }, [points, sorted, onChange, timeToX, valueToY, xToTime, yToValue]);

  const handleContextMenu = useCallback((e: React.MouseEvent, pointId: string) => {
    e.preventDefault();
    onChange(points.filter(p => p.id !== pointId));
  }, [points, onChange]);

  const handlePointerDown = useCallback((e: React.PointerEvent, point: CCPoint) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
    dragRef.current = { pointId: point.id, startX: e.clientX, startY: e.clientY, origTime: point.time, origValue: point.value };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setDragDelta({ dx: e.clientX - dragRef.current.startX, dy: e.clientY - dragRef.current.startY });
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const d = dragRef.current;
    const newTime = xToTime(timeToX(d.origTime) + (e.clientX - d.startX));
    const newValue = yToValue(valueToY(d.origValue) + (e.clientY - d.startY));
    onChange(points.map(p => p.id === d.pointId ? { ...p, time: newTime, value: newValue } : p));
    dragRef.current = null;
    setDragDelta(null);
  }, [points, onChange, xToTime, yToValue, timeToX, valueToY]);

  return (
    <div className="relative shrink-0 border-t" style={{ height, borderColor: "hsl(var(--foreground) / 0.1)", backgroundColor: "hsl(var(--muted) / 0.45)" }}>
      <span className="absolute top-1 left-1 text-[6px] font-mono text-foreground/45 select-none pointer-events-none z-10">{label}</span>
      {/* Center line for pitch bend */}
      {defaultValue !== min && (
        <div
          className="absolute w-full pointer-events-none"
          style={{ top: valueToY(defaultValue), height: 1, backgroundColor: "hsl(var(--foreground) / 0.08)" }}
        />
      )}
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="absolute inset-0 cursor-crosshair"
        onClick={handleSvgClick}
      >
        {/* Envelope line */}
        {polyline && (
          <polyline
            points={polyline}
            fill="none"
            stroke="hsl(var(--primary) / 0.5)"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />
        )}
        {/* Fill area */}
        {sorted.length > 0 && (
          <polygon
            points={`0,${height} ${polyline} ${width},${height}`}
            fill="hsl(var(--primary) / 0.08)"
          />
        )}
        {/* Draggable handles */}
        {sorted.map((point) => {
          let cx = timeToX(point.time);
          let cy = valueToY(point.value);
          if (dragRef.current?.pointId === point.id && dragDelta) {
            cx += dragDelta.dx;
            cy += dragDelta.dy;
          }
          return (
            <circle
              key={point.id}
              cx={cx}
              cy={cy}
              r={HANDLE_R}
              fill="hsl(var(--primary))"
              stroke="hsl(var(--background))"
              strokeWidth={1.5}
              className="cursor-grab"
              onPointerDown={(e) => handlePointerDown(e, point)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onContextMenu={(e) => handleContextMenu(e, point.id)}
            />
          );
        })}
      </svg>
    </div>
  );
}
