export interface FigmaAutomationPoint {
  time: number;
  value: number;
}

export interface FigmaAutomationLaneProps {
  parameterName?: string;
  points?: FigmaAutomationPoint[];
  min?: number;
  max?: number;
  height?: number;
  pixelsPerBeat?: number;
  totalBeats?: number;
  onClose?: () => void;
  className?: string;
}

export function FigmaAutomationLane({
  parameterName = "Volume",
  points = [],
  min = 0,
  max = 100,
  height = 100,
  pixelsPerBeat = 40,
  totalBeats = 16,
  onClose,
  className = "",
}: FigmaAutomationLaneProps) {
  const width = totalBeats * pixelsPerBeat;

  return (
    <div className={`flex flex-col border-t border-[var(--border)] bg-[var(--surface-1)] ${className}`}>
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5">
        <span className="text-xs font-medium text-[var(--foreground)]">{parameterName}</span>
        {onClose ? (
          <button type="button" onClick={onClose} className="rounded p-0.5 hover:bg-[var(--surface-3)]">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : null}
      </div>
      <div className="relative overflow-hidden bg-[var(--surface-0)]" style={{ height: `${height}px` }}>
        <div className="absolute inset-y-0 left-0 right-0 top-1/2 h-px bg-[var(--border)]" />
        <div className="absolute inset-0 bg-[repeating-linear-gradient(to_right,transparent,transparent_calc(25%_-_1px),hsl(240_8%_24%)_calc(25%_-_1px),hsl(240_8%_24%)_25%)] opacity-45" />
        {points.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-[var(--muted-foreground)]">
            Click to add automation
          </div>
        ) : (
          <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="#ff6b6b"
              strokeWidth="2"
              points={points
                .map((point) => {
                  const x = point.time * pixelsPerBeat;
                  const normalized = (point.value - min) / Math.max(1, max - min);
                  const y = height - normalized * height;
                  return `${x},${y}`;
                })
                .join(" ")}
            />
            {points.map((point) => {
              const x = point.time * pixelsPerBeat;
              const normalized = (point.value - min) / Math.max(1, max - min);
              const y = height - normalized * height;
              return <circle key={`${point.time}-${point.value}`} cx={x} cy={y} r="4" fill="#ff8d8d" stroke="white" strokeWidth="1.5" />;
            })}
          </svg>
        )}
      </div>
    </div>
  );
}
