import { useMemo } from "react";
import type { MidiNote } from "@/components/studio/PianoRollTransforms";

const CHORD_PATTERNS: [string, number[]][] = [
  // Triads
  ["maj", [0, 4, 7]],
  ["min", [0, 3, 7]],
  ["dim", [0, 3, 6]],
  ["aug", [0, 4, 8]],
  ["sus2", [0, 2, 7]],
  ["sus4", [0, 5, 7]],
  // Seventh chords
  ["maj7", [0, 4, 7, 11]],
  ["7", [0, 4, 7, 10]],
  ["m7", [0, 3, 7, 10]],
  ["m(maj7)", [0, 3, 7, 11]],
  ["dim7", [0, 3, 6, 9]],
  ["m7b5", [0, 3, 6, 10]],
  ["add9", [0, 4, 7, 14]],
];

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

interface DetectedChord {
  name: string;
  beat: number;
}

function detectChordAtBeat(notes: MidiNote[], beat: number, snapBeats: number): string | null {
  // Gather pitch classes of notes sounding at this beat
  const pitchClasses = new Set<number>();
  for (const n of notes) {
    if (n.start <= beat + 0.01 && n.start + n.duration > beat) {
      pitchClasses.add(n.pitch % 12);
    }
  }
  if (pitchClasses.size < 3) return null;

  const pcs = Array.from(pitchClasses).sort((a, b) => a - b);

  // Try each pitch class as root
  for (const root of pcs) {
    const intervals = pcs.map((p) => (p - root + 12) % 12).sort((a, b) => a - b);
    for (const [name, pattern] of CHORD_PATTERNS) {
      if (pattern.length > intervals.length) continue;
      // Check if pattern is a subset of intervals
      const patternNorm = pattern.map(p => p % 12);
      if (patternNorm.every((p) => intervals.includes(p))) {
        return `${NOTE_NAMES[root]}${name}`;
      }
    }
  }
  return null;
}

interface ChordDetectorProps {
  notes: MidiNote[];
  clipDuration: number;
  pxPerBeat: number;
  snapBeats: number;
  beatsPerBar: number;
  width: number;
}

export function ChordDetector({ notes, clipDuration, pxPerBeat, snapBeats, beatsPerBar, width }: ChordDetectorProps) {
  const chords = useMemo(() => {
    const result: DetectedChord[] = [];
    const step = Math.max(snapBeats, 0.25);
    let lastChord = "";
    for (let beat = 0; beat < clipDuration; beat += step) {
      const chord = detectChordAtBeat(notes, beat, step);
      if (chord && chord !== lastChord) {
        result.push({ name: chord, beat });
        lastChord = chord;
      } else if (!chord) {
        lastChord = "";
      }
    }
    return result;
  }, [notes, clipDuration, snapBeats]);

  if (chords.length === 0) return null;

  return (
    <div className="relative shrink-0" style={{ height: 18, width, backgroundColor: "hsl(var(--muted) / 0.55)", borderBottom: "1px solid hsl(var(--foreground) / 0.06)" }}>
      {chords.map((chord, i) => {
        const x = chord.beat * pxPerBeat;
        const nextX = i < chords.length - 1 ? chords[i + 1].beat * pxPerBeat : width;
        return (
          <div
            key={`${chord.beat}-${chord.name}`}
            className="absolute top-0 h-full flex items-center px-1 overflow-hidden"
            style={{ left: x, width: Math.max(nextX - x, 20) }}
          >
            <span className="text-[7px] font-mono font-semibold text-primary/70 truncate">{chord.name}</span>
          </div>
        );
      })}
    </div>
  );
}
