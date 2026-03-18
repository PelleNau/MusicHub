import { useUndoRedo } from "@/hooks/useUndoRedo";
import { useMusicHubCommandLog } from "@/hooks/useMusicHubCommandLog";
import { useMusicHubContinuousEditLog } from "@/hooks/useMusicHubContinuousEditLog";
import { useStudioRouteModel } from "@/hooks/useStudioRouteModel";
import { useStudioPresentationModels } from "@/hooks/useStudioPresentationModels";
import { useStudioRuntime } from "@/hooks/useStudioRuntime";
import { useStudioPageCoordination } from "@/hooks/useStudioPageCoordination";
import { useStudioModeModel } from "@/hooks/useStudioModeModel";
import { useStudioMarkerModel } from "@/hooks/useStudioMarkerModel";
import type { StudioModePreference } from "@/types/musicHubStudioModes";

interface UseStudioPageRuntimeOptions {
  signOut: () => Promise<void>;
  navigateToLab: () => void;
  preferredMode: StudioModePreference;
}

export function useStudioPageRuntime({
  signOut,
  navigateToLab,
  preferredMode,
}: UseStudioPageRuntimeOptions) {
  const history = useUndoRedo();
  const routeModel = useStudioRouteModel();
  const commandLog = useMusicHubCommandLog({ maxEntries: 150 });
  const continuousEditLog = useMusicHubContinuousEditLog({ maxEntries: 200 });
  const runtime = useStudioRuntime({
    activeSessionId: routeModel.activeSessionId,
    lessonId: routeModel.lessonId,
    history,
    commandLog,
    continuousEditLog,
  });

  const {
    sessions,
    session,
    tracks,
    isLoading,
    createSession,
    deleteSession,
    renameSession,
    sessionDomainModel,
    selectedClipIds,
    clearSelectedClipIds,
    activeClipId,
    bottomTab,
    hostActions,
    mixerPanelState,
    sessionMetrics,
    buildGraph,
    transport,
    actions,
  } = runtime;

  const {
    effectivePlaybackState,
    effectiveBeat,
    playheadBeatGetter,
  } = transport;
  const {
    hostPlugins,
    nativeArmedByTrack,
    nativeMonitoringByTrack,
    nativeChainIdsByTrack,
    refreshHostPlugins,
    handleLoadNativeChainForTrack,
    handleRemoveNativeNode,
    handleToggleNativeNodeBypass,
    handleNativeArmToggle,
    handleNativeMonitorToggle,
    handleRecordToggle,
    displayTracks,
    displayReturnTracks,
    masterMeter,
    trackViewStateById,
    transportSummary,
    connectionSummary,
    panelState,
    pianoRollState,
    detailPanelState,
    mixerState,
    guideBridge,
    continuousEditModel,
    commandDispatch,
    browserActionsModel,
    assetImportInputProps,
    bottomPaneModel,
    mixerViewModel,
    pianoRollViewModel,
    detailPanelModel,
  } = runtime;

  const markerModel = useStudioMarkerModel({
    sessionId: routeModel.activeSessionId,
    beatsPerBar: sessionMetrics.beatsPerBar,
    getCurrentBeat: playheadBeatGetter ?? (() => effectiveBeat),
    onSeek: commandDispatch.seek,
  });

  const coordination = useStudioPageCoordination({
    beatsPerBar: sessionMetrics.beatsPerBar,
    totalBeats: sessionMetrics.totalBeats,
    tracks,
    selectedClipIds,
    clearSelectedClipIds,
    bottomTab,
    showPianoRoll: bottomPaneModel.showPianoRoll,
    playbackState: effectivePlaybackState,
    history,
    commands: {
      play: commandDispatch.play,
      pause: commandDispatch.pause,
      deleteClip: commandDispatch.deleteClip,
      updateClip: commandDispatch.updateClip,
      openPanel: commandDispatch.openPanel,
      setLoop: commandDispatch.setLoop,
    },
    markerCommands: {
      addMarkerAtCurrentBeat: markerModel.addMarkerAtCurrentBeat,
    },
    loopState: {
      loopEnabled: transport.loopEnabled,
      loopStart: transport.loopStart,
      loopEnd: transport.loopEnd,
    },
    runtimeCoordination: {
      isMock: connectionSummary.isMock,
      buildGraph,
    },
  });

  const studioModeModel = useStudioModeModel({
    routeMode: routeModel.routeMode,
    preferredMode,
    lessonState: {
      visible: guideBridge.lesson !== undefined,
      lessonStatus: guideBridge.runtime.state.lessonStatus,
    },
    panelState,
  });

  const presentation = useStudioPresentationModels({
    behavior: {
      mixerState,
      tracks: displayTracks,
      allClips: sessionDomainModel.trackIndex.allClips,
      selectedClipIds,
      trackHeight: coordination.grid.trackHeight,
      commandDispatch,
      onMoveClip: actions.handleClipMove,
      fileInputRef: actions.fileInputRef,
      onAudioUpload: actions.handleAudioUpload,
      hostPlugins,
      onRefreshHostPlugins: refreshHostPlugins,
      trackViewStateById,
      continuousEditModel,
      onSplitClip: actions.handleSplitClip,
      pianoRollState,
      activeClipId,
      beatsPerBar: sessionMetrics.beatsPerBar,
      snapBeats: coordination.grid.snapBeats,
      currentBeat: effectiveBeat,
      onResizeClip: actions.handleClipResize,
      hostActions,
      detailPanelState,
      onLoadNativeChain: handleLoadNativeChainForTrack,
      onToggleNativeNodeBypass: handleToggleNativeNodeBypass,
      onRemoveNativeNode: handleRemoveNativeNode,
      onDeviceChainChange: actions.handleDeviceChainChange,
      guideBridge,
      onCommandRecorded: commandLog.record,
      panelState,
      loopEnabled: transport.loopEnabled,
      loopStart: transport.loopStart,
      loopEnd: transport.loopEnd,
      totalBeats: sessionMetrics.totalBeats,
      studioModeModel,
    },
    shell: {
      routeModel,
      signOut,
      navigateToLab,
      connectionSummary,
      onConnect: hostActions.connect,
      onDisconnect: hostActions.disconnect,
      onRestartShellHost: hostActions.restartShellHost,
      onToggleRecord: connectionSummary.canUseNativeControls ? handleRecordToggle : undefined,
      sessionMetrics,
      transportSummary,
      loopEnabled: transport.loopEnabled,
      loopStart: transport.loopStart,
      loopEnd: transport.loopEnd,
      masterMeter,
      commandDispatch,
      history,
      createSession,
      onCreateSession: actions.handleNewSession,
      onSelectSession: routeModel.selectSession,
      onDeleteSessionMutate: deleteSession.mutate,
      onRenameSessionMutate: renameSession.mutate,
      browserActionsModel,
      grid: coordination.grid,
      timelineRef: coordination.timelineRef,
      pixelsPerBeat: coordination.grid.pixelsPerBeat,
      playheadBeatGetter,
      effectiveBeat,
      onSeek: commandDispatch.seek,
      displayTracks,
      displayReturnTracks,
      trackViewStateById,
      selectedClipIds,
      onNativeMonitorToggle: handleNativeMonitorToggle,
      onNativeArmToggle: handleNativeArmToggle,
      assetImportInputProps,
      guideBridge,
      bottomPaneModel,
      panelState,
      mixerViewModel,
      mixerPanelState,
      pianoRollViewModel,
      detailPanelModel,
      markerModel,
    },
    studioModeModel,
  });

  return {
    routeModel,
    sessions,
    session,
    tracks,
    isLoading,
    sessionMetrics,
    guideBridge,
    connectionSummary,
    studioModeModel,
    markerModel,
    grid: coordination.grid,
    presentation,
    settingsRuntime: {
      bottomTab,
    },
  };
}

export type StudioPageRuntimeResult = ReturnType<typeof useStudioPageRuntime>;
