export interface FigmaClipMidiNote {
  pitch: number;
  start: number;
  duration: number;
  velocity: number;
}

export interface FigmaClipMidiPreviewProps {
  notes?: FigmaClipMidiNote[];
  clipDuration?: number;
  minPitch?: number;
  maxPitch?: number;
  className?: string;
}

export function FigmaClipMidiPreview({
  notes = [],
  clipDuration = 4,
  minPitch = 21,
  maxPitch = 108,
  className = "",
}: FigmaClipMidiPreviewProps) {
  const pitchRange = maxPitch - minPitch;

  return (
    <div className={`relative h-full w-full bg-black/20 ${className}`}>
      {notes.map((note, index) => {
        const left = (note.start / clipDuration) * 100;
        const width = (note.duration / clipDuration) * 100;
        const bottom = ((note.pitch - minPitch) / pitchRange) * 100;

        return (
          <div
            key={`${note.pitch}-${note.start}-${index}`}
            className="absolute h-0.5 rounded-full bg-white/60"
            style={{
              left: `${left}%`,
              width: `${width}%`,
              bottom: `${bottom}%`,
              opacity: note.velocity / 127,
            }}
          />
        );
      })}
    </div>
  );
}
