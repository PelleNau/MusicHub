import { ChevronDown, Flag, Grid3X3, Maximize2, Minus, MousePointer2, Plus, Upload, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GridDivision } from "@/hooks/useTimelineGrid";
import { TrackTemplateMenu } from "@/components/studio/TrackTemplateMenu";

interface StudioArrangementToolbarProps {
  mode: "guided" | "standard" | "focused";
  captureVariant?: "figma" | "figma-compact" | null;
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
  captureVariant,
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
  const showExtendedTrackActions = captureVariant == null;
  const figmaCapture = captureVariant === "figma";
  const heightLabel = figmaCapture ? "Medium" : trackHeight >= 120 ? "Tall" : trackHeight >= 96 ? "Medium" : "Compact";

  return (
    <div className="border-b border-white/6 bg-[#1d1f24] px-1.5 py-[2px]">
      <div className="flex h-7 items-center justify-between gap-1.5">
        <div className="flex min-w-0 items-center gap-1">
          <button className="flex h-6 items-center gap-1.5 rounded-[5px] border border-white/7 bg-[#272930] px-2 text-[9.5px] font-medium text-white/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <MousePointer2 className="h-3.5 w-3.5" />
            Pointer 1
            <ChevronDown className="h-3.5 w-3.5 text-white/45" />
          </button>
          <TrackTemplateMenu
            onCreateAudioTrack={onCreateAudioTrack}
            onCreateMidiTrack={onCreateMidiTrack}
            onCreateReturnTrack={onCreateReturnTrack}
          >
            <button
              className="flex h-6 items-center gap-1.5 rounded-[5px] border border-white/7 bg-[#272930] px-2 text-[9.5px] font-medium text-white/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
            >
              <Plus className="h-3.5 w-3.5" />
              Track
              <ChevronDown className="h-3.5 w-3.5 text-white/45" />
            </button>
          </TrackTemplateMenu>
          {captureVariant === "figma" ? null : captureVariant === "figma-compact" ? (
            <Button size="sm" variant="ghost" className="h-7 rounded-md px-2.5 text-[11px] text-white/68 hover:bg-white/6 hover:text-white">
              Ungroup
            </Button>
          ) : null}

          {showExtendedTrackActions ? (
            <div className="ml-1 flex items-center gap-0.5 rounded-[6px] border border-white/6 bg-[#181a1f] px-1 py-0.5">
              <Button size="sm" variant="ghost" className="h-5 rounded px-2 text-[9px] text-white/64 hover:bg-white/6 hover:text-white" onClick={onCreateMidiTrack}>
                MIDI
              </Button>
              <Button size="sm" variant="ghost" className="h-5 rounded px-2 text-[9px] text-white/64 hover:bg-white/6 hover:text-white" onClick={onCreateReturnTrack}>
                Return
              </Button>
              <Button size="sm" variant="ghost" className="h-5 rounded px-2 text-[9px] text-white/64 hover:bg-white/6 hover:text-white" onClick={onOpenAudioUpload}>
                <Upload className="mr-1 h-3 w-3" />
                Import
              </Button>
              <Button size="sm" variant="ghost" className="h-5 rounded px-2 text-[9px] text-white/64 hover:bg-white/6 hover:text-white" onClick={onAddMarkerAtPlayhead}>
                <Flag className="mr-1 h-3 w-3" />
                Marker
              </Button>
            </div>
          ) : null}
        </div>

          <div className="flex items-center gap-1 text-white/68">
            <div className="flex h-6 items-center gap-1 rounded-[6px] border border-white/7 bg-[#272930] px-1 py-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <Button
                size="sm"
                variant="ghost"
                className={`h-5 rounded-[4px] px-1.5 text-[9px] font-medium ${snapEnabled ? "bg-[#355fa9] text-white hover:bg-[#426bb2]" : "text-white/68 hover:bg-white/6 hover:text-white"}`}
                onClick={onToggleSnap}
              >
                <Grid3X3 className="mr-1 h-3.5 w-3.5" />
                Snap
              </Button>
              <span className="min-w-[2.5ch] px-1.5 text-center text-[9px] font-medium text-white/85">{activeDivision}</span>
            </div>

          {figmaCapture ? null : (
            <button
              className={`flex h-7 items-center rounded-[6px] border border-white/7 px-2.5 text-[10px] font-medium ${tripletMode ? "bg-[#355fa9] text-white" : "bg-[#272930] text-white/75"}`}
              onClick={onToggleTriplet}
            >
              Triplet
            </button>
          )}

            <div className="flex h-6 items-center gap-0.5 rounded-[6px] border border-white/7 bg-[#181a1f] px-1 py-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <button className="flex h-5 w-5 items-center justify-center rounded-[4px] hover:bg-white/6 hover:text-white" onClick={onNarrowGrid} title="Zoom out timeline grid">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button className="flex h-5 w-5 items-center justify-center rounded-[4px] hover:bg-white/6 hover:text-white" onClick={onWidenGrid} title="Zoom in timeline grid">
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button className="flex h-5 w-5 items-center justify-center rounded-[4px] hover:bg-white/6 hover:text-white">
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex h-6 items-center gap-1.5 rounded-[6px] border border-white/7 bg-[#272930] px-2 py-0 text-[9px] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <span className="text-white/55">Height:</span>
            <span className="font-medium text-white">{heightLabel}</span>
            <ChevronDown className="h-3.5 w-3.5 text-white/45" />
          </div>
        </div>
      </div>
    </div>
  );
}
