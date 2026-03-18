import { useMemo } from "react";

interface UseStudioNoteAuditionModelOptions {
  canUseNativeNoteAudition: boolean;
  onSendNote: (trackId: string, pitch: number, velocity: number) => void;
}

export function useStudioNoteAuditionModel({
  canUseNativeNoteAudition,
  onSendNote,
}: UseStudioNoteAuditionModelOptions) {
  return useMemo(
    () => ({
      canUseNativeNoteAudition,
      sendNativeNote: canUseNativeNoteAudition ? onSendNote : undefined,
    }),
    [canUseNativeNoteAudition, onSendNote],
  );
}
