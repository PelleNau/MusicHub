import { useRef, useState, useCallback, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";

interface PitchScrubWidgetProps {
  onPitchChange?: (freq: number) => void;
  className?: string;
}

/**
 * Lesson 1.2 — Continuous pitch scrub mapping position to frequency.
 */
export function PitchScrubWidget({ onPitchChange, className = "" }: PitchScrubWidgetProps) {
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const [frequency, setFrequency] = useState(440);
  const [playing, setPlaying] = useState(false);

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
      const g = ac.createGain();
      osc.type = "sine";
      osc.frequency.value = frequency;
      g.gain.value = 0.12;
      osc.connect(g).connect(ac.destination);
      osc.start();
      oscRef.current = osc;
      gainRef.current = g;
      setPlaying(true);
    } catch { /* */ }
  }, [frequency, playing]);

  useEffect(() => {
    if (oscRef.current) oscRef.current.frequency.value = frequency;
  }, [frequency]);

  useEffect(() => () => { oscRef.current?.stop(); }, []);

  // Pitch label
  const pitchLabel = frequency < 250 ? "Low" : frequency < 600 ? "Mid" : frequency < 1200 ? "High" : "Very High";

  return (
    <div className={`rounded-xl border border-border bg-card/50 p-5 space-y-4 ${className}`}>
      <div className="text-center space-y-1">
        <p className="text-3xl font-mono font-bold text-primary">{frequency} Hz</p>
        <p className="text-xs font-mono text-muted-foreground">{pitchLabel}</p>
      </div>

      {/* Visual frequency bar */}
      <div className="h-16 rounded-lg bg-background/50 overflow-hidden relative">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 transition-all duration-75"
          style={{ width: `${((frequency - 80) / (2000 - 80)) * 100}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Frequency markers */}
          {[100, 440, 880, 1760].map((f) => (
            <div
              key={f}
              className="absolute h-full w-px bg-border"
              style={{ left: `${((f - 80) / (2000 - 80)) * 100}%` }}
            >
              <span className="absolute -bottom-4 -translate-x-1/2 text-[8px] font-mono text-muted-foreground">{f}</span>
            </div>
          ))}
        </div>
      </div>

      <Slider
        min={80} max={2000} step={1}
        value={[frequency]}
        onValueChange={([v]) => { setFrequency(v); onPitchChange?.(v); }}
        className="w-full"
      />

      <div className="flex justify-center">
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 ${playing ? "text-primary border-primary/40" : ""}`}
          onClick={togglePlay}
        >
          {playing ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? "Stop" : "Listen"}
        </Button>
      </div>
    </div>
  );
}
