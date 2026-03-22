import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchTheoryStatsRecord,
  reportTheoryPersistenceError,
  type TheoryStatsRecord,
  upsertTheoryStatsRecord,
} from "@/domain/theory/theoryPersistence";

export const XP_FIRST_TRY = 10;
export const XP_RETRY = 5;
export const XP_MODULE_BONUS = 25;
export const XP_LESSON_COMPLETE = 5;

export const XP_LEVELS = [
  { threshold: 0, label: "Beginner" },
  { threshold: 100, label: "Apprentice" },
  { threshold: 500, label: "Student" },
  { threshold: 1000, label: "Scholar" },
  { threshold: 2500, label: "Master" },
] as const;

interface TheoryStatsState {
  xp: number;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
}

const DEFAULT_THEORY_STATS_STATE: TheoryStatsState = {
  xp: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastPracticeDate: null,
};

function toTheoryStatsState(record: TheoryStatsRecord | null): TheoryStatsState {
  if (!record) {
    return DEFAULT_THEORY_STATS_STATE;
  }

  return {
    xp: record.xp,
    currentStreak: record.current_streak,
    longestStreak: record.longest_streak,
    lastPracticeDate: record.last_practice_date,
  };
}

function toTheoryStatsRecord(state: TheoryStatsState): TheoryStatsRecord {
  return {
    xp: state.xp,
    current_streak: state.currentStreak,
    longest_streak: state.longestStreak,
    last_practice_date: state.lastPracticeDate,
  };
}

export function getLevel(xp: number) {
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i].threshold) return XP_LEVELS[i];
  }
  return XP_LEVELS[0];
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function useTheoryStats() {
  const { user } = useAuth();
  const [xp, setXp] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const statsRef = useRef<TheoryStatsState>(DEFAULT_THEORY_STATS_STATE);

  const applyStatsState = useCallback((next: TheoryStatsState) => {
    statsRef.current = next;
    setXp(next.xp);
    setCurrentStreak(next.currentStreak);
    setLongestStreak(next.longestStreak);
  }, []);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      applyStatsState(DEFAULT_THEORY_STATS_STATE);
      setLoading(false);
      return;
    }

    setLoading(true);

    const loadStats = async () => {
      try {
        const data = await fetchTheoryStatsRecord(user.id);
        if (cancelled) return;
        applyStatsState(toTheoryStatsState(data));
      } catch (error) {
        if (cancelled) return;
        reportTheoryPersistenceError("load theory stats", error);
        applyStatsState(DEFAULT_THEORY_STATS_STATE);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadStats();

    return () => { cancelled = true; };
  }, [user, applyStatsState]);

  const persist = useCallback(
    (next: TheoryStatsState) => {
      if (!user) return;

      void upsertTheoryStatsRecord(user.id, toTheoryStatsRecord(next)).catch((error) => {
        reportTheoryPersistenceError("save theory stats", error);
      });
    },
    [user]
  );

  const awardXP = useCallback(
    (amount: number) => {
      const current = statsRef.current;
      const today = todayStr();
      const yesterday = yesterdayStr();

      let newStreak = current.currentStreak;
      let newLongest = current.longestStreak;
      let newDate = current.lastPracticeDate;

      if (current.lastPracticeDate === today) {
        // Already practiced today — no streak change
      } else if (current.lastPracticeDate === yesterday || current.lastPracticeDate === null) {
        newStreak = current.currentStreak + 1;
        newDate = today;
      } else {
        newStreak = 1;
        newDate = today;
      }

      if (newStreak > newLongest) {
        newLongest = newStreak;
      }

      const nextState: TheoryStatsState = {
        xp: current.xp + amount,
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastPracticeDate: newDate,
      };

      applyStatsState(nextState);
      persist(nextState);
    },
    [applyStatsState, persist]
  );

  return { xp, currentStreak, longestStreak, loading, awardXP };
}
