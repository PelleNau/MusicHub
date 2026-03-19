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
      <div className="ml-3 w-80 overflow-auto rounded-[24px] border border-emerald-500/20 bg-card/90 shadow-[0_24px_80px_-36px_rgba(16,185,129,0.45)] backdrop-blur-xl">
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
    <div className="ml-3 flex h-full">
      <StudioLessonPanel
        state={lessonPanelModel.lessonState}
        onToggleCollapsed={lessonPanelModel.toggleCollapsed}
        onSkipStep={lessonPanelModel.skipCurrentStep}
        onResetStep={lessonPanelModel.resetCurrentStep}
        onAbortLesson={() => lessonPanelModel.abortLesson("user_closed")}
      />
    </div>
  );
}
