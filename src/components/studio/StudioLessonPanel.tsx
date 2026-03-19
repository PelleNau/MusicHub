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
      <div className={cn(
        "flex w-12 shrink-0 flex-col items-center gap-3 rounded-[20px] border py-3 backdrop-blur-xl",
        mode === "guided"
          ? "border-border/70 bg-card/85 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.7)]"
          : "border-border/60 bg-card/72 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.55)]",
      )}>
        <button
          onClick={onToggleCollapsed}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-colors hover:bg-primary/15"
          title="Open lesson guide"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="rotate-180 [writing-mode:vertical-rl] text-[10px] font-mono uppercase tracking-[0.24em] text-foreground/45">
          Lesson
        </div>
      </div>
    );
  }

  return (
    <aside className={cn(
      "flex shrink-0 flex-col overflow-hidden rounded-[24px] border backdrop-blur-xl",
      mode === "guided"
        ? "w-[360px] border-border/70 bg-card/88 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.82)]"
        : "w-[320px] border-border/60 bg-card/78 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.62)]",
    )}>
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
      <div className="shrink-0 border-t border-border/70 bg-background/55 px-4 py-3">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/35">
          Step Controls
        </div>
        <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" className="gap-1.5 font-mono text-xs" onClick={onResetStep}>
          <RotateCcw className="h-3 w-3" />
          Reset Step
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5 font-mono text-xs" onClick={onSkipStep}>
          <SkipForward className="h-3 w-3" />
          Skip
        </Button>
        </div>
      </div>
    </aside>
  );
}
