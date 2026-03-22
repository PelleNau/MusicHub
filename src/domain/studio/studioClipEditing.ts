import { snapToGrid } from "@/hooks/useTimelineGrid";

export function resolveClipSplitBeat(
  clipStartBeat: number,
  clipEndBeat: number,
  candidateBeat: number | undefined,
  snapBeats: number,
) {
  const fallbackBeat = (clipStartBeat + clipEndBeat) / 2;
  const targetBeat = candidateBeat ?? fallbackBeat;
  const snappedBeat = snapBeats > 0 ? snapToGrid(targetBeat, snapBeats) : targetBeat;

  if (snappedBeat <= clipStartBeat || snappedBeat >= clipEndBeat) {
    return fallbackBeat;
  }

  return snappedBeat;
}
