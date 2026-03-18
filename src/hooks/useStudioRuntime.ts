import { useStudioRuntimeCore } from "@/hooks/useStudioRuntimeCore";
import { useStudioInteractionRuntime } from "@/hooks/useStudioInteractionRuntime";
import type { useMusicHubCommandLog } from "@/hooks/useMusicHubCommandLog";
import type { useMusicHubContinuousEditLog } from "@/hooks/useMusicHubContinuousEditLog";
import type { useUndoRedo } from "@/hooks/useUndoRedo";

interface UseStudioRuntimeOptions {
  activeSessionId: string | null;
  lessonId: string | null;
  history: ReturnType<typeof useUndoRedo>;
  commandLog: ReturnType<typeof useMusicHubCommandLog>;
  continuousEditLog: ReturnType<typeof useMusicHubContinuousEditLog>;
}

export function useStudioRuntime({
  activeSessionId,
  lessonId,
  history,
  commandLog,
  continuousEditLog,
}: UseStudioRuntimeOptions) {
  const core = useStudioRuntimeCore({
    activeSessionId,
    history,
  });

  const interaction = useStudioInteractionRuntime({
    activeSessionId,
    lessonId,
    runtime: core,
    commandLog,
    continuousEditLog,
  });

  return {
    ...core,
    ...interaction,
  };
}

export type StudioRuntimeResult = ReturnType<typeof useStudioRuntime>;
