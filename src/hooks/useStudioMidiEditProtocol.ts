import { useMemo } from "react";
import type { StudioCommandDispatchResult } from "@/hooks/useStudioCommandDispatch";

interface UseStudioMidiEditProtocolOptions {
  commandDispatch: StudioCommandDispatchResult;
}

export function useStudioMidiEditProtocol({
  commandDispatch,
}: UseStudioMidiEditProtocolOptions) {
  return useMemo(
    () => ({
      mode: "replace_plus_granular" as const,
      replaceNotes: commandDispatch.replaceMidiNotes,
      insertNotes: commandDispatch.insertMidiNotes,
      updateNotes: commandDispatch.updateMidiNotes,
      deleteNotes: commandDispatch.deleteMidiNotes,
    }),
    [
      commandDispatch.deleteMidiNotes,
      commandDispatch.insertMidiNotes,
      commandDispatch.replaceMidiNotes,
      commandDispatch.updateMidiNotes,
    ],
  );
}
