import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Ruler } from "lucide-react";

import type { MidiNote } from "@/components/studio/PianoRollTransforms";

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

  const applyOperation = (mapper: (note: MidiNote) => MidiNote) => {
    const targetIds = new Set(targets.map((note) => note.id));
    const updated = notes.map((note) => (targetIds.has(note.id) ? mapper(note) : note));
    onApplyOperation(updated);
    setOpen(false);
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
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
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
        <ChevronDown className={`h-3 w-3 text-foreground/60 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute bottom-full left-0 z-50 mb-2 min-w-[220px] rounded-lg border border-[var(--border-strong)] bg-[var(--surface-2)] py-2 shadow-2xl">
          <div className="border-b border-[var(--border)] px-3 py-2">
            <div className="mb-1 text-xs text-foreground/60">
              {selectedNoteIds.size > 0
                ? `${selectedNoteIds.size} selected note${selectedNoteIds.size !== 1 ? "s" : ""}`
                : `${notes.length} total note${notes.length !== 1 ? "s" : ""}`}
            </div>
            <div className="font-mono text-[10px] text-foreground/40">
              Duration: {stats.min.toFixed(2)} - {stats.max.toFixed(2)} beats
            </div>
          </div>

          <Section label="Articulation">
            <MenuButton onClick={() => applyOperation((note) => ({ ...note, duration: Math.max(0.0625, note.duration * 1.15) }))}>
              Legato (Connect)
            </MenuButton>
            <MenuButton onClick={() => applyOperation((note) => ({ ...note, duration: Math.max(0.0625, note.duration * 0.75) }))}>
              Staccato (75%)
            </MenuButton>
            <MenuButton onClick={() => applyOperation((note) => ({ ...note, duration: Math.max(0.0625, note.duration * 0.5) }))}>
              Staccato (50%)
            </MenuButton>
          </Section>

          <Section label="Scale">
            <MenuButton onClick={() => applyOperation((note) => ({ ...note, duration: note.duration * 2 }))}>Double (2x)</MenuButton>
            <MenuButton onClick={() => applyOperation((note) => ({ ...note, duration: Math.max(0.0625, note.duration * 0.5) }))}>Half (0.5x)</MenuButton>
          </Section>

          <Section label="Quantize Length">
            <MenuButton onClick={() => applyOperation((note) => ({ ...note, duration: 0.25 }))}>To 1/16 Notes</MenuButton>
            <MenuButton onClick={() => applyOperation((note) => ({ ...note, duration: 0.5 }))}>To 1/8 Notes</MenuButton>
            <MenuButton onClick={() => applyOperation((note) => ({ ...note, duration: 1 }))}>To 1/4 Notes</MenuButton>
          </Section>

          <Section label="Set Fixed">
            <MenuButton onClick={() => applyOperation((note) => ({ ...note, duration: 1 }))}>1 Beat (Quarter)</MenuButton>
            <MenuButton onClick={() => applyOperation((note) => ({ ...note, duration: 0.5 }))}>0.5 Beat (Eighth)</MenuButton>
            <MenuButton onClick={() => applyOperation((note) => ({ ...note, duration: 0.25 }))}>0.25 Beat (16th)</MenuButton>
          </Section>
        </div>
      ) : null}
    </div>
  );
}

function MenuButton({
  children,
  onClick,
}: {
  children: ReactNode;
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

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="border-t border-[var(--border)] py-1">
      <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground/40">{label}</div>
      {children}
    </div>
  );
}
