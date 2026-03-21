import React, { useRef, useState, useCallback, useEffect } from "react";
import { getTrackColor } from "./trackColors";
import { HorizontalMeter } from "../NativeMeterBridge";
import type { MeterLevel } from "@/services/pluginHostSocket";

/* ── Single-letter toggle button (M / S / R) ── */
export function TrackToggle({
  label,
  active,
  activeClass,
  onClick,
}: {
  label: string;
  active: boolean;
  activeClass: string;
  onClick: () => void;
}) {
  return (
    <button
      data-track-control="true"
      type="button"
      onPointerDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={`h-[15px] w-[15px] flex items-center justify-center rounded-[3px] text-[7.5px] font-bold leading-none transition-colors border
        ${active ? `${activeClass} border-transparent` : "border-transparent hover:border-transparent"}`}
      style={!active ? {
        backgroundColor: "hsl(var(--studio-surface))",
        color: "hsl(var(--studio-text-muted))",
        borderColor: "hsl(var(--studio-border))",
      } : undefined}
    >
      {label}
    </button>
  );
}

/* ── Horizontal volume fader ── */
export function VolumeFader({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const computeValue = useCallback((clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect) return value;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return pct * pct * 1.25;
  }, [value]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    onChange(computeValue(e.clientX));
  }, [computeValue, onChange]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    onChange(computeValue(e.clientX));
  }, [dragging, computeValue, onChange]);

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const pct = Math.min(100, Math.sqrt(value / 1.25) * 100);

  return (
    <div
      ref={trackRef}
      className="relative h-[7px] flex-1 rounded-sm cursor-ew-resize overflow-hidden"
      style={{
        backgroundColor: "hsl(var(--studio-surface))",
        border: "1px solid hsl(var(--studio-border))",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="absolute inset-y-0 left-0 rounded-sm bg-primary/70" style={{ width: `${pct}%` }} />
      <div className="absolute top-0 bottom-0 w-px" style={{ left: "82.5%", backgroundColor: "hsl(var(--studio-text-dim))" }} />
      <div className="absolute top-0 bottom-0 w-px rounded-sm" style={{ left: `${pct}%`, backgroundColor: "hsl(var(--studio-needle))" }} />
      <div
        className="absolute top-1/2 h-[9px] w-[9px] -translate-y-1/2 rounded-full border border-white/22 shadow-[0_1px_3px_rgba(0,0,0,0.35)]"
        style={{
          left: `calc(${pct}% - 4.5px)`,
          backgroundColor: "hsl(var(--studio-knob-bg))",
        }}
      />
    </div>
  );
}

/* ── Pan control (small) ── */
export function PanControl({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const computeValue = useCallback((clientX: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return value;
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return (pct - 0.5) * 2;
  }, [value]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    onChange(computeValue(e.clientX));
  }, [computeValue, onChange]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    onChange(computeValue(e.clientX));
  }, [dragging, computeValue, onChange]);

  const handlePointerUp = useCallback(() => setDragging(false), []);
  const handleDoubleClick = useCallback(() => onChange(0), [onChange]);

  const thumbPct = ((value + 1) / 2) * 100;

  return (
    <div
      ref={ref}
      className="relative h-[5px] w-6 rounded-sm cursor-ew-resize overflow-hidden"
      style={{
        backgroundColor: "hsl(var(--studio-surface))",
        border: "1px solid hsl(var(--studio-border))",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={handleDoubleClick}
    >
      <div className="absolute top-0 bottom-0 left-1/2 w-px" style={{ backgroundColor: "hsl(var(--studio-border))" }} />
      <div
        className="absolute top-0 bottom-0 bg-accent/60"
        style={{
          left: value < 0 ? `${thumbPct}%` : "50%",
          width: `${Math.abs(value) * 50}%`,
        }}
      />
      <div className="absolute top-0 bottom-0 w-px rounded-sm" style={{ left: `${thumbPct}%`, backgroundColor: "hsl(var(--studio-needle))" }} />
    </div>
  );
}

/* ── Mini level meter (with optional native meter data) ── */
export function LevelMeter({
  volume,
  isMuted,
  nativeMeter,
}: {
  volume: number;
  isMuted: boolean;
  nativeMeter?: MeterLevel | null;
}) {
  // If we have native meter data, use the canvas-based meter
  if (nativeMeter) {
    return <HorizontalMeter meter={isMuted ? null : nativeMeter} height={3} />;
  }

  // Fallback: volume-based static display
  const level = isMuted ? 0 : volume;
  const pct = Math.min(100, Math.sqrt(level / 1.25) * 100);

  return (
    <div className="h-[3px] rounded-full overflow-hidden" style={{ backgroundColor: "hsl(var(--studio-surface))" }}>
      <div
        className="h-full rounded-full transition-all duration-100"
        style={{
          width: `${pct}%`,
          background: pct > 85
            ? "hsl(0, 70%, 50%)"
            : pct > 65
              ? "hsl(var(--warning))"
              : "hsl(var(--primary))",
        }}
      />
    </div>
  );
}

/* ── Send knob (small circular) ── */
export function SendKnob({
  label,
  value,
  color,
  onChange,
}: {
  label: string;
  value: number;
  color: string;
  onChange: (v: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const startVal = useRef(0);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
    startY.current = e.clientY;
    startVal.current = value;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [value]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const delta = (startY.current - e.clientY) / 80;
    onChange(Math.max(0, Math.min(1, startVal.current + delta)));
  }, [dragging, onChange]);

  const handlePointerUp = useCallback(() => setDragging(false), []);
  const handleDoubleClick = useCallback(() => onChange(0), [onChange]);

  const angle = -135 + value * 270;

  return (
    <div className="flex flex-col items-center gap-[1px]">
      <div
        ref={ref}
        className="relative h-[18px] w-[18px] rounded-full cursor-ns-resize"
        style={{ backgroundColor: "hsl(var(--studio-knob-bg))" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      >
        <svg className="absolute inset-0" viewBox="0 0 18 18">
          <circle
            cx="9" cy="9" r="7"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeDasharray={`${value * 27.5} 44`}
            strokeDashoffset="0"
            strokeLinecap="round"
            transform="rotate(-225 9 9)"
            opacity="0.7"
          />
        </svg>
        <div
          className="absolute top-[2px] left-1/2 w-px h-[6px] origin-bottom"
          style={{ backgroundColor: "hsl(var(--studio-needle))", transform: `translateX(-50%) rotate(${angle}deg)`, transformOrigin: "50% 100%" }}
        />
      </div>
      <span className="text-[7px] font-mono leading-none truncate max-w-[28px]" style={{ color: "hsl(var(--studio-text-dim))" }}>
        {label}
      </span>
    </div>
  );
}

/* ── Color picker popover ── */
export function ColorPicker({ currentColor, onSelect, onClose }: {
  currentColor: number;
  onSelect: (color: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="absolute left-0 top-full mt-1 z-50 bg-card border border-border rounded-md p-1.5 shadow-lg grid grid-cols-7 gap-1">
      {Array.from({ length: 21 }, (_, i) => (
        <button
          key={i}
          className={`w-4 h-4 rounded-sm transition-transform hover:scale-125 ${i === currentColor ? "ring-1 ring-foreground ring-offset-1 ring-offset-background" : ""}`}
          style={{ backgroundColor: getTrackColor(i) }}
          onClick={() => { onSelect(i); onClose(); }}
        />
      ))}
    </div>
  );
}

/* ── Vertical volume fader (traditional console style with groove + cap) ── */
export function VerticalFader({
  value,
  onChange,
  height = 120,
  width = 28,
  trackColor,
}: {
  value: number;
  onChange: (v: number) => void;
  height?: number;
  width?: number;
  trackColor?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  const computeValue = useCallback(
    (clientY: number) => {
      const rect = trackRef.current?.getBoundingClientRect();
      if (!rect) return value;
      const pct = 1 - Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
      return pct * pct * 1.25;
    },
    [value],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      onChange(computeValue(e.clientY));
    },
    [computeValue, onChange],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      onChange(computeValue(e.clientY));
    },
    [dragging, computeValue, onChange],
  );

  const handlePointerUp = useCallback(() => setDragging(false), []);

  const handleDoubleClick = useCallback(() => {
    setEditing(true);
    const db = value <= 0 ? -Infinity : 20 * Math.log10(value);
    setEditValue(db <= -70 ? "-∞" : db.toFixed(1));
  }, [value]);

  const commitEdit = useCallback(() => {
    setEditing(false);
    const parsed = parseFloat(editValue);
    if (!isNaN(parsed)) {
      const linear = Math.pow(10, parsed / 20);
      onChange(Math.max(0, Math.min(1.25, linear)));
    }
  }, [editValue, onChange]);

  const pct = Math.min(100, Math.sqrt(value / 1.25) * 100);
  const unityPct = 82.5;

  const dbTicks = [
    { db: 6, label: "+6" },
    { db: 0, label: "0" },
    { db: -6, label: "-6" },
    { db: -12, label: "-12" },
    { db: -24, label: "-24" },
    { db: -48, label: "-48" },
  ];

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-stretch gap-[2px]" style={{ height }}>
        {/* dB scale labels */}
        <div className="relative flex flex-col justify-between" style={{ width: 16, height }}>
          {dbTicks.map(({ db, label }) => {
            const lin = Math.pow(10, db / 20);
            const pos = 100 - Math.min(100, Math.sqrt(lin / 1.25) * 100);
            return (
              <span
                key={db}
                className="absolute right-0 font-mono text-[6px] leading-none tabular-nums"
                style={{ top: `${pos}%`, transform: "translateY(-50%)", color: "hsl(var(--studio-text-dim))" }}
              >
                {label}
              </span>
            );
          })}
        </div>

        {/* Fader groove */}
        <div
          ref={trackRef}
          className="relative cursor-ns-resize"
          style={{ width, height }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={handleDoubleClick}
        >
          <div
            className="absolute left-1/2 -translate-x-1/2 top-[4px] bottom-[4px] w-[4px] rounded-full"
            style={{ backgroundColor: "hsl(var(--studio-knob-bg))", border: "1px solid hsl(var(--studio-knob-track))" }}
          />
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-[4px] w-[4px] rounded-full opacity-50"
            style={{
              height: `${(pct / 100) * (height - 8)}px`,
              background: trackColor || "hsl(var(--primary))",
            }}
          />
          <div className="absolute left-0 right-0 h-px" style={{ bottom: `${unityPct}%`, backgroundColor: "hsl(var(--studio-border))" }} />

          {/* Fader cap */}
          <div
            className="absolute left-0 right-0 flex items-center justify-center"
            style={{ bottom: `calc(${pct}% - 10px)` }}
          >
            <div
              className={`rounded-[3px] border transition-colors ${
                dragging
                  ? "bg-foreground/95 border-foreground/50"
                  : "bg-foreground/80 border-foreground/25 hover:bg-foreground/90"
              }`}
              style={{ width: width - 4, height: 20 }}
            >
              <div className="h-full flex flex-col items-center justify-center gap-[2px]">
                <div className="w-[8px] h-px bg-background/40 rounded-full" />
                <div className="w-[8px] h-px bg-background/40 rounded-full" />
                <div className="w-[8px] h-px bg-background/40 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {editing ? (
        <input
          autoFocus
          className="w-12 text-center font-mono text-[8px] bg-background border border-border rounded px-0.5 py-0.5"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit();
            if (e.key === "Escape") setEditing(false);
          }}
        />
      ) : (
        <span
          className="font-mono text-[8px] cursor-default select-none tabular-nums"
          style={{ color: "hsl(var(--studio-text-dim))" }}
          onDoubleClick={handleDoubleClick}
        >
          {value <= 0 ? "-∞" : `${(20 * Math.log10(value)).toFixed(1)} dB`}
        </span>
      )}
    </div>
  );
}

/* ── Peak display (resettable numeric peak hold) ── */
export function PeakDisplay({
  meter,
  isMuted,
}: {
  meter: MeterLevel | null | undefined;
  isMuted: boolean;
}) {
  const [peakHold, setPeakHold] = useState(-Infinity);
  const meterRef = useRef(meter);
  meterRef.current = meter;

  useEffect(() => {
    if (isMuted || !meter) return;
    if (meter.peak > peakHold) setPeakHold(meter.peak);
  }, [meter, isMuted, peakHold]);

  const isClipping = peakHold > -0.5;
  const display =
    peakHold <= -60 ? "-∞" : `${peakHold > 0 ? "+" : ""}${peakHold.toFixed(1)}`;

  return (
    <button
      onClick={() => setPeakHold(-Infinity)}
      className={`font-mono text-[7px] leading-none px-1.5 py-[3px] rounded-[2px] cursor-pointer transition-colors ${
        isClipping
          ? "bg-destructive/20 text-destructive"
          : ""
      }`}
      style={!isClipping ? {
        backgroundColor: "hsl(var(--studio-surface))",
        color: "hsl(var(--studio-text-dim))",
      } : undefined}
      title="Click to reset peak"
    >
      {display}
    </button>
  );
}

/* ── Automation mode selector ── */
export type AutomationMode = "off" | "read" | "touch" | "latch" | "write";

export function AutomationModeButton({
  mode,
  onChange,
}: {
  mode: AutomationMode;
  onChange: (m: AutomationMode) => void;
}) {
  const modes: AutomationMode[] = ["off", "read", "touch", "latch", "write"];
  const labels: Record<AutomationMode, string> = { off: "Off", read: "R", touch: "T", latch: "L", write: "W" };
  const colors: Record<AutomationMode, string> = {
    off: "hsl(var(--studio-text-dim))",
    read: "hsl(var(--primary))",
    touch: "hsl(var(--warning))",
    latch: "hsl(var(--accent))",
    write: "hsl(var(--destructive))",
  };

  const cycle = useCallback(() => {
    const idx = modes.indexOf(mode);
    onChange(modes[(idx + 1) % modes.length]);
  }, [mode, onChange]);

  return (
    <button
      onClick={(e) => { e.stopPropagation(); cycle(); }}
      className="font-mono text-[7px] leading-none px-1.5 py-[2px] rounded-[2px] transition-colors"
      style={{
        backgroundColor: "hsl(var(--studio-surface))",
        color: colors[mode],
      }}
      title={`Automation: ${labels[mode]}`}
    >
      {labels[mode]}
    </button>
  );
}

/* ── Draggable track height divider ── */
export const TrackDivider = React.forwardRef<HTMLDivElement, { onHeightChange: (h: number) => void; currentHeight: number }>(
  function TrackDivider({ onHeightChange, currentHeight, ...props }, ref) {
    const dragRef = useRef<{ startY: number; startH: number } | null>(null);

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current = { startY: e.clientY, startH: currentHeight };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }, [currentHeight]);

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const delta = e.clientY - dragRef.current.startY;
      const newH = Math.min(200, Math.max(32, dragRef.current.startH + delta));
      onHeightChange(newH);
    }, [onHeightChange]);

    const handlePointerUp = useCallback(() => {
      dragRef.current = null;
    }, []);

    return (
      <div
        ref={ref}
        {...props}
        className="absolute bottom-0 left-0 right-0 h-[5px] cursor-row-resize z-20 group/divider flex items-center justify-center bg-border/30 hover:bg-primary/30 active:bg-primary/50 transition-colors"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="w-10 h-[2px] rounded-full bg-foreground/20 group-hover/divider:bg-primary/60 transition-colors" />
      </div>
    );
  }
);
