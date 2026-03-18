import type { CCPoint } from "@/components/studio/CCLane";
import type { MidiNote } from "@/components/studio/PianoRollTransforms";

/* ── Constants ── */
export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export const DEFAULT_KEY_HEIGHT = 18;
export const DEFAULT_PX_PER_BEAT = 48;
export const DEFAULT_VELOCITY = 100;
export const MIN_PITCH = 21;
export const MAX_PITCH = 108;
export const PIANO_WIDTH = 52;
export const RULER_HEIGHT = 24;
export const VELOCITY_LANE_HEIGHT = 60;
export const CC_LANE_HEIGHT = 50;
export const DRAG_THRESHOLD = 3;
export const MIN_NOTE_WIDTH = 6;
export const CLIP_EXTEND_HANDLE_W = 8;

export const MIN_PX_PER_BEAT = 12;
export const MAX_PX_PER_BEAT = 200;
export const MIN_KEY_HEIGHT = 8;
export const MAX_KEY_HEIGHT = 32;

/* ── Scales ── */
export const SCALES: Record<string, number[]> = {
  "Chromatic": [0,1,2,3,4,5,6,7,8,9,10,11],
  "Major": [0,2,4,5,7,9,11],
  "Minor": [0,2,3,5,7,8,10],
  "Dorian": [0,2,3,5,7,9,10],
  "Mixolydian": [0,2,4,5,7,9,10],
  "Pentatonic": [0,2,4,7,9],
  "Blues": [0,3,5,6,7,10],
  "Harmonic Minor": [0,2,3,5,7,8,11],
};

export const ROOT_NOTES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

export const SNAP_OPTIONS: { label: string; value: number }[] = [
  { label: "1/1", value: 4 },
  { label: "1/2", value: 2 },
  { label: "1/4", value: 1 },
  { label: "1/8", value: 0.5 },
  { label: "1/16", value: 0.25 },
  { label: "1/32", value: 0.125 },
  { label: "1/4T", value: 2/3 },
  { label: "1/8T", value: 1/3 },
  { label: "1/16T", value: 1/6 },
];

export const NOTE_LENGTH_OPTIONS: { label: string; value: number }[] = [
  { label: "Snap", value: 0 },
  { label: "1/1", value: 4 },
  { label: "1/2", value: 2 },
  { label: "1/4", value: 1 },
  { label: "1/8", value: 0.5 },
  { label: "1/16", value: 0.25 },
  { label: "1/32", value: 0.125 },
];

export type CCLaneType = "none" | "cc1" | "cc11" | "pitchBend";

export const CC_LANE_OPTIONS: { label: string; value: CCLaneType }[] = [
  { label: "None", value: "none" },
  { label: "CC1 Mod", value: "cc1" },
  { label: "CC11 Expr", value: "cc11" },
  { label: "Pitch Bend", value: "pitchBend" },
];

export type Tool = "select" | "draw" | "paint" | "erase";
export type DragMode = "none" | "move" | "resize" | "marquee" | "velocity" | "paint" | "clip-extend";
export type ViewMode = "pianoroll" | "stepseq";

/* ── Pure helpers ── */
export function noteName(pitch: number): string {
  return `${NOTE_NAMES[pitch % 12]}${Math.floor(pitch / 12) - 2}`;
}

export function isBlackKey(pitch: number): boolean {
  const n = pitch % 12;
  return n === 1 || n === 3 || n === 6 || n === 8 || n === 10;
}

export function isInScale(pitch: number, root: number, scaleIntervals: number[]): boolean {
  const relative = ((pitch % 12) - root + 12) % 12;
  return scaleIntervals.includes(relative);
}

export function formatBeatPosition(beat: number, beatsPerBar: number): string {
  const bar = Math.floor(beat / beatsPerBar) + 1;
  const beatInBar = Math.floor(beat % beatsPerBar) + 1;
  const sub = Math.round((beat % 1) * 4) + 1;
  return `${bar}.${beatInBar}.${sub}`;
}

export function parseCCData(midiData: unknown): { cc: Record<string, CCPoint[]>; pitchBend: CCPoint[] } {
  if (!midiData || typeof midiData !== "object" || Array.isArray(midiData)) {
    return { cc: {}, pitchBend: [] };
  }
  const data = midiData as {
    cc?: Record<string, CCPoint[]>;
    pitchBend?: CCPoint[];
  };
  return {
    cc: data.cc || {},
    pitchBend: data.pitchBend || [],
  };
}

export function buildMidiData(notes: MidiNote[], cc: Record<string, CCPoint[]>, pitchBend: CCPoint[]): unknown {
  const hasCC = Object.keys(cc).some(k => cc[k].length > 0);
  const hasPB = pitchBend.length > 0;
  if (!hasCC && !hasPB) return notes;
  return { notes, cc, pitchBend };
}
