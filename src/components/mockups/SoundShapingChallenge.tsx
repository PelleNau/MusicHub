import { useRef, useState, useCallback, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, Square, CheckCircle2, Target } from "lucide-react";

const CHALLENGES = [
  { prompt: "Make this sound bright and quiet", targetPitch: "high", targetLoudness: "low", targetWaveform: null },
  { prompt: "Make this sound deep and loud", targetPitch: "low", targetLoudness: "high", targetWaveform: null },
  { prompt: "Make this sound buzzy and mid-range", targetPitch: "mid", targetLoudness: "mid", targetWaveform: "square" as OscillatorType },
];

interface SoundShapingChallengeProps {
  onComplete?: () => void;
  className?: string;
}

/**
 * Lesson 1.7 — Prompt-driven parameter task.
 * User modifies pitch, volume, waveform to match a description.
 */
export function SoundShapingChallenge({ onComplete, className = "" }: SoundShapingChallengeProps) {
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const [challengeIdx, setChallengeIdx] = useState(0);
  const [frequency, setFrequency] = useState(440);
  const [loudness, setLoudness] = useState(0.15);
  const [waveform, setWaveform] = useState<OscillatorType>("sine");
  const [playing, setPlaying] = useState(false);
  const [paramsChanged, setParamsChanged] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState(false);

  const challenge = CHALLENGES[challengeIdx];

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
      osc.type = waveform;
      osc.frequency.value = frequency;
      g.gain.value = loudness;
      osc.connect(g).connect(ac.destination);
      osc.start();
      oscRef.current = osc; gainRef.current = g;
      setPlaying(true);
    } catch { /* */ }
  }, [playing, frequency, loudness, waveform]);

  useEffect(() => { if (oscRef.current) oscRef.current.frequency.value = frequency; }, [frequency]);
  useEffect(() => { if (gainRef.current) gainRef.current.gain.value = loudness; }, [loudness]);
  useEffect(() => { if (oscRef.current) oscRef.current.type = waveform; }, [waveform]);
  useEffect(() => () => { oscRef.current?.stop(); }, []);

  const handleNext = useCallback(() => {
    oscRef.current?.stop(); oscRef.current = null; setPlaying(false);
    if (challengeIdx < CHALLENGES.length - 1) {
      setChallengeIdx((i) => i + 1);
      setParamsChanged(new Set());
      setFrequency(440); setLoudness(0.15); setWaveform("sine");
    } else {
      setCompleted(true);
      onComplete?.();
    }
  }, [challengeIdx, onComplete]);

  const canAdvance = paramsChanged.size >= 2;

  if (completed) {
    return (
      <div className={`rounded-xl border border-primary/30 bg-primary/5 p-6 text-center space-y-3 ${className}`}>
        <CheckCircle2 className="h-8 w-8 text-primary mx-auto" />
        <p className="font-mono font-semibold">All challenges complete!</p>
        <p className="text-xs text-muted-foreground">You've learned to shape sound intentionally.</p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-border bg-card/50 p-5 space-y-4 ${className}`}>
      {/* Prompt card */}
      <div className="flex items-start gap-3 p-4 rounded-lg border border-accent/20 bg-accent/5">
        <Target className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <div>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Challenge {challengeIdx + 1}/{CHALLENGES.length}</p>
          <p className="text-sm font-mono font-semibold mt-1">{challenge.prompt}</p>
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          variant="outline" size="sm"
          className={`gap-2 ${playing ? "text-primary border-primary/40" : ""}`}
          onClick={togglePlay}
        >
          {playing ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? "Stop" : "Listen"}
        </Button>
      </div>

      {/* Controls */}
      <div className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
            <span>Pitch</span>
            <span className="text-primary">{frequency} Hz</span>
          </div>
          <Slider min={80} max={2000} step={10} value={[frequency]}
            onValueChange={([v]) => { setFrequency(v); setParamsChanged((p) => new Set([...p, "pitch"])); }}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
            <span>Loudness</span>
            <span className="text-primary">{Math.round(loudness * 100)}%</span>
          </div>
          <Slider min={0} max={50} step={1} value={[Math.round(loudness * 100)]}
            onValueChange={([v]) => { setLoudness(v / 100); setParamsChanged((p) => new Set([...p, "loudness"])); }}
          />
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-mono text-muted-foreground">Waveform</span>
          <div className="flex gap-1.5">
            {(["sine", "square", "triangle", "sawtooth"] as OscillatorType[]).map((wf) => (
              <button
                key={wf}
                onClick={() => { setWaveform(wf); setParamsChanged((p) => new Set([...p, "waveform"])); }}
                className={`flex-1 py-1.5 rounded text-[10px] font-mono border transition-all ${
                  waveform === wf ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-secondary/20 text-muted-foreground"
                }`}
              >
                {wf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advance */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-muted-foreground">
          {paramsChanged.size}/2 parameters changed
        </span>
        <Button size="sm" disabled={!canAdvance} onClick={handleNext}>
          {challengeIdx < CHALLENGES.length - 1 ? "Next Challenge" : "Complete"}
        </Button>
      </div>
    </div>
  );
}
