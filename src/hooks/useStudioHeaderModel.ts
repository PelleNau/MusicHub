import { useCallback, useMemo } from "react";
import type { StudioLessonPanelState } from "@/domain/studio/studioViewContracts";

interface UseStudioHeaderModelOptions {
  lessonState: StudioLessonPanelState;
  onToggleGuide: () => void;
  onOpenSessions: () => void;
  onOpenLab: () => void;
  onSignOut: () => void;
}

export function useStudioHeaderModel({
  lessonState,
  onToggleGuide,
  onOpenSessions,
  onOpenLab,
  onSignOut,
}: UseStudioHeaderModelOptions) {
  const guide = useMemo(
    () => ({
      visible: lessonState.visible,
      collapsed: lessonState.collapsed,
      label: lessonState.collapsed ? "Open Guide" : "Guide",
    }),
    [lessonState.collapsed, lessonState.visible],
  );

  return {
    guide,
    toggleGuide: useCallback(() => onToggleGuide(), [onToggleGuide]),
    openSessions: useCallback(() => onOpenSessions(), [onOpenSessions]),
    openLab: useCallback(() => onOpenLab(), [onOpenLab]),
    signOut: useCallback(() => onSignOut(), [onSignOut]),
  };
}
