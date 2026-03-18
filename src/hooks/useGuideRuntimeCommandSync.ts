import { useEffect, useRef } from "react";
import type {
  LessonCompleteCommand,
  LessonFailCommand,
  LessonAdvanceCommand,
  LessonStartCommand,
  MusicHubCommand,
  MusicHubCommandAck,
} from "@/types/musicHubCommands";
import type { GuideLessonRuntime } from "@/types/musicHubGuideRuntime";
import type { LessonDefinition } from "@/types/musicHubLessonDsl";

interface UseGuideRuntimeCommandSyncOptions {
  lesson?: LessonDefinition;
  runtime: GuideLessonRuntime;
  onCommandRecorded?: (command: MusicHubCommand, ack: MusicHubCommandAck) => void;
}

function createAck(command: MusicHubCommand): MusicHubCommandAck {
  return {
    commandId: command.id,
    accepted: true,
    status: "applied_local",
    affectedIds: [command.type],
  };
}

export function useGuideRuntimeCommandSync({
  lesson,
  runtime,
  onCommandRecorded,
}: UseGuideRuntimeCommandSyncOptions) {
  const previousLessonIdRef = useRef<string | undefined>(undefined);
  const previousStepIdRef = useRef<string | undefined>(undefined);
  const previousLessonStatusRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const currentLessonId = runtime.state.lesson?.lessonId;
    if (!lesson || !currentLessonId || runtime.state.lessonStatus === "idle") {
      previousLessonIdRef.current = currentLessonId;
      previousStepIdRef.current = runtime.state.currentStep?.stepId;
      previousLessonStatusRef.current = runtime.state.lessonStatus;
      return;
    }

    if (previousLessonIdRef.current !== currentLessonId) {
      const command: LessonStartCommand = {
        id: crypto.randomUUID(),
        type: "lesson.start",
        source: "guide",
        createdAt: new Date().toISOString(),
        payload: { lessonId: currentLessonId },
      };
      onCommandRecorded?.(command, createAck(command));
    }

    const currentStepId = runtime.state.currentStep?.stepId;
    if (
      previousLessonIdRef.current === currentLessonId &&
      currentStepId &&
      previousStepIdRef.current &&
      previousStepIdRef.current !== currentStepId
    ) {
      const command: LessonAdvanceCommand = {
        id: crypto.randomUUID(),
        type: "lesson.advance",
        source: "guide",
        createdAt: new Date().toISOString(),
        payload: {
          lessonId: currentLessonId,
          stepId: currentStepId,
        },
      };
      onCommandRecorded?.(command, createAck(command));
    }

    const currentStatus = runtime.state.lessonStatus;
    if (
      previousLessonIdRef.current === currentLessonId &&
      previousLessonStatusRef.current !== currentStatus
    ) {
      if (currentStatus === "completed") {
        const command: LessonCompleteCommand = {
          id: crypto.randomUUID(),
          type: "lesson.complete",
          source: "guide",
          createdAt: new Date().toISOString(),
          payload: {
            lessonId: currentLessonId,
            stepId: currentStepId,
          },
        };
        onCommandRecorded?.(command, createAck(command));
      }

      if (currentStatus === "failed") {
        const command: LessonFailCommand = {
          id: crypto.randomUUID(),
          type: "lesson.fail",
          source: "guide",
          createdAt: new Date().toISOString(),
          payload: {
            lessonId: currentLessonId,
            stepId: currentStepId,
            reason: runtime.state.failureReason,
          },
        };
        onCommandRecorded?.(command, createAck(command));
      }
    }

    previousLessonIdRef.current = currentLessonId;
    previousStepIdRef.current = currentStepId;
    previousLessonStatusRef.current = currentStatus;
  }, [
    lesson,
    onCommandRecorded,
    runtime.state.currentStep?.stepId,
    runtime.state.failureReason,
    runtime.state.lesson?.lessonId,
    runtime.state.lessonStatus,
  ]);
}
