import { extractMidiNotesFromData } from "@/domain/studio/studioMidiCommandProtocol";
import type { SessionClip, SessionTrack } from "@/types/studio";

export interface StudioSessionTrackIndex {
  trackById: Record<string, SessionTrack>;
  clipById: Record<string, SessionClip>;
  trackIdByClipId: Record<string, string>;
  allClips: SessionClip[];
}

export function buildSessionTrackIndex(tracks: SessionTrack[]): StudioSessionTrackIndex {
  const trackById: Record<string, SessionTrack> = {};
  const clipById: Record<string, SessionClip> = {};
  const trackIdByClipId: Record<string, string> = {};
  const allClips: SessionClip[] = [];

  for (const track of tracks) {
    trackById[track.id] = track;
    for (const clip of track.clips || []) {
      clipById[clip.id] = clip;
      trackIdByClipId[clip.id] = track.id;
      allClips.push(clip);
    }
  }

  return {
    trackById,
    clipById,
    trackIdByClipId,
    allClips,
  };
}

export const extractMidiNotes = extractMidiNotesFromData;

export function normalizeDisplayTracks(tracks: SessionTrack[]): SessionTrack[] {
  const effectiveSoloTrackId = tracks.find((track) => track.is_soloed)?.id ?? null;
  if (!effectiveSoloTrackId) return tracks;

  return tracks.map((track) =>
    track.is_soloed === (track.id === effectiveSoloTrackId)
      ? track
      : { ...track, is_soloed: track.id === effectiveSoloTrackId },
  );
}

export function getDisplayReturnTracks(tracks: SessionTrack[]): SessionTrack[] {
  return tracks.filter((track) => track.type === "return");
}
