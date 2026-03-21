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
  ctx.fillStyle = "#1f2127";
  ctx.fillRect(0, 0, width, height);

  const barOffsetBeats = getBarOffsetBeats(beatsPerBar);
  let divBeats = getDivisionBeats(activeDivision, beatsPerBar);
  if (tripletMode) divBeats = divBeats * (2 / 3);

  ctx.save();
  ctx.translate(-viewport.startX, 0);
  ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, monospace';
  ctx.textBaseline = "top";

  const startBarBeat = Math.max(
    barOffsetBeats,
    Math.floor((viewport.startBeat - barOffsetBeats) / beatsPerBar) * beatsPerBar + barOffsetBeats,
  );

  ctx.beginPath();
  ctx.strokeStyle = "rgba(255,255,255,0.24)";
  for (let beat = startBarBeat, bar = Math.floor((startBarBeat - barOffsetBeats) / beatsPerBar) + 1;
    beat <= totalBeats + GRID_EPSILON && beat <= viewport.endBeat + beatsPerBar;
    beat += beatsPerBar, bar += 1) {
    const x = beatToX(beat, pixelsPerBeat);
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);

    ctx.fillStyle = "rgba(255,255,255,0.94)";
    ctx.font = '700 11px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillText(`${bar}.1.1`, x + 6, 2);

    ctx.font = '10px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.fillStyle = "rgba(255,255,255,0.42)";
    for (let beatIndex = 2; beatIndex <= beatsPerBar; beatIndex += 1) {
      const beatX = beatToX(beat + (beatIndex - 1), pixelsPerBeat);
      if (beatX > viewport.endX + viewport.startX) break;
      ctx.fillText(String(beatIndex), beatX + 6, 3);
    }
  }
  ctx.stroke();

  ctx.beginPath();
  for (let beat = 0; beat <= totalBeats + GRID_EPSILON && beat <= viewport.endBeat + divBeats; beat += divBeats) {
    if (beat < viewport.startBeat - divBeats) continue;
    if (isBarDownbeat(beat, beatsPerBar, barOffsetBeats)) continue;

    const x = beatToX(beat, pixelsPerBeat);
    const isBeat = Math.abs(beat - Math.round(beat)) < GRID_EPSILON;
    const tickHeight = isBeat ? height * 0.52 : height * 0.28;
    ctx.strokeStyle = isBeat
      ? "rgba(255,255,255,0.16)"
      : "rgba(255,255,255,0.09)";
    ctx.moveTo(x + 0.5, height - tickHeight);
    ctx.lineTo(x + 0.5, height);
    ctx.stroke();
    ctx.beginPath();
  }

  ctx.restore();
}
