import { useMemo } from "react";
import type { SessionTrack } from "@/types/studio";
import type { GridDivision } from "@/hooks/useTimelineGrid";
import type { MeterLevel } from "@/services/pluginHostSocket";
import type { StudioMarkerModelResult } from "@/hooks/useStudioMarkerModel";
import type { StudioBrowserActionsModelResult } from "@/hooks/useStudioBrowserActionsModel";
import type { StudioTrackActionsModelResult } from "@/hooks/useStudioTrackActionsModel";

interface UseStudioArrangementWorkspaceModelOptions {
  browserActionsModel: StudioBrowserActionsModelResult;
  browserPreferredCollapsed: boolean;
  grid: {
    gridMode: "adaptive" | "fixed";
    fixedDivision: GridDivision;
    activeDivision: GridDivision;
    snapEnabled: boolean;
    tripletMode: boolean;
    snapBeats: number;
    trackHeight: number;
    setGridMode: (mode: "adaptive" | "fixed") => void;
    setFixedDivision: (division: GridDivision) => void;
    toggleSnapEnabled: () => void;
    toggleTripletMode: () => void;
    narrowGrid: () => void;
    widenGrid: () => void;
    setPixelsPerBeat: (value: number) => void;
    setTrackHeight: (value: number) => void;
  };
  timelineContainerProps: React.HTMLAttributes<HTMLDivElement>;
  timelineRef: React.RefObject<HTMLDivElement | null>;
  totalBeats: number;
  pixelsPerBeat: number;
  beatsPerBar: number;
  playheadBeatGetter: (() => number) | undefined;
  effectiveBeat: number;
  onSeek: (beat: number) => void;
  loopRegionProps: {
    loopStart: number;
    loopEnd: number;
    loopEnabled: boolean;
    totalBeats: number;
    snapBeats: number;
    onLoopChange: (start: number, end: number) => void;
    onLoopToggle: () => void;
    onLoopFocus: () => void;
    onLoopToSelection: () => void;
  };
  displayTracks: SessionTrack[];
  displayReturnTracks: SessionTrack[];
  trackViewStateById: Record<string, {
    selected: boolean;
    meter: MeterLevel | null;
    nativeMonitoring: boolean;
    nativeArmed: boolean;
  }>;
  selectedClipIds: Set<string>;
  trackActionsModel: StudioTrackActionsModelResult;
  canUseNativeControls: boolean;
  onNativeMonitorToggle?: (trackId: string, monitoring: boolean) => void;
  onNativeArmToggle?: (trackId: string, armed: boolean) => void;
  assetImportInputProps: React.InputHTMLAttributes<HTMLInputElement>;
  lessonInstruction?: string;
  markerModel: StudioMarkerModelResult;
}

export function useStudioArrangementWorkspaceModel({
  browserActionsModel,
  browserPreferredCollapsed,
  grid,
  timelineContainerProps,
  timelineRef,
  totalBeats,
  pixelsPerBeat,
  beatsPerBar,
  playheadBeatGetter,
  effectiveBeat,
  onSeek,
  loopRegionProps,
  displayTracks,
  displayReturnTracks,
  trackViewStateById,
  selectedClipIds,
  trackActionsModel,
  canUseNativeControls,
  onNativeMonitorToggle,
  onNativeArmToggle,
  assetImportInputProps,
  lessonInstruction,
  markerModel,
}: UseStudioArrangementWorkspaceModelOptions) {
  return useMemo(() => ({
    browserProps: {
      onAddDevice: browserActionsModel.onAddDevice,
      onAddHostPlugin: browserActionsModel.onAddHostPlugin,
      hostPlugins: browserActionsModel.hostPlugins,
      onRefreshHostPlugins: browserActionsModel.onRefreshHostPlugins,
      preferredCollapsed: browserPreferredCollapsed,
    },
    gridProps: {
      gridMode: grid.gridMode,
      fixedDivision: grid.fixedDivision,
      activeDivision: grid.activeDivision,
      snapEnabled: grid.snapEnabled,
      tripletMode: grid.tripletMode,
      onSetGridMode: grid.setGridMode,
      onSetFixedDivision: grid.setFixedDivision,
      onToggleSnap: grid.toggleSnapEnabled,
      onToggleTriplet: grid.toggleTripletMode,
      onNarrow: grid.narrowGrid,
      onWiden: grid.widenGrid,
    },
    timelineContainerProps,
    timelineRef,
    totalBeats,
    pixelsPerBeat,
    beatsPerBar,
    browserPreferredCollapsed,
    activeDivision: grid.activeDivision,
    tripletMode: grid.tripletMode,
    playheadBeatGetter,
    effectiveBeat,
    onSeek,
    trackHeight: grid.trackHeight,
    onSetPixelsPerBeat: grid.setPixelsPerBeat,
    onSetTrackHeight: grid.setTrackHeight,
    loopRegionProps,
    displayTracks,
    displayReturnTracks,
    trackViewStateById,
    selectedClipIds,
    emptyStateInstruction: lessonInstruction,
    trackLaneProps: {
      onSelect: trackActionsModel.track.onSelect,
      onMuteToggle: trackActionsModel.track.onMuteToggle,
      onSoloToggle: trackActionsModel.track.onSoloToggle,
      onNativeMonitorToggle: canUseNativeControls ? trackActionsModel.track.onNativeMonitorToggle : undefined,
      onNativeArmToggle: canUseNativeControls ? trackActionsModel.track.onNativeArmToggle : undefined,
      onVolumeChange: trackActionsModel.track.onVolumeChange,
      onPanChange: trackActionsModel.track.onPanChange,
      onSendChange: trackActionsModel.track.onSendChange,
      onRenameTrack: trackActionsModel.track.onRenameTrack,
      onDeleteTrack: trackActionsModel.track.onDeleteTrack,
      onColorChange: trackActionsModel.track.onColorChange,
      onClipMove: trackActionsModel.track.onClipMove,
      onClipResize: trackActionsModel.track.onClipResize,
      onReorder: trackActionsModel.track.onReorder,
      onClipSelect: trackActionsModel.track.onClipSelect,
      onClipClick: trackActionsModel.track.onClipClick,
      onCreateMidiClip: trackActionsModel.track.onCreateMidiClip,
      onAutomationChange: trackActionsModel.track.onAutomationChange,
      onAutomationAdd: trackActionsModel.track.onAutomationAdd,
      onAutomationRemove: trackActionsModel.track.onAutomationRemove,
      onDeleteClip: trackActionsModel.track.onDeleteClip,
      onDuplicateClip: trackActionsModel.track.onDuplicateClip,
      onLinkedDuplicateClip: trackActionsModel.track.onLinkedDuplicateClip,
      onRenameClip: trackActionsModel.track.onRenameClip,
      onClipColorChange: trackActionsModel.track.onClipColorChange,
      onSplitClip: trackActionsModel.track.onSplitClip,
      onMuteClip: trackActionsModel.track.onMuteClip,
      onSetAsLoop: trackActionsModel.track.onSetAsLoop,
      splitBeat: effectiveBeat,
    },
    snapBeats: grid.snapBeats,
    markerModel,
    timelineHeaderActions: {
      createAudioTrack: trackActionsModel.timelineHeader.createAudioTrack,
      createMidiTrack: trackActionsModel.timelineHeader.createMidiTrack,
      createReturnTrack: trackActionsModel.timelineHeader.createReturnTrack,
      openAudioUpload: trackActionsModel.timelineHeader.openAudioUpload,
      addMarkerAtPlayhead: markerModel.addMarkerAtCurrentBeat,
    },
    assetImportInputProps,
  }), [
    assetImportInputProps,
    beatsPerBar,
    browserPreferredCollapsed,
    browserActionsModel.hostPlugins,
    browserActionsModel.onAddDevice,
    browserActionsModel.onAddHostPlugin,
    browserActionsModel.onRefreshHostPlugins,
    canUseNativeControls,
    displayReturnTracks,
    displayTracks,
    effectiveBeat,
    grid,
    lessonInstruction,
    loopRegionProps,
    markerModel,
    onSeek,
    pixelsPerBeat,
    playheadBeatGetter,
    selectedClipIds,
    timelineContainerProps,
    timelineRef,
    totalBeats,
    trackActionsModel,
    trackViewStateById,
  ]);
}
