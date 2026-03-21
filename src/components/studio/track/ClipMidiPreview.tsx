import { memo, useMemo } from "react";

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
  color: string;
}

const MAX_RENDERED_NOTES = 300;

/** SVG-based MIDI note preview with pitch-class coloring and velocity opacity */
export const ClipMidiPreview = memo(function ClipMidiPreview({
  notes,
  clipDuration,
  isMuted,
  color,
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
      const fill = isMuted ? "rgba(255,255,255,0.16)" : color;
      const opacity = isMuted ? 0.24 : 0.28 + (n.velocity / 127) * 0.28;

      return (
        <rect
          key={i}
          x={x}
          y={y}
          width={w}
          height={noteHeight}
          rx={0.25}
          fill={fill}
          opacity={opacity}
        />
      );
    });
  }, [notes, clipDuration, isMuted, color]);

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
