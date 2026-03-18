import { useStudioMixerViewModel } from "@/hooks/useStudioMixerViewModel";
import { useStudioTimelineViewModel } from "@/hooks/useStudioTimelineViewModel";
import { useStudioAssetImportModel } from "@/hooks/useStudioAssetImportModel";
import { useStudioTrackActionsModel } from "@/hooks/useStudioTrackActionsModel";
import { useStudioBrowserActionsModel } from "@/hooks/useStudioBrowserActionsModel";
import { useStudioMidiEditProtocol } from "@/hooks/useStudioMidiEditProtocol";
import { useStudioNoteAuditionModel } from "@/hooks/useStudioNoteAuditionModel";
import { useStudioPianoRollViewModel } from "@/hooks/useStudioPianoRollViewModel";
import { useStudioNativeDetailActionsModel } from "@/hooks/useStudioNativeDetailActionsModel";
import { useStudioDetailPanelModel } from "@/hooks/useStudioDetailPanelModel";
import { useStudioLessonPanelModel } from "@/hooks/useStudioLessonPanelModel";
import { useStudioBottomPaneModel } from "@/hooks/useStudioBottomPaneModel";
import { useStudioTimelineShellModel } from "@/hooks/useStudioTimelineShellModel";
import type { StudioCommandDispatchResult } from "@/hooks/useStudioCommandDispatch";
import type { StudioContinuousEditModelResult } from "@/hooks/useStudioContinuousEditModel";
import type { StudioGuideBridgeResult } from "@/hooks/useStudioGuideBridge";
import type { StudioActionsResult } from "@/hooks/useStudioActions";
import type { HostConnectorActions } from "@/hooks/useHostConnector";
import type { HostPlugin } from "@/services/pluginHostClient";
import type { StudioSessionDomainRuntimeState } from "@/types/musicHubStudioRuntime";
import type { StudioModeModel } from "@/types/musicHubStudioModes";
import type {
  StudioDetailPanelState,
  StudioMixerState,
  StudioPanelState,
  StudioPianoRollState,
  StudioTrackViewState,
} from "@/domain/studio/studioViewContracts";

interface UseStudioBehaviorModelsOptions {
  mixerState: StudioMixerState;
  tracks: StudioMixerState["tracks"];
  allClips: StudioSessionDomainRuntimeState["trackIndex"]["allClips"];
  selectedClipIds: Set<string>;
  trackHeight: number;
  commandDispatch: StudioCommandDispatchResult;
  onMoveClip: (clipId: string, newStartBeats: number, targetTrackId?: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onAudioUpload: (file: File) => Promise<void>;
  hostPlugins: HostPlugin[];
  onRefreshHostPlugins?: () => void;
  trackViewStateById: Record<string, StudioTrackViewState>;
  continuousEditModel: StudioContinuousEditModelResult;
  onSplitClip: StudioActionsResult["handleSplitClip"];
  pianoRollState: StudioPianoRollState;
  activeClipId: string | null;
  beatsPerBar: number;
  snapBeats: number;
  currentBeat: number;
  onResizeClip: StudioActionsResult["handleClipResize"];
  hostActions: HostConnectorActions;
  detailPanelState: StudioDetailPanelState;
  onLoadNativeChain: (trackId: string) => Promise<string | null>;
  onToggleNativeNodeBypass: (chainId: string, nodeIndex: number, bypass: boolean) => void;
  onRemoveNativeNode: (chainId: string, nodeIndex: number) => void;
  onDeviceChainChange: StudioActionsResult["handleDeviceChainChange"];
  guideBridge: StudioGuideBridgeResult;
  onCommandRecorded: (entry: Parameters<ReturnType<typeof import("@/hooks/useMusicHubCommandLog").useMusicHubCommandLog>["record"]>[0]) => void;
  panelState: StudioPanelState;
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
  totalBeats: number;
  studioModeModel: StudioModeModel;
}

export function useStudioBehaviorModels({
  mixerState,
  tracks,
  allClips,
  selectedClipIds,
  trackHeight,
  commandDispatch,
  onMoveClip,
  fileInputRef,
  onAudioUpload,
  hostPlugins,
  onRefreshHostPlugins,
  trackViewStateById,
  continuousEditModel,
  onSplitClip,
  pianoRollState,
  activeClipId,
  beatsPerBar,
  snapBeats,
  currentBeat,
  onResizeClip,
  hostActions,
  detailPanelState,
  onLoadNativeChain,
  onToggleNativeNodeBypass,
  onRemoveNativeNode,
  onDeviceChainChange,
  guideBridge,
  onCommandRecorded,
  panelState,
  loopEnabled,
  loopStart,
  loopEnd,
  totalBeats,
  studioModeModel,
}: UseStudioBehaviorModelsOptions) {
  const mixerViewModel = useStudioMixerViewModel({
    tracks: mixerState.tracks,
    selectedTrackId: mixerState.selectedTrackId,
    masterMeter: mixerState.masterMeter,
    trackMeters: mixerState.trackMeters,
  });

  const timelineViewModel = useStudioTimelineViewModel({
    allClips,
    displayTracks: tracks,
    selectedClipIds,
    trackHeight,
    commandDispatch,
    onMoveClip,
  });

  const assetImportModel = useStudioAssetImportModel({
    fileInputRef,
    onAudioUpload,
  });

  const browserActionsModel = useStudioBrowserActionsModel({
    hostPlugins,
    commandDispatch,
    onRefreshHostPlugins,
  });

  const trackActionsModel = useStudioTrackActionsModel({
    commandDispatch,
    trackViewStateById,
    onVolumeChange: continuousEditModel.onVolumeChange,
    onPanChange: continuousEditModel.onPanChange,
    onSendChange: continuousEditModel.onSendChange,
    onClipMove: continuousEditModel.onClipMove,
    onClipResize: continuousEditModel.onClipResize,
    onReorderTrack: continuousEditModel.onReorderTrack,
    onAutomationChange: continuousEditModel.onAutomationChange,
    onAutomationAdd: continuousEditModel.onAutomationAdd,
    onAutomationRemove: continuousEditModel.onAutomationRemove,
    onSplitClip,
    onAudioUploadOpen: assetImportModel.openAudioUpload,
    onCreateTrack: {
      audio: timelineViewModel.createAudioTrack,
      midi: timelineViewModel.createMidiTrack,
      return: timelineViewModel.createReturnTrack,
    },
    onCreateMidiClip: timelineViewModel.createMidiClip,
    onMoveTimelineClip: timelineViewModel.moveClip,
    onLoopToSelection: timelineViewModel.loopToSelection,
    onSelectTrack: timelineViewModel.selectTrack,
    onSelectClip: timelineViewModel.selectClip,
    onClickClip: timelineViewModel.clickClip,
  });

  const midiEditProtocol = useStudioMidiEditProtocol({
    commandDispatch,
  });

  const noteAuditionModel = useStudioNoteAuditionModel({
    canUseNativeNoteAudition: pianoRollState.canUseNativeNoteAudition,
    onSendNote: (trackId, pitch, velocity) => hostActions.sendNote(trackId, pitch, velocity),
  });

  const pianoRollViewModel = useStudioPianoRollViewModel({
    clip: pianoRollState.clip,
    track: pianoRollState.track,
    ghostNotes: pianoRollState.ghostNotes,
    trackClips: pianoRollState.trackClips,
    canUseNativeNoteAudition: pianoRollState.canUseNativeNoteAudition,
    activeClipId,
    beatsPerBar,
    snapBeats,
    currentBeat,
    onSelectClip: timelineViewModel.selectClip,
    onResizeClip,
    onReplaceMidiNotes: midiEditProtocol.replaceNotes,
    onUpdateMidiData: (clipId, data) => commandDispatch.updateClip(clipId, { midiData: data }),
    onClose: commandDispatch.clearSelection,
    onNativeNote: noteAuditionModel.sendNativeNote,
    midiCommandMode: midiEditProtocol.mode,
  });

  const nativeDetailActionsModel = useStudioNativeDetailActionsModel({
    nativeChainId: detailPanelState.nativeChainId,
    nativeChainNodes: detailPanelState.nativeChainNodes,
    openEditors: detailPanelState.openEditors,
    onLoadNativeChain,
    onFetchChainParams: hostActions.fetchChainParams,
    onFetchPluginPresets: hostActions.fetchPluginPresets,
    onLoadPluginPreset: hostActions.loadPluginPreset,
    onSavePluginState: hostActions.savePluginState,
    onRestorePluginState: hostActions.restorePluginState,
    onSetParam: hostActions.setParam,
    onParamChanged: hostActions.onParamChanged,
    onOpenEditor: hostActions.openEditor,
    onCloseEditor: hostActions.closeEditor,
    onToggleNativeNodeBypass,
    onRemoveNativeNode,
  });

  const detailPanelModel = useStudioDetailPanelModel({
    track: detailPanelState.track,
    onDeviceChainChange,
    onClose: () => commandDispatch.select({ trackId: null }),
    isConnected: detailPanelState.isConnected,
    ...nativeDetailActionsModel,
  });

  const lessonPanelModel = useStudioLessonPanelModel({
    lesson: guideBridge.lesson,
    runtime: guideBridge.runtime,
    preferredCollapsed: studioModeModel.shell.guidePreferredCollapsed,
    onCommandRecorded,
  });

  const bottomPaneModel = useStudioBottomPaneModel({
    panelState,
    commandDispatch,
  });

  const timelineShellModel = useStudioTimelineShellModel({
    loopEnabled,
    loopStart,
    loopEnd,
    totalBeats,
    snapBeats,
    commandDispatch,
    onLoopToSelection: timelineViewModel.loopToSelection,
  });

  return {
    mixerViewModel,
    timelineViewModel,
    assetImportModel,
    browserActionsModel,
    trackActionsModel,
    midiEditProtocol,
    noteAuditionModel,
    pianoRollViewModel,
    nativeDetailActionsModel,
    detailPanelModel,
    lessonPanelModel,
    bottomPaneModel,
    timelineShellModel,
  };
}
