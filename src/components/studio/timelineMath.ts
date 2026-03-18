export const TRACK_HEADER_WIDTH = 208;
export const RULER_HEIGHT = 24;
export const GRID_EPSILON = 1e-9;

export interface TimelineViewportRange {
  startBeat: number;
  endBeat: number;
  startX: number;
  endX: number;
}

export function getViewportRange(
  scrollLeft: number,
  viewportWidth: number,
  pixelsPerBeat: number,
  totalBeats: number,
): TimelineViewportRange {
  const startX = Math.max(0, scrollLeft - TRACK_HEADER_WIDTH);
  const endX = Math.max(startX, startX + viewportWidth);
  const startBeat = Math.max(0, startX / pixelsPerBeat);
  const endBeat = Math.min(totalBeats, endX / pixelsPerBeat);

  return { startBeat, endBeat, startX, endX };
}

export function beatToX(beat: number, pixelsPerBeat: number) {
  return beat * pixelsPerBeat;
}

export function xToBeat(x: number, pixelsPerBeat: number) {
  return Math.max(0, x / pixelsPerBeat);
}

export function beatToContentX(beat: number, pixelsPerBeat: number) {
  return beatToX(beat, pixelsPerBeat);
}

export function beatToAbsoluteX(beat: number, pixelsPerBeat: number) {
  return TRACK_HEADER_WIDTH + beatToContentX(beat, pixelsPerBeat);
}

export function contentXToBeat(contentX: number, pixelsPerBeat: number) {
  return xToBeat(contentX, pixelsPerBeat);
}

export function clientXToBeat({
  clientX,
  timelineRectLeft,
  scrollLeft,
  pixelsPerBeat,
}: {
  clientX: number;
  timelineRectLeft: number;
  scrollLeft: number;
  pixelsPerBeat: number;
}) {
  const contentX = clientX - timelineRectLeft - TRACK_HEADER_WIDTH + scrollLeft;
  return contentXToBeat(contentX, pixelsPerBeat);
}

export function toGridIndex(beat: number, stepBeats: number) {
  if (stepBeats <= 0) return 0;
  return Math.round(beat / stepBeats);
}

export function generateGridBeats(totalBeats: number, stepBeats: number, startBeat: number) {
  if (stepBeats <= 0) return [] as number[];

  const beats: number[] = [];
  const startIndex = Math.ceil((startBeat - GRID_EPSILON) / stepBeats);
  const endIndex = Math.floor((totalBeats + GRID_EPSILON) / stepBeats);

  for (let index = startIndex; index <= endIndex; index += 1) {
    const beat = index * stepBeats;
    const normalizedBeat =
      Math.abs(beat - Math.round(beat)) < GRID_EPSILON ? Math.round(beat) : beat;
    beats.push(normalizedBeat);
  }

  return beats;
}

export function getBarOffsetBeats(_beatsPerBar: number) {
  return 0;
}

export function isBarDownbeat(beat: number, beatsPerBar: number, barOffsetBeats: number) {
  if (beatsPerBar <= 0) return false;
  const normalized = (beat - barOffsetBeats) / beatsPerBar;
  return Math.abs(normalized - Math.round(normalized)) < GRID_EPSILON;
}
