import { Music, X } from "lucide-react";
import { useMemo, useState } from "react";

import type { MidiNote } from "@/components/studio/PianoRollTransforms";

export interface StrummingOptions {
  direction: "up" | "down";
  speed: number;
  randomness: number;
}

interface StrummingDialogProps {
  notes: MidiNote[];
  open?: boolean;
  onApply: (options: StrummingOptions) => void;
  onClose: () => void;
}

const STRUMMING_PRESETS = {
  gentle: { direction: "down" as const, speed: 30, randomness: 10 },
  moderate: { direction: "down" as const, speed: 15, randomness: 20 },
  fast: { direction: "down" as const, speed: 8, randomness: 15 },
  upstroke: { direction: "up" as const, speed: 12, randomness: 15 },
};

function detectChords(notes: MidiNote[], timeWindow = 0.1): MidiNote[][] {
  if (notes.length === 0) return [];
  const sorted = [...notes].sort((a, b) => a.start - b.start);
  const chords: MidiNote[][] = [];
  let currentChord: MidiNote[] = [sorted[0]];

  for (let index = 1; index < sorted.length; index += 1) {
    const note = sorted[index];
    const previous = sorted[index - 1];
    if (Math.abs(note.start - previous.start) <= timeWindow) {
      currentChord.push(note);
    } else {
      if (currentChord.length >= 3) chords.push(currentChord);
      currentChord = [note];
    }
  }

  if (currentChord.length >= 3) chords.push(currentChord);
  return chords;
}

export function StrummingDialog({
  notes,
  open = true,
  onApply,
  onClose,
}: StrummingDialogProps) {
  const [direction, setDirection] = useState<"up" | "down">("down");
  const [speed, setSpeed] = useState(15);
  const [randomness, setRandomness] = useState(20);
  const chords = useMemo(() => detectChords(notes), [notes]);

  if (!open) return null;

  const applyPreset = (presetName: keyof typeof STRUMMING_PRESETS) => {
    const preset = STRUMMING_PRESETS[presetName];
    setDirection(preset.direction);
    setSpeed(preset.speed);
    setRandomness(preset.randomness);
  };

  const handleApply = () => {
    onApply({ direction, speed, randomness });
    onClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleApply();
    } else if (event.key === "Escape") {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-[420px] rounded-lg border border-[var(--border-strong)] bg-[var(--surface-2)] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-[var(--primary)]" />
            <h3 className="text-sm font-semibold text-foreground">Strumming Effect</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-4">
          {chords.length > 0 ? (
            <div className="rounded border border-blue-500/20 bg-blue-500/10 px-3 py-2">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                ✓ Detected {chords.length} chord{chords.length !== 1 ? "s" : ""} ({chords.reduce((sum, chord) => sum + chord.length, 0)} notes total)
              </p>
            </div>
          ) : (
            <div className="rounded border border-amber-500/20 bg-amber-500/10 px-3 py-2">
              <p className="text-xs text-amber-600 dark:text-amber-400">
                ⚠ No chords detected. Strumming works best with 3+ simultaneous notes.
              </p>
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">Quick Presets</label>
            <div className="grid grid-cols-4 gap-2">
              {(["gentle", "moderate", "fast", "upstroke"] as const).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="rounded bg-[var(--surface-3)] px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-[color-mix(in_srgb,var(--surface-3)_80%,transparent)]"
                >
                  {preset === "upstroke" ? "Upstroke" : preset.charAt(0).toUpperCase() + preset.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">Strum Direction</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDirection("down")}
                className={`rounded px-4 py-2 text-xs font-medium transition-colors ${
                  direction === "down"
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--surface-3)] text-foreground hover:bg-[color-mix(in_srgb,var(--surface-3)_80%,transparent)]"
                }`}
              >
                ↓ Down (Low to High)
              </button>
              <button
                type="button"
                onClick={() => setDirection("up")}
                className={`rounded px-4 py-2 text-xs font-medium transition-colors ${
                  direction === "up"
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--surface-3)] text-foreground hover:bg-[color-mix(in_srgb,var(--surface-3)_80%,transparent)]"
                }`}
              >
                ↑ Up (High to Low)
              </button>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Strum Speed</label>
              <span className="text-xs font-mono text-foreground">{speed}ms per note</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={speed}
              onChange={(event) => setSpeed(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[var(--surface-1)] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[var(--primary)] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--primary)]"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {speed < 10 ? "Very fast (flamenco)" : speed < 20 ? "Fast" : speed < 40 ? "Moderate" : "Slow (gentle)"}
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">Timing Randomness</label>
              <span className="text-xs font-mono text-foreground">{randomness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={randomness}
              onChange={(event) => setRandomness(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-[var(--surface-1)] [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-[var(--primary)] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--primary)]"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {randomness === 0 ? "Perfectly even" : randomness < 20 ? "Subtle variation" : "Natural variation"}
            </p>
          </div>

          <div className="rounded border border-blue-500/20 bg-blue-500/10 px-3 py-3">
            <p className="mb-2 text-xs font-semibold text-blue-600 dark:text-blue-400">Preview</p>
            <div className="space-y-1 text-xs text-blue-600 dark:text-blue-400">
              <div>Direction: <span className="ml-2 font-mono">{direction === "down" ? "↓ Down" : "↑ Up"}</span></div>
              <div>Speed: <span className="ml-2 font-mono">{speed}ms per note</span></div>
              <div>Randomness: <span className="ml-2 font-mono">±{randomness}%</span></div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 rounded-b-lg border-t border-[var(--border)] bg-[var(--surface-1)] px-4 py-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex items-center gap-2 rounded bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-600"
          >
            <Music className="h-3.5 w-3.5" />
            Apply Strumming
          </button>
        </div>
      </div>
    </div>
  );
}
