import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  extractMidiNotesFromData,
  withMidiNotesInData,
} from "@/domain/studio/studioMidiCommandProtocol";
import type { StudioSessionDomainRuntimeState } from "@/types/musicHubStudioRuntime";
import type { SessionTrack } from "@/types/studio";
import type { UndoRedoState } from "@/hooks/useUndoRedo";
import {
  removeSessionClipFromCache,
  updateSessionClipInCache,
} from "@/domain/studio/studioSessionCache";
import type {
  ClipCreatePayload,
  ClipUpdatePayload,
  CreateClipMutation,
  UpdateClipMutation,
  DeleteClipMutation,
} from "@/hooks/studioMutationTypes";
import { toast } from "sonner";

type MidiNoteLike = {
  pitch: number;
  start: number;
  duration: number;
  velocity: number;
};

interface UseStudioClipActionsOptions {
  activeSessionId: string | null;
  tracks: SessionTrack[];
  sessionDomainModel: StudioSessionDomainRuntimeState;
  createClip: CreateClipMutation;
  updateClip: UpdateClipMutation;
  deleteClip: DeleteClipMutation;
  history: UndoRedoState;
}

export function useStudioClipActions({
  activeSessionId,
  tracks,
  sessionDomainModel,
  createClip,
  updateClip,
  deleteClip,
  history,
}: UseStudioClipActionsOptions) {
  const { trackIndex } = sessionDomainModel;
  const queryClient = useQueryClient();

  const handleCreateMidiClip = useCallback(async (trackId: string, startBeats: number, durationBeats: number = 4) => {
    if (!activeSessionId) return;
    try {
      await createClip.mutateAsync({
        track_id: trackId,
        name: "MIDI Clip",
        start_beats: startBeats,
        end_beats: startBeats + durationBeats,
        color: tracks.find(t => t.id === trackId)?.color ?? 0,
        is_midi: true,
        midi_data: { notes: [] },
      });
      toast.success("MIDI clip created");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create clip";
      toast.error(`Failed to create clip: ${message}`);
    }
  }, [activeSessionId, createClip, tracks]);

  const handleUpdateMidiNotes = useCallback((clipId: string, notes: MidiNoteLike[]) => {
    const clip = trackIndex.clipById[clipId];
    const prevMidiData = clip ? clip.midi_data : { notes: [] };
    const nextMidiData = withMidiNotesInData(prevMidiData, notes);

    updateSessionClipInCache(queryClient, activeSessionId, clipId, {
      midi_data: nextMidiData,
    });

    history.push({
      label: "Edit MIDI notes",
      undo: () => updateClip.mutate({ clipId, updates: { midi_data: prevMidiData } }),
      redo: () => updateClip.mutate({ clipId, updates: { midi_data: nextMidiData } }),
    });
    updateClip.mutate({ clipId, updates: { midi_data: nextMidiData } });

    if (clip) {
      const aliasSource = clip.alias_of || clipId;
      const linkedClips = trackIndex.allClips
        .filter(
          (candidate) =>
            candidate.id !== clipId &&
          (candidate.id === aliasSource ||
              candidate.alias_of === aliasSource),
        );
      for (const linked of linkedClips) {
        updateClip.mutate({
          clipId: linked.id,
          updates: { midi_data: withMidiNotesInData(linked.midi_data, notes) },
        });
      }
    }
  }, [activeSessionId, history, queryClient, trackIndex, updateClip]);

  const handleCreateLinkedDuplicate = useCallback(async (clipId: string) => {
    if (!activeSessionId) return;
    const clip = trackIndex.clipById[clipId];
    if (!clip || !clip.is_midi) return;
    try {
      const aliasOf = clip.alias_of || clipId;
      const newStart = clip.end_beats;
      const duration = clip.end_beats - clip.start_beats;
      const insertPayload: ClipCreatePayload = {
        track_id: clip.track_id,
        name: `${clip.name} (linked)`,
        start_beats: newStart,
        end_beats: newStart + duration,
        color: clip.color,
        is_midi: true,
        midi_data: clip.midi_data
          ? withMidiNotesInData(clip.midi_data, extractMidiNotesFromData(clip.midi_data))
          : { notes: [] },
        alias_of: aliasOf,
      };
      await createClip.mutateAsync(insertPayload);
      toast.success("Linked duplicate created");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create linked duplicate";
      toast.error(message);
    }
  }, [activeSessionId, createClip, trackIndex]);

  const handleDeleteClip = useCallback((clipId: string) => {
    const clip = trackIndex.clipById[clipId];
    if (!clip) return;

    removeSessionClipFromCache(queryClient, activeSessionId, clipId);
    deleteClip.mutate(clipId);
    toast.success(`Deleted "${clip.name}"`);
  }, [activeSessionId, deleteClip, queryClient, trackIndex]);

  const handleDuplicateClip = useCallback(async (clipId: string) => {
    if (!activeSessionId) return;
    const clip = trackIndex.clipById[clipId];
    if (!clip) return;
    const duration = clip.end_beats - clip.start_beats;
    const newStart = clip.end_beats;
    try {
      const insertPayload: ClipCreatePayload = {
        track_id: clip.track_id,
        name: `${clip.name} (copy)`,
        start_beats: newStart,
        end_beats: newStart + duration,
        color: clip.color,
        is_midi: clip.is_midi,
        midi_data: clip.is_midi
          ? withMidiNotesInData(clip.midi_data, extractMidiNotesFromData(clip.midi_data))
          : clip.midi_data,
        is_muted: clip.is_muted,
        audio_url: clip.audio_url,
        waveform_peaks: clip.waveform_peaks,
      };
      await createClip.mutateAsync(insertPayload);
      toast.success("Clip duplicated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to duplicate clip";
      toast.error(message);
    }
  }, [activeSessionId, createClip, trackIndex]);

  const handleRenameClip = useCallback((clipId: string, name: string) => {
    const clip = trackIndex.clipById[clipId];
    if (!clip) return;
    const prevName = clip.name;
    updateClip.mutate({ clipId, updates: { name } });
    history.push({
      label: `Rename clip "${prevName}" → "${name}"`,
      undo: () => updateClip.mutate({ clipId, updates: { name: prevName } }),
      redo: () => updateClip.mutate({ clipId, updates: { name } }),
    });
  }, [history, trackIndex, updateClip]);

  const handleClipColorChange = useCallback((clipId: string, color: number) => {
    const clip = trackIndex.clipById[clipId];
    if (!clip) return;
    const prevColor = clip.color;
    updateClip.mutate({ clipId, updates: { color } });
    history.push({
      label: "Change clip color",
      undo: () => updateClip.mutate({ clipId, updates: { color: prevColor } }),
      redo: () => updateClip.mutate({ clipId, updates: { color } }),
    });
  }, [history, trackIndex, updateClip]);

  const handleSplitClip = useCallback(async (clipId: string, splitBeat: number) => {
    if (!activeSessionId) return;
    const clip = trackIndex.clipById[clipId];
    if (!clip) return;
    if (splitBeat <= clip.start_beats || splitBeat >= clip.end_beats) {
      return;
    }

    try {
      const leftNotes: MidiNoteLike[] = [];
      const rightNotes: MidiNoteLike[] = [];
      if (clip.is_midi) {
        const midiNotes = extractMidiNotesFromData(clip.midi_data);
        const relSplit = splitBeat - clip.start_beats;
        for (const n of midiNotes) {
          if (n.start + n.duration <= relSplit) {
            leftNotes.push(n);
          } else if (n.start >= relSplit) {
            rightNotes.push({ ...n, start: n.start - relSplit });
          } else {
            leftNotes.push({ ...n, duration: relSplit - n.start });
            rightNotes.push({ ...n, start: 0, duration: n.duration - (relSplit - n.start) });
          }
        }
      }

      let leftPeaks: number[] | null = null;
      let rightPeaks: number[] | null = null;
      if (!clip.is_midi && Array.isArray(clip.waveform_peaks)) {
        const peaks = clip.waveform_peaks as number[];
        const ratio = (splitBeat - clip.start_beats) / (clip.end_beats - clip.start_beats);
        const splitIdx = Math.round(peaks.length * ratio);
        leftPeaks = peaks.slice(0, splitIdx);
        rightPeaks = peaks.slice(splitIdx);
      }

      await updateClip.mutateAsync({ clipId, updates: {
        end_beats: splitBeat,
        ...(clip.is_midi ? { midi_data: withMidiNotesInData(clip.midi_data, leftNotes) } : {}),
        ...(leftPeaks ? { waveform_peaks: leftPeaks } : {}),
      }});

      const insertPayload: ClipCreatePayload = {
        track_id: clip.track_id,
        name: clip.name,
        start_beats: splitBeat,
        end_beats: clip.end_beats,
        color: clip.color,
        is_midi: clip.is_midi,
        is_muted: clip.is_muted,
        midi_data: clip.is_midi ? withMidiNotesInData(clip.midi_data, rightNotes) : null,
        ...(clip.audio_url ? { audio_url: clip.audio_url } : {}),
        ...(rightPeaks ? { waveform_peaks: rightPeaks } : {}),
      };
      await createClip.mutateAsync(insertPayload);
      toast.success("Clip split");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to split clip";
      toast.error(message);
    }
  }, [activeSessionId, createClip, trackIndex, updateClip]);

  const handleMuteClip = useCallback((clipId: string) => {
    const clip = trackIndex.clipById[clipId];
    if (!clip) return;
    const prev = clip.is_muted === true;
    const updates: ClipUpdatePayload = { is_muted: !prev };
    updateClip.mutate({ clipId, updates });
    history.push({
      label: `${!prev ? "Mute" : "Unmute"} clip "${clip.name}"`,
      undo: () => updateClip.mutate({ clipId, updates: { is_muted: prev } }),
      redo: () => updateClip.mutate({ clipId, updates: { is_muted: !prev } }),
    });
  }, [history, trackIndex, updateClip]);

  return {
    handleCreateMidiClip,
    handleUpdateMidiNotes,
    handleCreateLinkedDuplicate,
    handleDeleteClip,
    handleDuplicateClip,
    handleRenameClip,
    handleClipColorChange,
    handleSplitClip,
    handleMuteClip,
  };
}
