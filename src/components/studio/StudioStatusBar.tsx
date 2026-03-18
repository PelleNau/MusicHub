import { Magnet, ZoomIn, ZoomOut } from "lucide-react";
import type { StudioConnectionSummary } from "@/domain/studio/studioViewContracts";
import { STUDIO_INFO, useStudioInfo } from "@/components/studio/StudioInfoContext";

interface StudioStatusBarProps {
  trackCount: number;
  barCount: number;
  tempo: number;
  activeDivision: string;
  tripletMode: boolean;
  snapEnabled: boolean;
  pixelsPerBeat: number;
  connectionSummary: StudioConnectionSummary;
  onToggleSnap: () => void;
  onZoomOut: () => void;
  onZoomIn: () => void;
}

export function StudioStatusBar({
  trackCount,
  barCount,
  tempo,
  activeDivision,
  tripletMode,
  snapEnabled,
  pixelsPerBeat,
  connectionSummary,
  onToggleSnap,
  onZoomOut,
  onZoomIn,
}: StudioStatusBarProps) {
  const { setHoveredInfo } = useStudioInfo();
  const hp = (info: typeof STUDIO_INFO.snap) => ({
    onMouseEnter: () => setHoveredInfo(info),
    onMouseLeave: () => setHoveredInfo(null),
  });

  return (
    <div
      className="border-t border-border bg-card px-4 py-1.5 font-mono text-[10px] text-foreground/65 flex items-center gap-4"
      {...hp(STUDIO_INFO.statusBar)}
    >
      <span className="px-1.5 py-0.5 rounded border border-border/40 bg-muted/20" {...hp(STUDIO_INFO.trackCount)}>
        {trackCount} tracks
      </span>
      <span className="px-1.5 py-0.5 rounded border border-border/40 bg-muted/20" {...hp(STUDIO_INFO.barCount)}>
        {barCount} bars
      </span>
      <span className="px-1.5 py-0.5 rounded border border-border/40 bg-muted/20" {...hp(STUDIO_INFO.bpmDisplay)}>
        {tempo} BPM
      </span>
      <span className="border-l border-border pl-3 px-1.5 py-0.5 rounded border border-border/40 bg-muted/20" {...hp(STUDIO_INFO.gridDisplay)}>
        Grid: {activeDivision}
        {tripletMode ? "T" : ""}
      </span>
      <button
        onClick={onToggleSnap}
        {...hp(STUDIO_INFO.snap)}
        className={`flex items-center gap-1 px-1.5 py-0.5 rounded border transition-colors ${
          snapEnabled
            ? "text-primary border-primary/30 bg-primary/10"
            : "border-border/40 bg-muted/20 text-foreground/60"
        }`}
        title="Toggle snap (⌘4)"
      >
        <Magnet className="h-3 w-3" />
        <span>Snap {snapEnabled ? "ON" : "OFF"}</span>
      </button>
      {connectionSummary.connectionState === "connected" && connectionSummary.audioEngineState && (
        <span className="border-l border-border pl-3 px-1.5 py-0.5 rounded border border-border/40 bg-muted/20 text-primary/70">
          {connectionSummary.audioEngineState.sampleRate / 1000}kHz · {connectionSummary.audioEngineState.bufferSize}smp · CPU {Math.round(connectionSummary.audioEngineState.cpuLoad)}%
        </span>
      )}
      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center gap-1 border border-border/40 rounded-md px-1.5 py-0.5 bg-muted/20" {...hp(STUDIO_INFO.zoomH)}>
          <span className="text-[9px] text-foreground/50 uppercase">H</span>
          <button onClick={onZoomOut} className="p-0.5 hover:text-foreground transition-colors" title="Zoom out">
            <ZoomOut className="h-3 w-3" />
          </button>
          <span className="min-w-[3ch] text-center">{Math.round(pixelsPerBeat)}px</span>
          <button onClick={onZoomIn} className="p-0.5 hover:text-foreground transition-colors" title="Zoom in">
            <ZoomIn className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
