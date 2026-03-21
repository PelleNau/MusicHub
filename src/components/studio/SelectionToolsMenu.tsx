import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, MousePointer2 } from "lucide-react";

import type { MidiNote } from "@/components/studio/PianoRollTransforms";

interface SelectionToolsMenuProps {
  notes: MidiNote[];
  onSelect: (noteIds: Set<string>) => void;
}

export function SelectionToolsMenu({ notes, onSelect }: SelectionToolsMenuProps) {
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

  const handleSelection = (type: string) => {
    let selected = new Set<string>();

    switch (type) {
      case "all":
        selected = new Set(notes.map((note) => note.id));
        break;
      case "none":
        selected = new Set();
        break;
      case "muted":
        selected = new Set(notes.filter((note) => note.velocity <= 20).map((note) => note.id));
        break;
      case "soft":
        selected = new Set(notes.filter((note) => note.velocity >= 1 && note.velocity <= 60).map((note) => note.id));
        break;
      case "loud":
        selected = new Set(notes.filter((note) => note.velocity >= 80).map((note) => note.id));
        break;
      case "short":
        selected = new Set(notes.filter((note) => note.duration < 0.5).map((note) => note.id));
        break;
      case "long":
        selected = new Set(notes.filter((note) => note.duration > 2).map((note) => note.id));
        break;
      case "every2nd":
        selected = new Set(notes.filter((_, index) => index % 2 === 0).map((note) => note.id));
        break;
      case "every3rd":
        selected = new Set(notes.filter((_, index) => index % 3 === 0).map((note) => note.id));
        break;
      case "every4th":
        selected = new Set(notes.filter((_, index) => index % 4 === 0).map((note) => note.id));
        break;
      case "overlapping": {
        const overlapping = new Set<string>();
        const byStart = [...notes].sort((a, b) => a.start - b.start);
        for (let i = 0; i < byStart.length - 1; i += 1) {
          const current = byStart[i];
          const next = byStart[i + 1];
          if (current.pitch === next.pitch && current.start + current.duration > next.start) {
            overlapping.add(current.id);
            overlapping.add(next.id);
          }
        }
        selected = overlapping;
        break;
      }
      default:
        selected = new Set();
    }

    onSelect(selected);
    setOpen(false);
  };

  if (notes.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs italic text-foreground/40">
        <MousePointer2 className="h-3.5 w-3.5" />
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
        title="Advanced selection tools"
      >
        <MousePointer2 className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium">Select</span>
        <ChevronDown className={`h-3 w-3 text-foreground/60 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute bottom-full left-0 z-50 mb-2 min-w-[200px] rounded-lg border border-[var(--border-strong)] bg-[var(--surface-2)] py-2 shadow-2xl">
          <Section label="Basic">
            <MenuButton onClick={() => handleSelection("all")}>Select All <span className="ml-2 text-foreground/40">Ctrl+A</span></MenuButton>
            <MenuButton onClick={() => handleSelection("none")}>Deselect All <span className="ml-2 text-foreground/40">Esc</span></MenuButton>
          </Section>

          <Section label="By Velocity">
            <MenuButton onClick={() => handleSelection("muted")}>Muted Notes (≤20)</MenuButton>
            <MenuButton onClick={() => handleSelection("soft")}>Soft Notes (1-60)</MenuButton>
            <MenuButton onClick={() => handleSelection("loud")}>Loud Notes (80-127)</MenuButton>
          </Section>

          <Section label="By Duration">
            <MenuButton onClick={() => handleSelection("short")}>Short Notes (&lt;0.5 beats)</MenuButton>
            <MenuButton onClick={() => handleSelection("long")}>Long Notes (&gt;2 beats)</MenuButton>
          </Section>

          <Section label="Pattern">
            <MenuButton onClick={() => handleSelection("every2nd")}>Every 2nd Note</MenuButton>
            <MenuButton onClick={() => handleSelection("every3rd")}>Every 3rd Note</MenuButton>
            <MenuButton onClick={() => handleSelection("every4th")}>Every 4th Note</MenuButton>
          </Section>

          <Section label="Find Issues">
            <MenuButton onClick={() => handleSelection("overlapping")}>Overlapping Notes</MenuButton>
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
