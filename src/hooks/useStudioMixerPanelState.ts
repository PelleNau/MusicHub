import { useMemo, useState } from "react";

export function useStudioMixerPanelState(initialMasterVolume = 0.8) {
  const [masterVolume, setMasterVolume] = useState(initialMasterVolume);

  return useMemo(
    () => ({
      masterVolume,
      setMasterVolume,
    }),
    [masterVolume],
  );
}

export type StudioMixerPanelStateResult = ReturnType<typeof useStudioMixerPanelState>;
