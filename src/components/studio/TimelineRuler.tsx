import { useMemo, useCallback, memo } from "react";
import type { GridDivision } from "@/hooks/useTimelineGrid";
import { getDivisionBeats } from "@/hooks/useTimelineGrid";
import { GRID_EPSILON, getBarOffsetBeats, isBarDownbeat } from "./gridAlignment";

interface TimelineRulerProps {
  totalBeats: number;
  pixelsPerBeat: number;
  beatsPerBar: number;
  activeDivision: GridDivision;
  tripletMode: boolean;
  onSeek?: (beat: number) => void;
  zoomHandle?: React.ReactNode;
}

export const TimelineRuler = memo(function TimelineRuler({
  totalBeats,
  pixelsPerBeat,
  beatsPerBar,
  activeDivision,
  tripletMode,
  onSeek,
  zoomHandle,
}: TimelineRulerProps) {
  const totalWidth = totalBeats * pixelsPerBeat;

  const { barMarks, subMarks } = useMemo(() => {
    const barOffsetBeats = getBarOffsetBeats(beatsPerBar);

    const bars: { bar: number; x: number }[] = [];
    for (let beat = barOffsetBeats, bar = 1; beat <= totalBeats + GRID_EPSILON; beat += beatsPerBar, bar += 1) {
      bars.push({ bar, x: beat * pixelsPerBeat });
    }

    let divBeats = getDivisionBeats(activeDivision, beatsPerBar);
    if (tripletMode) divBeats = divBeats * (2 / 3);

    const subs: { x: number; isBeat: boolean }[] = [];

    // Always render quarter-note beat ticks so bar lengths are visually stable.
    for (let beat = 0; beat <= totalBeats + GRID_EPSILON; beat += 1) {
      if (isBarDownbeat(beat, beatsPerBar, barOffsetBeats)) continue;
      subs.push({ x: beat * pixelsPerBeat, isBeat: true });
    }

    // Add finer subdivision ticks only when grid is finer than one beat.
    if (divBeats < 1) {
      for (let beat = 0; beat <= totalBeats + GRID_EPSILON; beat += divBeats) {
        const isDownbeat = isBarDownbeat(beat, beatsPerBar, barOffsetBeats);
        const isBeat = Math.abs(beat - Math.round(beat)) < GRID_EPSILON;
        if (isDownbeat || isBeat) continue;
        subs.push({ x: beat * pixelsPerBeat, isBeat: false });
      }
    }

    return { barMarks: bars, subMarks: subs };
  }, [totalBeats, pixelsPerBeat, beatsPerBar, activeDivision, tripletMode]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onSeek) return;

      const timelineEl = e.currentTarget.closest("[data-timeline]") as HTMLElement | null;
      const rulerRect = e.currentTarget.getBoundingClientRect();

      if (!timelineEl) return;

      const x = e.clientX - rulerRect.left + timelineEl.scrollLeft;
      const beat = Math.max(0, x / pixelsPerBeat);
      onSeek(beat);
    },
    [onSeek, pixelsPerBeat]
  );

  return (
    <div className="flex border-b border-border sticky top-0 z-10 bg-card">
      {zoomHandle || <div className="w-52 shrink-0 border-r border-border/60 bg-card sticky left-0 z-10" />}
      <div
        className="relative h-6 bg-muted/20 cursor-default"
        style={{ minWidth: totalWidth }}
        onClick={handleClick}
      >
        {barMarks.map(({ bar, x }) => (
          <div key={`b${bar}`} className="absolute top-0 bottom-0" style={{ left: x }}>
            <div style={{ height: "100%", borderLeft: "1px solid hsl(var(--foreground) / 0.28)" }} />
            <span className="absolute top-0.5 left-1 text-[9px] font-mono text-foreground/70 select-none">
              {bar}
            </span>
          </div>
        ))}
        {subMarks.map(({ x, isBeat }, i) => (
          <div
            key={`s${i}`}
            className="absolute bottom-0"
            style={{
              left: x,
              height: isBeat ? "60%" : "35%",
              borderLeft: `1px solid ${isBeat ? "hsl(var(--foreground) / 0.18)" : "hsl(var(--foreground) / 0.1)"}`,
            }}
          />
        ))}
      </div>
    </div>
  );
});
