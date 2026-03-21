export interface FigmaVelocityNote {
  id: string;
  start: number;
  velocity: number;
}

export interface FigmaPianoRollVelocityLaneProps {
  notes?: FigmaVelocityNote[];
  selectedNotes?: string[];
  height?: number;
  pixelsPerBeat?: number;
  totalBeats?: number;
  className?: string;
}

export function FigmaPianoRollVelocityLane({
  notes = [],
  selectedNotes = [],
  height = 100,
  pixelsPerBeat = 40,
  totalBeats = 16,
  className = "",
}: FigmaPianoRollVelocityLaneProps) {
  return (
    <div className={`bg-[var(--surface-1)] border-t border-[var(--border)] ${className}`} style={{ height: `${height}px` }}>
      <div className="relative h-full w-full">
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${totalBeats}, ${pixelsPerBeat}px)` }}>
          {Array.from({ length: totalBeats }).map((_, index) => (
            <div key={index} className="border-r border-[var(--border)]/20" />
          ))}
        </div>

        {notes.map((note) => (
          <div
            key={note.id}
            className={`absolute bottom-0 w-1 rounded-t ${selectedNotes.includes(note.id) ? "bg-indigo-600" : "bg-gray-500"}`}
            style={{
              left: `${note.start * pixelsPerBeat}px`,
              height: `${(note.velocity / 127) * 100}%`,
            }}
          />
        ))}

        <div className="absolute left-2 top-2 text-xs text-[var(--muted-foreground)]">Velocity</div>
      </div>
    </div>
  );
}
