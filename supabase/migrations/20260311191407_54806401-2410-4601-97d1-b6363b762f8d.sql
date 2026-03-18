
-- Sessions table
CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Untitled Session',
  tempo numeric NOT NULL DEFAULT 120,
  time_signature text NOT NULL DEFAULT '4/4',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sessions" ON public.sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON public.sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON public.sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER sessions_updated_at BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Session tracks table
CREATE TABLE public.session_tracks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Track',
  type text NOT NULL DEFAULT 'audio',
  color integer NOT NULL DEFAULT 0,
  volume numeric NOT NULL DEFAULT 0.85,
  pan numeric NOT NULL DEFAULT 0,
  is_muted boolean NOT NULL DEFAULT false,
  is_soloed boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  device_chain jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.session_tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own session tracks" ON public.session_tracks FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.sessions WHERE sessions.id = session_tracks.session_id AND sessions.user_id = auth.uid()));
CREATE POLICY "Users can insert own session tracks" ON public.session_tracks FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.sessions WHERE sessions.id = session_tracks.session_id AND sessions.user_id = auth.uid()));
CREATE POLICY "Users can update own session tracks" ON public.session_tracks FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.sessions WHERE sessions.id = session_tracks.session_id AND sessions.user_id = auth.uid()));
CREATE POLICY "Users can delete own session tracks" ON public.session_tracks FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.sessions WHERE sessions.id = session_tracks.session_id AND sessions.user_id = auth.uid()));

-- Session clips table
CREATE TABLE public.session_clips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id uuid NOT NULL REFERENCES public.session_tracks(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Clip',
  start_beats numeric NOT NULL DEFAULT 0,
  end_beats numeric NOT NULL DEFAULT 4,
  color integer NOT NULL DEFAULT 0,
  is_midi boolean NOT NULL DEFAULT false,
  audio_url text,
  waveform_peaks jsonb,
  midi_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.session_clips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own session clips" ON public.session_clips FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.session_tracks t JOIN public.sessions s ON s.id = t.session_id
    WHERE t.id = session_clips.track_id AND s.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert own session clips" ON public.session_clips FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.session_tracks t JOIN public.sessions s ON s.id = t.session_id
    WHERE t.id = session_clips.track_id AND s.user_id = auth.uid()
  ));
CREATE POLICY "Users can update own session clips" ON public.session_clips FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.session_tracks t JOIN public.sessions s ON s.id = t.session_id
    WHERE t.id = session_clips.track_id AND s.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete own session clips" ON public.session_clips FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.session_tracks t JOIN public.sessions s ON s.id = t.session_id
    WHERE t.id = session_clips.track_id AND s.user_id = auth.uid()
  ));

-- Audio clips storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('audio-clips', 'audio-clips', false);

CREATE POLICY "Users can upload audio clips" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'audio-clips' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can read own audio clips" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'audio-clips' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own audio clips" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'audio-clips' AND (storage.foldername(name))[1] = auth.uid()::text);
