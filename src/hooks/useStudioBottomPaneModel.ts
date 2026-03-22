import { useCallback } from "react";
import type { StudioCommandDispatchResult } from "@/hooks/useStudioCommandDispatch";
import type { StudioPanelState } from "@/domain/studio/studioViewContracts";

interface UseStudioBottomPaneModelOptions {
  panelState: StudioPanelState;
  commandDispatch: StudioCommandDispatchResult;
}

export function useStudioBottomPaneModel({
  panelState,
  commandDispatch,
}: UseStudioBottomPaneModelOptions) {
  const setBottomTab = useCallback(
    (tab: "editor" | "mixer") => {
      if (tab === "mixer") {
        commandDispatch.openPanel("mixer");
        return;
      }

      commandDispatch.openPanel(panelState.showPianoRoll ? "pianoRoll" : "detail");
    },
    [commandDispatch, panelState.showPianoRoll],
  );

  return {
    bottomTab: panelState.bottomTab,
    showPianoRoll: panelState.showPianoRoll,
    setBottomTab,
  };
}

export type StudioBottomPaneModelResult = ReturnType<typeof useStudioBottomPaneModel>;
