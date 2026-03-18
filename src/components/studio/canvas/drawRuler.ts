import { getDivisionBeats, type GridDivision } from "@/hooks/useTimelineGrid";
import { GRID_EPSILON, getBarOffsetBeats, isBarDownbeat } from "@/components/studio/gridAlignment";
import { beatToX, type TimelineViewportRange } from "@/components/studio/timelineMath";

interface DrawRulerOptions {
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

export function drawRuler({
  ctx,
  width,
  height,
  totalBeats,
  pixelsPerBeat,
  beatsPerBar,
  activeDivision,
  tripletMode,
  viewport,
}: DrawRulerOptions) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "hsl(var(--muted) / 0.2)";
  ctx.fillRect(0, 0, width, height);

  const barOffsetBeats = getBarOffsetBeats(beatsPerBar);
  let divBeats = getDivisionBeats(activeDivision, beatsPerBar);
  if (tripletMode) divBeats = divBeats * (2 / 3);

  ctx.save();
  ctx.translate(-viewport.startX, 0);
  ctx.font = '9px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.textBaseline = "top";

  const startBarBeat = Math.max(
    barOffsetBeats,
    Math.floor((viewport.startBeat - barOffsetBeats) / beatsPerBar) * beatsPerBar + barOffsetBeats,
  );

  ctx.beginPath();
  ctx.strokeStyle = "hsl(var(--foreground) / 0.28)";
  for (let beat = startBarBeat, bar = Math.floor((startBarBeat - barOffsetBeats) / beatsPerBar) + 1;
    beat <= totalBeats + GRID_EPSILON && beat <= viewport.endBeat + beatsPerBar;
    beat += beatsPerBar, bar += 1) {
    const x = beatToX(beat, pixelsPerBeat);
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
    ctx.fillStyle = "hsl(var(--foreground) / 0.7)";
    ctx.fillText(String(bar), x + 4, 2);
  }
  ctx.stroke();

  ctx.beginPath();
  for (let beat = 0; beat <= totalBeats + GRID_EPSILON && beat <= viewport.endBeat + divBeats; beat += divBeats) {
    if (beat < viewport.startBeat - divBeats) continue;
    if (isBarDownbeat(beat, beatsPerBar, barOffsetBeats)) continue;

    const x = beatToX(beat, pixelsPerBeat);
    const isBeat = Math.abs(beat - Math.round(beat)) < GRID_EPSILON;
    const tickHeight = isBeat ? height * 0.6 : height * 0.35;
    ctx.strokeStyle = isBeat
      ? "hsl(var(--foreground) / 0.18)"
      : "hsl(var(--foreground) / 0.1)";
    ctx.moveTo(x + 0.5, height - tickHeight);
    ctx.lineTo(x + 0.5, height);
    ctx.stroke();
    ctx.beginPath();
  }

  ctx.restore();
}
