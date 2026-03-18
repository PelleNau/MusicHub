import { BookOpen, Target, Zap, CheckCircle2 } from "lucide-react";

export type Phase = "learn" | "practice" | "apply";

interface ModulePhaseHeaderProps {
  title: string;
  subtitle: string;
  activePhase: Phase;
  completedPhases: Phase[];
}

const PHASES: { key: Phase; label: string; icon: React.ElementType }[] = [
  { key: "learn", label: "Learn", icon: BookOpen },
  { key: "practice", label: "Practice", icon: Target },
  { key: "apply", label: "Apply", icon: Zap },
];

export function ModulePhaseHeader({ title, subtitle, activePhase, completedPhases }: ModulePhaseHeaderProps) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{subtitle}</p>
        <h2 className="text-lg font-mono font-bold">{title}</h2>
      </div>

      {/* Phase tabs */}
      <div className="flex items-center gap-1">
        {PHASES.map((p, i) => {
          const isActive = p.key === activePhase;
          const isDone = completedPhases.includes(p.key);
          const Icon = isDone ? CheckCircle2 : p.icon;

          return (
            <div key={p.key} className="flex items-center">
              {i > 0 && (
                <div className={`w-8 h-px mx-1 ${isDone || isActive ? "bg-primary/40" : "bg-muted"}`} />
              )}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.3)]"
                    : isDone
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <Icon className="h-3 w-3" />
                {p.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{
            width: `${
              ((completedPhases.length + (completedPhases.includes(activePhase) ? 0 : 0.5)) / 3) * 100
            }%`,
          }}
        />
      </div>
    </div>
  );
}
