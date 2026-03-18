import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SignalIssue } from "./AnalysisDashboard";
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from "lucide-react";

interface Props {
  issues: SignalIssue[];
}

const SEVERITY_CONFIG = {
  error: {
    icon: AlertCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/20",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
  },
  info: {
    icon: Info,
    color: "text-muted-foreground",
    bg: "bg-secondary/50",
    border: "border-border/20",
  },
};

export function SignalChainIssues({ issues }: Props) {
  const sorted = [...issues].sort((a, b) => {
    const order = { error: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });

  return (
    <Card className="border-border/30">
      <CardHeader className="pb-2">
        <CardTitle className="font-mono text-xs font-semibold tracking-wider uppercase text-foreground">
          Signal Chain Check
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <div className="flex items-center gap-2 py-6 justify-center">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <span className="font-mono text-sm text-muted-foreground">No issues detected</span>
          </div>
        ) : (
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {sorted.map((issue, i) => {
              const cfg = SEVERITY_CONFIG[issue.severity];
              const Icon = cfg.icon;
              return (
                <div
                  key={i}
                  className={`rounded-md border ${cfg.border} ${cfg.bg} px-3 py-2 flex items-start gap-2`}
                >
                  <Icon className={`h-3.5 w-3.5 shrink-0 mt-0.5 ${cfg.color}`} />
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] text-muted-foreground truncate">
                      {issue.trackName}
                    </p>
                    <p className="font-mono text-[11px] text-foreground leading-snug">
                      {issue.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
