import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { MidiNote } from "@/components/studio/PianoRollTransforms";

export interface TransposeOptions {
  semitones: number;
  clampToRange: boolean;
}

interface TransposeDialogProps {
  open: boolean;
  notes: MidiNote[];
  onApply: (options: TransposeOptions) => void;
  onClose: () => void;
}

function octavesToSemitones(octaves: number) {
  return octaves * 12;
}

function checkTransposeRange(notes: MidiNote[], semitones: number) {
  let tooLow = 0;
  let tooHigh = 0;

  for (const note of notes) {
    const nextPitch = note.pitch + semitones;
    if (nextPitch < 0) tooLow += 1;
    if (nextPitch > 127) tooHigh += 1;
  }

  return {
    hasIssues: tooLow > 0 || tooHigh > 0,
    tooLow,
    tooHigh,
  };
}

export function TransposeDialog({
  open,
  notes,
  onApply,
  onClose,
}: TransposeDialogProps) {
  const [semitones, setSemitones] = useState(0);
  const [clampToRange, setClampToRange] = useState(true);

  const rangeCheck = useMemo(() => checkTransposeRange(notes, semitones), [notes, semitones]);

  const handleApply = () => {
    onApply({ semitones, clampToRange });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : null)}>
      <DialogContent className="max-w-[400px] border-border/90 bg-[hsl(240_10%_16%)] p-0 text-foreground shadow-2xl">
        <DialogHeader className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <DialogTitle className="text-sm font-semibold">Transpose Notes</DialogTitle>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="space-y-4 p-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">Semitones</label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSemitones((prev) => Math.max(-48, prev - 1))}
                className="flex h-8 w-8 items-center justify-center rounded bg-[var(--surface-3)] transition-colors hover:bg-[color:color-mix(in_srgb,var(--surface-3)_80%,white_4%)]"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <input
                type="number"
                min={-48}
                max={48}
                value={semitones}
                onChange={(event) => setSemitones(Math.max(-48, Math.min(48, Number(event.target.value))))}
                className="flex-1 rounded border border-border bg-[var(--surface-1)] px-3 py-2 text-center font-mono text-sm text-foreground outline-none transition-colors focus:border-primary"
              />
              <button
                type="button"
                onClick={() => setSemitones((prev) => Math.min(48, prev + 1))}
                className="flex h-8 w-8 items-center justify-center rounded bg-[var(--surface-3)] transition-colors hover:bg-[color:color-mix(in_srgb,var(--surface-3)_80%,white_4%)]"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {semitones > 0 ? `+${semitones}` : semitones} semitone{Math.abs(semitones) !== 1 ? "s" : ""}
              {semitones !== 0 ? ` (${(semitones / 12).toFixed(1)} octaves)` : ""}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-muted-foreground">Quick Octave Transpose</label>
            <div className="grid grid-cols-4 gap-2">
              {[-2, -1, 1, 2].map((octaves) => (
                <button
                  key={octaves}
                  type="button"
                  onClick={() => setSemitones(octavesToSemitones(octaves))}
                  className="rounded bg-[var(--surface-3)] px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-[color:color-mix(in_srgb,var(--surface-3)_80%,white_4%)]"
                >
                  {octaves > 0 ? `+${octaves}` : octaves} Oct
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={clampToRange}
                onChange={(event) => setClampToRange(event.target.checked)}
                className="h-4 w-4 rounded border border-border bg-[var(--surface-2)]"
              />
              Clamp to MIDI range (0-127)
            </label>
            <p className="ml-6 text-xs text-muted-foreground">
              {clampToRange
                ? "Notes outside range will be clamped to nearest valid pitch"
                : "Notes outside range will be skipped"}
            </p>
          </div>

          {rangeCheck.hasIssues ? (
            <div className="rounded border border-amber-500/20 bg-amber-500/10 px-3 py-2">
              <p className="mb-1 text-xs font-medium text-amber-400">Range Warning</p>
              <p className="text-xs text-amber-300">
                {rangeCheck.tooLow > 0 ? `${rangeCheck.tooLow} note${rangeCheck.tooLow > 1 ? "s" : ""} below MIDI 0. ` : ""}
                {rangeCheck.tooHigh > 0 ? `${rangeCheck.tooHigh} note${rangeCheck.tooHigh > 1 ? "s" : ""} above MIDI 127. ` : ""}
                {clampToRange ? "They will be clamped." : "They will be skipped."}
              </p>
            </div>
          ) : null}

          <div className="rounded border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs text-blue-300">
            Transposing {notes.length} note{notes.length !== 1 ? "s" : ""}{semitones === 0 ? " (no change)" : ""}
          </div>
        </div>

        <DialogFooter className="rounded-b-lg border-t border-border bg-[var(--surface-1)] px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleApply}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
