/**
 * NativeMeterBridge — canvas-based real-time meter rendering for connected mode.
 * Uses requestAnimationFrame for smooth 30-60fps rendering without React state per frame.
 */

import { useRef, useEffect, memo } from "react";
import type { MeterLevel } from "@/services/pluginHostSocket";

/* ── Shared utility: dB to linear 0–1 ── */

function dbToLinear(db: number, minDb = -60, maxDb = 0): number {
  if (db <= minDb) return 0;
  if (db >= maxDb) return 1;
  return (db - minDb) / (maxDb - minDb);
}

function resolveThemeColor(variableName: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const value = window.getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  return value ? `hsl(${value})` : fallback;
}

function getMeterColor(pct: number, warningColor: string): string {
  if (pct > 0.85) return "hsl(0, 70%, 50%)";       // Red — clipping
  if (pct > 0.65) return warningColor;                // Yellow — hot
  return "hsl(166, 100%, 50%)";                       // Primary — normal
}

/* ── Horizontal Meter (for track controls) ── */

interface HorizontalMeterProps {
  meter: MeterLevel | null;
  width?: number;
  height?: number;
}

export const HorizontalMeter = memo(function HorizontalMeter({
  meter,
  width = 80,
  height = 3,
}: HorizontalMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const meterRef = useRef<MeterLevel | null>(meter);
  const rafRef = useRef<number>(0);

  meterRef.current = meter;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const warningColor = resolveThemeColor("--warning", "hsl(45, 100%, 55%)");

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const m = meterRef.current;
      if (!m) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const peakPct = dbToLinear(m.peak);
      const rmsPct = dbToLinear(m.rms);

      // RMS fill
      const rmsColor = getMeterColor(rmsPct, warningColor);
      ctx.fillStyle = rmsColor;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(0, 0, rmsPct * width, height);

      // Peak line
      ctx.globalAlpha = 1;
      ctx.fillStyle = getMeterColor(peakPct, warningColor);
      const peakX = Math.min(peakPct * width, width - 1);
      ctx.fillRect(peakX, 0, 1.5, height);

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, borderRadius: 2 }}
      className="block"
    />
  );
});

/* ── Vertical Meter (for master or large view) ── */

interface VerticalMeterProps {
  meter: MeterLevel | null;
  width?: number;
  height?: number;
  stereo?: boolean;
}

export const VerticalMeter = memo(function VerticalMeter({
  meter,
  width = 6,
  height = 40,
}: VerticalMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const meterRef = useRef<MeterLevel | null>(meter);
  const rafRef = useRef<number>(0);

  meterRef.current = meter;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const warningColor = resolveThemeColor("--warning", "hsl(45, 100%, 55%)");

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = "hsl(0, 0%, 12%)";
      ctx.fillRect(0, 0, width, height);

      const m = meterRef.current;
      if (!m) {
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const rmsPct = dbToLinear(m.rms);
      const peakPct = dbToLinear(m.peak);

      // RMS fill (from bottom)
      const rmsH = rmsPct * height;
      const gradient = ctx.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, "hsl(166, 100%, 50%)");
      gradient.addColorStop(0.65, "hsl(166, 100%, 50%)");
      gradient.addColorStop(0.85, warningColor);
      gradient.addColorStop(1, "hsl(0, 70%, 50%)");

      ctx.fillStyle = gradient;
      ctx.globalAlpha = 0.8;
      ctx.fillRect(0, height - rmsH, width, rmsH);

      // Peak indicator
      ctx.globalAlpha = 1;
      const peakY = height - peakPct * height;
      ctx.fillStyle = getMeterColor(peakPct, warningColor);
      ctx.fillRect(0, peakY, width, 1.5);

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, borderRadius: 1 }}
      className="block"
    />
  );
});

/* ── Stereo Master Meter (two vertical bars) ── */

interface MasterMeterProps {
  meter: MeterLevel | null;
  height?: number;
}

export const MasterMeter = memo(function MasterMeter({ meter, height = 20 }: MasterMeterProps) {
  return (
    <div className="flex items-center gap-px">
      <VerticalMeter meter={meter} width={3} height={height} />
      <VerticalMeter
        meter={meter ? { peak: meter.peak - 0.3, rms: meter.rms - 0.5 } : null}
        width={3}
        height={height}
      />
    </div>
  );
});
