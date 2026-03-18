import { AbletonParseResult } from "@/types/ableton";
import { AnalysisData } from "./AnalysisDashboard";
import { Music2, Layers, CheckCircle2, AlertTriangle } from "lucide-react";

interface Props {
  parsedResult: AbletonParseResult;
  analysis: AnalysisData;
}

function StatCard({
  icon,
  value,
  label,
  accent,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border/30 bg-card p-3 flex items-center gap-3">
      <div className={`rounded-md p-2 ${accent ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
        {icon}
      </div>
      <div>
        <p className="font-mono text-lg font-bold text-foreground">{value}</p>
        <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

export function ProjectStats({ parsedResult, analysis }: Props) {
  const coveragePct = analysis.totalDevices > 0
    ? Math.round((analysis.ownedDevices / analysis.totalDevices) * 100)
    : 0;

  return (
    <div className="grid grid-cols-4 gap-3" style={{ maxWidth: 788 }}>
      <StatCard
        icon={<Music2 className="h-4 w-4" />}
        value={parsedResult.trackCount}
        label="Tracks"
      />
      <StatCard
        icon={<Layers className="h-4 w-4" />}
        value={analysis.totalDevices}
        label="Devices"
      />
      <StatCard
        icon={<CheckCircle2 className="h-4 w-4" />}
        value={`${coveragePct}%`}
        label="Owned"
        accent
      />
      <StatCard
        icon={<AlertTriangle className="h-4 w-4" />}
        value={analysis.issues.length}
        label="Issues"
      />
    </div>
  );
}
