import { useState, useCallback, useMemo } from "react";
import type { MidiNote } from "@/components/studio/PianoRollTransforms";
import { useNoteAudition } from "@/hooks/useNoteAudition";

/** GM drum map subset */
const DRUM_MAP: { name: string; pitch: number }[] = [
  { name: "Kick", pitch: 36 },
  { name: "Snare", pitch: 38 },
  { name: "Rim", pitch: 37 },
  { name: "Clap", pitch: 39 },
  { name: "CH Hat", pitch: 42 },
  { name: "OH Hat", pitch: 46 },
  { name: "Lo Tom", pitch: 41 },
  { name: "Mid Tom", pitch: 47 },
  { name: "Hi Tom", pitch: 50 },
  { name: "Crash", pitch: 49 },
  { name: "Ride", pitch: 51 },
  { name: "Perc", pitch: 56 },
];

const ROW_H = 24;
const DEFAULT_VELOCITY = 100;

interface StepSequencerProps {
  notes: MidiNote[];
  onChange: (notes: MidiNote[]) => void;
  clipDuration: number;
  snapBeats: number;
  beatsPerBar: number;
  pxPerBeat: number;
  currentBeat?: number;
}

export function StepSequencer({
  notes,
  onChange,
  clipDuration,
  snapBeats,
  beatsPerBar,
  pxPerBeat,
  currentBeat,
}: StepSequencerProps) {
  const { playNote } = useNoteAudition();
  const [velocity, setVelocity] = useState(DEFAULT_VELOCITY);

  const stepSize = snapBeats > 0 ? snapBeats : 0.25;

  const steps = useMemo(() => {
    const count = Math.max(1, Math.ceil(clipDuration / stepSize));
    return Array.from({ length: count }, (_, i) => i * stepSize);
  }, [clipDuration, stepSize]);

  const stepWidth = stepSize * pxPerBeat;
  const totalWidth = steps.length * stepWidth;

  // Build a set of active cells: "pitch:step"
  const activeCells = useMemo(() => {
    const set = new Set<string>();
    for (const n of notes) {
      const step = Math.round(n.start / stepSize) * stepSize;
      set.add(`${n.pitch}:${step}`);
    }
    return set;
  }, [notes, stepSize]);

  const toggleCell = useCallback((pitch: number, step: number) => {
    const key = `${pitch}:${step}`;
    if (activeCells.has(key)) {
      // Remove note at this position
      onChange(notes.filter((n) => !(n.pitch === pitch && Math.abs(n.start - step) < stepSize * 0.5)));
    } else {
      // Add note
      const newNote: MidiNote = {
        id: crypto.randomUUID(),
        pitch,
        start: step,
        duration: stepSize,
        velocity,
      };
      onChange([...notes, newNote]);
      playNote(pitch, velocity);
    }
  }, [notes, onChange, activeCells, stepSize, velocity, playNote]);

  const currentStep = currentBeat !== undefined ? Math.floor(currentBeat / stepSize) : -1;

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Velocity selector */}
      <div className="flex items-center gap-2 px-3 py-1 border-b shrink-0" style={{ borderColor: "hsl(var(--border))" }}>
        <span className="text-[8px] font-mono text-foreground/55">STEP SEQ</span>
        <span className="text-[7px] font-mono text-foreground/50 ml-2">VEL</span>
        <input
          type="range"
          min={1}
          max={127}
          value={velocity}
          onChange={(e) => setVelocity(parseInt(e.target.value))}
          className="w-20 h-1 accent-primary"
        />
        <span className="text-[8px] font-mono text-foreground/60 w-6 text-right">{velocity}</span>
        <span className="text-[7px] font-mono text-foreground/45 ml-auto">{steps.length} steps · {stepSize} beat grid</span>
      </div>

      <div className="flex-1 overflow-auto min-h-0">
        <div className="flex">
          {/* Drum labels */}
          <div className="sticky left-0 z-10 shrink-0" style={{ width: 60 }}>
            {DRUM_MAP.map((drum) => (
              <div
                key={drum.pitch}
                className="flex items-center justify-end pr-2 border-b text-[8px] font-mono text-foreground/60 select-none"
                style={{ height: ROW_H, borderColor: "hsl(var(--foreground) / 0.06)", backgroundColor: "hsl(var(--muted) / 0.45)" }}
              >
                {drum.name}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="relative" style={{ width: totalWidth }}>
            {DRUM_MAP.map((drum, rowIdx) => (
              <div key={drum.pitch} className="flex border-b" style={{ height: ROW_H, borderColor: "hsl(var(--foreground) / 0.06)" }}>
                {steps.map((step, stepIdx) => {
                  const isActive = activeCells.has(`${drum.pitch}:${step}`);
                  const isBar = Math.abs(step % beatsPerBar) < 0.001;
                  const isCurrent = Math.floor(step / stepSize) === currentStep;
                  return (
                    <div
                      key={stepIdx}
                      onClick={() => toggleCell(drum.pitch, step)}
                      className="relative cursor-pointer transition-colors"
                      style={{
                        width: stepWidth,
                        height: ROW_H,
                        borderLeft: `1px solid ${isBar ? "hsl(var(--foreground) / 0.12)" : "hsl(var(--foreground) / 0.04)"}`,
                        backgroundColor: isCurrent
                          ? "hsl(var(--primary) / 0.08)"
                          : isBar
                          ? "hsl(var(--foreground) / 0.02)"
                          : "transparent",
                      }}
                    >
                      {isActive && (
                        <div
                          className="absolute inset-1 rounded-[3px]"
                          style={{
                            backgroundColor: "hsl(var(--primary) / 0.7)",
                            boxShadow: "0 0 4px hsl(var(--primary) / 0.3)",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
