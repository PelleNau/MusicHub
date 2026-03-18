import { useRef, useState, useCallback, useEffect } from "react";
import { Volume2 } from "lucide-react";

/** Simulated preset sounds using oscillator combinations */
const PRESETS = [
  { id: "sine-low", label: "Pure Tone", emoji: "🔔", freq: 262, type: "sine" as OscillatorType, desc: "Clean sine wave" },
  { id: "square-buzz", label: "Buzzy Synth", emoji: "⚡", freq: 330, type: "square" as OscillatorType, desc: "Bright square wave" },
  { id: "saw-lead", label: "Saw Lead", emoji: "🎹", freq: 440, type: "sawtooth" as OscillatorType, desc: "Rich sawtooth wave" },
  { id: "tri-soft", label: "Soft Pad", emoji: "🌊", freq: 262, type: "triangle" as OscillatorType, desc: "Gentle triangle wave" },
  { id: "sine-high", label: "Flute-like", emoji: "🎵", freq: 880, type: "sine" as OscillatorType, desc: "High pure tone" },
  { id: "square-low", label: "Bass Synth", emoji: "🎸", freq: 110, type: "square" as OscillatorType, desc: "Deep square bass" },
];

interface TimbrePresetPlayerProps {
  onPresetPlayed?: (presetId: string) => void;
  className?: string;
}

/**
 * Lesson 1.5 — Grid of preset sound buttons. Each plays a short tone.
 */
export function TimbrePresetPlayer({ onPresetPlayed, className = "" }: TimbrePresetPlayerProps) {
  const ctxRef = useRef<AudioContext | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playedPresets, setPlayedPresets] = useState<Set<string>>(new Set());

  const playPreset = useCallback((preset: typeof PRESETS[0]) => {
    if (playingId) return;
    onPresetPlayed?.(preset.id);
    setPlayedPresets((prev) => new Set([...prev, preset.id]));

    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext();
      const ac = ctxRef.current;
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = preset.type;
      osc.frequency.value = preset.freq;
      g.gain.setValueAtTime(0.12, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 1);
      osc.connect(g).connect(ac.destination);
      osc.start();
      osc.stop(ac.currentTime + 1);
      setPlayingId(preset.id);
      osc.onended = () => setPlayingId(null);
    } catch { /* */ }
  }, [playingId, onPresetPlayed]);

  return (
    <div className={`rounded-xl border border-border bg-card/50 p-5 space-y-3 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-xs font-mono text-muted-foreground">Tap to listen</span>
        <span className="text-[10px] font-mono text-primary">{playedPresets.size}/{PRESETS.length} heard</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {PRESETS.map((preset) => {
          const isPlaying = playingId === preset.id;
          const wasPlayed = playedPresets.has(preset.id);
          return (
            <button
              key={preset.id}
              onClick={() => playPreset(preset)}
              className={`p-3 rounded-lg border text-left transition-all ${
                isPlaying
                  ? "border-primary/60 bg-primary/15 shadow-[0_0_12px_hsl(var(--primary)/0.2)]"
                  : wasPlayed
                  ? "border-primary/20 bg-primary/5"
                  : "border-border bg-secondary/20 hover:bg-secondary/40"
              }`}
            >
              <div className="text-xl mb-1">{preset.emoji}</div>
              <div className="text-xs font-mono font-semibold">{preset.label}</div>
              <div className="text-[9px] font-mono text-muted-foreground mt-0.5">{preset.desc}</div>
              {isPlaying && <Volume2 className="h-3 w-3 text-primary mt-1 animate-pulse" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
