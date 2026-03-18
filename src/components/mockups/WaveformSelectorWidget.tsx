import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square, CheckCircle2 } from "lucide-react";

const WAVEFORMS: { type: OscillatorType; label: string; color: string }[] = [
  { type: "sine", label: "Sine", color: "hsl(166 100% 50%)" },
  { type: "square", label: "Square", color: "hsl(340 85% 60%)" },
  { type: "triangle", label: "Triangle", color: "hsl(45 100% 55%)" },
  { type: "sawtooth", label: "Sawtooth", color: "hsl(200 85% 55%)" },
];

interface WaveformSelectorWidgetProps {
  onExplored?: (explored: Set<OscillatorType>) => void;
  className?: string;
}

/**
 * Lesson 1.4 — Waveform selector with live canvas + audio.
 * Tracks which waveforms user has explored.
 */
export function WaveformSelectorWidget({ onExplored, className = "" }: WaveformSelectorWidgetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const [activeType, setActiveType] = useState<OscillatorType>("sine");
  const [playing, setPlaying] = useState(false);
  const [explored, setExplored] = useState<Set<OscillatorType>>(new Set(["sine"]));

  useEffect(() => { onExplored?.(explored); }, [explored, onExplored]);

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const wf = WAVEFORMS.find((w) => w.type === activeType)!;
    let phase = 0;
    const freq = 3; // visual cycles

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Center line
      ctx.strokeStyle = "hsl(0 0% 100% / 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();

      // Wave
      ctx.strokeStyle = wf.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const t = (x / w) * freq * Math.PI * 2 + phase;
        let y: number;
        switch (activeType) {
          case "square": y = Math.sign(Math.sin(t)); break;
          case "triangle": y = (2 / Math.PI) * Math.asin(Math.sin(t)); break;
          case "sawtooth": y = 2 * ((t / (2 * Math.PI)) - Math.floor(0.5 + t / (2 * Math.PI))); break;
          default: y = Math.sin(t);
        }
        const py = h / 2 - y * h * 0.35;
        if (x === 0) ctx.moveTo(x, py); else ctx.lineTo(x, py);
      }
      ctx.stroke();
      phase += 0.02;
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [activeType]);

  const selectWaveform = useCallback((type: OscillatorType) => {
    setActiveType(type);
    setExplored((prev) => new Set([...prev, type]));
    if (oscRef.current) oscRef.current.type = type;
  }, []);

  const togglePlay = useCallback(() => {
    if (playing) {
      oscRef.current?.stop(); oscRef.current = null;
      setPlaying(false); return;
    }
    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext();
      const ac = ctxRef.current;
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = activeType;
      osc.frequency.value = 330;
      g.gain.value = 0.12;
      osc.connect(g).connect(ac.destination);
      osc.start();
      oscRef.current = osc; gainRef.current = g;
      setPlaying(true);
    } catch { /* */ }
  }, [activeType, playing]);

  useEffect(() => () => { oscRef.current?.stop(); }, []);

  return (
    <div className={`rounded-xl border border-border bg-card/50 p-5 space-y-4 ${className}`}>
      <canvas
        ref={canvasRef}
        width={480} height={100}
        className="w-full h-[100px] rounded-lg bg-background/50"
      />

      {/* Waveform tabs */}
      <div className="flex gap-2">
        {WAVEFORMS.map((wf) => {
          const isActive = activeType === wf.type;
          const isExplored = explored.has(wf.type);
          return (
            <button
              key={wf.type}
              onClick={() => selectWaveform(wf.type)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono transition-all border ${
                isActive
                  ? "border-primary/40 bg-primary/10 text-primary shadow-[0_0_8px_hsl(var(--primary)/0.15)]"
                  : "border-border bg-secondary/20 text-muted-foreground hover:bg-secondary/40"
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                {isExplored && !isActive && <CheckCircle2 className="h-3 w-3 text-primary/60" />}
                {wf.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline" size="sm"
          className={`gap-2 ${playing ? "text-primary border-primary/40" : ""}`}
          onClick={togglePlay}
        >
          {playing ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? "Stop" : "Listen"}
        </Button>
        <span className="text-[10px] font-mono text-muted-foreground">
          {explored.size}/4 explored
        </span>
      </div>
    </div>
  );
}
