import { useEffect, useRef, useState } from "react";

interface FigmaFaderProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  showDb?: boolean;
  showScale?: boolean;
  height?: number;
  disabled?: boolean;
  color?: string;
  className?: string;
}

export function FigmaFader({
  value,
  onChange,
  label,
  showDb = true,
  showScale = true,
  height = 200,
  disabled = false,
  color,
  className = "",
}: FigmaFaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const valueToDb = (next: number): string => {
    if (next === 0) return "-∞";
    const db = 20 * Math.log10(next);
    return db >= 0 ? `+${db.toFixed(1)}` : db.toFixed(1);
  };

  const updateValue = (clientY: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const y = clientY - rect.top;
    const percentage = Math.max(0, Math.min(1, 1 - y / rect.height));
    onChange(percentage);
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    if (disabled) return;
    event.preventDefault();
    setIsDragging(true);
    updateValue(event.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (event: MouseEvent) => updateValue(event.clientY);
    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const unityGainPosition = 83.3;

  return (
    <div className={`flex select-none flex-col items-center gap-2 ${className}`}>
      {label ? (
        <span className="text-center text-[10px] font-medium uppercase tracking-wider text-[var(--ds-text-secondary)]">
          {label}
        </span>
      ) : null}

      <div className="relative flex items-center gap-3">
        {showScale ? (
          <div
            className="flex flex-col justify-between text-[10px] font-mono tabular-nums text-[var(--ds-fader-scale-text)]"
            style={{ height }}
          >
            <span>+6</span>
            <span className="font-semibold">0</span>
            <span>-6</span>
            <span>-12</span>
            <span>-24</span>
            <span>-∞</span>
          </div>
        ) : null}

        <div
          ref={trackRef}
          className={`relative w-12 cursor-ns-resize rounded-full bg-[var(--ds-fader-track-bg)] shadow-[var(--shadow-inset)] ${
            disabled ? "cursor-not-allowed opacity-50" : ""
          }`}
          style={{ height }}
          onMouseDown={handleMouseDown}
          onDoubleClick={() => {
            if (!disabled) onChange(1);
          }}
          title={disabled ? undefined : "Drag to adjust | Double-click: 0dB"}
        >
          <div
            className="absolute left-0 right-0 z-10 h-[2px] bg-[var(--ds-accent-primary)]/40"
            style={{ bottom: `${unityGainPosition}%` }}
          >
            <div className="absolute left-0 h-full w-2 bg-[var(--ds-accent-primary)]" />
            <div className="absolute right-0 h-full w-2 bg-[var(--ds-accent-primary)]" />
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-75"
            style={{
              height: `${value * 100}%`,
              background: color
                ? `linear-gradient(to top, ${color}, ${color}cc)`
                : "linear-gradient(to top, var(--ds-meter-green), var(--ds-accent-secondary))",
              boxShadow: `0 0 8px ${color || "var(--ds-accent-secondary)"}40`,
            }}
          />

          <div
            className="absolute left-0 right-0 h-[2px] bg-[var(--ds-accent-primary)] shadow-[0_0_6px_var(--ds-accent-primary)] transition-all duration-75"
            style={{ bottom: `${value * 100}%` }}
          />

          <div
            className={`absolute left-1/2 flex h-8 w-16 -translate-x-1/2 items-center justify-center rounded-lg bg-[var(--ds-fader-thumb-bg)] transition-all duration-75 ${
              isDragging ? "scale-105 shadow-[var(--shadow-raised-hover)]" : "shadow-[var(--shadow-raised)]"
            }`}
            style={{ bottom: `calc(${value * 100}% - 16px)` }}
          >
            <div className="flex flex-col gap-0.5">
              <div className="h-[2px] w-8 rounded-full bg-[var(--ds-text-tertiary)]" />
              <div className="h-[2px] w-8 rounded-full bg-[var(--ds-text-tertiary)]" />
              <div className="h-[2px] w-8 rounded-full bg-[var(--ds-text-tertiary)]" />
            </div>
          </div>
        </div>
      </div>

      {showDb ? (
        <div className="min-w-[3.5rem] text-center text-xs font-mono tabular-nums text-[var(--ds-text-primary)]">
          {valueToDb(value)} dB
        </div>
      ) : null}
    </div>
  );
}
