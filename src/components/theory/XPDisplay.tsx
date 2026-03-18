import { Zap, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getLevel } from "@/hooks/useTheoryStats";

interface XPDisplayProps {
  xp: number;
  streak: number;
  compact?: boolean;
}

export function XPDisplay({ xp, streak, compact = false }: XPDisplayProps) {
  const level = getLevel(xp);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 text-[10px] font-mono text-primary font-semibold">
          <Zap className="h-3 w-3" />
          {xp}
        </span>
        {streak > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] font-mono text-orange-500 font-semibold">
            <Flame className="h-3 w-3" />
            {streak}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1.5">
        <Zap className="h-3.5 w-3.5 text-primary" />
        <span className="text-sm font-mono font-bold text-primary tabular-nums transition-all">
          {xp} XP
        </span>
      </div>

      {streak > 0 && (
        <div className="flex items-center gap-1">
          <Flame className="h-3.5 w-3.5 text-orange-500" />
          <span className="text-xs font-mono font-semibold text-orange-500">
            {streak}-day streak
          </span>
        </div>
      )}

      <Badge variant="secondary" className="text-[9px] font-mono h-5 px-2">
        {level.label}
      </Badge>
    </div>
  );
}
