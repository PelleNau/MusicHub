import { ModuleCompletionCelebration } from "@/components/mockups/ModuleCompletionCelebration";
import { StudioLessonPanel } from "@/components/studio/StudioLessonPanel";
import type { StudioLessonPanelModelResult } from "@/hooks/useStudioLessonPanelModel";
import type { StudioGuideBridgeResult } from "@/hooks/useStudioGuideBridge";

interface StudioGuideSidebarProps {
  guideBridge: StudioGuideBridgeResult;
  lessonPanelModel: StudioLessonPanelModelResult;
  onDismissCompletion: () => void;
}

export function StudioGuideSidebar({
  guideBridge,
  lessonPanelModel,
  onDismissCompletion,
}: StudioGuideSidebarProps) {
  if (guideBridge.runtime.state.lessonStatus === "completed" && guideBridge.lesson) {
    return (
      <div className="w-72 border-l border-border bg-card overflow-auto">
        <ModuleCompletionCelebration
          title={guideBridge.lesson.title}
          objectives={guideBridge.lesson.objectives ?? []}
          totalXp={guideBridge.lesson.steps.length * 10}
          onNext={onDismissCompletion}
        />
      </div>
    );
  }

  return (
    <StudioLessonPanel
      state={lessonPanelModel.lessonState}
      onToggleCollapsed={lessonPanelModel.toggleCollapsed}
      onSkipStep={lessonPanelModel.skipCurrentStep}
      onResetStep={lessonPanelModel.resetCurrentStep}
      onAbortLesson={() => lessonPanelModel.abortLesson("user_closed")}
    />
  );
}
