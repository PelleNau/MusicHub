import { useMemo } from "react";
import type { LessonDefinition, LessonStepDefinition, LessonViewPolicy } from "@/types/musicHubLessonDsl";

function mergePanelPolicy(
  left?: LessonViewPolicy["panels"],
  right?: LessonViewPolicy["panels"],
): LessonViewPolicy["panels"] | undefined {
  if (!left && !right) return undefined;
  return {
    ...left,
    ...right,
  };
}

function mergeViewportPolicy(
  left?: LessonViewPolicy["viewport"],
  right?: LessonViewPolicy["viewport"],
): LessonViewPolicy["viewport"] | undefined {
  if (!left && !right) return undefined;
  return {
    ...left,
    ...right,
  };
}

function mergeInteractionPolicy(
  left?: LessonViewPolicy["interaction"],
  right?: LessonViewPolicy["interaction"],
): LessonViewPolicy["interaction"] | undefined {
  if (!left && !right) return undefined;
  return {
    ...left,
    ...right,
  };
}

function mergeViewPolicy(
  base?: LessonViewPolicy,
  overlay?: LessonViewPolicy,
): LessonViewPolicy | undefined {
  if (!base && !overlay) return undefined;
  return {
    panels: mergePanelPolicy(base?.panels, overlay?.panels),
    viewport: mergeViewportPolicy(base?.viewport, overlay?.viewport),
    interaction: mergeInteractionPolicy(base?.interaction, overlay?.interaction),
  };
}

export function useStudioLessonViewPolicy({
  lesson,
  currentStep,
}: {
  lesson?: LessonDefinition;
  currentStep?: LessonStepDefinition;
}) {
  return useMemo(() => {
    const lessonPolicy = mergeViewPolicy(lesson?.viewPolicy, lesson?.entry?.viewPolicy);
    return mergeViewPolicy(lessonPolicy, currentStep?.viewPolicy);
  }, [currentStep?.viewPolicy, lesson?.entry?.viewPolicy, lesson?.viewPolicy]);
}

export type StudioLessonViewPolicyResult = ReturnType<typeof useStudioLessonViewPolicy>;
