import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useChallengeProgress(moduleKey: string) {
  const { user } = useAuth();
  const [completedSet, setCompletedSet] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  // Fetch on mount
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;

    supabase
      .from("challenge_progress")
      .select("completed_indices")
      .eq("user_id", user.id)
      .eq("module_key", moduleKey)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.completed_indices) {
          setCompletedSet(new Set(data.completed_indices as number[]));
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
          supabase
            .from("challenge_progress")
            .upsert(
              { user_id: user.id, module_key: moduleKey, completed_indices: arr, updated_at: new Date().toISOString() },
              { onConflict: "user_id,module_key" }
            )
            .then(() => {});
        }
        return next;
      });
    },
    [user, moduleKey]
  );

  const resetProgress = useCallback(async () => {
    setCompletedSet(new Set());
    if (user) {
      await supabase
        .from("challenge_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("module_key", moduleKey);
    }
  }, [user, moduleKey]);

  return { completedSet, loading, markCompleted, resetProgress };
}
