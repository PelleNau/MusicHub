import { CheckCircle2, AlertTriangle, XCircle, Cpu, ChevronDown, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import type { ProjectMatchReport, TrackMatchReport, MatchStatus } from "@/lib/pluginMatcher";

const STATUS_ICON: Record<MatchStatus, React.ReactNode> = {
  available: <CheckCircle2 className="h-3.5 w-3.5 text-primary" />,
  alternative: <AlertTriangle className="h-3.5 w-3.5 text-warning" />,
  missing: <XCircle className="h-3.5 w-3.5 text-destructive" />,
  native: <Cpu className="h-3.5 w-3.5 text-muted-foreground" />,
};

const STATUS_LABEL: Record<MatchStatus, string> = {
  available: "Available",
  alternative: "Alternative",
  missing: "Missing",
  native: "Native",
};

function TrackRow({ report }: { report: TrackMatchReport }) {
  const [open, setOpen] = useState(false);
  const total = report.matches.length;
  const ready = report.availableCount + report.nativeCount;
  const pct = total > 0 ? (ready / total) * 100 : 0;

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-2.5 hover:bg-secondary/40 transition-colors text-left"
      >
        {open ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
        <span className="font-mono text-xs font-medium text-foreground flex-1 truncate">{report.trackName}</span>
        <Badge variant="outline" className="font-mono text-[9px]">{report.trackType}</Badge>
        <div className="flex items-center gap-1.5">
          {report.availableCount > 0 && <Badge className="font-mono text-[9px] bg-primary/20 text-primary border-0">{report.availableCount}✓</Badge>}
          {report.alternativeCount > 0 && <Badge className="font-mono text-[9px] bg-warning/20 text-warning border-0">{report.alternativeCount}⚠</Badge>}
          {report.missingCount > 0 && <Badge variant="destructive" className="font-mono text-[9px]">{report.missingCount}✗</Badge>}
        </div>
        <div className="w-16">
          <Progress value={pct} className="h-1.5" />
        </div>
      </button>

      {open && (
        <div className="px-4 pb-3 space-y-1">
          {report.matches.map((m, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded bg-secondary/30 font-mono text-[11px]">
              {STATUS_ICON[m.status]}
              <span className="text-foreground flex-1 truncate">{m.device.name}</span>
              <Badge variant="outline" className="text-[9px]">{STATUS_LABEL[m.status]}</Badge>
              {m.confidence > 0 && m.confidence < 1 && (
                <span className="text-muted-foreground">{(m.confidence * 100).toFixed(0)}%</span>
              )}
              {m.hostMatch && <span className="text-muted-foreground truncate max-w-[120px]">→ {m.hostMatch.name}</span>}
              {m.inventoryMatch && !m.hostMatch && (
                <span className="text-warning truncate max-w-[120px]">→ {m.inventoryMatch.vendor} {m.inventoryMatch.product}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MatchReportView({ report }: { report: ProjectMatchReport }) {
  const readyPct = report.totalDevices > 0
    ? ((report.available + report.native) / report.totalDevices) * 100
    : 0;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center gap-4 px-4 py-3 bg-card rounded-lg border">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-semibold text-foreground">Plugin Match Report</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {report.totalDevices} devices across {report.tracks.length} tracks
            </span>
          </div>
          <Progress value={readyPct} className="h-2" />
        </div>
        <div className="flex gap-3 font-mono text-[11px]">
          <div className="text-center">
            <div className="text-primary font-semibold">{report.available}</div>
            <div className="text-muted-foreground text-[9px]">Available</div>
          </div>
          <div className="text-center">
            <div className="text-muted-foreground font-semibold">{report.native}</div>
            <div className="text-muted-foreground text-[9px]">Native</div>
          </div>
          <div className="text-center">
            <div className="text-warning font-semibold">{report.alternatives}</div>
            <div className="text-muted-foreground text-[9px]">Alt</div>
          </div>
          <div className="text-center">
            <div className="text-destructive font-semibold">{report.missing}</div>
            <div className="text-muted-foreground text-[9px]">Missing</div>
          </div>
        </div>
      </div>

      {/* Per-track breakdown */}
      <ScrollArea className="max-h-[500px]">
        <div className="rounded-lg border bg-card overflow-hidden">
          {report.tracks
            .filter((t) => t.matches.length > 0)
            .map((t, i) => (
              <TrackRow key={i} report={t} />
            ))}
        </div>
      </ScrollArea>
    </div>
  );
}
