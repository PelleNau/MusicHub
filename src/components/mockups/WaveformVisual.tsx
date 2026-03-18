import { useRef, useEffect, useState, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WaveformVisualProps {
  className?: string;
}

export function WaveformVisual({ className }: WaveformVisualProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [frequency, setFrequency] = useState(220);
  const [playing, setPlaying] = useState(false);
  const oscRef = useRef<OscillatorNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Background grid
      ctx.strokeStyle = "hsl(198 85% 52% / 0.08)";
      ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Center line
      ctx.strokeStyle = "hsl(198 85% 52% / 0.15)";
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Waveform
      const cycles = frequency / 60;
      ctx.strokeStyle = "hsl(198 85% 52% / 0.9)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const t = x / w;
        const y = h / 2 + Math.sin((t * cycles * Math.PI * 2) + phase) * (h * 0.35);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Glow
      ctx.strokeStyle = "hsl(198 85% 52% / 0.2)";
      ctx.lineWidth = 6;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const t = x / w;
        const y = h / 2 + Math.sin((t * cycles * Math.PI * 2) + phase) * (h * 0.35);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += 0.03;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [frequency]);

  // Audio playback
  const togglePlay = useCallback(() => {
    if (playing) {
      oscRef.current?.stop();
      oscRef.current = null;
      setPlaying(false);
      return;
    }
    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext();
      const audioCtx = ctxRef.current;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      gain.gain.value = 0.15;
      osc.connect(gain).connect(audioCtx.destination);
      osc.start();
      oscRef.current = osc;
      setPlaying(true);
    } catch { /* audio not available */ }
  }, [frequency, playing]);

  // Update oscillator frequency live
  useEffect(() => {
    if (oscRef.current) {
      oscRef.current.frequency.value = frequency;
    }
  }, [frequency]);

  // Cleanup
  useEffect(() => {
    return () => {
      oscRef.current?.stop();
      oscRef.current = null;
    };
  }, []);

  return (
    <div className={`rounded-xl border border-border bg-card/50 p-4 space-y-3 ${className ?? ""}`}>
      <canvas
        ref={canvasRef}
        width={480}
        height={120}
        className="w-full h-[120px] rounded-lg bg-background/50"
      />
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 rounded-full shrink-0 ${playing ? "text-primary bg-primary/20" : "text-muted-foreground"}`}
          onClick={togglePlay}
        >
          <Volume2 className="h-4 w-4" />
        </Button>
        <div className="flex-1 space-y-1">
          <Slider
            min={80}
            max={2000}
            step={10}
            value={[frequency]}
            onValueChange={([v]) => setFrequency(v)}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
            <span>80 Hz (Low)</span>
            <span className="text-primary font-semibold">{frequency} Hz</span>
            <span>2000 Hz (High)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
