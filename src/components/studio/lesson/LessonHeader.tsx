import { ChevronRight, X, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import type { GuideLessonStatus } from "@/types/musicHubGuideRuntime";

interface LessonHeaderProps {
  title?: string;
  lessonStatus: GuideLessonStatus;
  stepIndex: number;
  stepCount: number;
  objectives: string[];
  onToggleCollapsed: () => void;
  onAbortLesson: () => void;
}

function statusBadge(status: GuideLessonStatus) {
  switch (status) {
    case "completed":
      return { label: "Complete", className: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" };
    case "failed":
    case "aborted":
      return { label: status === "failed" ? "Failed" : "Ended", className: "text-rose-400 border-rose-500/30 bg-rose-500/10" };
    case "active":
      return { label: "In Progress", className: "text-primary border-primary/30 bg-primary/10" };
    default:
      return { label: "Ready", className: "text-foreground/50 border-border bg-muted/20" };
  }
}

export function LessonHeader({
  title,
  lessonStatus,
  stepIndex,
  stepCount,
  objectives,
  onToggleCollapsed,
  onAbortLesson,
}: LessonHeaderProps) {
  const [showObjectives, setShowObjectives] = useState(false);
  const badge = statusBadge(lessonStatus);
  const progressPercent = stepCount > 0 ? Math.round(((stepIndex) / stepCount) * 100) : 0;

  return (
    <div className="shrink-0 border-b border-border">
      {/* Title row */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-foreground/45">
            <BookOpen className="h-3 w-3" />
            Lesson Guide
          </div>
          <div className="mt-1 text-sm font-mono font-semibold text-foreground truncate">
            {title}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            onClick={onToggleCollapsed}
            className="h-7 w-7 rounded-md border border-border bg-background/80 text-foreground/60 hover:text-foreground hover:bg-background transition-colors flex items-center justify-center"
            title="Collapse lesson guide"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onAbortLesson}
            className="h-7 w-7 rounded-md border border-border bg-background/80 text-foreground/60 hover:text-foreground hover:bg-background transition-colors flex items-center justify-center"
            title="Close lesson"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Status + progress */}
      <div className="px-3 pb-2.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono ${badge.className}`}>
            {badge.label}
          </span>
          <span className="text-[10px] font-mono text-foreground/50 tabular-nums">
            {Math.min(stepIndex + 1, Math.max(stepCount, 1))} / {Math.max(stepCount, 1)}
          </span>
        </div>
        <Progress value={progressPercent} className="h-1 bg-muted/30" />
      </div>

      {/* Objectives disclosure */}
      {objectives.length > 0 && (
        <div className="border-t border-border/50">
          <button
            onClick={() => setShowObjectives(!showObjectives)}
            className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-foreground/45 hover:text-foreground/60 transition-colors"
          >
            <span>Objectives ({objectives.length})</span>
            {showObjectives ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {showObjectives && (
            <ul className="px-3 pb-2.5 space-y-1.5">
              {objectives.map((obj, i) => (
                <li key={i} className="text-[11px] text-foreground/65 leading-relaxed flex items-start gap-2">
                  <span className="text-foreground/30 font-mono text-[9px] mt-0.5">{i + 1}.</span>
                  {obj}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
