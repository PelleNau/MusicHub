import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import type { Session } from "@/types/studio";
import type { AbletonParseResult } from "@/types/ableton";
import type {
  ClipCreatePayload,
  ClipUpdatePayload,
  TrackCreatePayload,
  TrackUpdatePayload,
} from "@/hooks/studioMutationTypes";
import type { StudioSessionPersistenceState } from "@/types/musicHubStudioRuntime";
import {
  invalidateSession,
  invalidateSessions,
  invalidateSessionTracks,
  studioSessionKeys,
} from "@/domain/studio/studioSessionQueries";
import { DEV_USER_ID, shouldUseDevSessionFixture, syncDevQueries } from "@/domain/studio/studioSessionDevFixture";
import { createStudioSessionSource } from "@/domain/studio/studioSessionSource";

export function useSession(sessionId: string | null): StudioSessionPersistenceState {
  const queryClient = useQueryClient();
  const { session: authSession } = useAuth();
  const userId = shouldUseDevSessionFixture ? DEV_USER_ID : authSession?.user?.id;
  const sessionSource = createStudioSessionSource({
    mode: shouldUseDevSessionFixture ? "dev" : "live",
    userId: userId ?? DEV_USER_ID,
    sessionId,
  });

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: studioSessionKeys.session(sessionId),
    enabled: !!sessionId,
    queryFn: async () => sessionSource.fetchSession(),
  });

  const { data: tracks = [], isLoading: tracksLoading } = useQuery({
    queryKey: studioSessionKeys.sessionTracks(sessionId),
    enabled: !!sessionId,
    queryFn: async () => sessionSource.fetchTracks(),
  });

  const createSession = useMutation({
    mutationFn: async (params: { name: string; tempo?: number; time_signature?: string }) => {
      return sessionSource.createSession(params);
    },
    onSuccess: (created?: Session) => {
      if (shouldUseDevSessionFixture) {
        syncDevQueries(queryClient, created?.id);
        return;
      }
      invalidateSessions(queryClient);
    },
  });

  const updateSession = useMutation({
    mutationFn: async (updates: Partial<Session>) => {
      await sessionSource.updateSession(updates);
    },
    onSuccess: () => {
      if (shouldUseDevSessionFixture) {
        syncDevQueries(queryClient, sessionId);
        return;
      }
      invalidateSession(queryClient, sessionId);
    },
  });

  const addTrack = useMutation({
    mutationFn: async (track: TrackCreatePayload) => sessionSource.addTrack(track),
    onSuccess: () => {
      if (shouldUseDevSessionFixture) {
        syncDevQueries(queryClient, sessionId);
        return;
      }
      invalidateSessionTracks(queryClient, sessionId);
    },
  });

  const updateTrack = useMutation({
    mutationFn: async ({ trackId, updates }: { trackId: string; updates: TrackUpdatePayload }) => {
      await sessionSource.updateTrack(trackId, updates);
    },
    // Skip refetch on success — optimistic updates in useStudioActions already applied
    onError: () => {
      if (shouldUseDevSessionFixture) {
        syncDevQueries(queryClient, sessionId);
        return;
      }
      invalidateSessionTracks(queryClient, sessionId);
    },
  });

  const deleteTrack = useMutation({
    mutationFn: async (trackId: string) => sessionSource.deleteTrack(trackId),
    onSuccess: () => {
      if (shouldUseDevSessionFixture) {
        syncDevQueries(queryClient, sessionId);
        return;
      }
      invalidateSessionTracks(queryClient, sessionId);
    },
  });

  const createClip = useMutation({
    mutationFn: async (clip: ClipCreatePayload) => sessionSource.createClip(clip),
    onSuccess: () => {
      if (shouldUseDevSessionFixture) {
        syncDevQueries(queryClient, sessionId);
        return;
      }
      invalidateSessionTracks(queryClient, sessionId);
    },
    onError: () => {
      if (shouldUseDevSessionFixture) {
        syncDevQueries(queryClient, sessionId);
        return;
      }
      invalidateSessionTracks(queryClient, sessionId);
    },
  });

  const updateClip = useMutation({
    mutationFn: async ({ clipId, updates }: { clipId: string; updates: ClipUpdatePayload }) => {
      await sessionSource.updateClip(clipId, updates);
    },
    // Skip refetch on success — optimistic updates already applied
    onError: () => {
      if (shouldUseDevSessionFixture) {
        syncDevQueries(queryClient, sessionId);
        return;
      }
      invalidateSessionTracks(queryClient, sessionId);
    },
  });

  const deleteClip = useMutation({
    mutationFn: async (clipId: string) => sessionSource.deleteClip(clipId),
    onSuccess: () => {
      if (shouldUseDevSessionFixture) {
        syncDevQueries(queryClient, sessionId);
        return;
      }
      invalidateSessionTracks(queryClient, sessionId);
    },
  });

  const deleteSession = useMutation({
    mutationFn: async (id: string) => sessionSource.deleteSession(id),
    onSuccess: () => {
      if (shouldUseDevSessionFixture) {
        syncDevQueries(queryClient);
        return;
      }
      invalidateSessions(queryClient);
    },
  });

  const renameSession = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      await sessionSource.renameSession(id, name);
    },
    onSuccess: (_, variables) => {
      if (shouldUseDevSessionFixture) {
        syncDevQueries(queryClient, variables.id);
        return;
      }
      invalidateSessions(queryClient);
    },
  });

  return {
    session,
    tracks,
    isLoading: sessionLoading || tracksLoading,
    createSession,
    updateSession,
    addTrack,
    updateTrack,
    deleteTrack,
    createClip,
    updateClip,
    deleteClip,
    deleteSession,
    renameSession,
  };
}

export function useSessions() {
  const { session: authSession } = useAuth();
  const userId = shouldUseDevSessionFixture ? DEV_USER_ID : authSession?.user?.id;
  const sessionSource = createStudioSessionSource({
    mode: shouldUseDevSessionFixture ? "dev" : "live",
    userId: userId ?? DEV_USER_ID,
    sessionId: null,
  });

  return useQuery({
    queryKey: studioSessionKeys.sessions(),
    enabled: shouldUseDevSessionFixture || !!userId,
    queryFn: async () => sessionSource.fetchSessions(),
  });
}

/**
 * Import an Ableton parsed result into a new Studio session.
 * Creates session + tracks + clips in one go.
 */
export async function createSessionFromAbleton(
  userId: string,
  parsed: AbletonParseResult,
  fileName: string
): Promise<string> {
  return createStudioSessionSource({
    mode: "live",
    userId,
    sessionId: null,
  }).importAbletonSession(parsed, fileName);
}
