import { ModuleCompletionCelebration } from "@/components/mockups/ModuleCompletionCelebration";
import { StudioLessonPanel } from "@/components/studio/StudioLessonPanel";
import type { StudioLessonPanelModelResult } from "@/hooks/useStudioLessonPanelModel";
import type { StudioGuideBridgeResult } from "@/hooks/useStudioGuideBridge";

interface StudioGuideSidebarProps {
  mode: "guided" | "standard" | "focused";
  visible: boolean;
  guideBridge: StudioGuideBridgeResult;
  lessonPanelModel: StudioLessonPanelModelResult;
  onDismissCompletion: () => void;
}

export function StudioGuideSidebar({
  mode,
  visible,
  guideBridge,
  lessonPanelModel,
  onDismissCompletion,
}: StudioGuideSidebarProps) {
  if (!visible) {
    return null;
  }

  if (guideBridge.runtime.state.lessonStatus === "completed" && guideBridge.lesson) {
    return (
      <div
        className={mode === "focused"
          ? "ml-2 w-72 overflow-auto rounded-[22px] border border-[color:var(--lesson-border)] bg-[var(--lesson-bg)] shadow-[0_18px_60px_-38px_rgba(16,185,129,0.35)] backdrop-blur-xl"
          : "ml-3 w-80 overflow-auto rounded-[24px] border border-[color:var(--lesson-border)] bg-[var(--lesson-bg)] shadow-[0_24px_80px_-36px_rgba(16,185,129,0.45)] backdrop-blur-xl"}
        data-studio-mode={mode}
      >
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
    <div className={mode === "focused" ? "ml-2 flex h-full" : "ml-3 flex h-full"} data-studio-mode={mode}>
      <StudioLessonPanel
        mode={mode}
        state={lessonPanelModel.lessonState}
        onToggleCollapsed={lessonPanelModel.toggleCollapsed}
        onSkipStep={lessonPanelModel.skipCurrentStep}
        onResetStep={lessonPanelModel.resetCurrentStep}
        onAbortLesson={() => lessonPanelModel.abortLesson("user_closed")}
      />
    </div>
  );
}
