import { useCallback, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { StudioMode } from "@/types/musicHubStudioModes";

function parseStudioMode(value: string | null): StudioMode | null {
  return value === "guided" || value === "standard" || value === "focused"
    ? value
    : null;
}

export function useStudioRouteModel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sessionId = searchParams.get("id");
  const lessonId = searchParams.get("lesson");
  const routeMode = parseStudioMode(searchParams.get("mode"));
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
      routeMode,
      activeSessionId,
      startLesson,
      dismissLesson,
      openSessions,
      selectSession,
    }),
    [activeSessionId, dismissLesson, lessonId, openSessions, routeMode, selectSession, startLesson],
  );
}

export type StudioRouteModelResult = ReturnType<typeof useStudioRouteModel>;
