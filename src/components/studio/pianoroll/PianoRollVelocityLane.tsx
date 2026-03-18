import { memo, useCallback, useRef } from "react";
import type { MidiNote, NoteColorMode } from "@/components/studio/PianoRollTransforms";
import { noteColor } from "@/components/studio/PianoRollTransforms";
import { VELOCITY_LANE_HEIGHT } from "./constants";

interface PianoRollVelocityLaneProps {
  notes: MidiNote[];
  selectedIds: Set<string>;
  pxPerBeat: number;
  noteColorMode: NoteColorMode;
  onNotesChange: (notes: MidiNote[]) => void;
  onSelectNote: (noteId: string) => void;
}

export const PianoRollVelocityLane = memo(function PianoRollVelocityLane({
  notes,
  selectedIds,
  pxPerBeat,
  noteColorMode,
  onNotesChange,
  onSelectNote,
}: PianoRollVelocityLaneProps) {
  const velDragRef = useRef<{ noteId: string; startY: number; origVel: number } | null>(null);

  const handleVelPointerDown = useCallback((e: React.PointerEvent, note: MidiNote) => {
    e.preventDefault(); e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    velDragRef.current = { noteId: note.id, startY: e.clientY, origVel: note.velocity };
    onSelectNote(note.id);
  }, [onSelectNote]);

  const handleVelPointerMove = useCallback((e: React.PointerEvent) => {
    if (!velDragRef.current) return;
    const dy = velDragRef.current.startY - e.clientY;
    const newVel = Math.max(1, Math.min(127, velDragRef.current.origVel + Math.round(dy * 1.5)));
    const el = e.currentTarget as HTMLElement;
    el.style.height = `${(newVel / 127) * 100}%`;
    el.dataset.vel = String(newVel);
  }, []);

  const handleVelPointerUp = useCallback((e: React.PointerEvent) => {
    if (!velDragRef.current) return;
    const dy = velDragRef.current.startY - e.clientY;
    const newVel = Math.max(1, Math.min(127, velDragRef.current.origVel + Math.round(dy * 1.5)));
    onNotesChange(notes.map((n) => n.id === velDragRef.current!.noteId ? { ...n, velocity: newVel } : n));
    velDragRef.current = null;
  }, [notes, onNotesChange]);

  return (
    <div
      className="relative shrink-0 border-t"
      style={{ height: VELOCITY_LANE_HEIGHT, borderColor: "hsl(var(--foreground) / 0.1)", backgroundColor: "hsl(var(--muted) / 0.45)" }}
    >
      <span className="absolute top-1 left-1 text-[6px] font-mono text-foreground/20 select-none pointer-events-none">VEL</span>
      {notes.map((note) => {
        const x = note.start * pxPerBeat;
        const w = Math.max(note.duration * pxPerBeat - 1, 3);
        const pct = (note.velocity / 127) * 100;
        const isSelected = selectedIds.has(note.id);
        const velColor = noteColorMode === "velocity"
          ? noteColor(note, "velocity", isSelected)
          : isSelected ? "hsl(var(--primary) / 0.8)" : "hsl(var(--primary) / 0.45)";
        return (
          <div key={note.id} className="absolute bottom-0" style={{ left: x, width: w }}>
            <div
              className="absolute bottom-0 w-full rounded-t-[1px] cursor-ns-resize transition-colors"
              style={{ height: `${pct}%`, backgroundColor: velColor }}
              onPointerDown={(e) => handleVelPointerDown(e, note)}
              onPointerMove={handleVelPointerMove}
              onPointerUp={handleVelPointerUp}
            />
          </div>
        );
      })}
    </div>
  );
});
