import { useMemo } from "react";
import type { LessonViewPolicy } from "@/types/musicHubLessonDsl";
import type { StudioPanelState, StudioLessonPanelState } from "@/domain/studio/studioViewContracts";
import type { StudioMode, StudioModeModel, StudioModePreference, StudioShellPolicy } from "@/types/musicHubStudioModes";

interface UseStudioModeModelOptions {
  routeMode: StudioMode | null;
  preferredMode: StudioModePreference;
  lessonState: Pick<StudioLessonPanelState, "visible" | "lessonStatus">;
  panelState: Pick<StudioPanelState, "showBottomWorkspace" | "showPianoRoll" | "showMixer">;
  lessonViewPolicy?: LessonViewPolicy;
}

function applyLessonViewPolicy(
  base: StudioShellPolicy,
  lessonViewPolicy: LessonViewPolicy | undefined,
): StudioShellPolicy {
  if (!lessonViewPolicy) return base;

  const next = { ...base };
  const panels = lessonViewPolicy.panels;

  if (panels?.guide === "show") {
    next.showGuideSidebar = true;
    next.guidePreferredCollapsed = false;
  } else if (panels?.guide === "collapse") {
    next.showGuideSidebar = true;
    next.guidePreferredCollapsed = true;
  } else if (panels?.guide === "hide") {
    next.showGuideSidebar = false;
  }

  if (panels?.browser === "show") {
    next.showBrowserPanel = true;
    next.browserPreferredCollapsed = false;
  } else if (panels?.browser === "collapse") {
    next.showBrowserPanel = true;
    next.browserPreferredCollapsed = true;
  } else if (panels?.browser === "hide") {
    next.showBrowserPanel = false;
  }

  if (panels?.bottomWorkspace === "show" || panels?.bottomWorkspace === "collapse") {
    next.showBottomWorkspace = true;
  } else if (panels?.bottomWorkspace === "hide") {
    next.showBottomWorkspace = false;
  }

  if (panels?.mixer === "show" || panels?.mixer === "collapse") {
    next.showBottomWorkspace = true;
    next.showBottomTabs = true;
  }

  if (panels?.pianoRoll === "show" || panels?.pianoRoll === "collapse") {
    next.showBottomWorkspace = true;
    next.showBottomTabs = true;
  }

  if (panels?.detail === "show" || panels?.detail === "collapse") {
    next.showBottomWorkspace = true;
    next.showBottomTabs = true;
  }

  next.focusTarget = lessonViewPolicy.viewport?.focus;
  next.dimNonEssentialPanels = lessonViewPolicy.interaction?.dimNonEssentialPanels === true;
  next.lockPanelSwitching = lessonViewPolicy.interaction?.lockPanelSwitching === true;
  next.lockBottomTab = lessonViewPolicy.interaction?.lockBottomTab === true;

  return next;
}

function resolveShellPolicy(
  mode: StudioMode,
  lessonState: UseStudioModeModelOptions["lessonState"],
  panelState: UseStudioModeModelOptions["panelState"],
  lessonViewPolicy: LessonViewPolicy | undefined,
): StudioShellPolicy {
  const basePolicy = (() => {
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
        focusTarget: "arrangement",
        dimNonEssentialPanels: false,
        lockPanelSwitching: false,
        lockBottomTab: false,
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
        focusTarget: "arrangement",
        dimNonEssentialPanels: false,
        lockPanelSwitching: false,
        lockBottomTab: false,
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
        focusTarget: "arrangement",
        dimNonEssentialPanels: false,
        lockPanelSwitching: false,
        lockBottomTab: false,
      };
  }
  })();

  return applyLessonViewPolicy(basePolicy, lessonViewPolicy);
}

export function useStudioModeModel({
  routeMode,
  preferredMode,
  lessonState,
  panelState,
  lessonViewPolicy,
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
      shell: resolveShellPolicy(mode, lessonState, panelState, lessonViewPolicy),
    };
  }, [lessonState, lessonViewPolicy, panelState, preferredMode, routeMode]);
}
