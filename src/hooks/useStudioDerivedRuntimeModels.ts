import { useStudioMixerPanelState } from "@/hooks/useStudioMixerPanelState";
import { useStudioHostModeModel } from "@/hooks/useStudioHostModeModel";
import type { HostConnectorState } from "@/hooks/useHostConnector";
import type { StudioSessionDomainRuntimeState } from "@/types/musicHubStudioRuntime";

interface UseStudioDerivedRuntimeModelsOptions {
  sessionDomainModel: StudioSessionDomainRuntimeState;
  hostState: HostConnectorState;
}

export function useStudioDerivedRuntimeModels({
  sessionDomainModel,
  hostState,
}: UseStudioDerivedRuntimeModelsOptions) {
  const mixerPanelState = useStudioMixerPanelState();
  const hostModeModel = useStudioHostModeModel({ hostState });

  return {
    mixerPanelState,
    sessionDomainModel,
    sessionMetrics: sessionDomainModel.sessionMetrics,
    hostModeModel,
    nativeSelectionModel: {
      selectedClip: sessionDomainModel.selectedClip,
      selectedTrack: sessionDomainModel.selectedTrack,
      selectedClipIsMidi: sessionDomainModel.selectedClipIsMidi,
    },
  };
}
