import { memo, useMemo } from "react";
import type { MidiNote, NoteColorMode } from "@/components/studio/PianoRollTransforms";
import { noteColor } from "@/components/studio/PianoRollTransforms";
import { noteName, MIN_NOTE_WIDTH, type DragMode, type Tool } from "./constants";

interface PianoRollNotesProps {
  notes: MidiNote[];
  ghostNotes: MidiNote[];
  selectedIds: Set<string>;
  pitchToRow: Map<number, number>;
  keyHeight: number;
  pxPerBeat: number;
  snapBeats: number;
  snap: (beats: number) => number;
  noteColorMode: NoteColorMode;
  dragDelta: { dx: number; dy: number; mode: DragMode } | null;
  splitMode: boolean;
  tool: Tool;
}

export const PianoRollNotes = memo(function PianoRollNotes({
  notes,
  ghostNotes,
  selectedIds,
  pitchToRow,
  keyHeight,
  pxPerBeat,
  snapBeats,
  snap,
  noteColorMode,
  dragDelta,
  splitMode,
  tool,
}: PianoRollNotesProps) {
  return (
    <>
      {/* Ghost notes */}
      {ghostNotes.map((note, i) => {
        const row = pitchToRow.get(note.pitch);
        if (row === undefined) return null;
        return (
          <div
            key={`ghost-${i}`}
            className="absolute rounded-[2px] pointer-events-none"
            style={{
              left: note.start * pxPerBeat,
              top: row * keyHeight + 2,
              width: Math.max(note.duration * pxPerBeat, MIN_NOTE_WIDTH),
              height: keyHeight - 4,
              backgroundColor: "hsl(var(--foreground) / 0.06)",
              border: "1px solid hsl(var(--foreground) / 0.08)",
            }}
          />
        );
      })}

      {/* MIDI notes */}
      {notes.map((note) => {
        const isSelected = selectedIds.has(note.id);
        const row = pitchToRow.get(note.pitch);
        if (row === undefined) return null;

        let noteX = note.start * pxPerBeat;
        let noteY = row * keyHeight;
        let noteW = Math.max(note.duration * pxPerBeat, MIN_NOTE_WIDTH);

        if (isSelected && dragDelta) {
          if (dragDelta.mode === "move") {
            const snappedDx = snap(dragDelta.dx / pxPerBeat) * pxPerBeat;
            const snappedDy = -Math.round(dragDelta.dy / keyHeight) * -keyHeight;
            noteX += snappedDx;
            noteY += snappedDy;
          } else if (dragDelta.mode === "resize") {
            const newDur = Math.max(snapBeats, snap(note.duration + dragDelta.dx / pxPerBeat));
            noteW = Math.max(newDur * pxPerBeat, MIN_NOTE_WIDTH);
          }
        }

        const bg = noteColor(note, noteColorMode, isSelected);

        return (
          <div
            key={note.id}
            className="absolute rounded-[2px]"
            style={{
              left: noteX,
              top: noteY + 1,
              width: noteW,
              height: keyHeight - 2,
              backgroundColor: isSelected ? "hsl(0, 0%, 95%)" : bg,
              border: isSelected ? `1.5px solid ${bg}` : undefined,
              cursor: splitMode ? "crosshair" : tool === "erase" ? "pointer" : "grab",
              boxShadow: isSelected ? `0 0 6px ${bg}` : undefined,
              zIndex: isSelected ? 5 : 1,
              willChange: dragDelta && isSelected ? "left, top, width" : undefined,
              touchAction: "none",
            }}
          >
            {/* Resize handle — wider invisible hit zone */}
            <div className="absolute right-0 top-0 bottom-0 w-[10px] cursor-col-resize" style={{ marginRight: -2 }} />
            {/* Left resize hint on hover */}
            <div className="absolute left-0 top-0 bottom-0 w-[10px] cursor-col-resize pointer-events-none" />
            {noteW > 24 && (
              <span
                className="text-[6px] font-mono pl-1 select-none pointer-events-none"
                style={{
                  lineHeight: `${keyHeight - 2}px`,
                  color: isSelected ? "hsl(0, 0%, 30%)" : "hsl(0, 0%, 100% / 0.6)",
                }}
              >
                {noteName(note.pitch)}
              </span>
            )}
          </div>
        );
      })}
    </>
  );
});
