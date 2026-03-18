import { useMemo } from "react";
import type { MidiNote } from "@/components/studio/PianoRollTransforms";
import type { StudioReplaceMidiNotesCommand } from "@/types/musicHubCommands";
import type { SessionClip, SessionTrack } from "@/types/studio";

interface UseStudioPianoRollViewModelOptions {
  clip?: SessionClip;
  track?: SessionTrack;
  ghostNotes: MidiNote[];
  trackClips: SessionClip[];
  canUseNativeNoteAudition: boolean;
  activeClipId: string | null;
  beatsPerBar: number;
  snapBeats: number;
  currentBeat: number;
  onSelectClip: (clipId: string, trackId: string) => void;
  onResizeClip: (clipId: string, startBeat: number, newEndBeats: number) => void;
  onReplaceMidiNotes: (
    clipId: string,
    notes: StudioReplaceMidiNotesCommand["payload"]["notes"],
  ) => void;
  onUpdateMidiData: (clipId: string, midiData: unknown) => void;
  onClose: () => void;
  onNativeNote?: (trackId: string, pitch: number, velocity: number) => void;
  midiCommandMode?: "replace_only" | "replace_plus_granular";
}

export function useStudioPianoRollViewModel({
  clip,
  track,
  ghostNotes,
  trackClips,
  canUseNativeNoteAudition,
  activeClipId,
  beatsPerBar,
  snapBeats,
  currentBeat,
  onSelectClip,
  onResizeClip,
  onReplaceMidiNotes,
  onUpdateMidiData,
  onClose,
  onNativeNote,
  midiCommandMode = "replace_only",
}: UseStudioPianoRollViewModelOptions) {
  return useMemo(() => {
    if (!clip) return null;

    return {
      clip,
      onNotesChange: (clipId: string, notes: MidiNote[]) => onReplaceMidiNotes(clipId, notes),
      onClipResize: (clipId: string, newEndBeats: number) => onResizeClip(clipId, clip.start_beats, newEndBeats),
      onClose,
      ghostNotes,
      beatsPerBar,
      snapBeats,
      currentBeat,
      allClips: trackClips.length > 1 ? trackClips : undefined,
      activeClipId,
      onSelectClip: (clipId: string) => {
        if (track) onSelectClip(clipId, track.id);
      },
      onMidiDataChange: (clipId: string, midiData: unknown) => onUpdateMidiData(clipId, midiData),
      midiCommandMode,
      onNativeNote:
        canUseNativeNoteAudition && track && onNativeNote
          ? (pitch: number, velocity: number) => onNativeNote(track.id, pitch, velocity)
          : undefined,
    };
  }, [
    activeClipId,
    beatsPerBar,
    canUseNativeNoteAudition,
    clip,
    currentBeat,
    ghostNotes,
    onClose,
    onNativeNote,
    onReplaceMidiNotes,
    onResizeClip,
    onSelectClip,
    onUpdateMidiData,
    midiCommandMode,
    snapBeats,
    track,
    trackClips,
  ]);
}

export type StudioPianoRollViewModelResult = ReturnType<typeof useStudioPianoRollViewModel>;
