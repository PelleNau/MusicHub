import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

export function useStudioRouteModel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionId = searchParams.get("id");
  const lessonId = searchParams.get("lesson");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(sessionId);

  const startLesson = useCallback(
    (nextLessonId: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("lesson", nextLessonId);
        return next;
      });
    },
    [setSearchParams],
  );

  const dismissLesson = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("lesson");
      return next;
    });
  }, [setSearchParams]);

  const openSessions = useCallback(() => {
    setActiveSessionId(null);
  }, []);

  const selectSession = useCallback((sessionId: string | null) => {
    setActiveSessionId(sessionId);
  }, []);

  return useMemo(
    () => ({
      lessonId,
      activeSessionId,
      startLesson,
      dismissLesson,
      openSessions,
      selectSession,
    }),
    [activeSessionId, dismissLesson, lessonId, openSessions, selectSession, startLesson],
  );
}

export type StudioRouteModelResult = ReturnType<typeof useStudioRouteModel>;
