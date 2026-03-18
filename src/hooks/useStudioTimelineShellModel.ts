import { useMemo, useState } from "react";
import type { StudioCommandDispatchResult } from "@/hooks/useStudioCommandDispatch";

interface UseStudioTimelineShellModelOptions {
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
  totalBeats: number;
  snapBeats: number;
  commandDispatch: StudioCommandDispatchResult;
  onLoopToSelection: () => void;
}

export function useStudioTimelineShellModel({
  loopEnabled,
  loopStart,
  loopEnd,
  totalBeats,
  snapBeats,
  commandDispatch,
  onLoopToSelection,
}: UseStudioTimelineShellModelOptions) {
  const [loopFocused, setLoopFocused] = useState(false);

  const timelineContainerProps = useMemo(
    () => ({
      onClick: () => setLoopFocused(false),
    }),
    [],
  );

  const loopRegionProps = useMemo(
    () => ({
      loopStart,
      loopEnd,
      loopEnabled,
      totalBeats,
      snapBeats,
      onLoopChange: (start: number, end: number) => commandDispatch.setLoop(loopEnabled, start, end),
      onLoopToggle: () => commandDispatch.setLoop(!loopEnabled, loopStart, loopEnd),
      onLoopFocus: () => setLoopFocused(true),
      onLoopToSelection,
    }),
    [
      commandDispatch,
      loopEnabled,
      loopEnd,
      loopStart,
      onLoopToSelection,
      snapBeats,
      totalBeats,
    ],
  );

  const loopState = useMemo(
    () => ({
      focused: loopFocused,
      start: loopStart,
      end: loopEnd,
      enabled: loopEnabled,
    }),
    [loopEnabled, loopEnd, loopFocused, loopStart],
  );

  return {
    loopState,
    timelineContainerProps,
    loopRegionProps,
  };
}
