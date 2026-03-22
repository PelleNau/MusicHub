import { useMemo } from "react";
import { BarChart3, ChevronDown } from "lucide-react";

import type { MidiNote } from "@/components/studio/PianoRollTransforms";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VelocityOperationsMenuProps {
  notes: MidiNote[];
  selectedNoteIds: Set<string>;
  onApplyOperation: (updatedNotes: MidiNote[]) => void;
}

function clampVelocity(value: number) {
  return Math.max(1, Math.min(127, Math.round(value)));
}

function getTargets(notes: MidiNote[], selectedIds: Set<string>) {
  return selectedIds.size > 0 ? notes.filter((note) => selectedIds.has(note.id)) : notes;
}

function getStats(notes: MidiNote[]) {
  if (notes.length === 0) return { min: 0, max: 0, average: 0 };
  const velocities = notes.map((note) => note.velocity);
  const sum = velocities.reduce((acc, value) => acc + value, 0);
  return {
    min: Math.min(...velocities),
    max: Math.max(...velocities),
    average: Math.round(sum / velocities.length),
  };
}

export function VelocityOperationsMenu({
  notes,
  selectedNoteIds,
  onApplyOperation,
}: VelocityOperationsMenuProps) {
  const targets = useMemo(() => getTargets(notes, selectedNoteIds), [notes, selectedNoteIds]);
  const stats = useMemo(() => getStats(targets), [targets]);

  const applyOperation = (mapper: (note: MidiNote, index: number, total: number) => MidiNote) => {
    const targetIds = new Set(targets.map((note) => note.id));
    const total = targets.length;
    let index = 0;
    const updated = notes.map((note) => {
      if (!targetIds.has(note.id)) return note;
      const mapped = mapper(note, index, total);
      index += 1;
      return mapped;
    });
    onApplyOperation(updated);
  };

  if (notes.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs italic text-foreground/40">
        <BarChart3 className="h-3.5 w-3.5" />
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
          <BarChart3 className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium">Velocity</span>
          <div className="flex items-center gap-1 font-mono text-[10px] text-foreground/60">
            <span>{stats.min}</span>
            <span>-</span>
            <span>{stats.max}</span>
            <span className="ml-1 text-foreground/40">(avg {stats.average})</span>
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
          Range: {stats.min} - {stats.max} • Avg: {stats.average}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-3 py-1 text-[10px] uppercase tracking-wide text-foreground/40">Adjust</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => applyOperation((note) => ({ ...note, velocity: clampVelocity(note.velocity + 10) }))} className="text-xs">Add +10</DropdownMenuItem>
        <DropdownMenuItem onClick={() => applyOperation((note) => ({ ...note, velocity: clampVelocity(note.velocity - 10) }))} className="text-xs">Subtract -10</DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-3 py-1 text-[10px] uppercase tracking-wide text-foreground/40">Scale</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => applyOperation((note) => ({ ...note, velocity: clampVelocity(note.velocity * 0.5) }))} className="text-xs">Compress (50%)</DropdownMenuItem>
        <DropdownMenuItem onClick={() => applyOperation((note) => ({ ...note, velocity: clampVelocity(note.velocity * 1.5) }))} className="text-xs">Expand (150%)</DropdownMenuItem>
        <DropdownMenuItem onClick={() => applyOperation((note) => ({ ...note, velocity: clampVelocity(70 + ((note.velocity - stats.min) / Math.max(1, stats.max - stats.min)) * 40) }))} className="text-xs">Normalize (70-110)</DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-3 py-1 text-[10px] uppercase tracking-wide text-foreground/40">Dynamics</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => applyOperation((note, index, total) => ({ ...note, velocity: clampVelocity(60 + (index / Math.max(1, total - 1)) * 50) }))} className="text-xs">Crescendo ↗</DropdownMenuItem>
        <DropdownMenuItem onClick={() => applyOperation((note, index, total) => ({ ...note, velocity: clampVelocity(110 - (index / Math.max(1, total - 1)) * 50) }))} className="text-xs">Diminuendo ↘</DropdownMenuItem>
        <DropdownMenuItem onClick={() => applyOperation((note) => ({ ...note, velocity: clampVelocity(note.velocity + (Math.random() - 0.5) * 30) }))} className="text-xs">Randomize (±15)</DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-3 py-1 text-[10px] uppercase tracking-wide text-foreground/40">Set Fixed</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => applyOperation((note) => ({ ...note, velocity: 80 }))} className="text-xs">Set to 80 (Normal)</DropdownMenuItem>
        <DropdownMenuItem onClick={() => applyOperation((note) => ({ ...note, velocity: 100 }))} className="text-xs">Set to 100 (Strong)</DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => applyOperation((note) => ({ ...note, velocity: clampVelocity(127 - note.velocity) }))} className="text-xs">
          Invert Velocities
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
