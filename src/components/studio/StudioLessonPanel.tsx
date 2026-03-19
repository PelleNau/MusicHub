import { ChevronLeft, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LessonHeader } from "@/components/studio/lesson/LessonHeader";
import { LessonStepCard } from "@/components/studio/lesson/LessonStepCard";
import { LessonProgressRail } from "@/components/studio/lesson/LessonProgressRail";
import type { StudioLessonPanelState } from "@/domain/studio/studioViewContracts";
import { cn } from "@/lib/utils";

interface StudioLessonPanelProps {
  mode: "guided" | "standard" | "focused";
  state: StudioLessonPanelState;
  onToggleCollapsed: () => void;
  onSkipStep: () => void;
  onResetStep: () => void;
  onAbortLesson: () => void;
}

export function StudioLessonPanel({
  mode,
  state,
  onToggleCollapsed,
  onSkipStep,
  onResetStep,
  onAbortLesson,
}: StudioLessonPanelProps) {
  if (!state.visible) return null;

  if (state.collapsed) {
    return (
      <div
        className={cn(
          "flex shrink-0 flex-col items-center gap-3 rounded-[12px] border py-3 backdrop-blur-xl",
          mode === "focused"
            ? "w-10 border-white/8 bg-[#232429] shadow-[0_14px_40px_-28px_rgba(15,23,42,0.55)]"
            : "w-12 border-white/8 bg-[#232429] shadow-[0_18px_50px_-28px_rgba(15,23,42,0.7)]",
        )}
      >
        <button
          onClick={onToggleCollapsed}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/8 bg-white/4 text-white/65 transition-colors hover:bg-white/8"
          title="Open lesson guide"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="rotate-180 [writing-mode:vertical-rl] text-[10px] uppercase tracking-[0.24em] text-white/35">
          Lesson
        </div>
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col overflow-hidden rounded-none border-l backdrop-blur-xl",
        mode === "focused"
          ? "w-[288px] border-white/8 bg-[#1f2025]"
          : "w-[340px] border-white/8 bg-[#1f2025]",
      )}
    >
      {/* Header */}
      <LessonHeader
        mode={mode}
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
        <div className="space-y-4 px-4 py-4">
          {/* Progress rail */}
          <LessonProgressRail
            stepIndex={state.stepIndex}
            stepCount={state.stepCount}
            stepTitles={state.stepTitles}
            lessonStatus={state.lessonStatus}
          />

          {/* Active step card */}
          <LessonStepCard
            mode={mode}
            currentStepTitle={state.currentStepTitle}
            instruction={state.instruction}
            stepStatus={state.stepStatus}
            activeHints={state.activeHints}
          />
        </div>
      </ScrollArea>

      {/* Action bar */}
      <div className="shrink-0 border-t border-white/6 bg-[#1f2025] px-4 py-3">
        <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-white/32">
          Step Controls
        </div>
        <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" className="gap-1.5 border-white/8 bg-white/4 text-xs text-white/78 hover:bg-white/8" onClick={onResetStep}>
          <RotateCcw className="h-3 w-3" />
          Reset Step
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5 border-white/8 bg-[#4a8fe8] text-xs text-white hover:bg-[#5a9cf1]" onClick={onSkipStep}>
          <SkipForward className="h-3 w-3" />
          Continue
        </Button>
        </div>
      </div>
    </aside>
  );
}
