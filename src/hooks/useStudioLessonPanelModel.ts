import { useEffect, useMemo, useState } from "react";
import { useGuideCommandDispatch } from "@/hooks/useGuideCommandDispatch";
import type { GuideLessonRuntime } from "@/types/musicHubGuideRuntime";
import type { LessonDefinition } from "@/types/musicHubLessonDsl";
import type { MusicHubCommand, MusicHubCommandAck } from "@/types/musicHubCommands";
import type { StudioLessonPanelState } from "@/domain/studio/studioViewContracts";

interface UseStudioLessonPanelModelOptions {
  lesson?: LessonDefinition;
  runtime: GuideLessonRuntime;
  preferredCollapsed?: boolean;
  onCommandRecorded?: (command: MusicHubCommand, ack: MusicHubCommandAck) => void;
}

export function useStudioLessonPanelModel({
  lesson,
  runtime,
  preferredCollapsed = false,
  onCommandRecorded,
}: UseStudioLessonPanelModelOptions) {
  const [collapsed, setCollapsed] = useState(false);
  const guideCommands = useGuideCommandDispatch({
    lessonId: lesson?.lessonId,
    runtime,
    onCommandRecorded,
  });

  useEffect(() => {
    if (lesson) {
      setCollapsed(preferredCollapsed);
    }
  }, [lesson, preferredCollapsed]);

  const currentStep = runtime.state.currentStep;
  const lessonState = useMemo<StudioLessonPanelState>(() => {
    const stepIndex = lesson && currentStep
      ? lesson.steps.findIndex((step) => step.stepId === currentStep.stepId)
      : -1;

    return {
      lessonId: lesson?.lessonId,
      title: lesson?.title,
      visible: Boolean(lesson),
      collapsed,
      lessonStatus: runtime.state.lessonStatus,
      stepStatus: runtime.state.stepStatus,
      currentStepId: currentStep?.stepId,
      currentStepTitle: currentStep?.title,
      instruction: currentStep?.instruction,
      stepIndex: stepIndex >= 0 ? stepIndex : 0,
      stepCount: lesson?.steps.length ?? 0,
      objectives: lesson?.objectives ?? [],
      activeHints: currentStep?.hints?.map((hint) => ({
        id: hint.id,
        text: hint.text,
      })) ?? [],
      stepTitles: lesson?.steps.map((s) => s.title) ?? [],
    };
  }, [collapsed, currentStep, lesson, runtime.state.lessonStatus, runtime.state.stepStatus]);

  return {
    lessonState,
    setCollapsed,
    toggleCollapsed: () => setCollapsed((value) => !value),
    skipCurrentStep: () => {
      if (runtime.state.currentStep?.stepId) {
        guideCommands.skipStep(runtime.state.currentStep.stepId);
      }
    },
    resetCurrentStep: () => {
      if (runtime.state.currentStep?.stepId) {
        guideCommands.resetStep(runtime.state.currentStep.stepId);
      }
    },
    abortLesson: guideCommands.abortLesson,
  };
}

export type StudioLessonPanelModelResult = ReturnType<typeof useStudioLessonPanelModel>;
