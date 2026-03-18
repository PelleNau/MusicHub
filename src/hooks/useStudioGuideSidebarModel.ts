import { useMemo } from "react";
import type { StudioGuideBridgeResult } from "@/hooks/useStudioGuideBridge";
import type { StudioLessonPanelModelResult } from "@/hooks/useStudioLessonPanelModel";

interface UseStudioGuideSidebarModelOptions {
  guideBridge: StudioGuideBridgeResult;
  lessonPanelModel: StudioLessonPanelModelResult;
  onDismissCompletion: () => void;
}

export function useStudioGuideSidebarModel({
  guideBridge,
  lessonPanelModel,
  onDismissCompletion,
}: UseStudioGuideSidebarModelOptions) {
  return useMemo(() => ({
    guideBridge,
    lessonPanelModel,
    onDismissCompletion,
  }), [guideBridge, lessonPanelModel, onDismissCompletion]);
}
