
CREATE TABLE public.user_theory_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  xp integer NOT NULL DEFAULT 0,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_practice_date date,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_theory_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own stats"
  ON public.user_theory_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON public.user_theory_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON public.user_theory_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress"
  ON public.challenge_progress FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
