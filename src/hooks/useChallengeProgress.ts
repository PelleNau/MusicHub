import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  deleteChallengeProgressRecord,
  fetchChallengeProgressRecord,
  upsertChallengeProgressRecord,
} from "@/domain/theory/theoryPersistence";

export function useChallengeProgress(moduleKey: string) {
  const { user } = useAuth();
  const [completedSet, setCompletedSet] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch on mount
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;

    fetchChallengeProgressRecord(user.id, moduleKey).then((completedIndices) => {
        if (cancelled) return;
        if (completedIndices) {
          setCompletedSet(new Set(completedIndices));
        }
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [user, moduleKey]);

  const markCompleted = useCallback(
    async (idx: number) => {
      setCompletedSet((prev) => {
        const next = new Set(prev);
        next.add(idx);
        // Fire-and-forget upsert
        if (user) {
          const arr = Array.from(next);
          upsertChallengeProgressRecord(user.id, moduleKey, arr).then(() => {});
        }
        return next;
      });
    },
    [user, moduleKey]
  );

  const resetProgress = useCallback(async () => {
    setCompletedSet(new Set());
    if (user) {
      await deleteChallengeProgressRecord(user.id, moduleKey);
    }
  }, [user, moduleKey]);

  return { completedSet, loading, markCompleted, resetProgress };
}
