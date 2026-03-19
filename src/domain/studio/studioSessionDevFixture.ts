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
  const makeWaveform = (length: number, phase = 0, gain = 0.7) =>
    Array.from({ length }, (_, index) => {
      const carrier = Math.abs(Math.sin((index + phase) / 4.8));
      const texture = Math.abs(Math.cos((index + phase) / 10.5)) * 0.35;
      return 0.12 + carrier * gain + texture;
    });

  const makeAudioClip = (
    id: string,
    trackId: string,
    name: string,
    start: number,
    end: number,
    color: number,
    phase = 0,
    gain = 0.7,
  ): SessionClip => ({
    id,
    track_id: trackId,
    name,
    start_beats: start,
    end_beats: end,
    color,
    is_midi: false,
    is_muted: false,
    audio_url: null,
    waveform_peaks: makeWaveform(64, phase, gain),
    midi_data: null,
    alias_of: null,
    created_at: createdAt,
  });

  const makeMidiClip = (
    id: string,
    trackId: string,
    name: string,
    start: number,
    end: number,
    color: number,
    notes: Array<{ id: string; pitch: number; start: number; duration: number; velocity: number }>,
  ): SessionClip => ({
    id,
    track_id: trackId,
    name,
    start_beats: start,
    end_beats: end,
    color,
    is_midi: true,
    is_muted: false,
    audio_url: null,
    waveform_peaks: null,
    midi_data: { notes },
    alias_of: null,
    created_at: createdAt,
  });

  const vocalLeadId = "dev-track-audio-vocal";
  const pianoId = "dev-track-midi-piano";
  const drumsId = "dev-track-audio-drums";
  const bassId = "dev-track-audio-bass";
  const percussionGroupId = "dev-track-group-percussion";
  const kickId = "dev-track-audio-kick";
  const snareId = "dev-track-audio-snare";
  const hiHatId = "dev-track-audio-hihat";
  const synthsGroupId = "dev-track-group-synths";
  const leadSynthId = "dev-track-midi-lead";
  const padId = "dev-track-midi-pad";

  const vocalVerse = makeAudioClip("dev-clip-vocal-verse", vocalLeadId, "Verse 1", 4, 18, 1, 0, 0.75);
  const vocalChorus = makeAudioClip("dev-clip-vocal-chorus", vocalLeadId, "Chorus", 32, 40, 1, 8, 0.6);
  const vocalVolumeAutomation = {
    id: "dev-auto-vocal-volume",
    target: "volume",
    label: "Volume",
    visible: true,
    points: [
      { id: "dev-auto-vocal-volume-1", time: 0, value: 0.48, curve: "linear" as const },
      { id: "dev-auto-vocal-volume-2", time: 10, value: 0.72, curve: "linear" as const },
      { id: "dev-auto-vocal-volume-3", time: 20, value: 0.56, curve: "linear" as const },
      { id: "dev-auto-vocal-volume-4", time: 30, value: 0.67, curve: "linear" as const },
      { id: "dev-auto-vocal-volume-5", time: 40, value: 0.44, curve: "linear" as const },
    ],
  };
  const pianoMelody = makeMidiClip(
    "dev-clip-piano-melody",
    pianoId,
    "Piano Melody",
    8,
    40,
    9,
    [
      { id: "pn-1", pitch: 60, start: 0, duration: 1, velocity: 0.84 },
      { id: "pn-2", pitch: 64, start: 0, duration: 1, velocity: 0.8 },
      { id: "pn-3", pitch: 67, start: 0, duration: 1, velocity: 0.78 },
      { id: "pn-4", pitch: 60, start: 4, duration: 1, velocity: 0.82 },
      { id: "pn-5", pitch: 65, start: 4, duration: 1, velocity: 0.8 },
      { id: "pn-6", pitch: 69, start: 4, duration: 1, velocity: 0.76 },
      { id: "pn-7", pitch: 62, start: 8, duration: 1, velocity: 0.83 },
      { id: "pn-8", pitch: 67, start: 8, duration: 1, velocity: 0.78 },
      { id: "pn-9", pitch: 71, start: 8, duration: 1, velocity: 0.74 },
      { id: "pn-10", pitch: 60, start: 12, duration: 1, velocity: 0.82 },
      { id: "pn-11", pitch: 65, start: 12, duration: 1, velocity: 0.78 },
      { id: "pn-12", pitch: 69, start: 12, duration: 1, velocity: 0.76 },
      { id: "pn-13", pitch: 64, start: 16, duration: 0.5, velocity: 0.8 },
      { id: "pn-14", pitch: 62, start: 17, duration: 0.5, velocity: 0.75 },
      { id: "pn-15", pitch: 60, start: 18, duration: 1, velocity: 0.78 },
      { id: "pn-16", pitch: 59, start: 19, duration: 1, velocity: 0.72 },
      { id: "pn-17", pitch: 60, start: 20, duration: 1, velocity: 0.82 },
    ],
  );
  const drumLoop = makeAudioClip("dev-clip-drum-loop", drumsId, "Drum Loop", 0, 38, 2, 3, 0.42);
  const kickPattern = makeAudioClip("dev-clip-kick", kickId, "Kick Pattern", 18, 40, 3, 6, 0.48);
  const snarePattern = makeAudioClip("dev-clip-snare", snareId, "Snare Pattern", 18, 40, 9, 4, 0.44);
  const hihatPattern = makeAudioClip("dev-clip-hihat", hiHatId, "Hi-Hat Pattern", 18, 40, 1, 9, 0.4);
  const leadSynthClip = makeMidiClip(
    "dev-clip-lead",
    leadSynthId,
    "Lead Hook",
    24,
    40,
    6,
    [
      { id: "ls-1", pitch: 72, start: 0, duration: 0.5, velocity: 0.82 },
      { id: "ls-2", pitch: 76, start: 1, duration: 0.5, velocity: 0.77 },
      { id: "ls-3", pitch: 74, start: 2, duration: 1, velocity: 0.75 },
    ],
  );
  const padClip = makeMidiClip(
    "dev-clip-pad",
    padId,
    "Pad Layer",
    12,
    36,
    7,
    [
      { id: "pd-1", pitch: 48, start: 0, duration: 4, velocity: 0.7 },
      { id: "pd-2", pitch: 55, start: 0, duration: 4, velocity: 0.66 },
      { id: "pd-3", pitch: 60, start: 0, duration: 4, velocity: 0.64 },
    ],
  );

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
          id: vocalLeadId,
          session_id: sessionId,
          name: "Vocal Lead",
          type: "audio",
          color: 1,
          volume: 0.85,
          pan: 0,
          is_muted: false,
          is_soloed: false,
          sort_order: 0,
          device_chain: [],
          sends: [],
          input_from: null,
          created_at: createdAt,
          clips: [vocalVerse, vocalChorus],
          automation_lanes: [vocalVolumeAutomation],
        },
        {
          id: pianoId,
          session_id: sessionId,
          name: "Piano",
          type: "midi",
          color: 9,
          volume: 0.8,
          pan: -0.1,
          is_muted: false,
          is_soloed: false,
          sort_order: 1,
          device_chain: [],
          sends: [],
          input_from: null,
          created_at: createdAt,
          clips: [pianoMelody],
          automation_lanes: [],
        },
        {
          id: drumsId,
          session_id: sessionId,
          name: "Drums",
          type: "audio",
          color: 2,
          volume: 0.8,
          pan: 0.05,
          is_muted: false,
          is_soloed: false,
          sort_order: 2,
          device_chain: [],
          sends: [],
          input_from: null,
          created_at: createdAt,
          clips: [drumLoop],
          automation_lanes: [],
        },
        {
          id: bassId,
          session_id: sessionId,
          name: "Bass",
          type: "audio",
          color: 5,
          volume: 0.78,
          pan: 0.02,
          is_muted: false,
          is_soloed: false,
          sort_order: 3,
          device_chain: [],
          sends: [],
          input_from: null,
          created_at: createdAt,
          clips: [],
          automation_lanes: [],
        },
        {
          id: percussionGroupId,
          session_id: sessionId,
          name: "Percussion Group",
          type: "group",
          color: 11,
          volume: 0.85,
          pan: 0,
          is_muted: false,
          is_soloed: false,
          sort_order: 4,
          device_chain: [],
          sends: [],
          input_from: null,
          created_at: createdAt,
          clips: [],
          automation_lanes: [],
        },
        {
          id: kickId,
          session_id: sessionId,
          name: "Kick",
          type: "audio",
          color: 3,
          volume: 0.88,
          pan: 0,
          is_muted: false,
          is_soloed: false,
          sort_order: 5,
          device_chain: [],
          sends: [],
          input_from: null,
          created_at: createdAt,
          clips: [kickPattern],
          automation_lanes: [],
        },
        {
          id: snareId,
          session_id: sessionId,
          name: "Snare",
          type: "audio",
          color: 9,
          volume: 0.82,
          pan: 0.02,
          is_muted: false,
          is_soloed: false,
          sort_order: 6,
          device_chain: [],
          sends: [],
          input_from: null,
          created_at: createdAt,
          clips: [snarePattern],
          automation_lanes: [],
        },
        {
          id: hiHatId,
          session_id: sessionId,
          name: "Hi-Hat",
          type: "audio",
          color: 1,
          volume: 0.8,
          pan: 0.04,
          is_muted: false,
          is_soloed: false,
          sort_order: 7,
          device_chain: [],
          sends: [],
          input_from: null,
          created_at: createdAt,
          clips: [hihatPattern],
          automation_lanes: [],
        },
        {
          id: synthsGroupId,
          session_id: sessionId,
          name: "Synths",
          type: "group",
          color: 13,
          volume: 0.8,
          pan: 0,
          is_muted: false,
          is_soloed: false,
          sort_order: 8,
          device_chain: [],
          sends: [],
          input_from: null,
          created_at: createdAt,
          clips: [],
          automation_lanes: [],
        },
        {
          id: leadSynthId,
          session_id: sessionId,
          name: "Lead Synth",
          type: "midi",
          color: 6,
          volume: 0.78,
          pan: 0.06,
          is_muted: false,
          is_soloed: false,
          sort_order: 9,
          device_chain: [],
          sends: [],
          input_from: null,
          created_at: createdAt,
          clips: [leadSynthClip],
          automation_lanes: [],
        },
        {
          id: padId,
          session_id: sessionId,
          name: "Pad",
          type: "midi",
          color: 7,
          volume: 0.76,
          pan: -0.04,
          is_muted: false,
          is_soloed: false,
          sort_order: 10,
          device_chain: [],
          sends: [],
          input_from: null,
          created_at: createdAt,
          clips: [padClip],
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
