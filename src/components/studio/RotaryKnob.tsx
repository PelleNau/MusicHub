import { useRef, useState } from "react";

interface RotaryKnobProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  size?: number;
  disabled?: boolean;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  color?: string;
  onContextMenu?: (event: React.MouseEvent) => void;
  title?: string;
}

export function RotaryKnob({
  value,
  onChange,
  label,
  size = 36,
  disabled = false,
  showValue = true,
  formatValue = (next) => Math.round(next * 100).toString(),
  color = "var(--accent)",
  onContextMenu,
  title,
}: RotaryKnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const startY = useRef(0);
  const startValue = useRef(0);

  const minAngle = -135;
  const maxAngle = 135;
  const angle = minAngle + value * (maxAngle - minAngle);
  const isActive = value > 0.01;
  const radius = size / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const activeArc = value * (270 / 360) * circumference;
  const isPanKnob = label?.toLowerCase().includes("pan") ?? false;

  const handleMouseDown = (event: React.MouseEvent) => {
    if (disabled) return;

    event.preventDefault();
    setIsDragging(true);
    startY.current = event.clientY;
    startValue.current = value;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = startY.current - moveEvent.clientY;
      const nextValue = Math.max(0, Math.min(1, startValue.current + deltaY * 0.005));
      onChange(nextValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleDoubleClick = () => {
    if (disabled) return;
    if (label?.toLowerCase().includes("pan") || label?.toLowerCase().includes("gain")) {
      onChange(0.5);
      return;
    }
    onChange(0);
  };

  return (
    <div className="select-none" style={{ width: `${size + 22}px` }}>
      <div className="flex flex-col items-center gap-0.5">
        {label ? (
          <div className="text-[8px] font-medium uppercase tracking-wider text-foreground/50">{label}</div>
        ) : null}

        <div
          className={`relative rounded-full transition-all duration-150 ${
            disabled ? "cursor-not-allowed opacity-50" : "cursor-ns-resize"
          } ${isDragging ? "scale-105" : isHovered ? "scale-[1.02]" : "scale-100"}`}
          style={{ width: `${size}px`, height: `${size}px` }}
          onMouseDown={handleMouseDown}
          onDoubleClick={handleDoubleClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onContextMenu={onContextMenu}
          title={title}
        >
          {isActive ? (
            <div
              className="absolute inset-0 rounded-full transition-opacity duration-200"
              style={{
                background: `radial-gradient(circle at center, transparent 60%, ${color}20 70%, ${color}40 100%)`,
                opacity: isDragging ? 1 : isHovered ? 0.8 : 0.6,
              }}
            />
          ) : null}

          <div
            className="absolute inset-0 rounded-full transition-all duration-150"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, var(--surface-3) 0%, var(--surface-2) 40%, var(--surface-1) 100%)",
              boxShadow: `inset 0 1px 2px rgba(255, 255, 255, 0.1), inset 0 -2px 4px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.2), ${
                isDragging ? `0 0 12px ${color}40` : isActive ? `0 0 8px ${color}20` : "0 0 0 transparent"
              }`,
              border: "1px solid var(--border)",
            }}
          >
            <svg className="absolute inset-0 -rotate-90" style={{ width: "100%", height: "100%" }}>
              <circle
                cx="50%"
                cy="50%"
                r={radius}
                fill="none"
                stroke="var(--surface-3)"
                strokeWidth="2"
                strokeDasharray={`${(270 / 360) * circumference} ${circumference}`}
                strokeDashoffset={`${(45 / 360) * circumference}`}
                opacity="0.3"
              />
              {isActive ? (
                <circle
                  cx="50%"
                  cy="50%"
                  r={radius}
                  fill="none"
                  stroke={color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${activeArc} ${circumference}`}
                  strokeDashoffset={`${(45 / 360) * circumference}`}
                  opacity={isDragging ? 1 : 0.92}
                />
              ) : null}
            </svg>

            <div className="absolute inset-0 flex items-center justify-center" style={{ transform: `rotate(${angle}deg)` }}>
              <div
                className="absolute rounded-full transition-all duration-150"
                style={{
                  width: "4px",
                  height: `${size * 0.38}px`,
                  top: `${size * 0.12}px`,
                  background: isActive ? color : "var(--foreground)",
                  borderRadius: "999px",
                  opacity: 1,
                  boxShadow: isDragging || isHovered ? `0 0 8px ${isActive ? color : "rgba(255,255,255,0.4)"}` : "none",
                }}
              />
            </div>

            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: `${size * 0.12}px`,
                height: `${size * 0.12}px`,
                background: "radial-gradient(circle, var(--surface-1), var(--surface-3))",
                boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.5)",
              }}
            />
          </div>

          {isHovered && !disabled ? (
            <div
              className="pointer-events-none absolute inset-0 rounded-full transition-opacity duration-200"
              style={{ border: `1px solid ${isActive ? color : "var(--primary)"}`, opacity: 0.4 }}
            />
          ) : null}
        </div>

        {showValue ? (
          <div
            className="min-w-[32px] text-center font-mono text-[10px] text-foreground/80 transition-colors duration-150"
            style={{ color: isActive ? color : undefined, fontVariantNumeric: "tabular-nums" }}
          >
            {formatValue(value)}
          </div>
        ) : null}

        {isPanKnob ? (
          <div className="mt-1 w-full px-0.5">
            <div className="mb-1 h-px w-full bg-gradient-to-r from-transparent via-foreground/12 to-transparent" />
            <div className="grid grid-cols-3 items-center font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-foreground/68">
              <span className="text-left">L</span>
              <span className="text-center text-foreground/82">C</span>
              <span className="text-right">R</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
