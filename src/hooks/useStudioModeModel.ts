import { useMemo } from "react";
import type { StudioPanelState, StudioLessonPanelState } from "@/domain/studio/studioViewContracts";
import type { StudioMode, StudioModeModel, StudioModePreference, StudioShellPolicy } from "@/types/musicHubStudioModes";

interface UseStudioModeModelOptions {
  routeMode: StudioMode | null;
  preferredMode: StudioModePreference;
  lessonState: Pick<StudioLessonPanelState, "visible" | "lessonStatus">;
  panelState: Pick<StudioPanelState, "showBottomWorkspace" | "showPianoRoll" | "showMixer">;
}

function resolveShellPolicy(
  mode: StudioMode,
  lessonState: UseStudioModeModelOptions["lessonState"],
  panelState: UseStudioModeModelOptions["panelState"],
): StudioShellPolicy {
  switch (mode) {
    case "guided":
      return {
        showGuideSidebar: lessonState.visible,
        guidePreferredCollapsed: false,
        showBrowserPanel: false,
        browserPreferredCollapsed: true,
        showBottomWorkspace: panelState.showPianoRoll || panelState.showMixer,
        showBottomTabs: panelState.showPianoRoll || panelState.showMixer,
        arrangementDefaultSize: panelState.showPianoRoll || panelState.showMixer ? 80 : 100,
        bottomDefaultSize: 20,
        density: "relaxed",
      };
    case "focused":
      return {
        showGuideSidebar: lessonState.visible && lessonState.lessonStatus === "active",
        guidePreferredCollapsed: true,
        showBrowserPanel: true,
        browserPreferredCollapsed: true,
        showBottomWorkspace: panelState.showBottomWorkspace,
        showBottomTabs: panelState.showPianoRoll || panelState.showMixer,
        arrangementDefaultSize: panelState.showBottomWorkspace ? 78 : 100,
        bottomDefaultSize: 22,
        density: "dense",
      };
    case "standard":
    default:
      return {
        showGuideSidebar: lessonState.visible,
        guidePreferredCollapsed: lessonState.visible,
        showBrowserPanel: true,
        browserPreferredCollapsed: false,
        showBottomWorkspace: panelState.showBottomWorkspace,
        showBottomTabs: true,
        arrangementDefaultSize: panelState.showBottomWorkspace ? 72 : 100,
        bottomDefaultSize: 28,
        density: "balanced",
      };
  }
}

export function useStudioModeModel({
  routeMode,
  preferredMode,
  lessonState,
  panelState,
}: UseStudioModeModelOptions): StudioModeModel {
  return useMemo(() => {
    let mode: StudioMode;
    let reason: StudioModeModel["reason"];

    if (routeMode) {
      mode = routeMode;
      reason = "route";
    } else if (preferredMode !== "auto") {
      mode = preferredMode;
      reason = "preference";
    } else if (lessonState.visible && lessonState.lessonStatus !== "idle") {
      mode = "guided";
      reason = "lesson";
    } else {
      mode = "standard";
      reason = "default";
    }

    return {
      routeMode,
      preferredMode,
      mode,
      reason,
      shell: resolveShellPolicy(mode, lessonState, panelState),
    };
  }, [lessonState, panelState, preferredMode, routeMode]);
}
