import type { QueryClient } from "@tanstack/react-query";
import type {
  ClipCreatePayload,
  ClipUpdatePayload,
  TrackCreatePayload,
  TrackUpdatePayload,
} from "@/hooks/studioMutationTypes";
import { studioSessionKeys } from "@/domain/studio/studioSessionQueries";
import type { Session, SessionClip, SessionTrack } from "@/types/studio";

export const shouldUseDevSessionFixture =
  import.meta.env.DEV && import.meta.env.VITE_BYPASS_AUTH === "1";

export const DEV_USER_ID = "dev-bypass-user";

type DevSessionStore = {
  sessions: Session[];
  tracksBySession: Record<string, SessionTrack[]>;
};

function cloneDev<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function nextDevId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createInitialDevStore(): DevSessionStore {
  const createdAt = nowIso();
  const sessionId = "dev-session-1";
  const track1Id = "dev-track-midi-1";
  const track2Id = "dev-track-midi-2";
  const track3Id = "dev-track-audio-1";

  const midiClipA: SessionClip = {
    id: "dev-clip-midi-a",
    track_id: track1Id,
    name: "MIDI Clip A",
    start_beats: 4,
    end_beats: 12,
    color: 6,
    is_midi: true,
    is_muted: false,
    audio_url: null,
    waveform_peaks: null,
    midi_data: {
      notes: [
        { id: "n1", pitch: 60, start: 0, duration: 1, velocity: 0.9 },
        { id: "n2", pitch: 64, start: 1, duration: 1, velocity: 0.85 },
        { id: "n3", pitch: 67, start: 2, duration: 2, velocity: 0.8 },
      ],
    },
    alias_of: null,
    created_at: createdAt,
  };

  const midiClipB: SessionClip = {
    id: "dev-clip-midi-b",
    track_id: track2Id,
    name: "MIDI Clip B",
    start_beats: 8,
    end_beats: 18,
    color: 9,
    is_midi: true,
    is_muted: false,
    audio_url: null,
    waveform_peaks: null,
    midi_data: {
      notes: [
        { id: "n4", pitch: 72, start: 0, duration: 0.5, velocity: 0.8 },
        { id: "n5", pitch: 71, start: 0.5, duration: 0.5, velocity: 0.78 },
        { id: "n6", pitch: 69, start: 1, duration: 1, velocity: 0.76 },
      ],
    },
    alias_of: null,
    created_at: createdAt,
  };

  const audioClip: SessionClip = {
    id: "dev-clip-audio-1",
    track_id: track3Id,
    name: "Audio Clip",
    start_beats: 0,
    end_beats: 16,
    color: 12,
    is_midi: false,
    is_muted: false,
    audio_url: null,
    waveform_peaks: Array.from({ length: 48 }, (_, index) =>
      0.2 + Math.abs(Math.sin(index / 5)) * 0.6,
    ),
    midi_data: null,
    alias_of: null,
    created_at: createdAt,
  };

  return {
    sessions: [
      {
        id: sessionId,
        user_id: DEV_USER_ID,
        name: "Dev Fixture Session",
        tempo: 120,
        time_signature: "4/4",
        created_at: createdAt,
        updated_at: createdAt,
      },
    ],
    tracksBySession: {
      [sessionId]: [
        {
          id: track1Id,
          session_id: sessionId,
          name: "MIDI 1",
          type: "midi",
          color: 4,
          volume: 0.85,
          pan: 0,
          is_muted: false,
          is_soloed: false,
          sort_order: 0,
          device_chain: [],
          sends: [],
          input_from: null,
          created_at: createdAt,
          clips: [midiClipA],
          automation_lanes: [],
        },
        {
          id: track2Id,
          session_id: sessionId,
          name: "MIDI 2",
          type: "midi",
          color: 7,
          volume: 0.8,
          pan: -0.1,
          is_muted: false,
          is_soloed: false,
          sort_order: 1,
          device_chain: [],
          sends: [],
          input_from: null,
          created_at: createdAt,
          clips: [midiClipB],
          automation_lanes: [],
        },
        {
          id: track3Id,
          session_id: sessionId,
          name: "Audio 1",
          type: "audio",
          color: 14,
          volume: 0.8,
          pan: 0.05,
          is_muted: false,
          is_soloed: false,
          sort_order: 2,
          device_chain: [],
          sends: [],
          input_from: null,
          created_at: createdAt,
          clips: [audioClip],
          automation_lanes: [],
        },
      ],
    },
  };
}

const devStore = createInitialDevStore();

function updateDevSessionTimestamp(sessionId: string) {
  const updatedAt = nowIso();
  devStore.sessions = devStore.sessions.map((session) =>
    session.id === sessionId ? { ...session, updated_at: updatedAt } : session,
  );
}

export function getDevSessions(): Session[] {
  return cloneDev(devStore.sessions);
}

export function getDevSession(sessionId: string): Session | null {
  return cloneDev(devStore.sessions.find((session) => session.id === sessionId) ?? null);
}

export function getDevTracks(sessionId: string): SessionTrack[] {
  return cloneDev(devStore.tracksBySession[sessionId] ?? []);
}

export function syncDevQueries(queryClient: QueryClient, sessionId?: string | null) {
  queryClient.setQueryData(studioSessionKeys.sessions(), getDevSessions());
  if (sessionId) {
    queryClient.setQueryData(studioSessionKeys.session(sessionId), getDevSession(sessionId));
    queryClient.setQueryData(studioSessionKeys.sessionTracks(sessionId), getDevTracks(sessionId));
  }
}

export function createDevSession(
  userId: string,
  params: { name: string; tempo?: number; time_signature?: string },
): Session {
  const createdAt = nowIso();
  const created: Session = {
    id: nextDevId("dev-session"),
    user_id: userId,
    name: params.name,
    tempo: params.tempo ?? 120,
    time_signature: params.time_signature ?? "4/4",
    created_at: createdAt,
    updated_at: createdAt,
  };
  devStore.sessions = [created, ...devStore.sessions];
  devStore.tracksBySession[created.id] = [];
  return cloneDev(created);
}

export function updateDevSession(sessionId: string, updates: Partial<Session>) {
  const updatedAt = nowIso();
  devStore.sessions = devStore.sessions.map((session) =>
    session.id === sessionId ? { ...session, ...updates, updated_at: updatedAt } : session,
  );
}

export function createDevTrack(sessionId: string, track: TrackCreatePayload): SessionTrack {
  const createdAt = nowIso();
  const newTrack: SessionTrack = {
    id: nextDevId("dev-track"),
    session_id: sessionId,
    name: track.name ?? `Track ${(devStore.tracksBySession[sessionId] ?? []).length + 1}`,
    type: (track.type as SessionTrack["type"]) ?? "audio",
    color: track.color ?? 0,
    volume: track.volume ?? 0.8,
    pan: track.pan ?? 0,
    is_muted: track.is_muted ?? false,
    is_soloed: track.is_soloed ?? false,
    sort_order: track.sort_order ?? (devStore.tracksBySession[sessionId] ?? []).length,
    device_chain: track.device_chain ?? [],
    sends: track.sends ?? [],
    input_from: track.input_from ?? null,
    created_at: createdAt,
    clips: [],
    automation_lanes: track.automation_lanes ?? [],
  };
  devStore.tracksBySession[sessionId] = [...(devStore.tracksBySession[sessionId] ?? []), newTrack];
  updateDevSessionTimestamp(sessionId);
  return cloneDev(newTrack);
}

export function updateDevTrack(sessionId: string, trackId: string, updates: TrackUpdatePayload) {
  const tracks = devStore.tracksBySession[sessionId] ?? [];
  devStore.tracksBySession[sessionId] = tracks.map((track) =>
    track.id === trackId ? { ...track, ...updates } : track,
  );
  updateDevSessionTimestamp(sessionId);
}

export function deleteDevTrack(sessionId: string, trackId: string) {
  devStore.tracksBySession[sessionId] = (devStore.tracksBySession[sessionId] ?? []).filter(
    (track) => track.id !== trackId,
  );
  updateDevSessionTimestamp(sessionId);
}

export function createDevClip(sessionId: string, clip: ClipCreatePayload): SessionClip {
  const createdAt = nowIso();
  const newClip: SessionClip = {
    id: nextDevId("dev-clip"),
    track_id: clip.track_id,
    name: clip.name ?? (clip.is_midi ? "MIDI Clip" : "Clip"),
    start_beats: clip.start_beats ?? 0,
    end_beats: clip.end_beats ?? 4,
    color: clip.color ?? 0,
    is_midi: clip.is_midi ?? false,
    is_muted: clip.is_muted ?? false,
    audio_url: clip.audio_url ?? null,
    waveform_peaks: clip.waveform_peaks ?? null,
    midi_data: clip.midi_data ?? null,
    alias_of: clip.alias_of ?? null,
    created_at: createdAt,
  };

  devStore.tracksBySession[sessionId] = (devStore.tracksBySession[sessionId] ?? []).map((track) =>
    track.id === newClip.track_id ? { ...track, clips: [...(track.clips ?? []), newClip] } : track,
  );
  updateDevSessionTimestamp(sessionId);
  return cloneDev(newClip);
}

export function updateDevClip(sessionId: string, clipId: string, updates: ClipUpdatePayload) {
  devStore.tracksBySession[sessionId] = (devStore.tracksBySession[sessionId] ?? []).map((track) => ({
    ...track,
    clips: (track.clips ?? []).map((clip) => (clip.id === clipId ? { ...clip, ...updates } : clip)),
  }));
  updateDevSessionTimestamp(sessionId);
}

export function deleteDevClip(sessionId: string, clipId: string) {
  devStore.tracksBySession[sessionId] = (devStore.tracksBySession[sessionId] ?? []).map((track) => ({
    ...track,
    clips: (track.clips ?? []).filter((clip) => clip.id !== clipId),
  }));
  updateDevSessionTimestamp(sessionId);
}

export function deleteDevSession(sessionId: string) {
  devStore.sessions = devStore.sessions.filter((session) => session.id !== sessionId);
  delete devStore.tracksBySession[sessionId];
}

export function renameDevSession(sessionId: string, name: string) {
  const updatedAt = nowIso();
  devStore.sessions = devStore.sessions.map((session) =>
    session.id === sessionId ? { ...session, name, updated_at: updatedAt } : session,
  );
}
