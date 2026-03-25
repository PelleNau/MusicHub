import { supabase } from "@/integrations/supabase/client";
import type { AbletonParseResult } from "@/types/ableton";
import type {
  ClipCreatePayload,
  ClipUpdatePayload,
  TrackCreatePayload,
  TrackUpdatePayload,
} from "@/hooks/studioMutationTypes";
import { normalizeDeviceChain, type Session, type SessionClip, type SessionTrack } from "@/types/studio";

function normalizeTrackPayloadDeviceChain<T extends { device_chain?: SessionTrack["device_chain"] }>(payload: T): T {
  if (!("device_chain" in payload) || !payload.device_chain) return payload;
  return {
    ...payload,
    device_chain: normalizeDeviceChain(payload.device_chain),
  };
}

export async function fetchSessionRecord(sessionId: string): Promise<Session> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single();
  if (error) throw error;
  return data as Session;
}

export async function fetchSessionTrackRecords(sessionId: string): Promise<SessionTrack[]> {
  const { data: trackRows, error: trackError } = await supabase
    .from("session_tracks")
    .select("*")
    .eq("session_id", sessionId)
    .order("sort_order");
  if (trackError) throw trackError;

  const trackIds = (trackRows ?? []).map((track) => track.id);
  const { data: clipRows, error: clipError } = await supabase
    .from("session_clips")
    .select("*")
    .in("track_id", trackIds.length ? trackIds : ["__none__"]);
  if (clipError) throw clipError;

  const clipsByTrack = (clipRows || []).reduce<Record<string, SessionClip[]>>((acc, clip) => {
    (acc[clip.track_id] = acc[clip.track_id] || []).push(clip as SessionClip);
    return acc;
  }, {});

  return (trackRows || []).map((track) => ({
    ...track,
    device_chain: normalizeDeviceChain(track.device_chain as SessionTrack["device_chain"]),
    clips: clipsByTrack[track.id] || [],
  })) as SessionTrack[];
}

export async function insertSessionRecord(params: {
  user_id: string;
  name: string;
  tempo?: number;
  time_signature?: string;
}): Promise<Session> {
  const { data, error } = await supabase
    .from("sessions")
    .insert(params)
    .select()
    .single();
  if (error) throw error;
  return data as Session;
}

export async function fetchUserSessionRecords(userId: string): Promise<Session[]> {
  const { data, error } = await supabase
    .from("sessions")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data as Session[];
}

export async function updateSessionRecord(
  sessionId: string,
  updates: Partial<Session>,
): Promise<void> {
  const { error } = await supabase
    .from("sessions")
    .update(updates)
    .eq("id", sessionId);
  if (error) throw error;
}

export async function insertTrackRecord(
  sessionId: string,
  track: TrackCreatePayload,
): Promise<SessionTrack> {
  const normalizedTrack = normalizeTrackPayloadDeviceChain(track);
  const { data, error } = await supabase
    .from("session_tracks")
    .insert([{ session_id: sessionId, ...normalizedTrack }])
    .select()
    .single();
  if (error) throw error;
  return {
    ...(data as SessionTrack),
    device_chain: normalizeDeviceChain((data as SessionTrack).device_chain),
    clips: [],
  };
}

export async function updateTrackRecord(
  trackId: string,
  updates: TrackUpdatePayload,
): Promise<void> {
  const normalizedUpdates = normalizeTrackPayloadDeviceChain(updates);
  const { error } = await supabase
    .from("session_tracks")
    .update(normalizedUpdates)
    .eq("id", trackId);
  if (error) throw error;
}

export async function deleteTrackRecord(trackId: string): Promise<void> {
  await deleteClipsByTrack(trackId);
  const { error } = await supabase.from("session_tracks").delete().eq("id", trackId);
  if (error) throw error;
}

export async function insertClipRecord(clip: ClipCreatePayload): Promise<SessionClip> {
  const { data, error } = await supabase
    .from("session_clips")
    .insert([clip])
    .select()
    .single();
  if (error) throw error;
  return data as SessionClip;
}

export async function updateClipRecord(
  clipId: string,
  updates: ClipUpdatePayload,
): Promise<void> {
  const { error } = await supabase
    .from("session_clips")
    .update(updates)
    .eq("id", clipId);
  if (error) throw error;
}

export async function deleteClipRecord(clipId: string): Promise<void> {
  const { error } = await supabase.from("session_clips").delete().eq("id", clipId);
  if (error) throw error;
}

export async function deleteClipsByTrack(trackId: string): Promise<void> {
  const { error } = await supabase.from("session_clips").delete().eq("track_id", trackId);
  if (error) throw error;
}

export async function fetchSessionTrackIds(sessionId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("session_tracks")
    .select("id")
    .eq("session_id", sessionId);
  if (error) throw error;
  return (data ?? []).map((track) => track.id);
}

export async function deleteTracksBySession(sessionId: string): Promise<void> {
  const { error } = await supabase.from("session_tracks").delete().eq("session_id", sessionId);
  if (error) throw error;
}

export async function deleteSessionRecord(sessionId: string): Promise<void> {
  const { error } = await supabase.from("sessions").delete().eq("id", sessionId);
  if (error) throw error;
}

export async function deleteSessionGraph(sessionId: string): Promise<void> {
  const trackIds = await fetchSessionTrackIds(sessionId);
  if (trackIds.length) {
    for (const trackId of trackIds) {
      await deleteClipsByTrack(trackId);
    }
  }
  await deleteTracksBySession(sessionId);
  await deleteSessionRecord(sessionId);
}

export async function renameSessionRecord(sessionId: string, name: string): Promise<void> {
  const { error } = await supabase
    .from("sessions")
    .update({ name })
    .eq("id", sessionId);
  if (error) throw error;
}

export async function insertTrackRecords(
  sessionId: string,
  tracks: TrackCreatePayload[],
): Promise<Array<SessionTrack & { clips: SessionClip[] }>> {
  const normalizedTracks = tracks.map(normalizeTrackPayloadDeviceChain);
  const { data, error } = await supabase
    .from("session_tracks")
    .insert(normalizedTracks.map((track) => ({ session_id: sessionId, ...track })))
    .select();
  if (error) throw error;
  return (data as SessionTrack[]).map((track) => ({
    ...track,
    device_chain: normalizeDeviceChain(track.device_chain),
    clips: [],
  }));
}

export async function insertClipRecords(clips: ClipCreatePayload[]): Promise<void> {
  if (!clips.length) return;
  const { error } = await supabase.from("session_clips").insert(clips);
  if (error) throw error;
}

export async function importAbletonSession(
  userId: string,
  parsed: AbletonParseResult,
  fileName: string,
): Promise<string> {
  const session = await insertSessionRecord({
    user_id: userId,
    name: fileName.replace(/\.als$/i, ""),
    tempo: parsed.tempo ?? 120,
    time_signature: parsed.timeSignature ?? "4/4",
  });

  const trackRows = await insertTrackRecords(
    session.id,
    parsed.tracks.map((track, index) => ({
      name: track.name,
      type: track.type,
      color: track.color,
      volume: track.volume ?? 0.85,
      pan: track.pan ?? 0,
      is_muted: track.isMuted,
      is_soloed: track.isSoloed,
      sort_order: index,
      device_chain: normalizeDeviceChain(track.devices as SessionTrack["device_chain"]),
    })),
  );

  const clipInserts: ClipCreatePayload[] = [];
  trackRows.forEach((dbTrack, index) => {
    const sourceTrack = parsed.tracks[index];
    if (!sourceTrack?.clips) return;
    for (const clip of sourceTrack.clips) {
      clipInserts.push({
        track_id: dbTrack.id,
        name: clip.name,
        start_beats: clip.startBeats,
        end_beats: clip.endBeats,
        color: clip.color,
        is_midi: clip.isMidi,
        is_muted: false,
        midi_data: clip.isMidi && clip.notes?.length ? clip.notes : null,
      });
    }
  });

  await insertClipRecords(clipInserts);
  return session.id;
}
