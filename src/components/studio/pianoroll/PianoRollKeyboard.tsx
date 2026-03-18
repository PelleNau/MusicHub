import { memo } from "react";
import { isBlackKey, isInScale, noteName, PIANO_WIDTH, RULER_HEIGHT } from "./constants";

interface PianoRollKeyboardProps {
  visiblePitches: number[];
  keyHeight: number;
  rootNote: number;
  scaleIntervals: number[];
  scaleName: string;
  chordLaneVisible: boolean;
}

export const PianoRollKeyboard = memo(function PianoRollKeyboard({
  visiblePitches,
  keyHeight,
  rootNote,
  scaleIntervals,
  scaleName,
  chordLaneVisible,
}: PianoRollKeyboardProps) {
  return (
    <div className="sticky left-0 z-20 shrink-0 flex flex-col" style={{ width: PIANO_WIDTH }}>
      {chordLaneVisible && (
        <div className="shrink-0" style={{ height: 18, backgroundColor: "hsl(var(--muted) / 0.55)", borderBottom: "1px solid hsl(var(--foreground) / 0.06)" }}>
          <span className="text-[6px] font-mono text-foreground/15 pl-1 leading-[18px]">CHORDS</span>
        </div>
      )}
      <div
        className="shrink-0 border-b border-r"
        style={{ height: RULER_HEIGHT, backgroundColor: "hsl(var(--muted) / 0.5)", borderColor: "hsl(var(--foreground) / 0.08)" }}
      />
      {visiblePitches.map((pitch) => {
        const black = isBlackKey(pitch);
        const inScale = isInScale(pitch, rootNote, scaleIntervals);
        const isC = pitch % 12 === 0;
        const isE = pitch % 12 === 4;
        const showBorder = isC || isE;
        return (
          <div
            key={pitch}
            className="relative flex items-center select-none overflow-hidden"
            style={{
              height: keyHeight,
              borderBottom: showBorder
                ? "1.5px solid hsl(var(--foreground) / 0.25)"
                : "1px solid hsl(var(--foreground) / 0.12)",
            }}
          >
            {black ? (
              <>
                <div className="absolute inset-0 bg-[hsl(0,0%,18%)] dark:bg-[hsl(0,0%,14%)]" />
                <div
                  className="absolute top-0 bottom-0 left-0 rounded-r-[2px] bg-[hsl(0,0%,12%)] dark:bg-[hsl(0,0%,10%)]"
                  style={{
                    width: "72%",
                    borderRight: "2px solid hsl(0, 0%, 8%)",
                    boxShadow: "1px 0 2px hsl(0, 0%, 0%, 0.3)",
                  }}
                />
                <span className="relative z-10 text-[7px] font-mono ml-auto pr-1 font-semibold text-[hsl(0,0%,65%)]">
                  {(inScale && scaleName !== "Chromatic") ? noteName(pitch) : ""}
                </span>
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-[hsl(0,0%,92%)] dark:bg-[hsl(0,0%,78%)]" />
                <span
                  className="relative z-10 text-[7px] font-mono ml-auto pr-1 font-semibold"
                  style={{
                    color: isC ? "hsl(0, 0%, 10%)" : inScale && scaleName !== "Chromatic" ? "hsl(0, 0%, 30%)" : "hsl(0, 0%, 50%)",
                  }}
                >
                  {isC ? noteName(pitch) : (inScale && scaleName !== "Chromatic") ? noteName(pitch) : ""}
                </span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
});
