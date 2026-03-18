import { memo } from "react";
import { isBlackKey, isInScale } from "./constants";

interface PianoRollGridProps {
  visiblePitches: number[];
  keyHeight: number;
  rootNote: number;
  scaleIntervals: number[];
  scaleName: string;
  displayClipDuration: number;
  pxPerBeat: number;
  snapBeats: number;
  beatsPerBar: number;
  isTripletSnap: boolean;
  clipDuration: number;
  clipExtendDelta: number;
}

export const PianoRollGrid = memo(function PianoRollGrid({
  visiblePitches,
  keyHeight,
  rootNote,
  scaleIntervals,
  scaleName,
  displayClipDuration,
  pxPerBeat,
  snapBeats,
  beatsPerBar,
  isTripletSnap,
  clipDuration,
  clipExtendDelta,
}: PianoRollGridProps) {
  const gridStep = snapBeats > 0 ? snapBeats : 1;
  const gridLineCount = Math.max(1, Math.ceil(displayClipDuration / gridStep) + 1);

  return (
    <>
      {/* Row backgrounds */}
      {visiblePitches.map((pitch, i) => {
        const black = isBlackKey(pitch);
        const inScale = isInScale(pitch, rootNote, scaleIntervals);
        const isC = pitch % 12 === 0;
        const isE = pitch % 12 === 4;
        const showBorder = isC || isE;
        let bg: string;
        if (scaleName !== "Chromatic") {
          if (black) {
            bg = inScale ? "hsl(var(--foreground) / 0.08)" : "hsl(var(--foreground) / 0.12)";
          } else {
            bg = inScale ? "hsl(var(--background))" : "hsl(var(--foreground) / 0.04)";
          }
        } else {
          bg = black ? "hsl(var(--foreground) / 0.08)" : "hsl(var(--foreground) / 0.03)";
        }
        return (
          <div
            key={pitch}
            className="absolute w-full pointer-events-none"
            style={{
              top: i * keyHeight,
              height: keyHeight,
              backgroundColor: bg,
              borderBottom: showBorder
                ? "1.5px solid hsl(var(--foreground) / 0.22)"
                : "1px solid hsl(var(--foreground) / 0.09)",
            }}
          />
        );
      })}

      {/* Beat lines */}
      {Array.from({ length: gridLineCount }, (_, i) => {
        const beat = i * gridStep;
        if (beat > displayClipDuration) return null;
        const x = beat * pxPerBeat;
        const isBar = Math.abs(beat % beatsPerBar) < 0.001;
        const isBeat = Math.abs(beat % 1) < 0.001;
        return (
          <div
            key={i}
            className="absolute top-0 bottom-0 pointer-events-none"
            style={{
              left: x,
              borderLeft: `1px solid ${
                isBar ? "hsl(var(--foreground) / 0.22)"
                  : isBeat ? "hsl(var(--foreground) / 0.14)"
                  : isTripletSnap ? "hsl(var(--primary) / 0.2)"
                  : "hsl(var(--foreground) / 0.08)"
              }`,
            }}
          />
        );
      })}

      {/* Clip end boundary — always visible when display extends beyond clip */}
      {displayClipDuration > clipDuration && (
        <>
          <div className="absolute top-0 bottom-0 pointer-events-none z-10" style={{ left: clipDuration * pxPerBeat, borderLeft: "2px dashed hsl(var(--foreground) / 0.18)" }} />
          <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: clipDuration * pxPerBeat, width: (displayClipDuration - clipDuration) * pxPerBeat, backgroundColor: "hsl(var(--foreground) / 0.03)" }} />
        </>
      )}

      {clipExtendDelta !== 0 && (
        <div className="absolute top-0 bottom-0 pointer-events-none z-10" style={{ left: clipDuration * pxPerBeat, borderLeft: "1px dashed hsl(var(--foreground) / 0.15)" }} />
      )}
    </>
  );
});
