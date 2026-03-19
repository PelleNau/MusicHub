import type { GridDivision } from "@/hooks/useTimelineGrid";
import type { StudioMarkerModelResult } from "@/hooks/useStudioMarkerModel";
import type { AutomationPoint, SessionTrack } from "@/types/studio";
import type { MeterLevel } from "@/services/pluginHostSocket";
import { BrowserPanel } from "@/components/studio/BrowserPanel";
import { GridContextMenu } from "@/components/studio/GridOverlay";
import { LoopRegion } from "@/components/studio/LoopRegion";
import { StudioArrangementToolbar } from "@/components/studio/StudioArrangementToolbar";
import { TimelineMarkerFlags, TimelineMarkerLines } from "@/components/studio/TimelineMarkerOverlay";
import { TimelineCanvas } from "@/components/studio/TimelineCanvas";
import { VerticalZoomSlider } from "@/components/studio/VerticalZoomSlider";
import { TrackLane } from "@/components/studio/TrackLane";
import { Flag, Plus, Undo2, Upload } from "lucide-react";

interface StudioArrangementWorkspaceProps {
  mode: "guided" | "standard" | "focused";
  captureVariant?: "figma" | null;
  showBrowserPanel: boolean;
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
  trackViewStateById: Record<
    string,
    {
      selected: boolean;
      meter: MeterLevel | null;
      nativeMonitoring: boolean;
      nativeArmed: boolean;
    }
  >;
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
    onAutomationChange: (trackId: string, laneId: string, points: AutomationPoint[]) => void;
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
    addMarkerAtPlayhead: () => void;
  };
  assetImportInputProps: React.InputHTMLAttributes<HTMLInputElement>;
  markerModel: StudioMarkerModelResult;
}

export function StudioArrangementWorkspace({
  mode,
  captureVariant,
  showBrowserPanel,
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
  emptyStateInstruction,
  trackLaneProps,
  snapBeats,
  arrangementWrapper,
  timelineHeaderActions,
  assetImportInputProps,
  markerModel,
}: StudioArrangementWorkspaceProps) {
  const timelineLabels = mode === "standard"
    ? ["Tracks", "Arrangement"]
    : ["Timeline", "Arrangement"];

  return (
    <div
      className="flex min-h-0 flex-1 overflow-hidden bg-[#17181b]"
      data-studio-mode={mode}
    >
      {showBrowserPanel ? <BrowserPanel {...browserProps} /> : null}

      <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
          <div className="border-b border-white/6 bg-[#232429] px-4 py-2">
            <div className="flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.18em] text-white/40">
              <div className="flex items-center gap-4">
                {timelineLabels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
              <div className="text-white/28">
                {emptyStateInstruction ? "Lesson Focus" : "Edit View"}
              </div>
            </div>
          </div>
          <StudioArrangementToolbar
            mode={mode}
            captureVariant={captureVariant}
            activeDivision={gridProps.activeDivision}
            snapEnabled={gridProps.snapEnabled}
            tripletMode={gridProps.tripletMode}
            pixelsPerBeat={pixelsPerBeat}
            trackHeight={trackHeight}
            onToggleSnap={gridProps.onToggleSnap}
            onToggleTriplet={gridProps.onToggleTriplet}
            onNarrowGrid={gridProps.onNarrow}
            onWidenGrid={gridProps.onWiden}
            onCreateAudioTrack={timelineHeaderActions.createAudioTrack}
            onCreateMidiTrack={timelineHeaderActions.createMidiTrack}
            onCreateReturnTrack={timelineHeaderActions.createReturnTrack}
            onOpenAudioUpload={timelineHeaderActions.openAudioUpload}
            onAddMarkerAtPlayhead={timelineHeaderActions.addMarkerAtPlayhead}
          />
          <GridContextMenu {...gridProps}>
            <div
              ref={timelineRef}
              data-timeline
              className="relative min-h-0 flex-1 overflow-auto bg-[#17181b]"
              {...timelineContainerProps}
            >
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
                      <VerticalZoomSlider
                        value={(trackHeight - 32) / (200 - 32)}
                        onChange={(value) => onSetTrackHeight(32 + value * (200 - 32))}
                      />
                    }
                    rulerOverlayContent={
                      <TimelineMarkerFlags
                        markers={markerModel.sortedMarkers}
                        pixelsPerBeat={pixelsPerBeat}
                        onJump={markerModel.jumpToMarker}
                        onRename={markerModel.renameMarker}
                        onDelete={markerModel.deleteMarker}
                      />
                    }
                    loopOverlay={<LoopRegion pixelsPerBeat={pixelsPerBeat} {...loopRegionProps} />}
                    gridOverlayContent={
                      <TimelineMarkerLines
                        markers={markerModel.sortedMarkers}
                        pixelsPerBeat={pixelsPerBeat}
                      />
                    }
                  >
                    {displayTracks.length === 0 ? (
                      <div className="flex h-full min-h-[120px] items-center justify-center">
                        <div className="max-w-sm rounded-2xl border border-white/8 bg-[#232429] px-5 py-4 text-center shadow-[var(--shadow-md)]">
                          {emptyStateInstruction ? (
                            <>
                              <p className="text-sm font-medium text-foreground/80">{emptyStateInstruction}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Follow the guide to build the first track before opening more panels.
                              </p>
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
                          onClipMove={(clipId, newStartBeats, deltaY) =>
                            trackLaneProps.onClipMove(clipId, track.id, newStartBeats, deltaY)
                          }
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

                  <div className="flex border-t border-white/6 bg-[#232429]">
                    <div className="sticky left-0 z-10 flex w-52 shrink-0 gap-1 border-r border-white/6 bg-[#24252a] px-2 py-2">
                      <button
                        className="flex h-7 flex-1 items-center justify-center gap-1 rounded-md border border-white/8 bg-[#2b2d33] font-mono text-[10px] text-white/65 transition-colors hover:bg-white/6 hover:text-white/82"
                        onClick={timelineHeaderActions.createAudioTrack}
                      >
                        <Plus className="h-3 w-3" /> Audio
                      </button>
                      <button
                        className="flex h-7 flex-1 items-center justify-center gap-1 rounded-md border border-white/8 bg-[#2b2d33] font-mono text-[10px] text-white/65 transition-colors hover:bg-white/6 hover:text-white/82"
                        onClick={timelineHeaderActions.createMidiTrack}
                      >
                        <Plus className="h-3 w-3" /> MIDI
                      </button>
                      <button
                        className="flex h-7 items-center justify-center gap-1 rounded-md border border-white/8 bg-[#2b2d33] px-2 font-mono text-[10px] text-white/65 transition-colors hover:bg-white/6 hover:text-white/82"
                        onClick={timelineHeaderActions.createReturnTrack}
                      >
                        <Undo2 className="h-3 w-3" /> Return
                      </button>
                      <button
                        className="flex h-7 items-center justify-center gap-1 rounded-md border border-white/8 bg-[#2b2d33] px-2 font-mono text-[10px] text-white/65 transition-colors hover:bg-white/6 hover:text-white/82"
                        onClick={timelineHeaderActions.openAudioUpload}
                      >
                        <Upload className="h-3 w-3" /> Audio
                      </button>
                      <button
                        className="flex h-7 items-center justify-center gap-1 rounded-md border border-white/8 bg-[#2b2d33] px-2 font-mono text-[10px] text-white/65 transition-colors hover:bg-white/6 hover:text-white/82"
                        onClick={timelineHeaderActions.addMarkerAtPlayhead}
                      >
                        <Flag className="h-3 w-3" /> Marker
                      </button>
                      <input {...assetImportInputProps} />
                    </div>
                    <div className="flex flex-1 items-center px-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/35">
                        Add only the tracks you need for the current step.
                      </p>
                    </div>
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
