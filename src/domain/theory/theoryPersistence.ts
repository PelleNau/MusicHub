import { supabase } from "@/integrations/supabase/client";

export interface TheoryStatsRecord {
  xp: number;
  current_streak: number;
  longest_streak: number;
  last_practice_date: string | null;
}

export async function fetchChallengeProgressRecord(
  userId: string,
  moduleKey: string,
): Promise<number[] | null> {
  const { data, error } = await supabase
    .from("challenge_progress")
    .select("completed_indices")
    .eq("user_id", userId)
    .eq("module_key", moduleKey)
    .maybeSingle();
  if (error) throw error;
  return (data?.completed_indices as number[] | undefined) ?? null;
}

export async function upsertChallengeProgressRecord(
  userId: string,
  moduleKey: string,
  completedIndices: number[],
): Promise<void> {
  const { error } = await supabase
    .from("challenge_progress")
    .upsert(
      {
        user_id: userId,
        module_key: moduleKey,
        completed_indices: completedIndices,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,module_key" },
    );
  if (error) throw error;
}

export async function deleteChallengeProgressRecord(userId: string, moduleKey: string): Promise<void> {
  const { error } = await supabase
    .from("challenge_progress")
    .delete()
    .eq("user_id", userId)
    .eq("module_key", moduleKey);
  if (error) throw error;
}

export async function fetchTheoryStatsRecord(userId: string): Promise<TheoryStatsRecord | null> {
  const { data, error } = await supabase
    .from("user_theory_stats")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return {
    xp: data.xp,
    current_streak: data.current_streak,
    longest_streak: data.longest_streak,
    last_practice_date: data.last_practice_date,
  };
}

export async function upsertTheoryStatsRecord(
  userId: string,
  updates: TheoryStatsRecord,
): Promise<void> {
  const { error } = await supabase
    .from("user_theory_stats")
    .upsert(
      {
        user_id: userId,
        ...updates,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  if (error) throw error;
}
