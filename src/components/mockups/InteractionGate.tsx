import { Button } from "@/components/ui/button";
import { CheckCircle2, Lock } from "lucide-react";

interface InteractionGateProps {
  /** Map of requirement labels to whether they've been met */
  requirements: Record<string, boolean>;
  onContinue: () => void;
  continueLabel?: string;
  className?: string;
}

/**
 * Tracks required interactions and enables "Continue" only when all are met.
 * Used in lessons 1.1, 1.4, 1.5 as a progression gate.
 */
export function InteractionGate({
  requirements,
  onContinue,
  continueLabel = "Continue",
  className = "",
}: InteractionGateProps) {
  const entries = Object.entries(requirements);
  const allMet = entries.every(([, met]) => met);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {entries.map(([label, met]) => (
          <div
            key={label}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border transition-all ${
              met
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-secondary/30 text-muted-foreground"
            }`}
          >
            {met ? <CheckCircle2 className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
            {label}
          </div>
        ))}
      </div>
      <Button
        onClick={onContinue}
        disabled={!allMet}
        className="w-full"
        size="sm"
      >
        {allMet ? continueLabel : `Complete all tasks to continue`}
      </Button>
    </div>
  );
}
