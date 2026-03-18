import { useState } from "react";
import {
  Lightbulb, AlertTriangle, Info, XCircle, Check, X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AnalysisSuggestion, SuggestionType } from "@/types/bridge";

interface AiSuggestionsViewProps {
  suggestions: AnalysisSuggestion[];
  onGoToTrack?: (trackId: string) => void;
}

const SEVERITY_STYLES: Record<string, { icon: typeof Info; color: string; bg: string }> = {
  info: { icon: Info, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
  warning: { icon: AlertTriangle, color: "text-[hsl(var(--warning))]", bg: "bg-[hsl(var(--warning))]/10 border-[hsl(var(--warning))]/20" },
  critical: { icon: XCircle, color: "text-destructive", bg: "bg-destructive/10 border-destructive/20" },
};

const TYPE_LABELS: Record<SuggestionType, string> = {
  chain_order: "Chain Order",
  redundant_plugin: "Redundant",
  missing_treatment: "Missing Treatment",
  cpu_optimization: "CPU",
  gain_staging: "Gain Staging",
  alternative: "Alternative",
};

export function AiSuggestionsView({ suggestions: initialSuggestions, onGoToTrack }: AiSuggestionsViewProps) {
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [typeFilter, setTypeFilter] = useState<SuggestionType | null>(null);

  const active = suggestions.filter(s => !s.dismissed);
  const dismissed = suggestions.filter(s => s.dismissed);
  const filtered = typeFilter ? active.filter(s => s.type === typeFilter) : active;

  const types = [...new Set(active.map(s => s.type))];

  const handleDismiss = (id: string) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, dismissed: true } : s));
  };

  const handleRestore = (id: string) => {
    setSuggestions(prev => prev.map(s => s.id === id ? { ...s, dismissed: false } : s));
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-4 py-2.5">
        <Lightbulb className="h-4 w-4 text-primary" />
        <span className="font-mono text-xs font-semibold text-foreground">AI Analysis</span>
        <Badge variant="secondary" className="font-mono text-[10px]">{active.length} active</Badge>
        {dismissed.length > 0 && (
          <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">{dismissed.length} dismissed</Badge>
        )}
      </div>

      <div className="flex items-center gap-1.5 border-b px-4 py-2 overflow-x-auto">
        <Badge variant={typeFilter === null ? "default" : "outline"} className="font-mono text-[10px] cursor-pointer shrink-0"
          onClick={() => setTypeFilter(null)}>All</Badge>
        {types.map(type => (
          <Badge key={type} variant={typeFilter === type ? "default" : "outline"}
            className="font-mono text-[10px] cursor-pointer shrink-0"
            onClick={() => setTypeFilter(typeFilter === type ? null : type)}>
            {TYPE_LABELS[type]}
          </Badge>
        ))}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filtered.map(s => {
            const style = SEVERITY_STYLES[s.severity];
            const Icon = style.icon;
            return (
              <div key={s.id} className={`rounded-lg border p-4 ${style.bg}`}>
                <div className="flex items-start gap-3">
                  <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${style.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-mono text-xs font-semibold text-foreground">{s.title}</p>
                      <Badge variant="outline" className="font-mono text-[9px]">{TYPE_LABELS[s.type]}</Badge>
                    </div>
                    <p className="font-mono text-[11px] text-muted-foreground leading-relaxed mb-2">{s.description}</p>
                    <div className="flex items-center gap-2">
                      {s.trackName && (
                        <Badge variant="secondary" className="font-mono text-[9px] cursor-pointer"
                          onClick={() => s.trackId && onGoToTrack?.(s.trackId)}>
                          Track: {s.trackName}
                        </Badge>
                      )}
                      {s.deviceName && (
                        <Badge variant="outline" className="font-mono text-[9px]">Device: {s.deviceName}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {s.action && (
                      <Button size="sm" variant="outline" className="h-7 gap-1 font-mono text-[10px]">
                        <Check className="h-3 w-3" /> {s.action}
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDismiss(s.id)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && active.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Lightbulb className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="font-mono text-sm text-muted-foreground">No suggestions yet</p>
              <p className="font-mono text-xs text-muted-foreground/60 mt-1">Import a project to get AI analysis</p>
            </div>
          )}

          {dismissed.length > 0 && (
            <div className="mt-6">
              <p className="font-mono text-[10px] text-muted-foreground font-semibold mb-2">DISMISSED</p>
              <div className="space-y-1.5">
                {dismissed.map(s => (
                  <div key={s.id} className="flex items-center gap-3 rounded-md border border-border/30 bg-secondary/20 px-3 py-2 opacity-60">
                    <span className="font-mono text-[10px] text-muted-foreground flex-1 truncate">{s.title}</span>
                    <Button size="sm" variant="ghost" className="h-6 font-mono text-[10px] text-muted-foreground"
                      onClick={() => handleRestore(s.id)}>Restore</Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
