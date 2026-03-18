export type StudioMode = "guided" | "standard" | "focused";

export type StudioModePreference = "auto" | StudioMode;

export interface StudioShellPolicy {
  showGuideSidebar: boolean;
  guidePreferredCollapsed: boolean;
  showBrowserPanel: boolean;
  browserPreferredCollapsed: boolean;
  showBottomWorkspace: boolean;
  showBottomTabs: boolean;
  arrangementDefaultSize: number;
  bottomDefaultSize: number;
  density: "relaxed" | "balanced" | "dense";
}

export interface StudioModeModel {
  routeMode: StudioMode | null;
  preferredMode: StudioModePreference;
  mode: StudioMode;
  reason: "route" | "preference" | "lesson" | "default";
  shell: StudioShellPolicy;
}
