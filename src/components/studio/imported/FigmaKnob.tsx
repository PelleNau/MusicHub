import { useEffect, useRef, useState } from "react";

interface FigmaKnobProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showValue?: boolean;
  formatValue?: (value: number) => string;
  min?: number;
  max?: number;
  bipolar?: boolean;
  disabled?: boolean;
  accent?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: { size: "w-12 h-12", indicator: "w-1 h-4", arc: 36 },
  md: { size: "w-16 h-16", indicator: "w-1.5 h-6", arc: 42 },
  lg: { size: "w-20 h-20", indicator: "w-2 h-7", arc: 48 },
  xl: { size: "w-24 h-24", indicator: "w-2.5 h-9", arc: 54 },
} as const;

export function FigmaKnob({
  value,
  onChange,
  label,
  size = "md",
  showValue = true,
  formatValue = (next) => Math.round(next * 100).toString(),
  min = 0,
  max = 1,
  bipolar = false,
  disabled = false,
  accent = false,
  className = "",
}: FigmaKnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(value);
  const knobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (event: MouseEvent) => {
      const deltaY = startY - event.clientY;
      const sensitivity = event.shiftKey ? 0.002 : 0.005;
      const next = Math.max(0, Math.min(1, startValue + deltaY * sensitivity));
      onChange(next);
    };

    const handleMouseUp = () => setIsDragging(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, onChange, startValue, startY]);

  const normalizedValue = (value - min) / (max - min);
  const rotation = -135 + normalizedValue * 270;

  return (
    <div className={`flex select-none flex-col items-center gap-2 ${className}`}>
      <div
        ref={knobRef}
        className={`relative ${sizeStyles[size].size} cursor-ns-resize rounded-full bg-[var(--ds-surface-raised)] shadow-[var(--shadow-raised)] transition-all duration-150 ease-out ${
          isDragging ? "scale-105 shadow-[var(--shadow-raised-hover)]" : "hover:scale-[1.02]"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
        onMouseDown={(event) => {
          if (disabled) return;
          event.preventDefault();
          setIsDragging(true);
          setStartY(event.clientY);
          setStartValue(value);
        }}
        onDoubleClick={() => {
          if (!disabled) onChange(bipolar ? 0.5 : 0);
        }}
        title={disabled ? undefined : "Drag: adjust | Shift+Drag: fine | Double-click: reset"}
      >
        <div className="absolute inset-2 rounded-full bg-[var(--ds-surface-raised)] shadow-[var(--shadow-inset)]">
          {bipolar ? (
            <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--ds-text-tertiary)]" />
          ) : null}
        </div>

        <div
          className="absolute left-1/2 top-0 -translate-x-1/2 transition-transform duration-100 ease-out"
          style={{
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            transformOrigin: "center bottom",
            bottom: "50%",
          }}
        >
          <div
            className={`${sizeStyles[size].indicator} mx-auto rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.3)] ${
              accent ? "bg-[var(--ds-knob-indicator-bg)]" : "bg-[var(--ds-accent-secondary)]"
            }`}
          />
        </div>

        {accent ? (
          <svg className="pointer-events-none absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={sizeStyles[size].arc}
              fill="none"
              stroke="var(--ds-knob-arc-bg)"
              strokeWidth="2.5"
              strokeDasharray={`${normalizedValue * 264} 264`}
              strokeLinecap="round"
              opacity="0.4"
            />
          </svg>
        ) : null}

        <div
          className="absolute inset-0 rounded-full focus-visible:ring-2 focus-visible:ring-[var(--ds-accent-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ds-surface-bg)]"
          tabIndex={disabled ? -1 : 0}
        />
      </div>

      {label ? (
        <span className="text-center text-[10px] font-medium uppercase tracking-wider text-[var(--ds-text-secondary)]">
          {label}
        </span>
      ) : null}

      {showValue ? (
        <span className="text-xs font-mono tabular-nums text-[var(--ds-text-primary)]">
          {bipolar
            ? normalizedValue - 0.5 > 0.01
              ? `R${Math.round((normalizedValue - 0.5) * 200)}`
              : normalizedValue - 0.5 < -0.01
                ? `L${Math.round(Math.abs((normalizedValue - 0.5) * 200))}`
                : "C"
            : formatValue(value)}
        </span>
      ) : null}
    </div>
  );
}
