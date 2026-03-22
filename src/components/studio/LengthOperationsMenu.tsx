import { useMemo } from "react";
import { ChevronDown, Ruler } from "lucide-react";

import type { MidiNote } from "@/components/studio/PianoRollTransforms";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LengthOperationsMenuProps {
  notes: MidiNote[];
  selectedNoteIds: Set<string>;
  onApplyOperation: (updatedNotes: MidiNote[]) => void;
}

function getTargets(notes: MidiNote[], selectedIds: Set<string>) {
  return selectedIds.size > 0 ? notes.filter((note) => selectedIds.has(note.id)) : notes;
}

function getStats(notes: MidiNote[]) {
  if (notes.length === 0) return { min: 0, max: 0, average: 0 };
  const durations = notes.map((note) => note.duration);
  const sum = durations.reduce((acc, value) => acc + value, 0);
  return {
    min: Math.min(...durations),
    max: Math.max(...durations),
    average: sum / durations.length,
  };
}

export function LengthOperationsMenu({
  notes,
  selectedNoteIds,
  onApplyOperation,
}: LengthOperationsMenuProps) {
  const targets = useMemo(() => getTargets(notes, selectedNoteIds), [notes, selectedNoteIds]);
  const stats = useMemo(() => getStats(targets), [targets]);

  const applyOperation = (mapper: (note: MidiNote) => MidiNote) => {
    const targetIds = new Set(targets.map((note) => note.id));
    const updated = notes.map((note) => (targetIds.has(note.id) ? mapper(note) : note));
    onApplyOperation(updated);
  };

  if (notes.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs italic text-foreground/40">
        <Ruler className="h-3.5 w-3.5" />
        <span>No notes to edit</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded bg-[var(--surface-3)] px-3 py-1.5 text-foreground transition-colors hover:bg-[color:color-mix(in_srgb,var(--surface-3)_80%,white_4%)]"
        >
          <Ruler className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium">Length</span>
          <div className="flex items-center gap-1 font-mono text-[10px] text-foreground/60">
            <span>{stats.min.toFixed(2)}</span>
            <span>-</span>
            <span>{stats.max.toFixed(2)}</span>
            <span className="ml-1 text-foreground/40">(avg {stats.average.toFixed(2)})</span>
          </div>
          <ChevronDown className="h-3 w-3 text-foreground/60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[260px]">
        <DropdownMenuLabel className="px-3 py-1 text-xs font-normal text-foreground/60">
          {selectedNoteIds.size > 0
            ? `${selectedNoteIds.size} selected note${selectedNoteIds.size !== 1 ? "s" : ""}`
            : `${notes.length} total note${notes.length !== 1 ? "s" : ""}`}
        </DropdownMenuLabel>
        <DropdownMenuLabel className="px-3 py-0 pb-1 font-mono text-[10px] font-normal text-foreground/40">
          Duration: {stats.min.toFixed(2)} - {stats.max.toFixed(2)} beats
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-3 py-1 text-[10px] uppercase tracking-wide text-foreground/40">Articulation</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => applyOperation((note) => ({ ...note, duration: Math.max(0.0625, note.duration * 1.15) }))} className="text-xs">Legato (Connect)</DropdownMenuItem>
        <DropdownMenuItem onClick={() => applyOperation((note) => ({ ...note, duration: Math.max(0.0625, note.duration * 0.75) }))} className="text-xs">Staccato (75%)</DropdownMenuItem>
        <DropdownMenuItem onClick={() => applyOperation((note) => ({ ...note, duration: Math.max(0.0625, note.duration * 0.5) }))} className="text-xs">Staccato (50%)</DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-3 py-1 text-[10px] uppercase tracking-wide text-foreground/40">Scale</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => applyOperation((note) => ({ ...note, duration: note.duration * 2 }))} className="text-xs">Double (2x)</DropdownMenuItem>
        <DropdownMenuItem onClick={() => applyOperation((note) => ({ ...note, duration: Math.max(0.0625, note.duration * 0.5) }))} className="text-xs">Half (0.5x)</DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-3 py-1 text-[10px] uppercase tracking-wide text-foreground/40">Quantize Length</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => applyOperation((note) => ({ ...note, duration: 0.25 }))} className="text-xs">To 1/16 Notes</DropdownMenuItem>
        <DropdownMenuItem onClick={() => applyOperation((note) => ({ ...note, duration: 0.5 }))} className="text-xs">To 1/8 Notes</DropdownMenuItem>
        <DropdownMenuItem onClick={() => applyOperation((note) => ({ ...note, duration: 1 }))} className="text-xs">To 1/4 Notes</DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-3 py-1 text-[10px] uppercase tracking-wide text-foreground/40">Set Fixed</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => applyOperation((note) => ({ ...note, duration: 1 }))} className="text-xs">1 Beat (Quarter)</DropdownMenuItem>
        <DropdownMenuItem onClick={() => applyOperation((note) => ({ ...note, duration: 0.5 }))} className="text-xs">0.5 Beat (Eighth)</DropdownMenuItem>
        <DropdownMenuItem onClick={() => applyOperation((note) => ({ ...note, duration: 0.25 }))} className="text-xs">0.25 Beat (16th)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
