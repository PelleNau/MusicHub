import { useStudioBehaviorModels } from "@/hooks/useStudioBehaviorModels";
import { useStudioShellModels } from "@/hooks/useStudioShellModels";

type BehaviorOptions = Parameters<typeof useStudioBehaviorModels>[0];
type ShellOptions = Parameters<typeof useStudioShellModels>[0];

interface UseStudioPresentationModelsOptions {
  behavior: BehaviorOptions;
  shell: Omit<
    ShellOptions,
    | "lessonPanelModel"
    | "browserActionsModel"
    | "trackActionsModel"
    | "mixerViewModel"
    | "bottomPaneModel"
    | "mixerPanelState"
    | "pianoRollViewModel"
    | "detailPanelModel"
    | "assetImportInputProps"
    | "timelineContainerProps"
    | "loopRegionProps"
  >;
}

export function useStudioPresentationModels({
  behavior,
  shell,
}: UseStudioPresentationModelsOptions) {
  const behaviorModels = useStudioBehaviorModels(behavior);

  const shellModels = useStudioShellModels({
    ...shell,
    lessonPanelModel: behaviorModels.lessonPanelModel,
    browserActionsModel: behaviorModels.browserActionsModel,
    trackActionsModel: behaviorModels.trackActionsModel,
    mixerViewModel: behaviorModels.mixerViewModel,
    bottomPaneModel: behaviorModels.bottomPaneModel,
    mixerPanelState: shell.mixerPanelState,
    pianoRollViewModel: behaviorModels.pianoRollViewModel,
    detailPanelModel: behaviorModels.detailPanelModel,
    assetImportInputProps: behaviorModels.assetImportModel.inputProps,
    timelineContainerProps: behaviorModels.timelineShellModel.timelineContainerProps,
    loopRegionProps: behaviorModels.timelineShellModel.loopRegionProps,
  });

  return {
    ...behaviorModels,
    ...shellModels,
  };
}
