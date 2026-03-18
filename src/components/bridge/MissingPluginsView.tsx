import { AlertTriangle, ExternalLink, ArrowRight, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { MissingPluginInfo } from "@/types/bridge";

interface MissingPluginsViewProps {
  missing: MissingPluginInfo[];
  onGoToTrack?: (trackId: string) => void;
}

export function MissingPluginsView({ missing, onGoToTrack }: MissingPluginsViewProps) {
  if (missing.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
          <Star className="h-7 w-7 text-primary" />
        </div>
        <p className="font-mono text-sm font-semibold text-foreground">All plugins found!</p>
        <p className="font-mono text-xs text-muted-foreground mt-1">No missing plugins in the current project.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b px-4 py-2.5">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <span className="font-mono text-xs font-semibold text-foreground">Missing Plugins</span>
        <Badge variant="destructive" className="font-mono text-[10px]">{missing.length}</Badge>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {missing.map(plugin => (
            <div key={plugin.name} className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-mono text-sm font-semibold text-foreground">{plugin.name}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{plugin.vendor} · {plugin.format}</p>
                </div>
                <Badge variant="destructive" className="font-mono text-[10px]">NOT FOUND</Badge>
              </div>

              <div className="mb-3">
                <p className="font-mono text-[10px] text-muted-foreground font-semibold mb-1">USED ON</p>
                <div className="flex gap-1.5">
                  {plugin.usedOnTracks.map(t => (
                    <Badge key={t.trackId} variant="outline" className="font-mono text-[10px] cursor-pointer hover:border-primary/50"
                      onClick={() => onGoToTrack?.(t.trackId)}>
                      {t.trackName}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="font-mono text-[10px] text-muted-foreground font-semibold mb-2">SUGGESTED REPLACEMENTS</p>
                <div className="space-y-2">
                  {plugin.replacements.map(alt => (
                    <div key={alt.id} className="flex items-start gap-3 rounded-md border border-border bg-card p-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 shrink-0">
                        <span className="font-mono text-xs font-bold text-primary">{alt.matchScore}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-mono text-xs font-semibold text-foreground">{alt.replacementName}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">{alt.replacementVendor}</span>
                          {alt.free && <Badge className="font-mono text-[9px] bg-primary/15 text-primary border-0">FREE</Badge>}
                          {alt.status !== "pending" && (
                            <Badge variant={alt.status === "accepted" ? "default" : "outline"} className="font-mono text-[9px]">
                              {alt.status.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">{alt.reason}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {alt.url && (
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" asChild>
                            <a href={alt.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="h-7 gap-1 font-mono text-[10px]">
                          <ArrowRight className="h-3 w-3" /> Swap
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
