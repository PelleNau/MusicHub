import type { Session, SessionClip, SessionTrack } from "@/types/studio";

type MutableSessionTrackFields = Omit<SessionTrack, "id" | "session_id" | "created_at" | "clips">;
type MutableSessionClipFields = Omit<SessionClip, "id" | "created_at">;

export type TrackCreatePayload = Partial<MutableSessionTrackFields>;
export type TrackUpdatePayload = Partial<MutableSessionTrackFields>;
export type ClipCreatePayload = Pick<MutableSessionClipFields, "track_id"> &
  Partial<Omit<MutableSessionClipFields, "track_id">>;
export type ClipUpdatePayload = Partial<MutableSessionClipFields>;

export interface CreateSessionMutation {
  mutateAsync: (params: {
    name: string;
    tempo?: number;
    time_signature?: string;
  }) => Promise<Pick<Session, "id">>;
  isPending?: boolean;
}

export interface UpdateSessionMutation {
  mutate: (updates: Partial<Session>) => void;
}

export interface AddTrackMutation {
  mutateAsync: (track: TrackCreatePayload) => Promise<unknown>;
}

export interface UpdateTrackMutation {
  mutate: (payload: { trackId: string; updates: TrackUpdatePayload }) => void;
}

export interface DeleteTrackMutation {
  mutate: (trackId: string) => void;
}

export interface CreateClipMutation {
  mutateAsync: (clip: ClipCreatePayload) => Promise<unknown>;
}

export interface UpdateClipMutation {
  mutate: (payload: { clipId: string; updates: ClipUpdatePayload }) => void;
  mutateAsync: (payload: { clipId: string; updates: ClipUpdatePayload }) => Promise<unknown>;
}

export interface DeleteClipMutation {
  mutate: (clipId: string) => void;
}
