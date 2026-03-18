import { useState } from "react";
import {
  ArrowLeft, Volume2, Music, ChevronRight, AlertTriangle, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import type { ProjectManifest, Track } from "@/types/bridge";

interface TrackDetailViewProps {
  project: ProjectManifest;
  onBack: () => void;
  onViewChain: (trackId: string) => void;
}

function TrackRow({ track, onViewChain }: { track: Track; onViewChain: () => void }) {
  const typeColors: Record<string, string> = {
    Audio: "bg-primary/15 text-primary",
    MIDI: "bg-accent/15 text-accent",
    Instrument: "bg-[hsl(280,70%,60%)]/15 text-[hsl(280,70%,60%)]",
    Bus: "bg-[hsl(40,80%,55%)]/15 text-[hsl(40,80%,55%)]",
    Return: "bg-[hsl(220,60%,55%)]/15 text-[hsl(220,60%,55%)]",
    Master: "bg-foreground/10 text-foreground",
  };
  const hasMissing = track.chain.some(d => d.missing);

  return (
    <div className="group flex items-center gap-3 rounded-md border border-border/50 bg-card px-3 py-2.5 transition-all hover:border-border hover:bg-secondary/30">
      <div className="h-8 w-1 rounded-full shrink-0" style={{ backgroundColor: track.color }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-mono text-xs font-semibold text-foreground truncate">{track.name}</span>
          <Badge className={`font-mono text-[9px] px-1.5 py-0 ${typeColors[track.type] || ""}`}>
            {track.type}
          </Badge>
          {track.isMuted && <Badge variant="outline" className="font-mono text-[9px] px-1 py-0 text-muted-foreground">M</Badge>}
          {track.isSoloed && <Badge className="font-mono text-[9px] px-1 py-0 bg-warning text-warning-foreground">S</Badge>}
          {hasMissing && <AlertTriangle className="h-3 w-3 text-destructive" />}
        </div>
        <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
          {track.chain.map((d, i) => (
            <span key={d.id} className="flex items-center gap-1">
              <span className={d.missing ? "text-destructive line-through" : ""}>{d.name}</span>
              {i < track.chain.length - 1 && <ChevronRight className="h-2.5 w-2.5" />}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5 w-16">
          <Volume2 className="h-3 w-3 text-muted-foreground" />
          <Slider value={[track.volume]} max={100} step={1} className="h-1" disabled />
        </div>
        <span className="font-mono text-[10px] text-muted-foreground w-8 text-right">
          {track.pan === 0 ? "C" : track.pan > 0 ? `${track.pan}R` : `${Math.abs(track.pan)}L`}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground w-6 text-right">{track.chain.length}fx</span>
        <Button size="sm" variant="ghost" className="h-7 gap-1 font-mono text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onViewChain}>
          <Eye className="h-3 w-3" /> Chain
        </Button>
      </div>
    </div>
  );
}

export function TrackDetailView({ project, onBack, onViewChain }: TrackDetailViewProps) {
  const [filter, setFilter] = useState<string | null>(null);

  const trackTypes = [...new Set(project.tracks.map(t => t.type))];
  const filtered = filter ? project.tracks.filter(t => t.type === filter) : project.tracks;
  const sorted = [...filtered].sort((a, b) => a.index - b.index);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b px-4 py-2.5">
        <Button size="sm" variant="ghost" className="h-7 gap-1 font-mono text-xs" onClick={onBack}>
          <ArrowLeft className="h-3 w-3" /> Projects
        </Button>
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-primary" />
          <span className="font-mono text-sm font-semibold text-foreground">{project.name}</span>
          <Badge variant="outline" className="font-mono text-[10px]">{project.daw}</Badge>
          <span className="font-mono text-[10px] text-muted-foreground">{project.tempo} BPM · {project.timeSignature} · {project.duration}</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 border-b px-4 py-2">
        <Badge variant={filter === null ? "default" : "outline"} className="font-mono text-[10px] cursor-pointer"
          onClick={() => setFilter(null)}>All ({project.tracks.length})</Badge>
        {trackTypes.map(type => (
          <Badge key={type} variant={filter === type ? "default" : "outline"} className="font-mono text-[10px] cursor-pointer"
            onClick={() => setFilter(filter === type ? null : type)}>
            {type} ({project.tracks.filter(t => t.type === type).length})
          </Badge>
        ))}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1.5">
          {sorted.map(track => (
            <TrackRow key={track.id} track={track} onViewChain={() => onViewChain(track.id)} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
