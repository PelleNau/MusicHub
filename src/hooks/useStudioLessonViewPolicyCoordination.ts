import { useEffect, useRef } from "react";
import type { LessonViewPolicy } from "@/types/musicHubLessonDsl";
import type { StudioCommandDispatchResult } from "@/hooks/useStudioCommandDispatch";
import type { StudioPanelState } from "@/domain/studio/studioViewContracts";

function resolveRequestedPanel(viewPolicy?: LessonViewPolicy): "mixer" | "pianoRoll" | "detail" | null {
  if (!viewPolicy) return null;

  const focus = viewPolicy.viewport?.focus;
  if (focus === "mixer") return "mixer";
  if (focus === "pianoRoll") return "pianoRoll";
  if (focus === "detail") return "detail";

  const panels = viewPolicy.panels;
  if (panels?.mixer === "show" || panels?.mixer === "collapse") return "mixer";
  if (panels?.pianoRoll === "show" || panels?.pianoRoll === "collapse") return "pianoRoll";
  if (panels?.detail === "show" || panels?.detail === "collapse") return "detail";

  return null;
}

export function useStudioLessonViewPolicyCoordination({
  viewPolicy,
  panelState,
  commandDispatch,
}: {
  viewPolicy?: LessonViewPolicy;
  panelState: Pick<StudioPanelState, "showMixer" | "showPianoRoll" | "showBottomWorkspace">;
  commandDispatch: StudioCommandDispatchResult;
}) {
  const lastRequestedPanelRef = useRef<string | null>(null);
  const requestedPanel = resolveRequestedPanel(viewPolicy);

  useEffect(() => {
    if (!requestedPanel) {
      lastRequestedPanelRef.current = null;
      return;
    }

    const alreadyVisible =
      (requestedPanel === "mixer" && panelState.showMixer) ||
      (requestedPanel === "pianoRoll" && panelState.showPianoRoll) ||
      (requestedPanel === "detail" && panelState.showBottomWorkspace && !panelState.showMixer && !panelState.showPianoRoll);

    if (alreadyVisible || lastRequestedPanelRef.current === requestedPanel) return;

    commandDispatch.openPanel(requestedPanel);
    lastRequestedPanelRef.current = requestedPanel;
  }, [
    commandDispatch,
    panelState.showBottomWorkspace,
    panelState.showMixer,
    panelState.showPianoRoll,
    requestedPanel,
  ]);
}
