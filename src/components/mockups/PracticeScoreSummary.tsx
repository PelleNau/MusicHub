import { Trophy, RotateCcw, ChevronRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PracticeScoreSummaryProps {
  score: number;
  total: number;
  xp: number;
  onContinue: () => void;
  onRetry: () => void;
}

export function PracticeScoreSummary({ score, total, xp, onContinue, onRetry }: PracticeScoreSummaryProps) {
  const pct = Math.round((score / total) * 100);
  const passed = pct >= 60;
  const size = 120;
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);

  return (
    <div className="flex flex-col items-center gap-6 py-4 animate-fade-in">
      {/* Ring */}
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={10} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={passed ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
          strokeWidth={10} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-700"
        />
        <text x="50%" y="44%" textAnchor="middle" dy="0.35em" className="fill-foreground font-mono text-xl font-bold">{pct}%</text>
        <text x="50%" y="62%" textAnchor="middle" dy="0.35em" className="fill-muted-foreground font-mono text-[9px]">{score}/{total}</text>
      </svg>

      {passed ? (
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h3 className="font-mono font-bold text-lg">Practice Complete!</h3>
          </div>
          <p className="text-xs text-muted-foreground">Great job — you're ready to apply this in the Studio.</p>
          <div className="flex items-center justify-center gap-1 text-sm font-mono text-primary font-bold mt-2">
            <Zap className="h-4 w-4" /> +{xp} XP
          </div>
        </div>
      ) : (
        <div className="text-center space-y-1">
          <h3 className="font-mono font-bold text-lg">Keep Practicing!</h3>
          <p className="text-xs text-muted-foreground">Score 60% or higher to continue.</p>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={onRetry}>
          <RotateCcw className="h-3 w-3" /> Retry
        </Button>
        {passed && (
          <Button size="sm" className="text-xs gap-1.5" onClick={onContinue}>
            Continue to Apply <ChevronRight className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
