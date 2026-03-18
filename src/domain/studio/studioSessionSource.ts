import type { Session, SessionTrack } from "@/types/studio";
import type { AbletonParseResult } from "@/types/ableton";
import type {
  ClipCreatePayload,
  ClipUpdatePayload,
  TrackCreatePayload,
  TrackUpdatePayload,
} from "@/hooks/studioMutationTypes";
import {
  createDevClip,
  createDevSession,
  createDevTrack,
  deleteDevClip,
  deleteDevSession,
  deleteDevTrack,
  getDevSession,
  getDevSessions,
  getDevTracks,
  renameDevSession,
  updateDevClip,
  updateDevSession,
  updateDevTrack,
} from "@/domain/studio/studioSessionDevFixture";
import {
  deleteClipRecord,
  deleteSessionGraph,
  deleteTrackRecord,
  fetchSessionRecord,
  fetchSessionTrackRecords,
  fetchUserSessionRecords,
  importAbletonSession,
  insertClipRecord,
  insertSessionRecord,
  insertTrackRecord,
  renameSessionRecord,
  updateClipRecord,
  updateSessionRecord,
  updateTrackRecord,
} from "@/domain/studio/studioSessionPersistence";

export interface StudioSessionSource {
  fetchSession: () => Promise<Session | null>;
  fetchTracks: () => Promise<SessionTrack[]>;
  fetchSessions: () => Promise<Session[]>;
  createSession: (params: { name: string; tempo?: number; time_signature?: string }) => Promise<Session>;
  updateSession: (updates: Partial<Session>) => Promise<void>;
  addTrack: (track: TrackCreatePayload) => Promise<unknown>;
  updateTrack: (trackId: string, updates: TrackUpdatePayload) => Promise<void>;
  deleteTrack: (trackId: string) => Promise<void>;
  createClip: (clip: ClipCreatePayload) => Promise<unknown>;
  updateClip: (clipId: string, updates: ClipUpdatePayload) => Promise<void>;
  deleteClip: (clipId: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  renameSession: (sessionId: string, name: string) => Promise<void>;
  importAbletonSession: (parsed: AbletonParseResult, fileName: string) => Promise<string>;
}

interface CreateStudioSessionSourceOptions {
  mode: "dev" | "live";
  userId: string;
  sessionId: string | null;
}

export function createStudioSessionSource({
  mode,
  userId,
  sessionId,
}: CreateStudioSessionSourceOptions): StudioSessionSource {
  if (mode === "dev") {
    return {
      fetchSession: async () => (sessionId ? getDevSession(sessionId) : null),
      fetchTracks: async () => (sessionId ? getDevTracks(sessionId) : []),
      fetchSessions: async () => getDevSessions(),
      createSession: async (params) => createDevSession(userId, params),
      updateSession: async (updates) => {
        if (sessionId) updateDevSession(sessionId, updates);
      },
      addTrack: async (track) => {
        if (!sessionId) return undefined;
        return createDevTrack(sessionId, track);
      },
      updateTrack: async (trackId, updates) => {
        if (sessionId) updateDevTrack(sessionId, trackId, updates);
      },
      deleteTrack: async (trackId) => {
        if (sessionId) deleteDevTrack(sessionId, trackId);
      },
      createClip: async (clip) => {
        if (!sessionId) return undefined;
        return createDevClip(sessionId, clip);
      },
      updateClip: async (clipId, updates) => {
        if (sessionId) updateDevClip(sessionId, clipId, updates);
      },
      deleteClip: async (clipId) => {
        if (sessionId) deleteDevClip(sessionId, clipId);
      },
      deleteSession: async (targetSessionId) => {
        deleteDevSession(targetSessionId);
      },
      renameSession: async (targetSessionId, name) => {
        renameDevSession(targetSessionId, name);
      },
      importAbletonSession: async () => {
        throw new Error("Ableton import is not supported in dev fixture mode.");
      },
    };
  }

  return {
    fetchSession: async () => (sessionId ? fetchSessionRecord(sessionId) : null),
    fetchTracks: async () => (sessionId ? fetchSessionTrackRecords(sessionId) : []),
    fetchSessions: async () => fetchUserSessionRecords(userId),
    createSession: async (params) => insertSessionRecord({ user_id: userId, ...params }),
    updateSession: async (updates) => {
      if (sessionId) await updateSessionRecord(sessionId, updates);
    },
    addTrack: async (track) => {
      if (!sessionId) return undefined;
      const { clips, ...rest } = track as TrackCreatePayload & { clips?: unknown };
      void clips;
      return insertTrackRecord(sessionId, rest);
    },
    updateTrack: async (trackId, updates) => updateTrackRecord(trackId, updates),
    deleteTrack: async (trackId) => deleteTrackRecord(trackId),
    createClip: async (clip) => insertClipRecord(clip),
    updateClip: async (clipId, updates) => updateClipRecord(clipId, updates),
    deleteClip: async (clipId) => deleteClipRecord(clipId),
    deleteSession: async (targetSessionId) => deleteSessionGraph(targetSessionId),
    renameSession: async (targetSessionId, name) => renameSessionRecord(targetSessionId, name),
    importAbletonSession: async (parsed, fileName) => importAbletonSession(userId, parsed, fileName),
  };
}
