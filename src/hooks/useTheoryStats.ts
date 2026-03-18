import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
  const [lastPracticeDate, setLastPracticeDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;

    supabase
      .from("user_theory_stats")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        if (data) {
          setXp(data.xp);
          setCurrentStreak(data.current_streak);
          setLongestStreak(data.longest_streak);
          setLastPracticeDate(data.last_practice_date);
        }
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [user]);

  const persist = useCallback(
    (updates: { xp: number; current_streak: number; longest_streak: number; last_practice_date: string | null }) => {
      if (!user) return;
      supabase
        .from("user_theory_stats")
        .upsert(
          { user_id: user.id, ...updates, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        )
        .then(() => {});
    },
    [user]
  );

  const awardXP = useCallback(
    (amount: number) => {
      setXp((prev) => {
        const next = prev + amount;
        // Streak logic
        const today = todayStr();
        const yesterday = yesterdayStr();

        let newStreak = currentStreak;
        let newLongest = longestStreak;
        let newDate = lastPracticeDate;

        if (lastPracticeDate === today) {
          // Already practiced today — no streak change
        } else if (lastPracticeDate === yesterday || lastPracticeDate === null) {
          newStreak = currentStreak + 1;
          newDate = today;
        } else {
          newStreak = 1;
          newDate = today;
        }

        if (newStreak > newLongest) newLongest = newStreak;

        setCurrentStreak(newStreak);
        setLongestStreak(newLongest);
        setLastPracticeDate(newDate);

        persist({ xp: next, current_streak: newStreak, longest_streak: newLongest, last_practice_date: newDate });

        return next;
      });
    },
    [currentStreak, longestStreak, lastPracticeDate, persist]
  );

  return { xp, currentStreak, longestStreak, loading, awardXP };
}
