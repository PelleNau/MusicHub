import { ChevronLeft, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LessonHeader } from "@/components/studio/lesson/LessonHeader";
import { LessonStepCard } from "@/components/studio/lesson/LessonStepCard";
import { LessonProgressRail } from "@/components/studio/lesson/LessonProgressRail";
import type { StudioLessonPanelState } from "@/domain/studio/studioViewContracts";

interface StudioLessonPanelProps {
  state: StudioLessonPanelState;
  onToggleCollapsed: () => void;
  onSkipStep: () => void;
  onResetStep: () => void;
  onAbortLesson: () => void;
}

export function StudioLessonPanel({
  state,
  onToggleCollapsed,
  onSkipStep,
  onResetStep,
  onAbortLesson,
}: StudioLessonPanelProps) {
  if (!state.visible) return null;

  if (state.collapsed) {
    return (
      <div className="w-10 shrink-0 border-l border-border bg-card/80 flex flex-col items-center py-3 gap-3">
        <button
          onClick={onToggleCollapsed}
          className="h-8 w-8 rounded-md border border-border bg-background/80 text-foreground/70 hover:text-foreground hover:bg-background transition-colors flex items-center justify-center"
          title="Open lesson guide"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="rotate-180 [writing-mode:vertical-rl] text-[10px] font-mono uppercase tracking-wider text-foreground/45">
          Lesson
        </div>
      </div>
    );
  }

  return (
    <aside className="w-[320px] shrink-0 border-l border-border bg-card/80 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <LessonHeader
        title={state.title}
        lessonStatus={state.lessonStatus}
        stepIndex={state.stepIndex}
        stepCount={state.stepCount}
        objectives={state.objectives}
        onToggleCollapsed={onToggleCollapsed}
        onAbortLesson={onAbortLesson}
      />

      {/* Scrollable content */}
      <ScrollArea className="flex-1">
        <div className="px-3 py-3 space-y-4">
          {/* Progress rail */}
          <LessonProgressRail
            stepIndex={state.stepIndex}
            stepCount={state.stepCount}
            stepTitles={state.stepTitles}
            lessonStatus={state.lessonStatus}
          />

          {/* Active step card */}
          <LessonStepCard
            currentStepTitle={state.currentStepTitle}
            instruction={state.instruction}
            stepStatus={state.stepStatus}
            activeHints={state.activeHints}
          />
        </div>
      </ScrollArea>

      {/* Action bar */}
      <div className="shrink-0 flex items-center gap-2 px-3 py-3 border-t border-border">
        <Button size="sm" variant="outline" className="font-mono text-xs gap-1.5" onClick={onResetStep}>
          <RotateCcw className="h-3 w-3" />
          Reset Step
        </Button>
        <Button size="sm" variant="outline" className="font-mono text-xs gap-1.5" onClick={onSkipStep}>
          <SkipForward className="h-3 w-3" />
          Skip
        </Button>
      </div>
    </aside>
  );
}
