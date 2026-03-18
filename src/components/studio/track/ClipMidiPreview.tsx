import { memo, useMemo } from "react";

/** Pitch-class color palette (chromatic, 12 colors) */
const NOTE_COLORS: Record<number, string> = {
  0: "#ff6b6b",   // C
  1: "#e85d75",   // C#
  2: "#ffa94d",   // D
  3: "#f59f00",   // D#
  4: "#ffd43b",   // E
  5: "#69db7c",   // F
  6: "#38d9a9",   // F#
  7: "#4dabf7",   // G
  8: "#5c7cfa",   // G#
  9: "#7950f2",   // A
  10: "#cc5de8",  // A#
  11: "#f06595",  // B
};

interface MiniNote {
  pitch: number;
  start: number;
  duration: number;
  velocity: number;
}

interface ClipMidiPreviewProps {
  notes: MiniNote[];
  clipDuration: number;
  isMuted: boolean;
}

const MAX_RENDERED_NOTES = 300;

/** SVG-based MIDI note preview with pitch-class coloring and velocity opacity */
export const ClipMidiPreview = memo(function ClipMidiPreview({
  notes,
  clipDuration,
  isMuted,
}: ClipMidiPreviewProps) {
  const rects = useMemo(() => {
    if (notes.length === 0) return null;

    let minPitch = 127, maxPitch = 0;
    for (const n of notes) {
      if (n.pitch < minPitch) minPitch = n.pitch;
      if (n.pitch > maxPitch) maxPitch = n.pitch;
    }
    const pitchRange = Math.max(maxPitch - minPitch + 1, 1);
    const noteHeight = Math.max(100 / pitchRange, 2);

    // Cap notes for performance
    const renderNotes = notes.length > MAX_RENDERED_NOTES
      ? notes.slice(0, MAX_RENDERED_NOTES)
      : notes;

    return renderNotes.map((n, i) => {
      const x = (n.start / clipDuration) * 100;
      const w = Math.max((n.duration / clipDuration) * 100, 0.3);
      const y = ((maxPitch - n.pitch) / pitchRange) * 100;
      const color = isMuted ? "rgba(255,255,255,0.2)" : NOTE_COLORS[n.pitch % 12];
      // Velocity → opacity: 0.3 at vel=0, 1.0 at vel=127
      const opacity = isMuted ? 0.3 : 0.3 + (n.velocity / 127) * 0.7;

      return (
        <rect
          key={i}
          x={x}
          y={y}
          width={w}
          height={noteHeight}
          rx={0.4}
          fill={color}
          opacity={opacity}
        />
      );
    });
  }, [notes, clipDuration, isMuted]);

  if (!rects) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ top: 12, bottom: 0, height: "calc(100% - 12px)" }}
    >
      {rects}
    </svg>
  );
});
