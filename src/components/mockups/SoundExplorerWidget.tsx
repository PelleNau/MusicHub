import { useRef, useState, useEffect, useCallback } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Volume2, Play, Square } from "lucide-react";
import { LevelMeter } from "./LevelMeter";

interface SoundExplorerWidgetProps {
  onInteraction?: (changed: { pitch: boolean; loudness: boolean }) => void;
  className?: string;
}

/**
 * Lesson 1.1 — Combined pitch + loudness + waveform widget.
 * Tracks whether user modified both parameters.
 */
export function SoundExplorerWidget({ onInteraction, className = "" }: SoundExplorerWidgetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const [frequency, setFrequency] = useState(220);
  const [loudness, setLoudness] = useState(0.15);
  const [playing, setPlaying] = useState(false);
  const [pitchChanged, setPitchChanged] = useState(false);
  const [loudnessChanged, setLoudnessChanged] = useState(false);

  // Report interaction state
  useEffect(() => {
    onInteraction?.({ pitch: pitchChanged, loudness: loudnessChanged });
  }, [pitchChanged, loudnessChanged, onInteraction]);

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

      // Grid
      ctx.strokeStyle = "hsl(166 100% 50% / 0.06)";
      ctx.lineWidth = 1;
      for (let y = 0; y < h; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }
      // Center line
      ctx.strokeStyle = "hsl(166 100% 50% / 0.12)";
      ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();

      // Waveform
      const cycles = frequency / 60;
      const amp = loudness / 0.3; // normalize to visual amplitude
      ctx.strokeStyle = `hsl(166 100% 50% / ${0.4 + amp * 0.5})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const t = x / w;
        const y = h / 2 + Math.sin((t * cycles * Math.PI * 2) + phase) * (h * 0.35 * Math.min(amp, 1));
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += 0.03;
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [frequency, loudness]);

  // Audio
  const togglePlay = useCallback(() => {
    if (playing) {
      oscRef.current?.stop();
      oscRef.current = null;
      setPlaying(false);
      return;
    }
    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext();
      const ac = ctxRef.current;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      const analyser = ac.createAnalyser();
      analyser.fftSize = 256;
      osc.type = "sine";
      osc.frequency.value = frequency;
      gain.gain.value = loudness;
      osc.connect(gain).connect(analyser).connect(ac.destination);
      osc.start();
      oscRef.current = osc;
      gainRef.current = gain;
      analyserRef.current = analyser;
      setPlaying(true);
    } catch { /* no audio */ }
  }, [frequency, loudness, playing]);

  // Update live params
  useEffect(() => {
    if (oscRef.current) oscRef.current.frequency.value = frequency;
  }, [frequency]);
  useEffect(() => {
    if (gainRef.current) gainRef.current.gain.value = loudness;
  }, [loudness]);

  // Cleanup
  useEffect(() => () => { oscRef.current?.stop(); }, []);

  return (
    <div className={`rounded-xl border border-border bg-card/50 p-5 space-y-4 ${className}`}>
      <div className="flex gap-3">
        <canvas
          ref={canvasRef}
          width={480}
          height={100}
          className="flex-1 h-[100px] rounded-lg bg-background/50"
        />
        {playing && (
          <LevelMeter analyser={analyserRef.current} height={100} width={20} />
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className={`h-10 w-10 rounded-full shrink-0 ${playing ? "text-primary bg-primary/20" : "text-muted-foreground"}`}
          onClick={togglePlay}
        >
          {playing ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <span className="text-xs font-mono text-muted-foreground w-12">{playing ? "Stop" : "Play"}</span>
      </div>

      {/* Pitch slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
          <span>Pitch (Frequency)</span>
          <span className="text-primary font-semibold">{frequency} Hz</span>
        </div>
        <Slider
          min={80} max={2000} step={10}
          value={[frequency]}
          onValueChange={([v]) => { setFrequency(v); setPitchChanged(true); }}
        />
        <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
          <span>Low</span><span>High</span>
        </div>
      </div>

      {/* Loudness slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
          <span>Loudness (Volume)</span>
          <span className="text-primary font-semibold">{Math.round(loudness * 100)}%</span>
        </div>
        <Slider
          min={0} max={50} step={1}
          value={[Math.round(loudness * 100)]}
          onValueChange={([v]) => { setLoudness(v / 100); setLoudnessChanged(true); }}
        />
        <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
          <span>Quiet</span><span>Loud</span>
        </div>
      </div>
    </div>
  );
}
