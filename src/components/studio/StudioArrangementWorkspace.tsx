import { Plus, Undo2, Upload } from "lucide-react";
import type { GridDivision } from "@/hooks/useTimelineGrid";
import type { SessionTrack } from "@/types/studio";
import type { MeterLevel } from "@/services/pluginHostSocket";
import { BrowserPanel } from "@/components/studio/BrowserPanel";
import { GridContextMenu } from "@/components/studio/GridOverlay";
import { LoopRegion } from "@/components/studio/LoopRegion";
import { TimelineCanvas } from "@/components/studio/TimelineCanvas";
import { ZoomDragHandle } from "@/components/studio/ZoomDragHandle";
import { TrackLane } from "@/components/studio/TrackLane";

interface StudioArrangementWorkspaceProps {
  browserProps: React.ComponentProps<typeof BrowserPanel>;
  gridProps: {
    gridMode: "adaptive" | "fixed";
    fixedDivision: GridDivision;
    activeDivision: GridDivision;
    snapEnabled: boolean;
    tripletMode: boolean;
    onSetGridMode: (mode: "adaptive" | "fixed") => void;
    onSetFixedDivision: (division: GridDivision) => void;
    onToggleSnap: () => void;
    onToggleTriplet: () => void;
    onNarrow: () => void;
    onWiden: () => void;
  };
  timelineContainerProps: React.HTMLAttributes<HTMLDivElement>;
  timelineRef: React.RefObject<HTMLDivElement | null>;
  totalBeats: number;
  pixelsPerBeat: number;
  beatsPerBar: number;
  activeDivision: GridDivision;
  tripletMode: boolean;
  playheadBeatGetter: (() => number) | undefined;
  effectiveBeat: number;
  onSeek: (beat: number) => void;
  trackHeight: number;
  onSetPixelsPerBeat: (value: number) => void;
  onSetTrackHeight: (value: number) => void;
  loopRegionProps: React.ComponentProps<typeof LoopRegion>;
  displayTracks: SessionTrack[];
  displayReturnTracks: SessionTrack[];
  trackViewStateById: Record<string, {
    selected: boolean;
    meter: MeterLevel | null;
    nativeMonitoring: boolean;
    nativeArmed: boolean;
  }>;
  selectedClipIds: Set<string>;
  emptyStateInstruction?: string;
  trackLaneProps: {
    onSelect: (trackId: string) => void;
    onMuteToggle: (trackId: string) => void;
    onSoloToggle: (trackId: string) => void;
    onNativeMonitorToggle?: (trackId: string, monitoring: boolean) => void;
    onNativeArmToggle?: (trackId: string, armed: boolean) => void;
    onVolumeChange: (trackId: string, volume: number) => void;
    onPanChange: (trackId: string, pan: number) => void;
    onSendChange: (trackId: string, sends: SessionTrack["sends"]) => void;
    onRenameTrack: (trackId: string, name: string) => void;
    onDeleteTrack: (trackId: string) => void;
    onColorChange: (trackId: string, color: number) => void;
    onClipMove: (clipId: string, trackId: string, newStartBeats: number, deltaY?: number) => void;
    onClipResize: (clipId: string, newStartBeats: number, newEndBeats: number) => void;
    onReorder: (trackId: string, direction: "up" | "down") => void;
    onClipSelect: (clipId: string, trackId: string) => void;
    onClipClick: (clipId: string, trackId: string, e: React.MouseEvent) => void;
    onCreateMidiClip: (trackId: string, startBeats: number) => void;
    onAutomationChange: (trackId: string, laneId: string, points: any[]) => void;
    onAutomationAdd: (trackId: string, target: string, label: string) => void;
    onAutomationRemove: (trackId: string, laneId: string) => void;
    onDeleteClip: (clipId: string) => void;
    onDuplicateClip: (clipId: string) => void;
    onLinkedDuplicateClip: (clipId: string) => void;
    onRenameClip: (clipId: string, name: string) => void;
    onClipColorChange: (clipId: string, color: number) => void;
    onSplitClip: (clipId: string, beatPosition: number) => void;
    onMuteClip: (clipId: string) => void;
    onSetAsLoop: (clipId: string) => void;
  };
  snapBeats: number;
  arrangementWrapper: (children: React.ReactNode) => React.ReactNode;
  timelineHeaderActions: {
    createAudioTrack: () => void;
    createMidiTrack: () => void;
    createReturnTrack: () => void;
    openAudioUpload: () => void;
  };
  assetImportInputProps: React.InputHTMLAttributes<HTMLInputElement>;
}

export function StudioArrangementWorkspace({
  browserProps,
  gridProps,
  timelineContainerProps,
  timelineRef,
  totalBeats,
  pixelsPerBeat,
  beatsPerBar,
  activeDivision,
  tripletMode,
  playheadBeatGetter,
  effectiveBeat,
  onSeek,
  trackHeight,
  onSetPixelsPerBeat,
  onSetTrackHeight,
  loopRegionProps,
  displayTracks,
  displayReturnTracks,
  trackViewStateById,
  selectedClipIds,
  emptyState,
  trackLaneProps,
  snapBeats,
  arrangementWrapper,
  timelineHeaderActions,
  assetImportInputProps,
}: StudioArrangementWorkspaceProps) {
  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      <BrowserPanel {...browserProps} />

      <div className="flex-1 min-w-0 min-h-0 overflow-hidden">
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <GridContextMenu {...gridProps}>
            <div ref={timelineRef} data-timeline className="flex-1 overflow-auto min-h-0 relative" {...timelineContainerProps}>
              {arrangementWrapper(
                <>
                  <TimelineCanvas
                    totalBeats={totalBeats}
                    pixelsPerBeat={pixelsPerBeat}
                    beatsPerBar={beatsPerBar}
                    activeDivision={activeDivision}
                    tripletMode={tripletMode}
                    scrollContainerRef={timelineRef}
                    onSeek={onSeek}
                    beatGetter={playheadBeatGetter}
                    staticBeat={effectiveBeat}
                    zoomHandle={
                      <ZoomDragHandle
                        pixelsPerBeat={pixelsPerBeat}
                        trackHeight={trackHeight}
                        onZoomH={onSetPixelsPerBeat}
                        onZoomV={onSetTrackHeight}
                      />
                    }
                    loopOverlay={<LoopRegion pixelsPerBeat={pixelsPerBeat} {...loopRegionProps} />}
                  >
                    {displayTracks.length === 0 ? (
                      <div className="flex h-full min-h-[120px] items-center justify-center">
                        <div className="text-center space-y-1">
                          {emptyStateInstruction ? (
                            <>
                              <p className="text-sm text-foreground/70">{emptyStateInstruction}</p>
                              <p className="text-xs text-muted-foreground">Follow the guide to get started</p>
                            </>
                          ) : (
                            <p className="font-mono text-[11px] text-foreground/45">Add a track to get started</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      displayTracks.map((track) => (
                        <TrackLane
                          key={track.id}
                          track={track}
                          returnTracks={displayReturnTracks}
                          pixelsPerBeat={pixelsPerBeat}
                          totalBeats={totalBeats}
                          beatsPerBar={beatsPerBar}
                          isSelected={trackViewStateById[track.id]?.selected ?? false}
                          selectedClipIds={selectedClipIds}
                          onSelect={trackLaneProps.onSelect}
                          onMuteToggle={trackLaneProps.onMuteToggle}
                          onSoloToggle={trackLaneProps.onSoloToggle}
                          onNativeMonitorToggle={trackLaneProps.onNativeMonitorToggle}
                          onNativeArmToggle={trackLaneProps.onNativeArmToggle}
                          onVolumeChange={trackLaneProps.onVolumeChange}
                          onPanChange={trackLaneProps.onPanChange}
                          onSendChange={trackLaneProps.onSendChange}
                          onRenameTrack={trackLaneProps.onRenameTrack}
                          onDeleteTrack={trackLaneProps.onDeleteTrack}
                          onColorChange={trackLaneProps.onColorChange}
                          onClipMove={(clipId, newStartBeats, deltaY) => trackLaneProps.onClipMove(clipId, track.id, newStartBeats, deltaY)}
                          onClipResize={trackLaneProps.onClipResize}
                          onReorder={trackLaneProps.onReorder}
                          onClipSelect={trackLaneProps.onClipSelect}
                          onClipClick={trackLaneProps.onClipClick}
                          onCreateMidiClip={trackLaneProps.onCreateMidiClip}
                          onAutomationChange={trackLaneProps.onAutomationChange}
                          onAutomationAdd={trackLaneProps.onAutomationAdd}
                          onAutomationRemove={trackLaneProps.onAutomationRemove}
                          onDeleteClip={trackLaneProps.onDeleteClip}
                          onDuplicateClip={trackLaneProps.onDuplicateClip}
                          onLinkedDuplicateClip={trackLaneProps.onLinkedDuplicateClip}
                          onRenameClip={trackLaneProps.onRenameClip}
                          onClipColorChange={trackLaneProps.onClipColorChange}
                          onSplitClip={trackLaneProps.onSplitClip}
                          onMuteClip={trackLaneProps.onMuteClip}
                          onSetAsLoop={trackLaneProps.onSetAsLoop}
                          snapBeats={snapBeats}
                          activeDivision={activeDivision}
                          tripletMode={tripletMode}
                          nativeMeter={trackViewStateById[track.id]?.meter ?? null}
                          nativeMonitoring={trackViewStateById[track.id]?.nativeMonitoring ?? false}
                          nativeArmed={trackViewStateById[track.id]?.nativeArmed ?? false}
                        />
                      ))
                    )}
                  </TimelineCanvas>

                  <div className="flex border-b border-border/60">
                    <div className="w-52 shrink-0 border-r border-border/60 bg-card px-2 py-2 flex gap-1 sticky left-0 z-10">
                      <button className="flex-1 flex items-center justify-center gap-1 rounded-[3px] h-6 font-mono text-[10px] text-foreground/65 border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-border hover:text-foreground/80 transition-colors" onClick={timelineHeaderActions.createAudioTrack}>
                        <Plus className="h-3 w-3" /> Audio
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1 rounded-[3px] h-6 font-mono text-[10px] text-foreground/65 border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-border hover:text-foreground/80 transition-colors" onClick={timelineHeaderActions.createMidiTrack}>
                        <Plus className="h-3 w-3" /> MIDI
                      </button>
                      <button className="flex items-center justify-center gap-1 rounded-[3px] h-6 px-2 font-mono text-[10px] text-foreground/65 border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-border hover:text-foreground/80 transition-colors" onClick={timelineHeaderActions.createReturnTrack}>
                        <Undo2 className="h-3 w-3" /> Return
                      </button>
                      <button className="flex items-center justify-center gap-1 rounded-[3px] h-6 px-2 font-mono text-[10px] text-foreground/65 border border-border/50 bg-muted/20 hover:bg-muted/40 hover:border-border hover:text-foreground/80 transition-colors" onClick={timelineHeaderActions.openAudioUpload}>
                        <Upload className="h-3 w-3" /> Audio
                      </button>
                      <input {...assetImportInputProps} />
                    </div>
                    <div className="flex-1" />
                  </div>
                </>,
              )}
            </div>
          </GridContextMenu>
        </div>
      </div>
    </div>
  );
}
