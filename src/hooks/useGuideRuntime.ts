import { useCallback, useEffect, useMemo, useState } from "react";
import { guideAnchorResolver } from "@/domain/guide/guideAnchorResolver";
import { guideStepEvaluator } from "@/domain/guide/guideStepEvaluator";
import type { MusicHubCommandLogEntry } from "@/hooks/useMusicHubCommandLog";
import type { MusicHubContinuousEdit } from "@/types/musicHubContinuousEdits";
import type {
  GuideAnchorRegistryEntry,
  GuideLessonRuntime,
  GuideObservationBuffer,
  GuideResolvedAnchor,
  GuideRuntimeState,
  GuideRuntimeEvent,
  GuideSelectorSnapshot,
} from "@/types/musicHubGuideRuntime";
import type { LessonDefinition, LessonStepDefinition } from "@/types/musicHubLessonDsl";

interface UseGuideRuntimeOptions {
  lesson?: LessonDefinition;
  selectors: GuideSelectorSnapshot;
  commandEntries?: MusicHubCommandLogEntry[];
  continuousEditEntries?: MusicHubContinuousEdit[];
  events?: GuideRuntimeEvent[];
  anchorRegistry?: GuideAnchorRegistryEntry[];
}

function resolveStepAnchors(
  step: LessonStepDefinition | undefined,
  anchorRegistry: GuideAnchorRegistryEntry[],
): Record<string, GuideResolvedAnchor> {
  if (!step) return {};
  const result = guideAnchorResolver.resolveAnchor(step.anchor, anchorRegistry);
  return {
    [step.stepId]: result.anchor,
  };
}

function findStep(lesson: LessonDefinition | undefined, stepId?: string) {
  if (!lesson || !stepId) return undefined;
  return lesson.steps.find((step) => step.stepId === stepId);
}

export function useGuideRuntime({
  lesson,
  selectors,
  commandEntries = [],
  continuousEditEntries = [],
  events = [],
  anchorRegistry = [],
}: UseGuideRuntimeOptions): GuideLessonRuntime {
  const [state, setState] = useState<GuideRuntimeState>({
    lessonStatus: "idle",
    stepStatus: "idle",
    resolvedAnchors: {},
  });

  const observation = useMemo<GuideObservationBuffer>(
    () => ({
      commands: commandEntries.map((entry) => entry.command),
      acknowledgments: commandEntries.map((entry) => entry.ack),
      continuousEdits: continuousEditEntries,
      events,
      selectors,
    }),
    [commandEntries, continuousEditEntries, events, selectors],
  );

  const startLesson = useCallback((nextLesson: LessonDefinition) => {
    const firstStep = nextLesson.steps[0];
    setState({
      lesson: nextLesson,
      currentStep: firstStep,
      lessonStatus: "active",
      stepStatus: firstStep ? "arming" : "completed",
      resolvedAnchors: resolveStepAnchors(firstStep, anchorRegistry),
    });
  }, [anchorRegistry]);

  const abortLesson = useCallback((reason?: string) => {
    setState((current) => ({
      ...current,
      lessonStatus: "aborted",
      stepStatus: "failed",
      lastEvaluation: current.lastEvaluation ?? {
        status: "failed",
        expectedObserved: false,
        validationSatisfied: false,
        reason,
      },
    }));
  }, []);

  const skipStep = useCallback((stepId: string) => {
    setState((current) => {
      if (!current.lesson || current.currentStep?.stepId !== stepId) return current;
      const currentIndex = current.lesson.steps.findIndex((step) => step.stepId === stepId);
      const nextStep = current.lesson.steps[currentIndex + 1];
      return {
        ...current,
        currentStep: nextStep,
        stepStatus: nextStep ? "arming" : "completed",
        lessonStatus: nextStep ? current.lessonStatus : "completed",
        resolvedAnchors: resolveStepAnchors(nextStep, anchorRegistry),
      };
    });
  }, [anchorRegistry]);

  const resetStep = useCallback((stepId: string) => {
    setState((current) => {
      const step = findStep(current.lesson, stepId);
      if (!step) return current;
      return {
        ...current,
        currentStep: step,
        stepStatus: "arming",
        resolvedAnchors: resolveStepAnchors(step, anchorRegistry),
      };
    });
  }, [anchorRegistry]);

  const applyObservation = useCallback((buffer: GuideObservationBuffer) => {
    setState((current) => {
      if (!current.lesson || !current.currentStep) return current;

      const resolvedAnchors =
        Object.keys(current.resolvedAnchors).length > 0
          ? current.resolvedAnchors
          : resolveStepAnchors(current.currentStep, anchorRegistry);

      const evaluation = guideStepEvaluator.evaluateStep(current.currentStep, {
        selectors: buffer.selectors,
        recentCommands: buffer.commands,
        recentAcks: buffer.acknowledgments,
        recentContinuousEdits: buffer.continuousEdits,
        recentEvents: buffer.events,
        resolvedAnchors,
      });

      if (evaluation.status !== "completed") {
        return {
          ...current,
          stepStatus: evaluation.status,
          resolvedAnchors,
          lastEvaluation: evaluation,
        };
      }

      const nextStep = findStep(current.lesson, evaluation.resolvedNextStepId)
        ?? current.lesson.steps[
          current.lesson.steps.findIndex((step) => step.stepId === current.currentStep?.stepId) + 1
        ];

      return {
        ...current,
        currentStep: nextStep,
        lessonStatus: nextStep ? current.lessonStatus : "completed",
        stepStatus: nextStep ? "arming" : "completed",
        resolvedAnchors: resolveStepAnchors(nextStep, anchorRegistry),
        lastEvaluation: evaluation,
      };
    });
  }, [anchorRegistry]);

  useEffect(() => {
    if (!lesson) return;
    if (state.lesson?.lessonId === lesson.lessonId) return;
    startLesson(lesson);
  }, [lesson, startLesson, state.lesson?.lessonId]);

  useEffect(() => {
    if (state.lessonStatus !== "active") return;
    applyObservation(observation);
  }, [applyObservation, observation, state.lessonStatus]);

  return {
    state,
    startLesson,
    abortLesson,
    skipStep,
    resetStep,
    applyObservation,
  };
}
