import { useCallback, useEffect, useMemo, useState } from "react";
import type { StudioMode } from "@/types/musicHubStudioModes";

const STORAGE_KEY = "musichub:lesson-entry-state";

type LessonEntryRecord = {
  lessonId: string;
  lastOpenedAt: string;
  mode: StudioMode;
};

type LessonEntryState = Record<string, LessonEntryRecord>;

function readState(): LessonEntryState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as LessonEntryState;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeState(state: LessonEntryState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function formatLessonEntryTimestamp(isoTimestamp?: string | null) {
  if (!isoTimestamp) return null;
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return null;

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function useStudioLessonEntryState(lessonId?: string | null) {
  const [state, setState] = useState<LessonEntryState>({});

  useEffect(() => {
    setState(readState());
  }, []);

  const current = useMemo(
    () => (lessonId ? state[lessonId] ?? null : null),
    [lessonId, state],
  );

  const recordLaunch = useCallback((mode: StudioMode) => {
    if (!lessonId) return;
    setState((prev) => {
      const next = {
        ...prev,
        [lessonId]: {
          lessonId,
          mode,
          lastOpenedAt: new Date().toISOString(),
        },
      };
      writeState(next);
      return next;
    });
  }, [lessonId]);

  return {
    current,
    recordLaunch,
    lastOpenedLabel: formatLessonEntryTimestamp(current?.lastOpenedAt),
  };
}
