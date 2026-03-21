import { useEffect, useState } from "react";

interface FigmaMeterProps {
  level: number;
  peak?: number;
  orientation?: "vertical" | "horizontal";
  height?: number;
  width?: number;
  showScale?: boolean;
  type?: "vu" | "peak" | "rms";
  className?: string;
}

export function FigmaMeter({
  level,
  peak,
  orientation = "vertical",
  height = 200,
  width = 24,
  showScale = false,
  type = "peak",
  className = "",
}: FigmaMeterProps) {
  const [peakHold, setPeakHold] = useState(peak || 0);
  const [peakHoldTimer, setPeakHoldTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (level <= peakHold) return;
    setPeakHold(level);
    if (peakHoldTimer) clearTimeout(peakHoldTimer);
    const timer = setTimeout(() => setPeakHold(0), 1500);
    setPeakHoldTimer(timer);
  }, [level, peakHold, peakHoldTimer]);

  useEffect(() => {
    if (peak !== undefined) setPeakHold(peak);
  }, [peak]);

  const getColor = (position: number) => {
    if (position > 0.92) return "var(--ds-meter-red)";
    if (position > 0.85) return "var(--ds-meter-orange)";
    if (position > 0.65) return "var(--ds-meter-yellow)";
    return "var(--ds-meter-green)";
  };

  const segments = 48;
  const segmentHeight = (height - (segments - 1)) / segments;

  if (orientation === "vertical") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showScale ? (
          <div className="flex flex-col justify-between text-[9px] font-mono leading-none tabular-nums text-[var(--ds-fader-scale-text)]" style={{ height }}>
            <span>0</span>
            <span>-3</span>
            <span>-6</span>
            <span>-12</span>
            <span>-18</span>
            <span>-24</span>
            <span>-36</span>
            <span>-∞</span>
          </div>
        ) : null}

        <div className="relative rounded-lg bg-[var(--ds-meter-bg)] shadow-[var(--shadow-inset)]" style={{ width, height }} data-meter-type={type}>
          <div className="absolute inset-1 flex flex-col-reverse gap-[1px]">
            {Array.from({ length: segments }).map((_, index) => {
              const segmentValue = (index + 1) / segments;
              const isLit = segmentValue <= level;
              const isPeak = Math.abs(segmentValue - peakHold) < 0.025;
              const segmentColor = getColor(segmentValue);

              return (
                <div
                  key={index}
                  className="rounded-[1px] transition-all duration-75"
                  style={{
                    height: segmentHeight,
                    backgroundColor: isLit || isPeak ? segmentColor : "var(--ds-surface-inset)",
                    opacity: isLit ? 1 : isPeak ? 0.9 : 0.25,
                    boxShadow: isLit ? `0 0 4px ${segmentColor}` : "none",
                  }}
                />
              );
            })}
          </div>

          {level > 0.98 ? (
            <div className="absolute left-0 right-0 top-0 h-2 rounded-t-lg bg-[var(--ds-meter-red)] shadow-[0_0_8px_var(--ds-meter-red)]">
              <div className="h-full w-full animate-pulse bg-[var(--ds-meter-red)]" />
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="relative rounded-lg bg-[var(--ds-meter-bg)] shadow-[var(--shadow-inset)]" style={{ width, height: 24 }} data-meter-type={type}>
        <div className="absolute inset-1 flex gap-[1px]">
          {Array.from({ length: segments }).map((_, index) => {
            const segmentValue = (index + 1) / segments;
            const isLit = segmentValue <= level;
            const segmentWidth = (width - (segments - 1) - 8) / segments;
            const segmentColor = getColor(segmentValue);

            return (
              <div
                key={index}
                className="rounded-[1px] transition-all duration-75"
                style={{
                  width: segmentWidth,
                  backgroundColor: isLit ? segmentColor : "var(--ds-surface-inset)",
                  opacity: isLit ? 1 : 0.25,
                  boxShadow: isLit ? `0 0 4px ${segmentColor}` : "none",
                }}
              />
            );
          })}
        </div>

        {level > 0.98 ? (
          <div className="absolute bottom-0 right-0 top-0 w-2 animate-pulse rounded-r-lg bg-[var(--ds-meter-red)]" />
        ) : null}
      </div>
    </div>
  );
}

export function FigmaStereoMeter({
  leftLevel,
  rightLevel,
  leftPeak,
  rightPeak,
  height = 200,
  showScale = true,
  className = "",
}: {
  leftLevel: number;
  rightLevel: number;
  leftPeak?: number;
  rightPeak?: number;
  height?: number;
  showScale?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex gap-2 ${className}`}>
      <div className="flex flex-col items-center gap-1">
        <FigmaMeter level={leftLevel} peak={leftPeak} height={height} showScale={showScale} />
        <span className="text-[10px] font-semibold text-[var(--ds-text-secondary)]">L</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <FigmaMeter level={rightLevel} peak={rightPeak} height={height} showScale={false} />
        <span className="text-[10px] font-semibold text-[var(--ds-text-secondary)]">R</span>
      </div>
    </div>
  );
}

export function FigmaCorrelationMeter({
  correlation,
  size = "md",
  className = "",
}: {
  correlation: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeStyles = {
    sm: "w-24 h-3",
    md: "w-32 h-4",
    lg: "w-40 h-5",
  } as const;

  const position = (correlation + 1) / 2;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className={`relative ${sizeStyles[size]} rounded-full bg-[var(--ds-meter-bg)] shadow-[var(--shadow-inset)]`}>
        <div className="absolute bottom-0 left-0 top-0 w-1/2 rounded-l-full bg-gradient-to-r from-[var(--ds-meter-red)]/30 to-transparent" />
        <div className="absolute bottom-0 right-0 top-0 w-1/2 rounded-r-full bg-gradient-to-l from-[var(--ds-meter-green)]/30 to-transparent" />
        <div className="absolute bottom-0 left-1/2 top-0 w-[2px] -translate-x-1/2 bg-[var(--ds-text-tertiary)]/40" />
        <div
          className="absolute top-1/2 h-full w-2 -translate-y-1/2 rounded-full bg-[var(--ds-text-primary)] shadow-[0_0_4px_var(--ds-text-primary)] transition-all duration-100"
          style={{ left: `calc(${position * 100}% - 4px)` }}
        />
      </div>
      <div className="flex justify-between text-[9px] font-mono text-[var(--ds-text-tertiary)]">
        <span>-1</span>
        <span>0</span>
        <span>+1</span>
      </div>
    </div>
  );
}
