import { getDivisionBeats, type GridDivision } from "@/hooks/useTimelineGrid";
import { GRID_EPSILON, getBarOffsetBeats, isBarDownbeat } from "@/components/studio/gridAlignment";
import { beatToX, type TimelineViewportRange } from "@/components/studio/timelineMath";

interface DrawGridOptions {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  totalBeats: number;
  pixelsPerBeat: number;
  beatsPerBar: number;
  activeDivision: GridDivision;
  tripletMode: boolean;
  viewport: TimelineViewportRange;
}

export function drawGrid({
  ctx,
  width,
  height,
  totalBeats,
  pixelsPerBeat,
  beatsPerBar,
  activeDivision,
  tripletMode,
  viewport,
}: DrawGridOptions) {
  ctx.clearRect(0, 0, width, height);

  const barOffsetBeats = getBarOffsetBeats(beatsPerBar);
  let divBeats = getDivisionBeats(activeDivision, beatsPerBar);
  if (tripletMode) divBeats = divBeats * (2 / 3);

  const startBarBeat = Math.max(
    barOffsetBeats,
    Math.floor((viewport.startBeat - barOffsetBeats) / beatsPerBar) * beatsPerBar + barOffsetBeats,
  );

  ctx.save();
  ctx.translate(-viewport.startX, 0);

  ctx.beginPath();
  ctx.strokeStyle = "hsl(var(--foreground) / 0.28)";
  for (let beat = startBarBeat; beat <= totalBeats + GRID_EPSILON && beat <= viewport.endBeat + beatsPerBar; beat += beatsPerBar) {
    const x = beatToX(beat, pixelsPerBeat);
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
  }
  ctx.stroke();

  ctx.beginPath();
  for (let beat = 0; beat <= totalBeats + GRID_EPSILON && beat <= viewport.endBeat + divBeats; beat += divBeats) {
    if (beat < viewport.startBeat - divBeats) continue;
    const isDownbeat = isBarDownbeat(beat, beatsPerBar, barOffsetBeats);
    if (isDownbeat) continue;

    const x = beatToX(beat, pixelsPerBeat);
    const isBeat = Math.abs(beat % 1) < GRID_EPSILON;
    ctx.strokeStyle = isBeat
      ? "hsl(var(--foreground) / 0.18)"
      : "hsl(var(--foreground) / 0.1)";
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
    ctx.stroke();
    ctx.beginPath();
  }

  ctx.restore();
}
