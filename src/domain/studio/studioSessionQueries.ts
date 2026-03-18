import type { QueryClient } from "@tanstack/react-query";

export const studioSessionKeys = {
  sessions: () => ["sessions"] as const,
  session: (sessionId: string | null | undefined) => ["session", sessionId] as const,
  sessionTracks: (sessionId: string | null | undefined) => ["session-tracks", sessionId] as const,
};

export function invalidateSessions(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: studioSessionKeys.sessions() });
}

export function invalidateSession(queryClient: QueryClient, sessionId: string | null | undefined) {
  return queryClient.invalidateQueries({ queryKey: studioSessionKeys.session(sessionId) });
}

export function invalidateSessionTracks(queryClient: QueryClient, sessionId: string | null | undefined) {
  return queryClient.invalidateQueries({ queryKey: studioSessionKeys.sessionTracks(sessionId) });
}
