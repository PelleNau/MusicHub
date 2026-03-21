import {
  ArrowUpDown,
  CheckSquare,
  Clipboard,
  Clock,
  Copy,
  Gauge,
  Scissors,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";

import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";

interface PianoRollContextMenuProps {
  hasSelection: boolean;
  hasMultipleSelection: boolean;
  hasClipboard: boolean;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onQuantize: () => void;
  onHumanize: () => void;
  onTransposeOpen: () => void;
  onLegato: () => void;
  onReverse: () => void;
  onInvert: () => void;
}

function DisabledMenuItem({
  label,
  shortcut,
}: {
  label: string;
  shortcut?: string;
}) {
  return (
    <ContextMenuItem disabled className="text-xs font-mono">
      {label}
      {shortcut ? <ContextMenuShortcut className="text-[9px]">{shortcut}</ContextMenuShortcut> : null}
    </ContextMenuItem>
  );
}

export function PianoRollContextMenu({
  hasSelection,
  hasMultipleSelection,
  hasClipboard,
  onSelectAll,
  onDeselectAll,
  onCut,
  onCopy,
  onPaste,
  onDelete,
  onQuantize,
  onHumanize,
  onTransposeOpen,
  onLegato,
  onReverse,
  onInvert,
}: PianoRollContextMenuProps) {
  return (
    <ContextMenuContent className="min-w-[220px]">
      <ContextMenuSub>
        <ContextMenuSubTrigger className="gap-2">
          <Zap className="h-3.5 w-3.5 opacity-70" />
          Transform
        </ContextMenuSubTrigger>
        <ContextMenuSubContent className="min-w-[200px]">
          <ContextMenuItem onClick={onQuantize} disabled={!hasSelection}>
            Quantize
            <ContextMenuShortcut className="text-[9px]">Q</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onClick={onHumanize} disabled={!hasSelection}>
            Humanize
            <ContextMenuShortcut className="text-[9px]">H</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onClick={onReverse} disabled={!hasMultipleSelection}>
            Reverse Order
          </ContextMenuItem>
          <DisabledMenuItem label="Mirror (Time)" />
          <DisabledMenuItem label="Mirror (Pitch)" />
          <ContextMenuSeparator />
          <DisabledMenuItem label="Strumming" shortcut="S" />
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSub>
        <ContextMenuSubTrigger className="gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 opacity-70" />
          Pitch
        </ContextMenuSubTrigger>
        <ContextMenuSubContent className="min-w-[200px]">
          <ContextMenuItem onClick={onTransposeOpen} disabled={!hasSelection}>
            Transpose
            <ContextMenuShortcut className="text-[9px]">T</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <DisabledMenuItem label="Chord Tools" shortcut="C" />
          <DisabledMenuItem label="Detect Chords" />
          <DisabledMenuItem label="Invert Chord" />
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSub>
        <ContextMenuSubTrigger className="gap-2">
          <Clock className="h-3.5 w-3.5 opacity-70" />
          Duration
        </ContextMenuSubTrigger>
        <ContextMenuSubContent className="min-w-[200px]">
          <DisabledMenuItem label="Quantize Length" />
          <ContextMenuItem onClick={onLegato} disabled={!hasMultipleSelection}>
            Legato (Extend to Next)
          </ContextMenuItem>
          <DisabledMenuItem label="Staccato (50%)" />
          <ContextMenuSeparator />
          <DisabledMenuItem label="Double Length" />
          <DisabledMenuItem label="Half Length" />
          <ContextMenuSeparator />
          <DisabledMenuItem label="Scale Length" />
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSub>
        <ContextMenuSubTrigger className="gap-2">
          <Gauge className="h-3.5 w-3.5 opacity-70" />
          Velocity
        </ContextMenuSubTrigger>
        <ContextMenuSubContent className="min-w-[200px]">
          <DisabledMenuItem label="Scale Velocity" />
          <DisabledMenuItem label="Add Velocity" />
          <DisabledMenuItem label="Randomize Velocity" />
          <ContextMenuSeparator />
          <DisabledMenuItem label="Ramp Up" />
          <DisabledMenuItem label="Ramp Down" />
          <ContextMenuSeparator />
          <DisabledMenuItem label="Compress Velocity" />
          <DisabledMenuItem label="Expand Velocity" />
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSub>
        <ContextMenuSubTrigger className="gap-2">
          <Sparkles className="h-3.5 w-3.5 opacity-70" />
          Creative
        </ContextMenuSubTrigger>
        <ContextMenuSubContent className="min-w-[200px]">
          <DisabledMenuItem label="Arpeggiator" shortcut="A" />
          <ContextMenuSeparator />
          <DisabledMenuItem label="Repeat 2x" />
          <DisabledMenuItem label="Repeat 4x" />
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSub>
        <ContextMenuSubTrigger className="gap-2">
          <Scissors className="h-3.5 w-3.5 opacity-70" />
          Notes
        </ContextMenuSubTrigger>
        <ContextMenuSubContent className="min-w-[200px]">
          <DisabledMenuItem label="Split at Playhead" />
          <DisabledMenuItem label="Split at Bars" />
          <DisabledMenuItem label="Split at Beats" />
          <ContextMenuSeparator />
          <DisabledMenuItem label="Join Consecutive" />
          <ContextMenuSeparator />
          <DisabledMenuItem label="Remove Short Notes" />
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSub>
        <ContextMenuSubTrigger className="gap-2">
          <CheckSquare className="h-3.5 w-3.5 opacity-70" />
          Selection
        </ContextMenuSubTrigger>
        <ContextMenuSubContent className="min-w-[200px]">
          <ContextMenuItem onClick={onSelectAll}>
            Select All
            <ContextMenuShortcut className="text-[9px]">Ctrl+A</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onClick={onDeselectAll} disabled={!hasSelection}>
            Deselect All
            <ContextMenuShortcut className="text-[9px]">Esc</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <DisabledMenuItem label="Select by Velocity" />
          <DisabledMenuItem label="Select by Pitch" />
          <DisabledMenuItem label="Select by Duration" />
          <ContextMenuSeparator />
          <DisabledMenuItem label="Invert Selection" />
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSeparator />

      <ContextMenuItem onClick={onCut} disabled={!hasSelection} className="gap-2">
        <Scissors className="h-3.5 w-3.5 opacity-70" />
        Cut
        <ContextMenuShortcut className="text-[9px]">Ctrl+X</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem onClick={onCopy} disabled={!hasSelection} className="gap-2">
        <Copy className="h-3.5 w-3.5 opacity-70" />
        Copy
        <ContextMenuShortcut className="text-[9px]">Ctrl+C</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem onClick={onPaste} disabled={!hasClipboard} className="gap-2">
        <Clipboard className="h-3.5 w-3.5 opacity-70" />
        Paste
        <ContextMenuShortcut className="text-[9px]">Ctrl+V</ContextMenuShortcut>
      </ContextMenuItem>
      <DisabledMenuItem label="Duplicate" shortcut="Ctrl+D" />

      <ContextMenuSeparator />

      <ContextMenuItem onClick={onDelete} disabled={!hasSelection} className="gap-2 text-destructive focus:text-destructive">
        <Trash2 className="h-3.5 w-3.5 opacity-70" />
        Delete
        <ContextMenuShortcut className="text-[9px]">Del</ContextMenuShortcut>
      </ContextMenuItem>
    </ContextMenuContent>
  );
}
