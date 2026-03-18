import { useCallback, useRef, useMemo, memo } from "react";
import type { AutomationLaneData, AutomationPoint } from "@/types/studio";
import { X, ChevronDown } from "lucide-react";

const LANE_HEIGHT = 48;
const HANDLE_R = 3.5;

interface AutomationLaneProps {
  lane: AutomationLaneData;
  pixelsPerBeat: number;
  totalBeats: number;
  trackColor: string;
  onChange: (laneId: string, points: AutomationPoint[]) => void;
  onRemove: (laneId: string) => void;
}

export const AutomationLane = memo(function AutomationLane({
  lane,
  pixelsPerBeat,
  totalBeats,
  trackColor,
  onChange,
  onRemove,
}: AutomationLaneProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{
    pointId: string;
    startX: number;
    startY: number;
    origTime: number;
    origValue: number;
  } | null>(null);

  const width = totalBeats * pixelsPerBeat;
  const height = LANE_HEIGHT;
  const laneColor = lane.color || trackColor;

  const valueToY = useCallback((v: number) => height - v * height, [height]);
  const yToValue = useCallback((y: number) => Math.max(0, Math.min(1, (height - y) / height)), [height]);
  const timeToX = useCallback((t: number) => t * pixelsPerBeat, [pixelsPerBeat]);
  const xToTime = useCallback((x: number) => Math.max(0, x / pixelsPerBeat), [pixelsPerBeat]);

  const sorted = useMemo(() => [...lane.points].sort((a, b) => a.time - b.time), [lane.points]);

  // Build SVG path with hold/linear segments
  const pathD = useMemo(() => {
    if (sorted.length === 0) return "";
    const parts: string[] = [];
    // Start from time 0 at first point's value (or 0.5 default)
    const firstY = valueToY(sorted[0].value);
    parts.push(`M 0,${firstY}`);

    for (let i = 0; i < sorted.length; i++) {
      const p = sorted[i];
      const px = timeToX(p.time);
      const py = valueToY(p.value);

      if (p.curve === "hold" && i > 0) {
        // Step: horizontal then vertical
        parts.push(`H ${px}`);
        parts.push(`V ${py}`);
      } else {
        parts.push(`L ${px},${py}`);
      }
    }
    // Extend to end
    parts.push(`H ${width}`);
    return parts.join(" ");
  }, [sorted, valueToY, timeToX, width]);

  // Fill path
  const fillD = useMemo(() => {
    if (!pathD) return "";
    return `${pathD} V ${height} H 0 Z`;
  }, [pathD, height]);

  const handleSvgClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (dragRef.current) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Don't add if near existing point
    const hit = sorted.find(
      (p) => Math.abs(timeToX(p.time) - x) < 8 && Math.abs(valueToY(p.value) - y) < 8
    );
    if (hit) return;

    const newPoint: AutomationPoint = {
      id: crypto.randomUUID(),
      time: xToTime(x),
      value: yToValue(y),
      curve: "linear",
    };
    onChange(lane.id, [...lane.points, newPoint]);
  }, [lane, sorted, onChange, timeToX, valueToY, xToTime, yToValue]);

  const handleContextMenu = useCallback((e: React.MouseEvent, pointId: string) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(lane.id, lane.points.filter((p) => p.id !== pointId));
  }, [lane, onChange]);

  const handlePointerDown = useCallback((e: React.PointerEvent, point: AutomationPoint) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as SVGElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      pointId: point.id,
      startX: e.clientX,
      startY: e.clientY,
      origTime: point.time,
      origValue: point.value,
    };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const d = dragRef.current;
    const newTime = xToTime(timeToX(d.origTime) + (e.clientX - d.startX));
    const newValue = yToValue(valueToY(d.origValue) + (e.clientY - d.startY));
    onChange(
      lane.id,
      lane.points.map((p) =>
        p.id === d.pointId ? { ...p, time: newTime, value: newValue } : p
      )
    );
  }, [lane, onChange, xToTime, yToValue, timeToX, valueToY]);

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  return (
    <div
      className="relative flex border-b border-border/40"
      style={{ height: LANE_HEIGHT }}
    >
      {/* Label */}
      <div className="w-52 shrink-0 bg-card border-r border-border/60 flex items-center px-2 gap-1 sticky left-0 z-10">
        <ChevronDown className="h-2.5 w-2.5 text-muted-foreground/70" />
        <span className="text-[9px] font-mono text-muted-foreground truncate flex-1">
          {lane.label}
        </span>
        <button
          onClick={() => onRemove(lane.id)}
          className="h-4 w-4 flex items-center justify-center rounded text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      </div>

      {/* Automation canvas */}
      <div className="relative flex-1 overflow-hidden" style={{ minWidth: width }}>
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "hsl(var(--foreground) / 0.02)" }}
        />
        {/* Center line */}
        <div
          className="absolute w-full pointer-events-none"
          style={{
            top: height / 2,
            height: 1,
            backgroundColor: "hsl(var(--foreground) / 0.06)",
            minWidth: width,
          }}
        />
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="absolute inset-0 cursor-crosshair"
          onClick={handleSvgClick}
        >
          {/* Fill */}
          {fillD && (
            <path d={fillD} fill={laneColor} fillOpacity={0.06} />
          )}
          {/* Line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={laneColor}
              strokeWidth={1.5}
              strokeLinejoin="round"
              opacity={0.6}
            />
          )}
          {/* Handles */}
          {sorted.map((point) => (
            <circle
              key={point.id}
              cx={timeToX(point.time)}
              cy={valueToY(point.value)}
              r={HANDLE_R}
              fill={laneColor}
              stroke="hsl(var(--background))"
              strokeWidth={1}
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => handlePointerDown(e, point)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onContextMenu={(e) => handleContextMenu(e, point.id)}
            />
          ))}
        </svg>
      </div>
    </div>
  );
});

export { LANE_HEIGHT as AUTOMATION_LANE_HEIGHT };
