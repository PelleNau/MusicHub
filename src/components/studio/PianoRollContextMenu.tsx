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
  hasNotes: boolean;
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
  onStrummingOpen: () => void;
  onChordToolsOpen: () => void;
  onArpeggiatorOpen: () => void;
  onLegato: () => void;
  onReverse: () => void;
  onInvert: () => void;
  onSetLengthSixteenth: () => void;
  onSetLengthEighth: () => void;
  onSetLengthQuarter: () => void;
  onStaccatoHalf: () => void;
  onDoubleLength: () => void;
  onHalfLength: () => void;
  onVelocityAdd: () => void;
  onVelocityRandomize: () => void;
  onVelocityRampUp: () => void;
  onVelocityRampDown: () => void;
  onVelocityCompress: () => void;
  onVelocityExpand: () => void;
  onSplitAtPlayhead: () => void;
  onSplitAtBars: () => void;
  onSplitAtBeats: () => void;
  onJoinConsecutive: () => void;
  onRemoveShortNotes: () => void;
  onRepeat2x: () => void;
  onRepeat4x: () => void;
}

export function PianoRollContextMenu({
  hasNotes,
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
  onStrummingOpen,
  onChordToolsOpen,
  onArpeggiatorOpen,
  onLegato,
  onReverse,
  onInvert,
  onSetLengthSixteenth,
  onSetLengthEighth,
  onSetLengthQuarter,
  onStaccatoHalf,
  onDoubleLength,
  onHalfLength,
  onVelocityAdd,
  onVelocityRandomize,
  onVelocityRampUp,
  onVelocityRampDown,
  onVelocityCompress,
  onVelocityExpand,
  onSplitAtPlayhead,
  onSplitAtBars,
  onSplitAtBeats,
  onJoinConsecutive,
  onRemoveShortNotes,
  onRepeat2x,
  onRepeat4x,
}: PianoRollContextMenuProps) {
  return (
    <ContextMenuContent className="min-w-[220px]">
      <ContextMenuItem onClick={onQuantize} disabled={!hasNotes} className="gap-2">
        <Zap className="h-3.5 w-3.5 opacity-70" />
        Quantize
        <ContextMenuShortcut className="text-[9px]">Q</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem onClick={onHumanize} disabled={!hasNotes} className="gap-2">
        <Zap className="h-3.5 w-3.5 opacity-70" />
        Humanize
        <ContextMenuShortcut className="text-[9px]">H</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem onClick={onTransposeOpen} disabled={!hasNotes} className="gap-2">
        <ArrowUpDown className="h-3.5 w-3.5 opacity-70" />
        Transpose
        <ContextMenuShortcut className="text-[9px]">T</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem onClick={onArpeggiatorOpen} disabled={!hasMultipleSelection} className="gap-2">
        <Sparkles className="h-3.5 w-3.5 opacity-70" />
        Arpeggiator
        <ContextMenuShortcut className="text-[9px]">A</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem onClick={onSplitAtPlayhead} disabled={!hasNotes} className="gap-2">
        <Scissors className="h-3.5 w-3.5 opacity-70" />
        Split at Playhead
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuSub>
        <ContextMenuSubTrigger className="gap-2">
          <Zap className="h-3.5 w-3.5 opacity-70" />
          Transform
        </ContextMenuSubTrigger>
        <ContextMenuSubContent className="min-w-[200px]">
          <ContextMenuItem onClick={onQuantize} disabled={!hasNotes}>
            Quantize
            <ContextMenuShortcut className="text-[9px]">Q</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onClick={onHumanize} disabled={!hasNotes}>
            Humanize
            <ContextMenuShortcut className="text-[9px]">H</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onClick={onReverse} disabled={!hasNotes}>
            Reverse Order
          </ContextMenuItem>
          <ContextMenuItem onClick={onReverse} disabled={!hasNotes}>
            Mirror (Time)
          </ContextMenuItem>
          <ContextMenuItem onClick={onInvert} disabled={!hasNotes}>
            Mirror (Pitch)
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={onStrummingOpen} disabled={!hasMultipleSelection}>
            Strumming
            <ContextMenuShortcut className="text-[9px]">S</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSub>
        <ContextMenuSubTrigger className="gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 opacity-70" />
          Pitch
        </ContextMenuSubTrigger>
        <ContextMenuSubContent className="min-w-[200px]">
          <ContextMenuItem onClick={onTransposeOpen} disabled={!hasNotes}>
            Transpose
            <ContextMenuShortcut className="text-[9px]">T</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={onChordToolsOpen} disabled={!hasMultipleSelection}>
            Chord Tools
            <ContextMenuShortcut className="text-[9px]">C</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onClick={onInvert} disabled={!hasMultipleSelection}>
            Invert Chord / Notes
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSub>
        <ContextMenuSubTrigger className="gap-2">
          <Clock className="h-3.5 w-3.5 opacity-70" />
          Duration
        </ContextMenuSubTrigger>
        <ContextMenuSubContent className="min-w-[200px]">
          <ContextMenuItem onClick={onSetLengthSixteenth} disabled={!hasNotes}>
            Quantize Length to 1/16
          </ContextMenuItem>
          <ContextMenuItem onClick={onSetLengthEighth} disabled={!hasNotes}>
            Quantize Length to 1/8
          </ContextMenuItem>
          <ContextMenuItem onClick={onSetLengthQuarter} disabled={!hasNotes}>
            Quantize Length to 1/4
          </ContextMenuItem>
          <ContextMenuItem onClick={onLegato} disabled={!hasMultipleSelection}>
            Legato (Extend to Next)
          </ContextMenuItem>
          <ContextMenuItem onClick={onStaccatoHalf} disabled={!hasNotes}>
            Staccato (50%)
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={onDoubleLength} disabled={!hasNotes}>
            Double Length
          </ContextMenuItem>
          <ContextMenuItem onClick={onHalfLength} disabled={!hasNotes}>
            Half Length
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSub>
        <ContextMenuSubTrigger className="gap-2">
          <Gauge className="h-3.5 w-3.5 opacity-70" />
          Velocity
        </ContextMenuSubTrigger>
        <ContextMenuSubContent className="min-w-[200px]">
          <ContextMenuItem onClick={onVelocityAdd} disabled={!hasNotes}>
            Add Velocity (+10)
          </ContextMenuItem>
          <ContextMenuItem onClick={onVelocityRandomize} disabled={!hasNotes}>
            Randomize Velocity
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={onVelocityRampUp} disabled={!hasMultipleSelection}>
            Ramp Up
          </ContextMenuItem>
          <ContextMenuItem onClick={onVelocityRampDown} disabled={!hasMultipleSelection}>
            Ramp Down
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={onVelocityCompress} disabled={!hasNotes}>
            Compress Velocity
          </ContextMenuItem>
          <ContextMenuItem onClick={onVelocityExpand} disabled={!hasNotes}>
            Expand Velocity
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSub>
        <ContextMenuSubTrigger className="gap-2">
          <Sparkles className="h-3.5 w-3.5 opacity-70" />
          Creative
        </ContextMenuSubTrigger>
        <ContextMenuSubContent className="min-w-[200px]">
          <ContextMenuItem onClick={onArpeggiatorOpen} disabled={!hasMultipleSelection}>
            Arpeggiator
            <ContextMenuShortcut className="text-[9px]">A</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={onRepeat2x} disabled={!hasNotes}>
            Repeat 2x
          </ContextMenuItem>
          <ContextMenuItem onClick={onRepeat4x} disabled={!hasNotes}>
            Repeat 4x
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>

      <ContextMenuSub>
        <ContextMenuSubTrigger className="gap-2">
          <Scissors className="h-3.5 w-3.5 opacity-70" />
          Notes
        </ContextMenuSubTrigger>
        <ContextMenuSubContent className="min-w-[200px]">
          <ContextMenuItem onClick={onSplitAtPlayhead} disabled={!hasNotes}>
            Split at Playhead
          </ContextMenuItem>
          <ContextMenuItem onClick={onSplitAtBars} disabled={!hasNotes}>
            Split at Bars
          </ContextMenuItem>
          <ContextMenuItem onClick={onSplitAtBeats} disabled={!hasNotes}>
            Split at Beats
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={onJoinConsecutive} disabled={!hasMultipleSelection}>
            Join Consecutive
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={onRemoveShortNotes} disabled={!hasNotes}>
            Remove Short Notes
          </ContextMenuItem>
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

      <ContextMenuSeparator />

      <ContextMenuItem onClick={onDelete} disabled={!hasSelection} className="gap-2 text-destructive focus:text-destructive">
        <Trash2 className="h-3.5 w-3.5 opacity-70" />
        Delete
        <ContextMenuShortcut className="text-[9px]">Del</ContextMenuShortcut>
      </ContextMenuItem>
    </ContextMenuContent>
  );
}
