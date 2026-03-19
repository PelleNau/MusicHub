import { ChevronRight, X, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import type { GuideLessonStatus } from "@/types/musicHubGuideRuntime";
import { cn } from "@/lib/utils";

interface LessonHeaderProps {
  mode: "guided" | "standard" | "focused";
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
  mode,
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
    <div
      className={cn(
        "shrink-0 border-b border-border/70",
        mode === "focused"
          ? "bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.08),transparent_62%)]"
          : "bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_58%)]",
      )}
    >
      {/* Title row */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.22em] text-foreground/45">
            <BookOpen className="h-3 w-3" />
            Lesson Guide
          </div>
          <div className="mt-2 text-base font-mono font-semibold text-foreground truncate">
            {title}
          </div>
          <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-foreground/60">
            {mode === "focused"
              ? "Lesson support stays available while the canvas remains prioritized."
              : "Stay inside the highlighted workspace. The guide will reveal more of Studio only when the lesson needs it."}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            onClick={onToggleCollapsed}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/70 bg-background/80 text-foreground/60 transition-colors hover:text-foreground hover:bg-background"
            title="Collapse lesson guide"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onAbortLesson}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/70 bg-background/80 text-foreground/60 transition-colors hover:text-foreground hover:bg-background"
            title="Close lesson"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Status + progress */}
      <div className="space-y-2 px-4 pb-4">
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
        <div className="border-t border-border/50 bg-background/35">
          <button
            onClick={() => setShowObjectives(!showObjectives)}
            className="flex w-full items-center justify-between px-4 py-3 text-[10px] font-mono uppercase tracking-[0.18em] text-foreground/45 transition-colors hover:text-foreground/60"
          >
            <span>Objectives ({objectives.length})</span>
            {showObjectives ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {showObjectives && (
            <ul className="space-y-2 px-4 pb-4">
              {objectives.map((obj, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] leading-relaxed text-foreground/65">
                  <span className="mt-0.5 font-mono text-[9px] text-foreground/30">{i + 1}.</span>
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
