import type { QueryClient } from "@tanstack/react-query";
import type { SessionClip, SessionTrack } from "@/types/studio";
import { studioSessionKeys } from "@/domain/studio/studioSessionQueries";
import type { ClipUpdatePayload, TrackUpdatePayload } from "@/hooks/studioMutationTypes";

export function setSessionTracks(
  queryClient: QueryClient,
  sessionId: string | null,
  updater: (tracks: SessionTrack[]) => SessionTrack[],
) {
  queryClient.setQueryData<SessionTrack[]>(
    studioSessionKeys.sessionTracks(sessionId),
    (existing) => updater(existing ?? []),
  );
}

export function mapSessionTracks(
  queryClient: QueryClient,
  sessionId: string | null,
  mapper: (track: SessionTrack) => SessionTrack,
) {
  setSessionTracks(queryClient, sessionId, (tracks) => tracks.map(mapper));
}

export function updateSessionTrackInCache(
  queryClient: QueryClient,
  sessionId: string | null,
  trackId: string,
  updates: TrackUpdatePayload,
) {
  mapSessionTracks(queryClient, sessionId, (track) =>
    track.id === trackId ? { ...track, ...updates } : track,
  );
}

export function removeSessionTrackFromCache(
  queryClient: QueryClient,
  sessionId: string | null,
  trackId: string,
) {
  setSessionTracks(queryClient, sessionId, (tracks) =>
    tracks.filter((track) => track.id !== trackId),
  );
}

export function mapSessionClips(
  queryClient: QueryClient,
  sessionId: string | null,
  mapper: (clip: SessionClip, track: SessionTrack) => SessionClip,
) {
  mapSessionTracks(queryClient, sessionId, (track) => ({
    ...track,
    clips: (track.clips ?? []).map((clip) => mapper(clip, track)),
  }));
}

export function updateSessionClipInCache(
  queryClient: QueryClient,
  sessionId: string | null,
  clipId: string,
  updates: ClipUpdatePayload,
) {
  mapSessionClips(queryClient, sessionId, (clip) =>
    clip.id === clipId ? { ...clip, ...updates } : clip,
  );
}

export function removeSessionClipFromCache(
  queryClient: QueryClient,
  sessionId: string | null,
  clipId: string,
) {
  mapSessionTracks(queryClient, sessionId, (track) => ({
    ...track,
    clips: (track.clips ?? []).filter((clip) => clip.id !== clipId),
  }));
}
