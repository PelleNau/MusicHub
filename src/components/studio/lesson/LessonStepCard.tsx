import { Check, Loader2, AlertCircle } from "lucide-react";
import type { GuideStepStatus } from "@/types/musicHubGuideRuntime";

interface LessonStepCardProps {
  currentStepTitle?: string;
  instruction?: string;
  stepStatus: GuideStepStatus;
  activeHints: Array<{ id: string; text: string }>;
}

function StepStatusIndicator({ status }: { status: GuideStepStatus }) {
  switch (status) {
    case "completed":
      return (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
          <Check className="h-3 w-3" />
        </span>
      );
    case "arming":
      return (
        <span className="relative flex h-5 w-5 items-center justify-center">
          <span className="animate-ping absolute h-4 w-4 rounded-full bg-primary/40" />
          <span className="relative h-3 w-3 rounded-full bg-primary" />
        </span>
      );
    case "awaiting_expected":
    case "awaiting_validation":
      return (
        <span className="flex h-5 w-5 items-center justify-center">
          <Loader2 className="h-3.5 w-3.5 text-amber-400 animate-spin" />
        </span>
      );
    case "failed":
      return (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500/15 text-rose-400">
          <AlertCircle className="h-3 w-3" />
        </span>
      );
    default:
      return (
        <span className="h-3 w-3 rounded-full border-2 border-foreground/20" />
      );
  }
}

export function LessonStepCard({
  currentStepTitle,
  instruction,
  stepStatus,
  activeHints,
}: LessonStepCardProps) {
  return (
    <div className="space-y-3">
      {/* Step title + status */}
      {currentStepTitle && (
        <div className="flex items-start gap-2.5">
          <StepStatusIndicator status={stepStatus} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-mono font-medium text-foreground leading-tight">
              {currentStepTitle}
            </div>
            <div className="mt-0.5 text-[10px] font-mono text-foreground/40 capitalize">
              {stepStatus.replace(/_/g, " ")}
            </div>
          </div>
        </div>
      )}

      {/* Instruction */}
      {instruction && (
        <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2.5">
          <p className="text-xs leading-relaxed text-foreground/80">
            {instruction}
          </p>
        </div>
      )}

      {/* Hints */}
      {activeHints.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[10px] font-mono uppercase tracking-wider text-foreground/40">
            Hints
          </div>
          {activeHints.map((hint) => (
            <div
              key={hint.id}
              className="rounded-md border border-border bg-background/60 px-2.5 py-2 text-[11px] text-foreground/65 leading-relaxed"
            >
              {hint.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
