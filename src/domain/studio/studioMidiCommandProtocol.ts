import type {
  StudioDeleteMidiNotesCommand,
  StudioInsertMidiNotesCommand,
  StudioReplaceMidiNotesCommand,
  StudioUpdateMidiNotesCommand,
} from "@/types/musicHubCommands";
import type { MidiNote } from "@/components/studio/PianoRollTransforms";

export function extractMidiNotesFromData(midiData: unknown): MidiNote[] {
  if (Array.isArray(midiData)) return midiData as MidiNote[];
  if (midiData && typeof midiData === "object" && "notes" in midiData) {
    const notes = (midiData as { notes?: unknown }).notes;
    if (Array.isArray(notes)) return notes as MidiNote[];
  }
  return [];
}

export function withMidiNotesInData(midiData: unknown, notes: MidiNote[]): unknown {
  if (midiData && typeof midiData === "object" && !Array.isArray(midiData)) {
    return { ...(midiData as Record<string, unknown>), notes };
  }
  return { notes };
}

export function fromReplaceMidiNotesCommand(
  notes: StudioReplaceMidiNotesCommand["payload"]["notes"],
): MidiNote[] {
  return notes.map((note) => ({
    id: note.id ?? crypto.randomUUID(),
    pitch: note.pitch,
    start: note.startBeat,
    duration: note.lengthBeats,
    velocity: note.velocity,
  }));
}

export function insertMidiNotes(
  existingNotes: MidiNote[],
  notes: StudioInsertMidiNotesCommand["payload"]["notes"],
): MidiNote[] {
  return [
    ...existingNotes,
    ...notes.map((note) => ({
      id: note.id ?? crypto.randomUUID(),
      pitch: note.pitch,
      start: note.startBeat,
      duration: note.lengthBeats,
      velocity: note.velocity,
    })),
  ];
}

export function updateMidiNotes(
  existingNotes: MidiNote[],
  notes: StudioUpdateMidiNotesCommand["payload"]["notes"],
): MidiNote[] {
  return existingNotes.map((note) => {
    const patch = notes.find((candidate) => candidate.id === note.id);
    if (!patch) return note;

    return {
      ...note,
      pitch: patch.pitch ?? note.pitch,
      start: patch.startBeat ?? note.start,
      duration: patch.lengthBeats ?? note.duration,
      velocity: patch.velocity ?? note.velocity,
    };
  });
}

export function deleteMidiNotes(
  existingNotes: MidiNote[],
  noteIds: StudioDeleteMidiNotesCommand["payload"]["noteIds"],
): MidiNote[] {
  const ids = new Set(noteIds);
  return existingNotes.filter((note) => !ids.has(note.id));
}
