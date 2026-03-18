import { useMemo } from "react";
import type { MidiNote } from "@/components/studio/PianoRollTransforms";
import { buildSessionTrackIndex } from "@/domain/studio/studioSessionAdapter";
import type { StudioSessionDomainRuntimeState } from "@/types/musicHubStudioRuntime";
import type { Session, SessionClip, SessionTrack } from "@/types/studio";

const DEFAULT_TOTAL_BEATS = 128;

interface UseStudioSessionDomainModelOptions {
  session: Session | null | undefined;
  tracks: SessionTrack[];
  activeClipId: string | null;
  selectedTrackId: string | null;
}

export function useStudioSessionDomainModel({
  session,
  tracks,
  activeClipId,
  selectedTrackId,
}: UseStudioSessionDomainModelOptions): StudioSessionDomainRuntimeState {
  const trackIndex = useMemo(() => buildSessionTrackIndex(tracks), [tracks]);
  const tempo = session?.tempo ?? 120;
  const timeSignature = session?.time_signature ?? "4/4";
  const beatsPerBar = parseInt(timeSignature.split("/")[0]) || 4;

  const totalBeats = useMemo(() => {
    if (!trackIndex.allClips.length) return DEFAULT_TOTAL_BEATS;
    const maxClipEnd = Math.max(...trackIndex.allClips.map((clip) => clip.end_beats), 0);
    return Math.max(
      DEFAULT_TOTAL_BEATS,
      Math.ceil(maxClipEnd / beatsPerBar) * beatsPerBar + beatsPerBar * 4,
    );
  }, [beatsPerBar, trackIndex]);

  const sessionMetrics = useMemo(
    () => ({
      tempo,
      timeSignature,
      beatsPerBar,
      totalBeats,
    }),
    [beatsPerBar, tempo, timeSignature, totalBeats],
  );

  const selectedClip = useMemo<SessionClip | undefined>(() => {
    if (!activeClipId) return undefined;
    return trackIndex.clipById[activeClipId];
  }, [activeClipId, trackIndex]);

  const selectedTrack = useMemo<SessionTrack | undefined>(() => {
    if (selectedClip) {
      const trackId = trackIndex.trackIdByClipId[selectedClip.id];
      return trackId ? trackIndex.trackById[trackId] : undefined;
    }
    if (!selectedTrackId) return undefined;
    return trackIndex.trackById[selectedTrackId];
  }, [selectedClip, selectedTrackId, trackIndex]);

  const ghostNotes = useMemo<MidiNote[]>(() => {
    if (!activeClipId) return [];

    const clip = trackIndex.clipById[activeClipId];
    if (!clip?.is_midi) return [];

    const clipTrackId = trackIndex.trackIdByClipId[activeClipId];
    return tracks
      .filter((track) => track.id !== clipTrackId)
      .flatMap((track) => track.clips || [])
      .filter((candidate) => candidate.is_midi && candidate.midi_data)
      .flatMap((candidate) => {
        const notes = Array.isArray(candidate.midi_data)
          ? (candidate.midi_data as MidiNote[])
          : candidate.midi_data &&
              typeof candidate.midi_data === "object" &&
              "notes" in candidate.midi_data &&
              Array.isArray((candidate.midi_data as { notes?: unknown }).notes)
            ? ((candidate.midi_data as { notes: MidiNote[] }).notes ?? [])
            : [];

        return notes.map((note) => ({
          ...note,
          start: note.start + (candidate.start_beats - clip.start_beats),
        }));
      });
  }, [activeClipId, trackIndex, tracks]);

  return {
    trackIndex,
    sessionMetrics,
    selectedClip,
    selectedTrack,
    selectedClipIsMidi: Boolean(selectedClip?.is_midi),
    ghostNotes,
  };
}
