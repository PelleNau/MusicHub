import { useMemo } from "react";
import type { SessionTrack } from "@/types/studio";
import type { MeterLevel } from "@/services/pluginHostSocket";

interface UseStudioMixerViewModelOptions {
  tracks: SessionTrack[];
  selectedTrackId: string | null;
  masterMeter: MeterLevel | null;
  trackMeters: Record<string, MeterLevel>;
}

export function useStudioMixerViewModel({
  tracks,
  selectedTrackId,
  masterMeter,
  trackMeters,
}: UseStudioMixerViewModelOptions) {
  return useMemo(
    () => ({
      tracks,
      selectedTrackId,
      masterMeter,
      trackMeters,
    }),
    [masterMeter, selectedTrackId, trackMeters, tracks],
  );
}

export type StudioMixerViewModelResult = ReturnType<typeof useStudioMixerViewModel>;
