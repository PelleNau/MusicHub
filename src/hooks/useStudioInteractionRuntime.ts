import { useNativeHostSync } from "@/hooks/useNativeHostSync";
import { useStudioDomainView } from "@/hooks/useStudioDomainView";
import { useStudioGuideBridge } from "@/hooks/useStudioGuideBridge";
import { useStudioContinuousEditModel } from "@/hooks/useStudioContinuousEditModel";
import { useStudioCommandDispatch } from "@/hooks/useStudioCommandDispatch";
import { extractMidiNotesFromData } from "@/domain/studio/studioMidiCommandProtocol";
import type { useMusicHubCommandLog } from "@/hooks/useMusicHubCommandLog";
import type { useMusicHubContinuousEditLog } from "@/hooks/useMusicHubContinuousEditLog";
import type { StudioRuntimeCoreResult } from "@/hooks/useStudioRuntimeCore";

interface UseStudioInteractionRuntimeOptions {
  activeSessionId: string | null;
  lessonId: string | null;
  runtime: StudioRuntimeCoreResult;
  commandLog: ReturnType<typeof useMusicHubCommandLog>;
  continuousEditLog: ReturnType<typeof useMusicHubContinuousEditLog>;
}

export function useStudioInteractionRuntime({
  activeSessionId,
  lessonId,
  runtime,
  commandLog,
  continuousEditLog,
}: UseStudioInteractionRuntimeOptions) {
  const nativeHostSync = useNativeHostSync({
    tracks: runtime.tracks,
    selectedTrackId: runtime.selectedTrackId,
    selectedTrack: runtime.nativeSelectionModel.selectedTrack,
    selectedClipIsMidi: runtime.nativeSelectionModel.selectedClipIsMidi,
    activeSessionId,
    isMock: runtime.hostState.isMock,
    hostState: runtime.hostState,
    hostActions: runtime.hostActions,
    onDeviceChainChange: runtime.actions.handleDeviceChainChange,
  });

  const domainView = useStudioDomainView({
    tracks: runtime.tracks,
    selectedClipIds: runtime.selectedClipIds,
    selectedTrackId: runtime.selectedTrackId,
    activeClipId: runtime.activeClipId,
    bottomTab: runtime.bottomTab,
    hostState: runtime.hostState,
    browserAudioEnabled: runtime.hostModeModel.browserAudioEnabled,
    hostAvailable: runtime.hostModeModel.hostAvailable,
    engine: runtime.engine,
    effectivePlaybackState: runtime.transport.effectivePlaybackState,
    effectiveBeat: runtime.transport.effectiveBeat,
    mode: runtime.transport.mode,
    selectedClip: runtime.sessionDomainModel.selectedClip,
    selectedTrack: runtime.sessionDomainModel.selectedTrack,
    ghostNotes: runtime.sessionDomainModel.ghostNotes,
    nativeChainIdsByTrack: nativeHostSync.nativeChainIdsByTrack,
    nativeArmedByTrack: nativeHostSync.nativeArmedByTrack,
    nativeMonitoringByTrack: nativeHostSync.nativeMonitoringByTrack,
  });

  const guideBridge = useStudioGuideBridge({
    lessonId,
    commandEntries: commandLog.entries,
    continuousEditEntries: continuousEditLog.entries,
    onCommandRecorded: commandLog.record,
    transportSummary: domainView.transportSummary,
    connectionSummary: domainView.connectionSummary,
    panelState: domainView.panelState,
    selectionSummary: domainView.selectionSummary,
    pianoRollState: domainView.pianoRollState,
    detailPanelState: domainView.detailPanelState,
    trackViewStateById: domainView.trackViewStateById,
    displayTracks: domainView.displayTracks,
    displayReturnTracks: domainView.displayReturnTracks,
  });

  const continuousEditModel = useStudioContinuousEditModel({
    sessionId: activeSessionId,
    recordEdit: continuousEditLog.record,
    onVolumeChange: runtime.actions.handleVolumeChange,
    onPanChange: runtime.actions.handlePanChange,
    onSendChange: runtime.actions.handleSendChange,
    onClipMove: runtime.actions.handleClipMove,
    onClipResize: runtime.actions.handleClipResize,
    onReorderTrack: runtime.actions.handleReorderTrack,
    onAutomationChange: runtime.actions.handleAutomationChange,
    onAutomationAdd: runtime.actions.handleAutomationAdd,
    onAutomationRemove: runtime.actions.handleAutomationRemove,
  });

  const commandDispatch = useStudioCommandDispatch({
    sessionId: activeSessionId,
    currentBeat: runtime.transport.effectiveBeat,
    loopEnabled: runtime.loopEnabled,
    loopStart: runtime.loopStart,
    loopEnd: runtime.loopEnd,
    selectedClipIds: runtime.selectedClipIds,
    onPlay: runtime.transport.handlePlay,
    onPause: runtime.transport.handlePause,
    onStop: runtime.transport.handleStop,
    onSeek: runtime.transport.handleSeek,
    onSetLoop: (enabled, start, end) => runtime.transport.handleLoopChange(start, end),
    onToggleLoop: runtime.transport.handleLoopToggle,
    onSetTempo: runtime.transport.handleTempoChange,
    recording: runtime.hostState.recording,
    onToggleRecord: nativeHostSync.handleRecordToggle,
    onCreateTrack: (type, _role, _name) => {
      if (type === "return") {
        runtime.actions.handleAddReturn();
        return;
      }
      if (type === "audio" || type === "midi") {
        runtime.actions.handleAddTrack(type);
      }
    },
    onUpdateTrack: (trackId, patch) => {
      if (typeof patch.name === "string") runtime.actions.handleRenameTrack(trackId, patch.name);
      if (typeof patch.color === "number") runtime.actions.handleColorChange(trackId, patch.color);
      if (typeof patch.muted === "boolean") runtime.actions.handleMuteToggle(trackId);
      if (typeof patch.solo === "boolean") runtime.actions.handleSoloToggle(trackId);
      if (typeof patch.armed === "boolean") nativeHostSync.handleNativeArmToggle(trackId, patch.armed);
      if (typeof patch.monitoring === "string") {
        nativeHostSync.handleNativeMonitorToggle(trackId, patch.monitoring !== "off");
      }
    },
    onDeleteTrack: runtime.actions.handleDeleteTrack,
    onCreateMidiClip: runtime.actions.handleCreateMidiClip,
    onUpdateClip: (clipId, patch) => {
      if (typeof patch.name === "string") runtime.actions.handleRenameClip(clipId, patch.name);
      if (typeof patch.color === "number") runtime.actions.handleClipColorChange(clipId, patch.color);
      if (typeof patch.muted === "boolean") runtime.actions.handleMuteClip(clipId);
      if ("midiData" in patch) {
        runtime.updateClip.mutate({ clipId, updates: { midi_data: patch.midiData } });
      }
    },
    onReplaceMidiNotes: runtime.actions.handleUpdateMidiNotes,
    resolveMidiNotes: (clipId) => {
      const clip = runtime.sessionDomainModel.trackIndex.clipById[clipId];
      return extractMidiNotesFromData(clip?.midi_data);
    },
    onDeleteClip: runtime.actions.handleDeleteClip,
    onDuplicateClip: (clipId, linked) => {
      if (linked) {
        runtime.actions.handleCreateLinkedDuplicate(clipId);
        return;
      }
      runtime.actions.handleDuplicateClip(clipId);
    },
    onAddDevice: runtime.actions.handleBrowserAddDevice,
    onAddHostPlugin: (pluginId) => {
      const plugin = nativeHostSync.hostPlugins.find((candidate) => candidate.id === pluginId);
      if (plugin) runtime.actions.handleBrowserAddHostPlugin(plugin);
    },
    onCommandRecorded: commandLog.record,
    setSelectedTrackId: runtime.setSelectedTrackId,
    setSelectedClipIds: runtime.setSelectedClipIds,
    setBottomTab: runtime.setBottomTab,
  });

  return {
    ...nativeHostSync,
    ...domainView,
    guideBridge,
    continuousEditModel,
    commandDispatch,
  };
}
