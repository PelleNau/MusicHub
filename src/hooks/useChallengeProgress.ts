import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  deleteChallengeProgressRecord,
  fetchChallengeProgressRecord,
  reportTheoryPersistenceError,
  upsertChallengeProgressRecord,
} from "@/domain/theory/theoryPersistence";

export function useChallengeProgress(moduleKey: string) {
  const { user } = useAuth();
  const [completedSet, setCompletedSet] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const completedSetRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    completedSetRef.current = completedSet;
  }, [completedSet]);

  // Fetch on mount
  useEffect(() => {
    let cancelled = false;
    const resetProgressState = () => {
      const next = new Set<number>();
      completedSetRef.current = next;
      setCompletedSet(next);
    };

    if (!user) {
      resetProgressState();
      setLoading(false);
      return;
    }

    setLoading(true);

    const loadProgress = async () => {
      try {
        const completedIndices = await fetchChallengeProgressRecord(user.id, moduleKey);
        if (cancelled) return;

        const next = new Set(completedIndices ?? []);
        completedSetRef.current = next;
        setCompletedSet(next);
      } catch (error) {
        if (cancelled) return;
        reportTheoryPersistenceError(`load challenge progress for ${moduleKey}`, error);
        resetProgressState();
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadProgress();

    return () => { cancelled = true; };
  }, [user, moduleKey]);

  const markCompleted = useCallback(
    (idx: number) => {
      const next = new Set(completedSetRef.current);
      next.add(idx);
      completedSetRef.current = next;
      setCompletedSet(next);

      if (!user) return;

      void upsertChallengeProgressRecord(user.id, moduleKey, Array.from(next)).catch((error) => {
        reportTheoryPersistenceError(`save challenge progress for ${moduleKey}`, error);
      });
    },
    [user, moduleKey]
  );

  const resetProgress = useCallback(() => {
    const next = new Set<number>();
    completedSetRef.current = next;
    setCompletedSet(next);

    if (!user) return;

    void deleteChallengeProgressRecord(user.id, moduleKey).catch((error) => {
      reportTheoryPersistenceError(`reset challenge progress for ${moduleKey}`, error);
    });
  }, [user, moduleKey]);

  return { completedSet, loading, markCompleted, resetProgress };
}
