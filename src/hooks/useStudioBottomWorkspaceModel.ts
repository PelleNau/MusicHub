import { useMemo } from "react";
import type { StudioBottomPaneModelResult } from "@/hooks/useStudioBottomPaneModel";
import type { StudioMixerViewModelResult } from "@/hooks/useStudioMixerViewModel";
import type { StudioTrackActionsModelResult } from "@/hooks/useStudioTrackActionsModel";
import type { StudioPianoRollViewModelResult } from "@/hooks/useStudioPianoRollViewModel";
import type { StudioDetailPanelModelResult } from "@/hooks/useStudioDetailPanelModel";

interface UseStudioBottomWorkspaceModelOptions {
  bottomPaneModel: StudioBottomPaneModelResult;
  panelState: {
    showMixer: boolean;
    showPianoRoll: boolean;
    selectedTrackId: string | null;
  };
  mixerViewModel: StudioMixerViewModelResult;
  mixerPanelState: {
    masterVolume: number;
    setMasterVolume: (value: number) => void;
  };
  trackActionsModel: StudioTrackActionsModelResult;
  pianoRollViewModel: StudioPianoRollViewModelResult | null;
  detailPanelModel: StudioDetailPanelModelResult;
  lessonInstruction?: string;
}

export function useStudioBottomWorkspaceModel({
  bottomPaneModel,
  panelState,
  mixerViewModel,
  mixerPanelState,
  trackActionsModel,
  pianoRollViewModel,
  detailPanelModel,
  lessonInstruction,
}: UseStudioBottomWorkspaceModelOptions) {
  return useMemo(() => ({
    bottomTab: bottomPaneModel.bottomTab,
    setBottomTab: bottomPaneModel.setBottomTab,
    showPianoRoll: bottomPaneModel.showPianoRoll,
    showMixer: panelState.showMixer,
    showDetail: Boolean(panelState.selectedTrackId),
    selectedTrackId: panelState.selectedTrackId,
    mixerEmptyInstruction: lessonInstruction,
    emptyInstruction: lessonInstruction,
    mixerPanelProps: {
      tracks: mixerViewModel.tracks,
      selectedTrackId: mixerViewModel.selectedTrackId,
      masterMeter: mixerViewModel.masterMeter,
      masterVolume: mixerPanelState.masterVolume,
      trackMeters: mixerViewModel.trackMeters,
      onMasterVolumeChange: mixerPanelState.setMasterVolume,
      onMuteToggle: trackActionsModel.mixer.onMuteToggle,
      onSoloToggle: trackActionsModel.mixer.onSoloToggle,
      onVolumeChange: trackActionsModel.mixer.onVolumeChange,
      onPanChange: trackActionsModel.mixer.onPanChange,
      onSendChange: trackActionsModel.mixer.onSendChange,
      onSelectTrack: trackActionsModel.mixer.onSelectTrack,
      onInsertClick: trackActionsModel.mixer.onInsertClick,
      onRenameTrack: trackActionsModel.mixer.onRenameTrack,
      onDeleteTrack: trackActionsModel.mixer.onDeleteTrack,
      onColorChange: trackActionsModel.mixer.onColorChange,
    },
    pianoRollProps: panelState.showPianoRoll && pianoRollViewModel ? pianoRollViewModel : null,
    detailPanelProps: detailPanelModel,
  }), [
    bottomPaneModel.bottomTab,
    bottomPaneModel.setBottomTab,
    bottomPaneModel.showPianoRoll,
    detailPanelModel,
    lessonInstruction,
    mixerPanelState,
    mixerViewModel,
    panelState.selectedTrackId,
    panelState.showMixer,
    panelState.showPianoRoll,
    pianoRollViewModel,
    trackActionsModel.mixer,
  ]);
}
