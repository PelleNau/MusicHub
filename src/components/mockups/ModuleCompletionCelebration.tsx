import { Sparkles, Zap, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ModuleCompletionCelebrationProps {
  title: string;
  objectives: string[];
  totalXp: number;
  onNext: () => void;
}

export function ModuleCompletionCelebration({ title, objectives, totalXp, onNext }: ModuleCompletionCelebrationProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 animate-fade-in">
      <div className="relative">
        <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-ring">
          <Sparkles className="h-10 w-10 text-primary animate-float" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-xl font-mono font-bold">Module Complete!</h2>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>

      {/* Objectives */}
      <div className="w-full max-w-xs space-y-2">
        {objectives.map((obj, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            <span>{obj}</span>
          </div>
        ))}
      </div>

      {/* XP */}
      <div className="flex items-center gap-2 text-lg font-mono font-bold text-primary">
        <Zap className="h-5 w-5" /> +{totalXp} XP
      </div>

      <Button size="sm" className="text-xs gap-1.5 mt-2" onClick={onNext}>
        Next Module <ChevronRight className="h-3 w-3" />
      </Button>
    </div>
  );
}
