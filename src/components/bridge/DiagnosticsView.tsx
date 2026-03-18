import { useState } from "react";
import { AlertTriangle, Info, XCircle, Trash2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DiagnosticEntry } from "@/services/pluginHostClient";

interface DiagnosticsViewProps {
  diagnostics: DiagnosticEntry[];
  onClear: () => void;
}

const LEVEL_CONFIG = {
  info:    { icon: Info,           color: "text-primary",     bg: "border-primary/20" },
  warning: { icon: AlertTriangle,  color: "text-[hsl(var(--warning))]", bg: "border-[hsl(var(--warning))]/20" },
  error:   { icon: XCircle,        color: "text-destructive", bg: "border-destructive/20" },
};

export function DiagnosticsView({ diagnostics, onClear }: DiagnosticsViewProps) {
  const [levelFilter, setLevelFilter] = useState<string | null>(null);

  const filtered = levelFilter ? diagnostics.filter(d => d.level === levelFilter) : diagnostics;
  const errorCount = diagnostics.filter(d => d.level === "error").length;
  const warnCount = diagnostics.filter(d => d.level === "warning").length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-4 py-2.5">
        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        <span className="font-mono text-xs font-semibold text-foreground">Diagnostics Log</span>
        <Badge variant="secondary" className="font-mono text-[10px]">{diagnostics.length} entries</Badge>
        {errorCount > 0 && <Badge variant="destructive" className="font-mono text-[10px]">{errorCount} errors</Badge>}
        {warnCount > 0 && <Badge variant="outline" className="font-mono text-[10px] text-[hsl(var(--warning))]">{warnCount} warnings</Badge>}
        <div className="ml-auto">
          <Button size="sm" variant="ghost" className="h-7 gap-1 font-mono text-[10px] text-muted-foreground" onClick={onClear}
            disabled={diagnostics.length === 0}>
            <Trash2 className="h-3 w-3" /> Clear
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 border-b px-4 py-2">
        <Filter className="h-3 w-3 text-muted-foreground" />
        {["all", "error", "warning", "info"].map(level => (
          <Badge key={level}
            variant={(level === "all" && !levelFilter) || levelFilter === level ? "default" : "outline"}
            className="font-mono text-[10px] cursor-pointer"
            onClick={() => setLevelFilter(level === "all" ? null : level)}>
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </Badge>
        ))}
      </div>

      <ScrollArea className="flex-1">
        {filtered.length > 0 ? (
          <div className="p-4 space-y-1">
            {filtered.map((entry, i) => {
              const config = LEVEL_CONFIG[entry.level];
              const Icon = config.icon;
              return (
                <div key={i} className={`flex items-start gap-2.5 rounded-md border bg-card px-3 py-2 ${config.bg}`}>
                  <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${config.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="font-mono text-[9px]">{entry.stage}</Badge>
                      {entry.pluginName && (
                        <span className="font-mono text-[10px] text-foreground font-semibold">{entry.pluginName}</span>
                      )}
                      <span className="font-mono text-[9px] text-muted-foreground/60 ml-auto shrink-0">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-muted-foreground mt-0.5 break-all">{entry.message}</p>
                    {entry.detail && (
                      <p className="font-mono text-[9px] text-muted-foreground/50 mt-0.5">{entry.detail}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center">
            <Info className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="font-mono text-sm text-muted-foreground">No diagnostics</p>
            <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">
              Errors and status messages from backend operations will appear here
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
