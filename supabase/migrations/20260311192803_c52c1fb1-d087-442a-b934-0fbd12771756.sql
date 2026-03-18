
-- Add sends JSONB column to session_tracks (array of {return_track_id, level} objects)
ALTER TABLE public.session_tracks ADD COLUMN sends jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Add input_from column for return tracks to identify their source routing
ALTER TABLE public.session_tracks ADD COLUMN input_from text DEFAULT NULL;
