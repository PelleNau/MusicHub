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
    <div className="border-b border-white/5 bg-[#1b1d22] px-1 py-px">
      <div className="flex h-[22px] items-center justify-between gap-1">
        <div className="flex min-w-0 items-center gap-[3px]">
          <button className="flex h-[20px] items-center gap-1 rounded-[4px] border border-white/6 bg-[#25272d] px-2 text-[9px] font-medium text-white/76 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
            <MousePointer2 className="h-3.5 w-3.5" />
            Pointer 1
            <ChevronDown className="h-3.5 w-3.5 text-white/36" />
          </button>
          <TrackTemplateMenu
            onCreateAudioTrack={onCreateAudioTrack}
            onCreateMidiTrack={onCreateMidiTrack}
            onCreateReturnTrack={onCreateReturnTrack}
          >
            <button
              className="flex h-[20px] items-center gap-1 rounded-[4px] border border-white/6 bg-[#25272d] px-2 text-[9px] font-medium text-white/76 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]"
            >
              <Plus className="h-3.5 w-3.5" />
              Track
              <ChevronDown className="h-3.5 w-3.5 text-white/36" />
            </button>
          </TrackTemplateMenu>
          {captureVariant === "figma" ? null : captureVariant === "figma-compact" ? (
            <Button size="sm" variant="ghost" className="h-7 rounded-md px-2.5 text-[11px] text-white/68 hover:bg-white/6 hover:text-white">
              Ungroup
            </Button>
          ) : null}

          {showExtendedTrackActions ? (
            <div className="ml-1 flex items-center gap-0.5 rounded-[4px] border border-white/5 bg-[#16181d] px-1 py-0.5">
              <Button size="sm" variant="ghost" className="h-[17px] rounded px-2 text-[8px] text-white/56 hover:bg-white/6 hover:text-white" onClick={onCreateMidiTrack}>
                MIDI
              </Button>
              <Button size="sm" variant="ghost" className="h-[17px] rounded px-2 text-[8px] text-white/56 hover:bg-white/6 hover:text-white" onClick={onCreateReturnTrack}>
                Return
              </Button>
              <Button size="sm" variant="ghost" className="h-[17px] rounded px-2 text-[8px] text-white/56 hover:bg-white/6 hover:text-white" onClick={onOpenAudioUpload}>
                <Upload className="mr-1 h-3 w-3" />
                Import
              </Button>
              <Button size="sm" variant="ghost" className="h-[17px] rounded px-2 text-[8px] text-white/56 hover:bg-white/6 hover:text-white" onClick={onAddMarkerAtPlayhead}>
                <Flag className="mr-1 h-3 w-3" />
                Marker
              </Button>
            </div>
          ) : null}
        </div>

          <div className="flex items-center gap-[4px] text-white/62">
            <div className="flex h-[20px] items-center gap-1 rounded-[4px] border border-white/6 bg-[#25272d] px-1 py-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
              <Button
                size="sm"
                variant="ghost"
                className={`h-[17px] rounded-[3px] px-1.5 text-[8px] font-medium ${snapEnabled ? "bg-[#355fa9] text-white hover:bg-[#426bb2]" : "text-white/60 hover:bg-white/6 hover:text-white"}`}
                onClick={onToggleSnap}
              >
                <Grid3X3 className="mr-1 h-3.5 w-3.5" />
                Snap
              </Button>
              <span className="min-w-[2.5ch] px-1.5 text-center text-[8px] font-medium text-white/78">{activeDivision}</span>
            </div>

          {figmaCapture ? null : (
            <button
              className={`flex h-[20px] items-center rounded-[4px] border border-white/6 px-2 text-[8px] font-medium ${tripletMode ? "bg-[#355fa9] text-white" : "bg-[#25272d] text-white/68"}`}
              onClick={onToggleTriplet}
            >
              Triplet
            </button>
          )}

            <div className="flex h-[20px] items-center gap-0.5 rounded-[4px] border border-white/5 bg-[#16181d] px-1 py-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
            <button className="flex h-[17px] w-[17px] items-center justify-center rounded-[3px] hover:bg-white/6 hover:text-white" onClick={onNarrowGrid} title="Zoom out timeline grid">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button className="flex h-[17px] w-[17px] items-center justify-center rounded-[3px] hover:bg-white/6 hover:text-white" onClick={onWidenGrid} title="Zoom in timeline grid">
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button className="flex h-[17px] w-[17px] items-center justify-center rounded-[3px] hover:bg-white/6 hover:text-white">
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex h-[20px] items-center gap-1.5 rounded-[4px] border border-white/6 bg-[#25272d] px-2 py-0 text-[8px] shadow-[inset_0_1px_0_rgba(255,255,255,0.025)]">
            <span className="text-white/48">Height:</span>
            <span className="font-medium text-white/84">{heightLabel}</span>
            <ChevronDown className="h-3.5 w-3.5 text-white/36" />
          </div>
        </div>
      </div>
    </div>
  );
}
