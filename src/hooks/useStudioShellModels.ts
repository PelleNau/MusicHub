import { useStudioHeaderModel } from "@/hooks/useStudioHeaderModel";
import { useStudioConnectionActionsModel } from "@/hooks/useStudioConnectionActionsModel";
import { useStudioConnectionAlertModel } from "@/hooks/useStudioConnectionAlertModel";
import { useStudioSessionPickerModel } from "@/hooks/useStudioSessionPickerModel";
import { useStudioTransportBarModel } from "@/hooks/useStudioTransportBarModel";
import { useStudioArrangementWorkspaceModel } from "@/hooks/useStudioArrangementWorkspaceModel";
import { useStudioBottomWorkspaceModel } from "@/hooks/useStudioBottomWorkspaceModel";
import { useStudioGuideSidebarModel } from "@/hooks/useStudioGuideSidebarModel";
import type { StudioLessonPanelModelResult } from "@/hooks/useStudioLessonPanelModel";
import type { StudioRouteModelResult } from "@/hooks/useStudioRouteModel";
import type { StudioBrowserActionsModelResult } from "@/hooks/useStudioBrowserActionsModel";
import type { StudioBottomPaneModelResult } from "@/hooks/useStudioBottomPaneModel";
import type { StudioMixerViewModelResult } from "@/hooks/useStudioMixerViewModel";
import type { StudioTrackActionsModelResult } from "@/hooks/useStudioTrackActionsModel";
import type { StudioPianoRollViewModelResult } from "@/hooks/useStudioPianoRollViewModel";
import type { StudioDetailPanelModelResult } from "@/hooks/useStudioDetailPanelModel";
import type { useStudioTimelineShellModel } from "@/hooks/useStudioTimelineShellModel";
import type { StudioCommandDispatchResult } from "@/hooks/useStudioCommandDispatch";
import type { useUndoRedo } from "@/hooks/useUndoRedo";
import type { StudioGuideBridgeResult } from "@/hooks/useStudioGuideBridge";
import type { StudioMixerPanelStateResult } from "@/hooks/useStudioMixerPanelState";
import type { useTimelineGrid } from "@/hooks/useTimelineGrid";
import type { StudioSessionMetrics } from "@/types/musicHubStudioRuntime";
import type { SessionTrack } from "@/types/studio";

interface UseStudioShellModelsOptions {
  lessonPanelModel: StudioLessonPanelModelResult;
  routeModel: StudioRouteModelResult;
  signOut: () => Promise<void>;
  navigateToLab: () => void;
  connectionSummary: {
    canUseNativeControls: boolean;
    currentBeat?: number;
  } & Parameters<typeof useStudioConnectionAlertModel>[0]["connectionSummary"];
  onConnect: () => void;
  onDisconnect: () => void;
  onRestartShellHost: () => void;
  onToggleRecord?: () => void;
  sessionMetrics: StudioSessionMetrics;
  transportSummary: {
    currentBeat: number;
    playbackState: "playing" | "paused" | "stopped";
  };
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
  masterMeter: Parameters<typeof useStudioTransportBarModel>[0]["masterMeter"];
  commandDispatch: StudioCommandDispatchResult;
  history: ReturnType<typeof useUndoRedo>;
  createSession: { isPending: boolean };
  onCreateSession: () => Promise<string | null>;
  onSelectSession: (id: string | null) => void;
  onDeleteSessionMutate: (id: string, options: { onSuccess: () => void; onError: () => void }) => void;
  onRenameSessionMutate: (
    payload: { id: string; name: string },
    options: { onSuccess: () => void; onError: () => void },
  ) => void;
  browserActionsModel: StudioBrowserActionsModelResult;
  grid: ReturnType<typeof useTimelineGrid>;
  timelineContainerProps: Parameters<typeof useStudioArrangementWorkspaceModel>[0]["timelineContainerProps"];
  timelineRef: Parameters<typeof useStudioArrangementWorkspaceModel>[0]["timelineRef"];
  pixelsPerBeat: number;
  playheadBeatGetter: (() => number) | undefined;
  effectiveBeat: number;
  onSeek: (beat: number) => void;
  loopRegionProps: Parameters<typeof useStudioArrangementWorkspaceModel>[0]["loopRegionProps"];
  displayTracks: SessionTrack[];
  displayReturnTracks: SessionTrack[];
  trackViewStateById: Parameters<typeof useStudioArrangementWorkspaceModel>[0]["trackViewStateById"];
  selectedClipIds: Set<string>;
  trackActionsModel: StudioTrackActionsModelResult;
  onNativeMonitorToggle?: (trackId: string, monitoring: boolean) => void;
  onNativeArmToggle?: (trackId: string, armed: boolean) => void;
  assetImportInputProps: React.InputHTMLAttributes<HTMLInputElement>;
  guideBridge: StudioGuideBridgeResult;
  bottomPaneModel: StudioBottomPaneModelResult;
  panelState: {
    showMixer: boolean;
    showPianoRoll: boolean;
    selectedTrackId: string | null;
  };
  mixerViewModel: StudioMixerViewModelResult;
  mixerPanelState: StudioMixerPanelStateResult;
  pianoRollViewModel: StudioPianoRollViewModelResult | null;
  detailPanelModel: StudioDetailPanelModelResult;
}

export function useStudioShellModels({
  lessonPanelModel,
  routeModel,
  signOut,
  navigateToLab,
  connectionSummary,
  onConnect,
  onDisconnect,
  onRestartShellHost,
  onToggleRecord,
  sessionMetrics,
  transportSummary,
  loopEnabled,
  loopStart,
  loopEnd,
  masterMeter,
  commandDispatch,
  history,
  createSession,
  onCreateSession,
  onSelectSession,
  onDeleteSessionMutate,
  onRenameSessionMutate,
  browserActionsModel,
  grid,
  timelineContainerProps,
  timelineRef,
  pixelsPerBeat,
  playheadBeatGetter,
  effectiveBeat,
  onSeek,
  loopRegionProps,
  displayTracks,
  displayReturnTracks,
  trackViewStateById,
  selectedClipIds,
  trackActionsModel,
  onNativeMonitorToggle,
  onNativeArmToggle,
  assetImportInputProps,
  guideBridge,
  bottomPaneModel,
  panelState,
  mixerViewModel,
  mixerPanelState,
  pianoRollViewModel,
  detailPanelModel,
}: UseStudioShellModelsOptions) {
  const headerModel = useStudioHeaderModel({
    lessonState: lessonPanelModel.lessonState,
    onToggleGuide: lessonPanelModel.toggleCollapsed,
    onOpenSessions: routeModel.openSessions,
    onOpenLab: navigateToLab,
    onSignOut: signOut,
  });

  const connectionActionsModel = useStudioConnectionActionsModel({
    connectionSummary,
    onConnect,
    onDisconnect,
    onRestartShellHost,
    onToggleRecord,
  });

  const transportBarModel = useStudioTransportBarModel({
    tempo: sessionMetrics.tempo,
    timeSignature: sessionMetrics.timeSignature,
    currentBeat: transportSummary.currentBeat,
    playbackState: transportSummary.playbackState,
    loopEnabled,
    loopStart,
    loopEnd,
    connectionSummary,
    masterMeter,
    commandDispatch,
    history,
    connectionActionsModel,
  });

  const connectionAlertModel = useStudioConnectionAlertModel({
    connectionSummary,
  });

  const sessionPickerModel = useStudioSessionPickerModel({
    createSession,
    onCreateSession,
    onSelectSession,
    onSignOut: signOut,
    onDeleteSession: onDeleteSessionMutate,
    onRenameSession: onRenameSessionMutate,
  });

  const lessonInstruction = guideBridge.runtime.state.currentStep?.instruction;

  const arrangementWorkspaceModel = useStudioArrangementWorkspaceModel({
    browserActionsModel,
    grid,
    timelineContainerProps,
    timelineRef,
    totalBeats: sessionMetrics.totalBeats,
    pixelsPerBeat,
    beatsPerBar: sessionMetrics.beatsPerBar,
    playheadBeatGetter,
    effectiveBeat,
    onSeek,
    loopRegionProps,
    displayTracks,
    displayReturnTracks,
    trackViewStateById,
    selectedClipIds,
    trackActionsModel,
    canUseNativeControls: connectionSummary.canUseNativeControls,
    onNativeMonitorToggle,
    onNativeArmToggle,
    assetImportInputProps,
    lessonInstruction,
  });

  const bottomWorkspaceModel = useStudioBottomWorkspaceModel({
    bottomPaneModel,
    panelState,
    mixerViewModel,
    mixerPanelState,
    trackActionsModel,
    pianoRollViewModel: panelState.showPianoRoll ? pianoRollViewModel : null,
    detailPanelModel,
    lessonInstruction,
  });

  const guideSidebarModel = useStudioGuideSidebarModel({
    guideBridge,
    lessonPanelModel,
    onDismissCompletion: routeModel.dismissLesson,
  });

  return {
    headerModel,
    connectionActionsModel,
    transportBarModel,
    connectionAlertModel,
    sessionPickerModel,
    arrangementWorkspaceModel,
    bottomWorkspaceModel,
    guideSidebarModel,
  };
}
