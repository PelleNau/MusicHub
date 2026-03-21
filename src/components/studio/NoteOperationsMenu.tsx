import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Scissors } from "lucide-react";

import type { MidiNote } from "@/components/studio/PianoRollTransforms";

interface NoteOperationsMenuProps {
  notes: MidiNote[];
  selectedNoteIds: Set<string>;
  playheadPosition: number;
  onApplyOperation: (type: string) => void;
}

export function NoteOperationsMenu({
  notes,
  selectedNoteIds,
  playheadPosition,
  onApplyOperation,
}: NoteOperationsMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const handle = (type: string) => {
    onApplyOperation(type);
    setOpen(false);
  };

  if (notes.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs italic text-foreground/40">
        <Scissors className="h-3.5 w-3.5" />
        <span>No notes</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded bg-[var(--surface-3)] px-3 py-1.5 text-foreground transition-colors hover:bg-[color:color-mix(in_srgb,var(--surface-3)_80%,white_4%)]"
        title="Note operations"
      >
        <Scissors className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium">Notes</span>
        <ChevronDown className={`h-3 w-3 text-foreground/60 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute bottom-full left-0 z-50 mb-2 min-w-[200px] rounded-lg border border-[var(--border-strong)] bg-[var(--surface-2)] py-2 shadow-2xl">
          <div className="border-b border-[var(--border)] px-3 py-2">
            <div className="text-xs text-foreground/60">
              {selectedNoteIds.size > 0
                ? `${selectedNoteIds.size} selected note${selectedNoteIds.size !== 1 ? "s" : ""}`
                : `${notes.length} total note${notes.length !== 1 ? "s" : ""}`}
            </div>
            <div className="mt-1 font-mono text-[10px] text-foreground/40">Playhead: {playheadPosition.toFixed(2)} beats</div>
          </div>

          <Section label="Split">
            <MenuButton onClick={() => handle("splitAtPlayhead")}>Split at Playhead</MenuButton>
            <MenuButton onClick={() => handle("splitAtBar")}>Split at Each Bar</MenuButton>
            <MenuButton onClick={() => handle("splitAtBeat")}>Split at Each Beat</MenuButton>
          </Section>

          <Section label="Join">
            <MenuButton onClick={() => handle("joinConsecutive")}>Join Consecutive Notes</MenuButton>
          </Section>

          <Section label="Transform">
            <MenuButton onClick={() => handle("reverse")}>Reverse Order</MenuButton>
            <MenuButton onClick={() => handle("mirrorHorizontal")}>Mirror (Time)</MenuButton>
            <MenuButton onClick={() => handle("mirrorVertical")}>Mirror (Pitch)</MenuButton>
          </Section>

          <Section label="Repeat">
            <MenuButton onClick={() => handle("repeat2x")}>Repeat 2x</MenuButton>
            <MenuButton onClick={() => handle("repeat4x")}>Repeat 4x</MenuButton>
          </Section>

          <Section label="Cleanup">
            <MenuButton onClick={() => handle("removeShort")}>Remove Short Notes (&lt;0.1)</MenuButton>
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
