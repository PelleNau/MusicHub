import { useRef, useState } from "react";

import type { MidiNote } from "@/components/studio/PianoRollTransforms";

interface VelocityLaneProps {
  notes: MidiNote[];
  selectedNotes: Set<string>;
  pixelsPerBeat: number;
  totalBars: number;
  beatsPerBar: number;
  barWidth: number;
  onUpdateNote: (noteId: string, velocity: number) => void;
  onSelectNote: (noteId: string, addToSelection: boolean) => void;
}

const LANE_HEIGHT = 80;
const MIN_VELOCITY = 1;
const MAX_VELOCITY = 127;

export function VelocityLane({
  notes,
  selectedNotes,
  pixelsPerBeat,
  totalBars,
  beatsPerBar,
  barWidth,
  onUpdateNote,
  onSelectNote,
}: VelocityLaneProps) {
  const laneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null);

  const gridWidth = totalBars * barWidth;

  const handleVelocityEdit = (event: React.MouseEvent) => {
    if (!laneRef.current || !draggedNoteId) return;
    const rect = laneRef.current.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const normalized = 1 - y / LANE_HEIGHT;
    const velocity = Math.max(MIN_VELOCITY, Math.min(MAX_VELOCITY, Math.round(normalized * MAX_VELOCITY)));
    onUpdateNote(draggedNoteId, velocity);
  };

  const handleBarMouseDown = (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setIsDragging(true);
    setDraggedNoteId(noteId);
    onSelectNote(noteId, event.shiftKey);
    handleVelocityEdit(event);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedNoteId(null);
  };

  return (
    <div
      ref={laneRef}
      className="velocity-lane-bg relative cursor-ns-resize border-t border-[var(--border-strong)] bg-[var(--surface-1)]"
      style={{ height: `${LANE_HEIGHT}px`, width: `${gridWidth}px` }}
      onMouseMove={(event) => {
        if (!isDragging || !draggedNoteId) return;
        handleVelocityEdit(event);
      }}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="pointer-events-none absolute inset-0">
        {[25, 50, 75, 100].map((percent) => (
          <div
            key={percent}
            className="absolute left-0 right-0 h-px"
            style={{
              top: `${100 - percent}%`,
              backgroundColor: percent === 50 ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.05)",
            }}
          />
        ))}

        {Array.from({ length: totalBars }, (_, barIndex) => (
          <div
            key={`bar-${barIndex}`}
            className="absolute bottom-0 top-0 w-px bg-[var(--timeline-bar)]"
            style={{ left: `${barIndex * barWidth}px` }}
          />
        ))}

        {Array.from({ length: totalBars * beatsPerBar }, (_, beatIndex) => (
          <div
            key={`beat-${beatIndex}`}
            className="absolute bottom-0 top-0 w-px opacity-25"
            style={{ left: `${beatIndex * pixelsPerBeat}px`, backgroundColor: "rgba(255,255,255,0.06)" }}
          />
        ))}
      </div>

      <div className="absolute inset-0">
        {notes.map((note) => {
          const noteX = note.start * pixelsPerBeat;
          const noteWidth = Math.max(note.duration * pixelsPerBeat, 4);
          const barHeight = (note.velocity / MAX_VELOCITY) * LANE_HEIGHT;
          const isSelected = selectedNotes.has(note.id);

          return (
            <div
              key={note.id}
              className={`absolute bottom-0 transition-all ${isSelected ? "opacity-100" : "opacity-70 hover:opacity-90"}`}
              style={{ left: `${noteX}px`, width: `${noteWidth}px`, height: `${barHeight}px` }}
              onMouseDown={(event) => handleBarMouseDown(note.id, event)}
              title={`Velocity: ${note.velocity}`}
            >
              <div
                className={`h-full w-full cursor-ns-resize transition-colors ${
                  isSelected ? "bg-[var(--primary)]" : "bg-[var(--primary)]/60 hover:bg-[var(--primary)]/80"
                }`}
                style={{
                  borderTop: isSelected ? "2px solid var(--primary)" : "1px solid rgba(74, 158, 255, 0.8)",
                  boxShadow: isSelected ? "0 0 0 1px var(--primary)" : "none",
                }}
              />

              {isSelected && noteWidth > 20 ? (
                <div className="pointer-events-none absolute left-1/2 top-0 mb-1 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded bg-black/70 px-1 py-0.5 font-mono text-[10px] font-semibold text-white">
                  {note.velocity}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 top-0 flex w-8 flex-col justify-between py-1 font-mono text-[10px] text-foreground/40">
        <div>127</div>
        <div>64</div>
        <div>1</div>
      </div>
    </div>
  );
}
