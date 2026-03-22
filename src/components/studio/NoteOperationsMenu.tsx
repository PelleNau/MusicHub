import { ChevronDown, Scissors } from "lucide-react";

import type { MidiNote } from "@/components/studio/PianoRollTransforms";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const handle = (type: string) => {
    onApplyOperation(type);
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded bg-[var(--surface-3)] px-3 py-1.5 text-foreground transition-colors hover:bg-[color:color-mix(in_srgb,var(--surface-3)_80%,white_4%)]"
          title="Note operations"
        >
          <Scissors className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium">Notes</span>
          <ChevronDown className="h-3 w-3 text-foreground/60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[220px]">
        <DropdownMenuLabel className="px-3 py-1 text-xs font-normal text-foreground/60">
          {selectedNoteIds.size > 0
            ? `${selectedNoteIds.size} selected note${selectedNoteIds.size !== 1 ? "s" : ""}`
            : `${notes.length} total note${notes.length !== 1 ? "s" : ""}`}
        </DropdownMenuLabel>
        <DropdownMenuLabel className="mt-0 px-3 py-0 pb-1 font-mono text-[10px] font-normal text-foreground/40">
          Playhead: {playheadPosition.toFixed(2)} beats
        </DropdownMenuLabel>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-3 py-1 text-[10px] uppercase tracking-wide text-foreground/40">Split</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handle("splitAtPlayhead")} className="text-xs">Split at Playhead</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handle("splitAtBar")} className="text-xs">Split at Each Bar</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handle("splitAtBeat")} className="text-xs">Split at Each Beat</DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-3 py-1 text-[10px] uppercase tracking-wide text-foreground/40">Join</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handle("joinConsecutive")} className="text-xs">Join Consecutive Notes</DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-3 py-1 text-[10px] uppercase tracking-wide text-foreground/40">Transform</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handle("reverse")} className="text-xs">Reverse Order</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handle("mirrorHorizontal")} className="text-xs">Mirror (Time)</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handle("mirrorVertical")} className="text-xs">Mirror (Pitch)</DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-3 py-1 text-[10px] uppercase tracking-wide text-foreground/40">Repeat</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handle("repeat2x")} className="text-xs">Repeat 2x</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handle("repeat4x")} className="text-xs">Repeat 4x</DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuLabel className="px-3 py-1 text-[10px] uppercase tracking-wide text-foreground/40">Cleanup</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handle("removeShort")} className="text-xs">Remove Short Notes (&lt;0.1)</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
