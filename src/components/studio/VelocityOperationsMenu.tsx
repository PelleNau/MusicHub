import { useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, ChevronDown } from "lucide-react";

import type { MidiNote } from "@/components/studio/PianoRollTransforms";

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
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const targets = useMemo(() => getTargets(notes, selectedNoteIds), [notes, selectedNoteIds]);
  const stats = useMemo(() => getStats(targets), [targets]);

  useEffect(() => {
    if (!open) return undefined;
    const handleOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

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
    setOpen(false);
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
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
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
        <ChevronDown className={`h-3 w-3 text-foreground/60 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute bottom-full left-0 z-50 mb-2 min-w-[240px] rounded-lg border border-[var(--border-strong)] bg-[var(--surface-2)] py-2 shadow-2xl">
          <div className="border-b border-[var(--border)] px-3 py-2">
            <div className="text-xs text-foreground/60">
              {selectedNoteIds.size > 0
                ? `${selectedNoteIds.size} selected note${selectedNoteIds.size !== 1 ? "s" : ""}`
                : `${notes.length} total note${notes.length !== 1 ? "s" : ""}`}
            </div>
            <div className="font-mono text-[10px] text-foreground/40">
              Range: {stats.min} - {stats.max} • Avg: {stats.average}
            </div>
          </div>

          <div className="py-1">
            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground/40">Adjust</div>
            <MenuButton onClick={() => applyOperation((note) => ({ ...note, velocity: clampVelocity(note.velocity + 10) }))}>Add +10</MenuButton>
            <MenuButton onClick={() => applyOperation((note) => ({ ...note, velocity: clampVelocity(note.velocity - 10) }))}>Subtract -10</MenuButton>
          </div>

          <SectionDivider />
          <div className="py-1">
            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground/40">Scale</div>
            <MenuButton onClick={() => applyOperation((note) => ({ ...note, velocity: clampVelocity(note.velocity * 0.5) }))}>Compress (50%)</MenuButton>
            <MenuButton onClick={() => applyOperation((note) => ({ ...note, velocity: clampVelocity(note.velocity * 1.5) }))}>Expand (150%)</MenuButton>
            <MenuButton onClick={() => applyOperation((note) => ({ ...note, velocity: clampVelocity(70 + ((note.velocity - stats.min) / Math.max(1, stats.max - stats.min)) * 40) }))}>Normalize (70-110)</MenuButton>
          </div>

          <SectionDivider />
          <div className="py-1">
            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground/40">Dynamics</div>
            <MenuButton onClick={() => applyOperation((note, index, total) => ({ ...note, velocity: clampVelocity(60 + (index / Math.max(1, total - 1)) * 50) }))}>Crescendo ↗</MenuButton>
            <MenuButton onClick={() => applyOperation((note, index, total) => ({ ...note, velocity: clampVelocity(110 - (index / Math.max(1, total - 1)) * 50) }))}>Diminuendo ↘</MenuButton>
            <MenuButton onClick={() => applyOperation((note) => ({ ...note, velocity: clampVelocity(note.velocity + (Math.random() - 0.5) * 30) }))}>Randomize (±15)</MenuButton>
          </div>

          <SectionDivider />
          <div className="py-1">
            <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground/40">Set Fixed</div>
            <MenuButton onClick={() => applyOperation((note) => ({ ...note, velocity: 80 }))}>Set to 80 (Normal)</MenuButton>
            <MenuButton onClick={() => applyOperation((note) => ({ ...note, velocity: 100 }))}>Set to 100 (Strong)</MenuButton>
          </div>

          <SectionDivider />
          <div className="py-1">
            <MenuButton onClick={() => applyOperation((note) => ({ ...note, velocity: clampVelocity(127 - note.velocity) }))}>
              Invert Velocities
            </MenuButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MenuButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full px-3 py-1.5 text-left text-xs text-foreground transition-colors hover:bg-[var(--surface-3)]"
    >
      {children}
    </button>
  );
}

function SectionDivider() {
  return <div className="border-t border-[var(--border)] py-1" />;
}
