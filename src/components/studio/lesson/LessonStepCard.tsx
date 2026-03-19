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
        "space-y-4 rounded-[12px] border p-4",
        "border-white/8 bg-[#283246] shadow-[0_10px_30px_-20px_rgba(0,0,0,0.55)]",
      )}
    >
      {/* Step title + status */}
      {currentStepTitle && (
        <div className="flex items-start gap-2.5">
          <StepStatusIndicator status={stepStatus} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium leading-tight text-white">
              {currentStepTitle}
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/42">
              {stepStatus.replace(/_/g, " ")}
            </div>
          </div>
        </div>
      )}

      {/* Instruction */}
      {instruction && (
        <div className="rounded-xl border border-white/8 bg-white/4 px-4 py-3">
          <div className="mb-1 text-[10px] uppercase tracking-[0.18em] text-white/46">
            Current Action
          </div>
          <p className="text-sm leading-relaxed text-white/82">
            {instruction}
          </p>
        </div>
      )}

      {/* Hints */}
      {activeHints.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/42">
            Hints
          </div>
          {activeHints.map((hint) => (
            <div
              key={hint.id}
              className="rounded-xl border border-white/8 bg-[#20242f] px-3 py-2.5 text-[11px] leading-relaxed text-white/65"
            >
              {hint.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
