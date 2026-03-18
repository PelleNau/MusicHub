import { useCallback } from "react";
import type {
  LessonAbortCommand,
  LessonResetStepCommand,
  LessonSkipStepCommand,
  MusicHubCommand,
  MusicHubCommandAck,
} from "@/types/musicHubCommands";
import type { GuideLessonRuntime } from "@/types/musicHubGuideRuntime";

interface UseGuideCommandDispatchOptions {
  lessonId?: string;
  runtime: GuideLessonRuntime;
  onCommandRecorded?: (command: MusicHubCommand, ack: MusicHubCommandAck) => void;
}

function recordAck(
  command: MusicHubCommand,
  onCommandRecorded?: (command: MusicHubCommand, ack: MusicHubCommandAck) => void,
) {
  const ack: MusicHubCommandAck = {
    commandId: command.id,
    accepted: true,
    status: "applied_local",
    affectedIds: [command.type],
  };
  onCommandRecorded?.(command, ack);
  return ack;
}

export function useGuideCommandDispatch({
  lessonId,
  runtime,
  onCommandRecorded,
}: UseGuideCommandDispatchOptions) {
  const skipStep = useCallback(
    (stepId: string) => {
      if (!lessonId) return null;
      const command: LessonSkipStepCommand = {
        id: crypto.randomUUID(),
        type: "lesson.skipStep",
        source: "user",
        createdAt: new Date().toISOString(),
        payload: { lessonId, stepId },
      };
      runtime.skipStep(stepId);
      return recordAck(command, onCommandRecorded);
    },
    [lessonId, onCommandRecorded, runtime],
  );

  const resetStep = useCallback(
    (stepId: string) => {
      if (!lessonId) return null;
      const command: LessonResetStepCommand = {
        id: crypto.randomUUID(),
        type: "lesson.resetStep",
        source: "user",
        createdAt: new Date().toISOString(),
        payload: { lessonId, stepId },
      };
      runtime.resetStep(stepId);
      return recordAck(command, onCommandRecorded);
    },
    [lessonId, onCommandRecorded, runtime],
  );

  const abortLesson = useCallback(
    (reason?: string) => {
      if (!lessonId) return null;
      const command: LessonAbortCommand = {
        id: crypto.randomUUID(),
        type: "lesson.abort",
        source: "user",
        createdAt: new Date().toISOString(),
        payload: { lessonId, reason },
      };
      runtime.abortLesson(reason);
      return recordAck(command, onCommandRecorded);
    },
    [lessonId, onCommandRecorded, runtime],
  );

  return {
    skipStep,
    resetStep,
    abortLesson,
  };
}
