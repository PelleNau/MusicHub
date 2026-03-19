import { Flag, Grid3X3, Minus, Plus, RotateCcw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GridDivision } from "@/hooks/useTimelineGrid";

interface StudioArrangementToolbarProps {
  mode: "guided" | "standard" | "focused";
  activeDivision: GridDivision;
  snapEnabled: boolean;
  tripletMode: boolean;
  pixelsPerBeat: number;
  trackHeight: number;
  onToggleSnap: () => void;
  onToggleTriplet: () => void;
  onNarrowGrid: () => void;
  onWidenGrid: () => void;
  onCreateAudioTrack: () => void;
  onCreateMidiTrack: () => void;
  onCreateReturnTrack: () => void;
  onOpenAudioUpload: () => void;
  onAddMarkerAtPlayhead: () => void;
}

export function StudioArrangementToolbar({
  mode,
  activeDivision,
  snapEnabled,
  tripletMode,
  pixelsPerBeat,
  trackHeight,
  onToggleSnap,
  onToggleTriplet,
  onNarrowGrid,
  onWidenGrid,
  onCreateAudioTrack,
  onCreateMidiTrack,
  onCreateReturnTrack,
  onOpenAudioUpload,
  onAddMarkerAtPlayhead,
}: StudioArrangementToolbarProps) {
  const dense = mode === "focused";

  return (
    <div className="border-b border-border/50 bg-background/75 px-4 py-2.5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" className="font-mono text-xs" onClick={onCreateAudioTrack}>
            + Audio
          </Button>
          <Button size="sm" variant="secondary" className="font-mono text-xs" onClick={onCreateMidiTrack}>
            + MIDI
          </Button>
          <Button size="sm" variant="ghost" className="font-mono text-xs" onClick={onCreateReturnTrack}>
            + Return
          </Button>
          <Button size="sm" variant="ghost" className="font-mono text-xs" onClick={onOpenAudioUpload}>
            <Upload className="mr-1.5 h-3.5 w-3.5" />
            Import
          </Button>
          <Button size="sm" variant="ghost" className="font-mono text-xs" onClick={onAddMarkerAtPlayhead}>
            <Flag className="mr-1.5 h-3.5 w-3.5" />
            Marker
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-xl border border-border/60 bg-card/70 px-1 py-1">
            <Button
              size="sm"
              variant={snapEnabled ? "secondary" : "ghost"}
              className="h-7 px-2 font-mono text-[11px]"
              onClick={onToggleSnap}
            >
              <Grid3X3 className="mr-1 h-3.5 w-3.5" />
              Snap {activeDivision}
            </Button>
            <Button
              size="sm"
              variant={tripletMode ? "secondary" : "ghost"}
              className="h-7 px-2 font-mono text-[11px]"
              onClick={onToggleTriplet}
            >
              Triplet
            </Button>
          </div>

          <div className="flex items-center rounded-xl border border-border/60 bg-card/70 px-1 py-1">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onNarrowGrid} title="Zoom out timeline grid">
              <Minus className="h-3.5 w-3.5" />
            </Button>
            <div className="min-w-[72px] text-center font-mono text-[11px] text-foreground/60">
              {Math.round(pixelsPerBeat)} px/beat
            </div>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onWidenGrid} title="Zoom in timeline grid">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="hidden items-center gap-2 rounded-xl border border-border/60 bg-card/70 px-2.5 py-1.5 md:flex">
            <RotateCcw className="h-3.5 w-3.5 text-foreground/45" />
            <div className="font-mono text-[11px] text-foreground/60">
              Track height {trackHeight}px
            </div>
          </div>

          {!dense && (
            <div className="hidden rounded-full border border-border/60 bg-background/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/45 lg:block">
              Arrangement Controls
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
