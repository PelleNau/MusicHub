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
    const topScale = mid - 1;
    const bottomScale = mid + 1;

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.95;

    for (let i = 0; i < peaks.length; i++) {
      const amp = Math.abs(peaks[i]) * (height * 0.42);
      const x = i * step;
      ctx.beginPath();
      ctx.moveTo(x, topScale - amp);
      ctx.lineTo(x, bottomScale + amp);
      ctx.stroke();
    }
  }, [peaks, color, width, height]);

  if (!peaks || !peaks.length) return null;

  return <canvas ref={canvasRef} style={{ width, height }} className="absolute inset-0" />;
}
