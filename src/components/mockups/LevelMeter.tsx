import { useRef, useEffect } from "react";

interface LevelMeterProps {
  analyser: AnalyserNode | null;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Real-time vertical amplitude bar driven by an AnalyserNode.
 * Reusable across lessons 1.3, 1.7, and the Capstone.
 */
export function LevelMeter({ analyser, width = 24, height = 120, className = "" }: LevelMeterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dataArray = new Uint8Array(analyser?.fftSize ?? 256);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = "hsl(0 0% 100% / 0.04)";
      ctx.beginPath();
      ctx.roundRect(0, 0, w, h, 4);
      ctx.fill();

      let rms = 0;
      if (analyser) {
        analyser.getByteTimeDomainData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = (dataArray[i] - 128) / 128;
          sum += v * v;
        }
        rms = Math.sqrt(sum / dataArray.length);
      }

      const level = Math.min(rms * 3, 1); // amplify for visibility
      const barH = level * h;

      // Gradient fill
      const grad = ctx.createLinearGradient(0, h, 0, 0);
      grad.addColorStop(0, "hsl(166 100% 50% / 0.8)");
      grad.addColorStop(0.7, "hsl(45 100% 55% / 0.8)");
      grad.addColorStop(1, "hsl(0 84% 60% / 0.9)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(2, h - barH, w - 4, barH, 2);
      ctx.fill();

      // Scale marks
      ctx.fillStyle = "hsl(0 0% 100% / 0.12)";
      for (let y = 0; y < h; y += h / 6) {
        ctx.fillRect(0, y, w, 1);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [analyser]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`rounded ${className}`}
    />
  );
}
