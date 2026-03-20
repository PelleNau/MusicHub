import { ChevronDown, Flag, Grid3X3, Maximize2, Minus, MousePointer2, Plus, Search, Upload, ZoomIn } from "lucide-react";
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
  return (
    <div className="border-b border-white/6 bg-[#232429] px-3 py-1.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex h-8 items-center gap-2 rounded-md border border-white/8 bg-[#2b2d33] px-3 text-[12px] text-white/84">
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
              className="flex h-8 items-center gap-2 rounded-md border border-white/8 bg-[#2b2d33] px-3 text-[12px] text-white/84"
            >
              <Plus className="h-3.5 w-3.5" />
              Track
              <ChevronDown className="h-3.5 w-3.5 text-white/45" />
            </button>
          </TrackTemplateMenu>
          {captureVariant === "figma" ? null : (
            <>
              {captureVariant === "figma-compact" ? (
                <Button size="sm" variant="ghost" className="h-8 rounded-md px-3 text-[12px] text-white/68 hover:bg-white/6 hover:text-white">
                  Ungroup
                </Button>
              ) : (
                <>
                  <Button size="sm" variant="ghost" className="h-8 rounded-md px-3 text-[12px] text-white/68 hover:bg-white/6 hover:text-white" onClick={onCreateMidiTrack}>
                    MIDI
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 rounded-md px-3 text-[12px] text-white/68 hover:bg-white/6 hover:text-white" onClick={onCreateReturnTrack}>
                    Return
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 rounded-md px-3 text-[12px] text-white/68 hover:bg-white/6 hover:text-white" onClick={onOpenAudioUpload}>
                    <Upload className="mr-1.5 h-3.5 w-3.5" />
                    Import
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 rounded-md px-3 text-[12px] text-white/68 hover:bg-white/6 hover:text-white" onClick={onAddMarkerAtPlayhead}>
                    <Flag className="mr-1.5 h-3.5 w-3.5" />
                    Marker
                  </Button>
                </>
              )}
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-white/68">
          <div className="flex items-center gap-1 rounded-md border border-white/8 bg-[#2b2d33] px-1 py-1">
            <Button
              size="sm"
              variant="ghost"
              className={`h-6 rounded px-2 text-[12px] ${snapEnabled ? "bg-[#355fa9] text-white hover:bg-[#426bb2]" : "text-white/68 hover:bg-white/6 hover:text-white"}`}
              onClick={onToggleSnap}
            >
              <Grid3X3 className="mr-1 h-3.5 w-3.5" />
              Snap
            </Button>
            <span className="px-2 text-[12px] text-white/85">{activeDivision}</span>
          </div>

          <button
            className={`flex h-8 items-center rounded-md border border-white/8 px-3 text-[12px] ${tripletMode ? "bg-[#355fa9] text-white" : "bg-[#2b2d33] text-white/75"}`}
            onClick={onToggleTriplet}
          >
            Triplet
          </button>

          <div className="flex items-center gap-1">
            <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/6 hover:text-white">
              <Search className="h-3.5 w-3.5" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/6 hover:text-white" onClick={onNarrowGrid} title="Zoom out timeline grid">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/6 hover:text-white" onClick={onWidenGrid} title="Zoom in timeline grid">
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/6 hover:text-white">
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-white/8 bg-[#2b2d33] px-3 py-1 text-[12px]">
            <span className="text-white/55">Height:</span>
            <span className="text-white">{trackHeight >= 96 ? "Medium" : "Compact"}</span>
            <ChevronDown className="h-3.5 w-3.5 text-white/45" />
          </div>
        </div>
      </div>
    </div>
  );
}
