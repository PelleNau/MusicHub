import { useRef, useState, useCallback, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Square, CheckCircle2 } from "lucide-react";
import { LevelMeter } from "./LevelMeter";

interface DualVolumeBalanceProps {
  targetRange?: [number, number]; // acceptable dB difference range
  onBalanced?: () => void;
  className?: string;
}

/**
 * Lesson 1.3 — Two oscillators with independent volume sliders and level meters.
 * Task: balance volumes within a target range.
 */
export function DualVolumeBalance({ targetRange = [-3, 3], onBalanced, className = "" }: DualVolumeBalanceProps) {
  const ctxRef = useRef<AudioContext | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volA, setVolA] = useState(0.3);
  const [volB, setVolB] = useState(0.08);
  const [balanced, setBalanced] = useState(false);

  const oscARef = useRef<OscillatorNode | null>(null);
  const oscBRef = useRef<OscillatorNode | null>(null);
  const gainARef = useRef<GainNode | null>(null);
  const gainBRef = useRef<GainNode | null>(null);
  const analyserARef = useRef<AnalyserNode | null>(null);
  const analyserBRef = useRef<AnalyserNode | null>(null);

  // Check balance
  useEffect(() => {
    const diff = Math.abs(volA - volB);
    const isBalanced = diff < 0.08; // within ~8% of each other
    setBalanced(isBalanced);
    if (isBalanced && volA > 0.05 && volB > 0.05) onBalanced?.();
  }, [volA, volB, onBalanced]);

  const togglePlay = useCallback(() => {
    if (playing) {
      oscARef.current?.stop(); oscBRef.current?.stop();
      oscARef.current = null; oscBRef.current = null;
      setPlaying(false);
      return;
    }
    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext();
      const ac = ctxRef.current;

      // Sound A — low tone
      const oscA = ac.createOscillator();
      const gA = ac.createGain();
      const anA = ac.createAnalyser(); anA.fftSize = 256;
      oscA.type = "sine"; oscA.frequency.value = 220;
      gA.gain.value = volA;
      oscA.connect(gA).connect(anA).connect(ac.destination);
      oscA.start();

      // Sound B — higher tone
      const oscB = ac.createOscillator();
      const gB = ac.createGain();
      const anB = ac.createAnalyser(); anB.fftSize = 256;
      oscB.type = "triangle"; oscB.frequency.value = 440;
      gB.gain.value = volB;
      oscB.connect(gB).connect(anB).connect(ac.destination);
      oscB.start();

      oscARef.current = oscA; oscBRef.current = oscB;
      gainARef.current = gA; gainBRef.current = gB;
      analyserARef.current = anA; analyserBRef.current = anB;
      setPlaying(true);
    } catch { /* */ }
  }, [playing, volA, volB]);

  // Live gain updates
  useEffect(() => { if (gainARef.current) gainARef.current.gain.value = volA; }, [volA]);
  useEffect(() => { if (gainBRef.current) gainBRef.current.gain.value = volB; }, [volB]);

  // Cleanup
  useEffect(() => () => {
    oscARef.current?.stop(); oscBRef.current?.stop();
  }, []);

  return (
    <div className={`rounded-xl border border-border bg-card/50 p-5 space-y-4 ${className}`}>
      <p className="text-xs font-mono text-muted-foreground text-center">
        Adjust the volume sliders to balance both sounds equally
      </p>

      <div className="flex justify-center">
        <Button
          variant="outline" size="sm"
          className={`gap-2 ${playing ? "text-primary border-primary/40" : ""}`}
          onClick={togglePlay}
        >
          {playing ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? "Stop" : "Play Both"}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Sound A */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold">Sound A</span>
            <span className="text-[10px] font-mono text-primary">220 Hz · Sine</span>
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Slider
                min={0} max={50} step={1}
                value={[Math.round(volA * 100)]}
                onValueChange={([v]) => setVolA(v / 100)}
              />
              <span className="text-[10px] font-mono text-muted-foreground">{Math.round(volA * 100)}%</span>
            </div>
            {playing && <LevelMeter analyser={analyserARef.current} height={60} width={16} />}
          </div>
        </div>

        {/* Sound B */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold">Sound B</span>
            <span className="text-[10px] font-mono text-accent">440 Hz · Triangle</span>
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Slider
                min={0} max={50} step={1}
                value={[Math.round(volB * 100)]}
                onValueChange={([v]) => setVolB(v / 100)}
              />
              <span className="text-[10px] font-mono text-muted-foreground">{Math.round(volB * 100)}%</span>
            </div>
            {playing && <LevelMeter analyser={analyserBRef.current} height={60} width={16} />}
          </div>
        </div>
      </div>

      {/* Balance indicator */}
      <div className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-mono transition-all ${
        balanced ? "bg-primary/10 text-primary" : "bg-secondary/30 text-muted-foreground"
      }`}>
        {balanced ? <CheckCircle2 className="h-4 w-4" /> : null}
        {balanced ? "Balanced! Great job." : "Keep adjusting..."}
      </div>
    </div>
  );
}
