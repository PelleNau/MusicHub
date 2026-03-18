import { useEffect } from "react";
import { BookOpen, Target, Zap, CheckCircle2 } from "lucide-react";
import type { Phase } from "./ModulePhaseHeader";

interface PhaseTransitionOverlayProps {
  completedPhase: Phase;
  nextPhase: Phase;
  onDone: () => void;
}

const META: Record<Phase, { label: string; icon: React.ElementType; next: string }> = {
  learn: { label: "Learn Phase", icon: BookOpen, next: "Starting Practice…" },
  practice: { label: "Practice Phase", icon: Target, next: "Starting Apply…" },
  apply: { label: "Apply Phase", icon: Zap, next: "Module Complete!" },
};

export function PhaseTransitionOverlay({ completedPhase, nextPhase, onDone }: PhaseTransitionOverlayProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 2000);
    return () => clearTimeout(t);
  }, [onDone]);

  const meta = META[completedPhase];
  const Icon = meta.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center gap-4 animate-scale-in">
        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-mono text-lg font-bold">{meta.label} Complete!</h3>
        <p className="text-sm text-muted-foreground">{meta.next}</p>
        <div className="flex gap-1 mt-2">
          {(["learn", "practice", "apply"] as Phase[]).map((p) => (
            <div
              key={p}
              className={`h-1.5 w-8 rounded-full ${
                p === completedPhase || (["learn", "practice", "apply"].indexOf(p) < ["learn", "practice", "apply"].indexOf(completedPhase))
                  ? "bg-primary"
                  : p === nextPhase
                  ? "bg-primary/30"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
