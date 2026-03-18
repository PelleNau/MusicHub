import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square, CheckCircle2 } from "lucide-react";
import { SoundSlotCard, type SoundSlot } from "./SoundSlotCard";

const LANE_COLORS = [
  "hsl(166 100% 50%)",
  "hsl(340 85% 60%)",
  "hsl(45 100% 55%)",
];

const INITIAL_SLOTS: SoundSlot[] = [
  { presetId: null, pitch: 440, volume: 50 },
  { presetId: null, pitch: 440, volume: 50 },
  { presetId: null, pitch: 440, volume: 50 },
];

const SOUND_PRESETS_MAP: Record<string, { type: OscillatorType; freq: number }> = {
  bell: { type: "sine", freq: 880 },
  bass: { type: "square", freq: 110 },
  pad: { type: "triangle", freq: 330 },
  lead: { type: "sawtooth", freq: 660 },
  tone: { type: "sine", freq: 440 },
  buzz: { type: "square", freq: 220 },
};

interface MiniTimelineProps {
  onComplete?: () => void;
  className?: string;
}

/**
 * Capstone — 3-lane, 8-second scene builder.
 * User picks 3 contrasting sounds, adjusts parameters, plays back.
 */
export function MiniTimeline({ onComplete, className = "" }: MiniTimelineProps) {
  const [slots, setSlots] = useState<SoundSlot[]>(INITIAL_SLOTS);
  const [playing, setPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const timeoutRef = useRef<number>(0);

  const filledCount = slots.filter((s) => s.presetId).length;
  const allFilled = filledCount === 3;
  // Check for "contrasting" — at least 2 different presets
  const uniquePresets = new Set(slots.filter((s) => s.presetId).map((s) => s.presetId));
  const isContrasting = uniquePresets.size >= 2;
  const isComplete = allFilled && isContrasting;

  const updateSlot = useCallback((idx: number, slot: SoundSlot) => {
    setSlots((prev) => prev.map((s, i) => (i === idx ? slot : s)));
  }, []);

  const playScene = useCallback(() => {
    if (playing || !allFilled) return;
    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext();
      const ac = ctxRef.current;
      const duration = 8;
      const slotDuration = duration / 3;

      slots.forEach((slot, i) => {
        if (!slot.presetId) return;
        const preset = SOUND_PRESETS_MAP[slot.presetId];
        if (!preset) return;

        const startTime = ac.currentTime + i * slotDuration;
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.type = preset.type;
        osc.frequency.value = slot.pitch;
        g.gain.setValueAtTime(0, startTime);
        g.gain.linearRampToValueAtTime(slot.volume / 200, startTime + 0.1);
        g.gain.setValueAtTime(slot.volume / 200, startTime + slotDuration - 0.2);
        g.gain.linearRampToValueAtTime(0, startTime + slotDuration);
        osc.connect(g).connect(ac.destination);
        osc.start(startTime);
        osc.stop(startTime + slotDuration);
      });

      setPlaying(true);
      setPlayProgress(0);

      // Animate progress
      const totalMs = duration * 1000;
      const start = performance.now();
      const tick = () => {
        const elapsed = performance.now() - start;
        setPlayProgress(Math.min(elapsed / totalMs, 1));
        if (elapsed < totalMs) {
          timeoutRef.current = requestAnimationFrame(tick);
        } else {
          setPlaying(false);
          setPlayProgress(0);
        }
      };
      timeoutRef.current = requestAnimationFrame(tick);
    } catch { /* */ }
  }, [playing, allFilled, slots]);

  useEffect(() => () => cancelAnimationFrame(timeoutRef.current), []);

  return (
    <div className={`rounded-xl border border-border bg-card/50 p-5 space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-semibold">Sound Scene — 8 seconds</span>
        <span className="text-[10px] font-mono text-muted-foreground">{filledCount}/3 sounds</span>
      </div>

      {/* Visual timeline bar */}
      <div className="h-10 rounded-lg bg-background/50 flex overflow-hidden relative border border-border/50">
        {slots.map((slot, i) => (
          <div
            key={i}
            className="flex-1 flex items-center justify-center text-[10px] font-mono border-r border-border/30 last:border-r-0"
            style={{ backgroundColor: slot.presetId ? LANE_COLORS[i] + "20" : "transparent" }}
          >
            {slot.presetId ? `${slot.presetId}` : "empty"}
          </div>
        ))}
        {/* Playhead */}
        {playing && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-primary z-10 transition-none"
            style={{ left: `${playProgress * 100}%` }}
          />
        )}
      </div>

      {/* Slot cards */}
      <div className="grid grid-cols-3 gap-3">
        {slots.map((slot, i) => (
          <SoundSlotCard
            key={i}
            slot={slot}
            index={i}
            color={LANE_COLORS[i]}
            onChange={(s) => updateSlot(i, s)}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline" size="sm"
            className={`gap-2 ${playing ? "text-primary border-primary/40" : ""}`}
            onClick={playScene}
            disabled={!allFilled || playing}
          >
            {playing ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {playing ? "Playing..." : "Play Scene"}
          </Button>
        </div>
        {isComplete && (
          <Button size="sm" onClick={onComplete} className="gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> Complete Capstone
          </Button>
        )}
      </div>

      {allFilled && !isContrasting && (
        <p className="text-[10px] font-mono text-warning text-center">
          Use at least 2 different sounds for contrast
        </p>
      )}
    </div>
  );
}
