import { Check, Loader2, AlertCircle } from "lucide-react";
import type { GuideStepStatus } from "@/types/musicHubGuideRuntime";
import { cn } from "@/lib/utils";

interface LessonStepCardProps {
  mode: "guided" | "standard" | "focused";
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
  mode,
  currentStepTitle,
  instruction,
  stepStatus,
  activeHints,
}: LessonStepCardProps) {
  return (
    <div
      className={cn(
        "space-y-4 rounded-[20px] border p-4",
        mode === "focused"
          ? "border-border/60 bg-background/40 shadow-[0_14px_40px_-30px_rgba(15,23,42,0.45)]"
          : "border-border/70 bg-background/55 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.7)]",
      )}
    >
      {/* Step title + status */}
      {currentStepTitle && (
        <div className="flex items-start gap-2.5">
          <StepStatusIndicator status={stepStatus} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-mono font-medium leading-tight text-foreground">
              {currentStepTitle}
            </div>
            <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.18em] text-foreground/40">
              {stepStatus.replace(/_/g, " ")}
            </div>
          </div>
        </div>
      )}

      {/* Instruction */}
      {instruction && (
        <div className="rounded-2xl border border-primary/20 bg-primary/8 px-4 py-3">
          <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-primary/70">
            Current Action
          </div>
          <p className="text-sm leading-relaxed text-foreground/82">
            {instruction}
          </p>
        </div>
      )}

      {/* Hints */}
      {activeHints.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-foreground/40">
            Hints
          </div>
          {activeHints.map((hint) => (
            <div
              key={hint.id}
              className="rounded-xl border border-border/70 bg-card/65 px-3 py-2.5 text-[11px] leading-relaxed text-foreground/65"
            >
              {hint.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
