import { ChevronDown, MousePointer2 } from "lucide-react";

import type { MidiNote } from "@/components/studio/PianoRollTransforms";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SelectionToolsMenuProps {
  notes: MidiNote[];
  onSelect: (noteIds: Set<string>) => void;
}

export function SelectionToolsMenu({ notes, onSelect }: SelectionToolsMenuProps) {
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded bg-[var(--surface-3)] px-3 py-1.5 text-foreground transition-colors hover:bg-[color:color-mix(in_srgb,var(--surface-3)_80%,white_4%)]"
          title="Advanced selection tools"
        >
          <MousePointer2 className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium">Select</span>
          <ChevronDown className="h-3 w-3 text-foreground/60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[220px]">
        <DropdownMenuLabel className="px-3 py-1 text-[10px] uppercase tracking-wide text-foreground/40">Basic</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleSelection("all")} className="text-xs">
          Select All
          <span className="ml-auto text-foreground/40">Ctrl+A</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelection("none")} className="text-xs">
          Deselect All
          <span className="ml-auto text-foreground/40">Esc</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-3 py-1 text-[10px] uppercase tracking-wide text-foreground/40">By Velocity</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleSelection("muted")} className="text-xs">Muted Notes (≤20)</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelection("soft")} className="text-xs">Soft Notes (1-60)</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelection("loud")} className="text-xs">Loud Notes (80-127)</DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-3 py-1 text-[10px] uppercase tracking-wide text-foreground/40">By Duration</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleSelection("short")} className="text-xs">Short Notes (&lt;0.5 beats)</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelection("long")} className="text-xs">Long Notes (&gt;2 beats)</DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-3 py-1 text-[10px] uppercase tracking-wide text-foreground/40">Pattern</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleSelection("every2nd")} className="text-xs">Every 2nd Note</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelection("every3rd")} className="text-xs">Every 3rd Note</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSelection("every4th")} className="text-xs">Every 4th Note</DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-3 py-1 text-[10px] uppercase tracking-wide text-foreground/40">Find Issues</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleSelection("overlapping")} className="text-xs">Overlapping Notes</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
