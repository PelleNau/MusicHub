import { useRef, useEffect } from "react";

export function ClipWaveform({ peaks, color, width, height }: {
  peaks: number[] | null;
  color: string;
  width: number;
  height: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !peaks || !peaks.length) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const mid = height / 2;
    const step = width / peaks.length;

    ctx.beginPath();
    ctx.moveTo(0, mid);

    for (let i = 0; i < peaks.length; i++) {
      const amp = Math.abs(peaks[i]) * mid;
      ctx.lineTo(i * step, mid - amp);
    }

    ctx.lineTo(width, mid);

    for (let i = peaks.length - 1; i >= 0; i--) {
      const amp = Math.abs(peaks[i]) * mid;
      ctx.lineTo(i * step, mid + amp);
    }

    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }, [peaks, color, width, height]);

  if (!peaks || !peaks.length) return null;

  return <canvas ref={canvasRef} style={{ width, height }} className="absolute inset-0" />;
}
