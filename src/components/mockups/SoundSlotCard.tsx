import { useCallback, useRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Play, X } from "lucide-react";

const SOUND_PRESETS = [
  { id: "bell", label: "Bell", freq: 880, type: "sine" as OscillatorType, emoji: "🔔" },
  { id: "bass", label: "Bass", freq: 110, type: "square" as OscillatorType, emoji: "🎸" },
  { id: "pad", label: "Pad", freq: 330, type: "triangle" as OscillatorType, emoji: "🌊" },
  { id: "lead", label: "Lead", freq: 660, type: "sawtooth" as OscillatorType, emoji: "⚡" },
  { id: "tone", label: "Tone", freq: 440, type: "sine" as OscillatorType, emoji: "🎵" },
  { id: "buzz", label: "Buzz", freq: 220, type: "square" as OscillatorType, emoji: "🐝" },
];

export interface SoundSlot {
  presetId: string | null;
  pitch: number;
  volume: number;
}

interface SoundSlotCardProps {
  slot: SoundSlot;
  index: number;
  color: string;
  onChange: (slot: SoundSlot) => void;
  audioContext?: AudioContext;
  className?: string;
}

/**
 * Capstone — Individual sound slot: preset picker, pitch, volume.
 */
export function SoundSlotCard({ slot, index, color, onChange, audioContext, className = "" }: SoundSlotCardProps) {
  const ctxRef = useRef<AudioContext | null>(audioContext ?? null);

  const preset = SOUND_PRESETS.find((p) => p.id === slot.presetId);

  const preview = useCallback(() => {
    if (!preset) return;
    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext();
      const ac = ctxRef.current;
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = preset.type;
      osc.frequency.value = slot.pitch;
      g.gain.setValueAtTime(slot.volume / 100, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.8);
      osc.connect(g).connect(ac.destination);
      osc.start(); osc.stop(ac.currentTime + 0.8);
    } catch { /* */ }
  }, [preset, slot.pitch, slot.volume]);

  return (
    <div className={`rounded-lg border bg-card/50 p-3 space-y-2 ${className}`} style={{ borderColor: color + "40" }}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-semibold" style={{ color }}>Lane {index + 1}</span>
        {preset && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={preview}>
            <Play className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Preset picker */}
      {!slot.presetId ? (
        <div className="grid grid-cols-3 gap-1">
          {SOUND_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => onChange({ ...slot, presetId: p.id, pitch: p.freq })}
              className="p-2 rounded border border-border bg-secondary/20 hover:bg-secondary/40 text-center transition-all"
            >
              <div className="text-sm">{p.emoji}</div>
              <div className="text-[9px] font-mono">{p.label}</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono">{preset?.emoji} {preset?.label}</span>
            <button
              onClick={() => onChange({ presetId: null, pitch: 440, volume: 50 })}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
              <span>Pitch</span><span>{slot.pitch} Hz</span>
            </div>
            <Slider min={80} max={1200} step={10} value={[slot.pitch]}
              onValueChange={([v]) => onChange({ ...slot, pitch: v })}
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[9px] font-mono text-muted-foreground">
              <span>Volume</span><span>{slot.volume}%</span>
            </div>
            <Slider min={0} max={100} step={5} value={[slot.volume]}
              onValueChange={([v]) => onChange({ ...slot, volume: v })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
