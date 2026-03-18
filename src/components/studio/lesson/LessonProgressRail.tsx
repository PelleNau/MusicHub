import { Check } from "lucide-react";
import type { GuideLessonStatus } from "@/types/musicHubGuideRuntime";

interface LessonProgressRailProps {
  stepIndex: number;
  stepCount: number;
  stepTitles: string[];
  lessonStatus: GuideLessonStatus;
}

export function LessonProgressRail({
  stepIndex,
  stepCount,
  stepTitles,
  lessonStatus,
}: LessonProgressRailProps) {
  if (stepCount === 0) return null;

  return (
    <div className="space-y-0">
      {Array.from({ length: stepCount }).map((_, i) => {
        const isCompleted = i < stepIndex || (i === stepIndex && lessonStatus === "completed");
        const isActive = i === stepIndex && lessonStatus === "active";
        const isFuture = i > stepIndex;
        const title = stepTitles[i] ?? `Step ${i + 1}`;

        return (
          <div key={i} className="flex items-start gap-2.5 relative">
            {/* Vertical connector */}
            <div className="flex flex-col items-center shrink-0 w-5">
              {/* Node */}
              {isCompleted ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Check className="h-2.5 w-2.5" />
                </span>
              ) : isActive ? (
                <span className="relative flex h-5 w-5 items-center justify-center shrink-0">
                  <span className="animate-ping absolute h-4 w-4 rounded-full bg-primary/30" />
                  <span className="relative h-3 w-3 rounded-full bg-primary" />
                </span>
              ) : (
                <span className="flex h-5 w-5 items-center justify-center shrink-0">
                  <span className="h-2.5 w-2.5 rounded-full border-2 border-foreground/15" />
                </span>
              )}
              {/* Line to next */}
              {i < stepCount - 1 && (
                <div className={`w-px flex-1 min-h-[12px] ${isCompleted ? "bg-emerald-500/30" : "bg-border/50"}`} />
              )}
            </div>

            {/* Label */}
            <span
              className={`text-[11px] font-mono leading-tight pt-0.5 pb-3 ${
                isActive
                  ? "text-foreground font-medium"
                  : isCompleted
                  ? "text-foreground/50 line-through"
                  : isFuture
                  ? "text-foreground/30"
                  : "text-foreground/50"
              }`}
            >
              {title}
            </span>
          </div>
        );
      })}
    </div>
  );
}
