import { NOTE_NAMES, SCALES } from "@/components/studio/pianoroll/constants";
import { CHORD_TYPES } from "@/components/studio/ChordPalette";

/* ── Interval Names ── */
const INTERVAL_NAMES: Record<number, string> = {
  0: "Unison",
  1: "Minor 2nd",
  2: "Major 2nd",
  3: "Minor 3rd",
  4: "Major 3rd",
  5: "Perfect 4th",
  6: "Tritone",
  7: "Perfect 5th",
  8: "Minor 6th",
  9: "Major 6th",
  10: "Minor 7th",
  11: "Major 7th",
  12: "Octave",
};

const INTERVAL_QUALITIES: Record<number, "perfect" | "consonant" | "dissonant"> = {
  0: "perfect",
  1: "dissonant",
  2: "consonant",
  3: "consonant",
  4: "consonant",
  5: "perfect",
  6: "dissonant",
  7: "perfect",
  8: "consonant",
  9: "consonant",
  10: "dissonant",
  11: "dissonant",
};

export function getIntervalName(semitones: number): string {
  const normalized = ((semitones % 12) + 12) % 12;
  return INTERVAL_NAMES[normalized] ?? `${normalized} semitones`;
}

export function getIntervalQuality(semitones: number): "perfect" | "consonant" | "dissonant" {
  const normalized = ((semitones % 12) + 12) % 12;
  return INTERVAL_QUALITIES[normalized] ?? "dissonant";
}

/* ── Chord Detection ── */

// Extended chord patterns for identification (beyond ChordPalette)
const CHORD_PATTERNS: { name: string; intervals: number[] }[] = [
  ...CHORD_TYPES,
  { name: "dim7", intervals: [0, 3, 6, 9] },
  { name: "m7b5", intervals: [0, 3, 6, 10] },
  { name: "9", intervals: [0, 4, 7, 10, 14] },
  { name: "m9", intervals: [0, 3, 7, 10, 14] },
  { name: "6", intervals: [0, 4, 7, 9] },
  { name: "m6", intervals: [0, 3, 7, 9] },
];

export function identifyChord(pitchClasses: number[]): { root: string; name: string; inversion: number } | null {
  if (pitchClasses.length < 2) return null;
  const unique = [...new Set(pitchClasses.map((p) => ((p % 12) + 12) % 12))].sort((a, b) => a - b);
  if (unique.length < 2) return null;

  for (let rotation = 0; rotation < unique.length; rotation++) {
    const root = unique[rotation];
    const intervals = unique.map((n) => ((n - root + 12) % 12)).sort((a, b) => a - b);

    for (const pattern of CHORD_PATTERNS) {
      const patternNorm = pattern.intervals.map((i) => i % 12).sort((a, b) => a - b);
      const intervalsSet = new Set(intervals);
      const patternSet = new Set(patternNorm);
      if (patternSet.size === intervalsSet.size && [...patternSet].every((v) => intervalsSet.has(v))) {
        return {
          root: NOTE_NAMES[root],
          name: `${NOTE_NAMES[root]}${pattern.name === "Maj" ? "" : pattern.name}`,
          inversion: rotation,
        };
      }
    }
  }
  return null;
}

/* ── Scale Matching ── */
export interface ScaleMatch {
  root: string;
  rootIndex: number;
  scaleName: string;
  matchCount: number;
  totalNotes: number;
  percentage: number;
}

export function findMatchingScales(pitchClasses: number[]): ScaleMatch[] {
  const unique = [...new Set(pitchClasses.map((p) => ((p % 12) + 12) % 12))];
  if (unique.length === 0) return [];

  const results: ScaleMatch[] = [];

  for (let root = 0; root < 12; root++) {
    for (const [scaleName, intervals] of Object.entries(SCALES)) {
      if (scaleName === "Chromatic") continue;
      const scaleNotes = new Set(intervals.map((i) => (i + root) % 12));
      const matchCount = unique.filter((n) => scaleNotes.has(n)).length;
      if (matchCount === unique.length) {
        results.push({
          root: NOTE_NAMES[root],
          rootIndex: root,
          scaleName,
          matchCount,
          totalNotes: intervals.length,
          percentage: Math.round((matchCount / unique.length) * 100),
        });
      }
    }
  }

  return results.sort((a, b) => a.totalNotes - b.totalNotes);
}

/* ── Key Suggestion ── */
export interface KeySuggestion {
  root: string;
  rootIndex: number;
  scaleName: string;
  confidence: number;
}

export function suggestKey(pitchClasses: number[]): KeySuggestion[] {
  const unique = [...new Set(pitchClasses.map((p) => ((p % 12) + 12) % 12))];
  if (unique.length === 0) return [];

  const candidates: KeySuggestion[] = [];

  for (let root = 0; root < 12; root++) {
    for (const scaleName of ["Major", "Minor"]) {
      const intervals = SCALES[scaleName];
      const scaleNotes = new Set(intervals.map((i) => (i + root) % 12));
      const matchCount = unique.filter((n) => scaleNotes.has(n)).length;
      const confidence = Math.round((matchCount / unique.length) * 100);
      if (confidence >= 60) {
        candidates.push({ root: NOTE_NAMES[root], rootIndex: root, scaleName, confidence });
      }
    }
  }

  return candidates.sort((a, b) => b.confidence - a.confidence);
}

/* ── Diatonic Chords ── */
const ROMAN_NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII"];

export interface DiatonicChord {
  degree: number;
  roman: string;
  root: string;
  rootIndex: number;
  quality: "major" | "minor" | "diminished" | "augmented";
  notes: number[];
}

export function getDiatonicChords(root: number, scaleIntervals: number[]): DiatonicChord[] {
  const chords: DiatonicChord[] = [];

  for (let i = 0; i < scaleIntervals.length; i++) {
    const chordRoot = (root + scaleIntervals[i]) % 12;
    // Stack thirds: 1st, 3rd, 5th scale degrees from this position
    const third = scaleIntervals[(i + 2) % scaleIntervals.length] + (i + 2 >= scaleIntervals.length ? 12 : 0);
    const fifth = scaleIntervals[(i + 4) % scaleIntervals.length] + (i + 4 >= scaleIntervals.length ? 12 : 0);

    const interval3 = ((third - scaleIntervals[i]) + 12) % 12;
    const interval5 = ((fifth - scaleIntervals[i]) + 12) % 12;

    let quality: DiatonicChord["quality"] = "major";
    if (interval3 === 3 && interval5 === 7) quality = "minor";
    else if (interval3 === 3 && interval5 === 6) quality = "diminished";
    else if (interval3 === 4 && interval5 === 8) quality = "augmented";
    else if (interval3 === 4 && interval5 === 7) quality = "major";

    let roman = ROMAN_NUMERALS[i] ?? `${i + 1}`;
    if (quality === "minor") roman = roman.toLowerCase();
    if (quality === "diminished") roman = roman.toLowerCase() + "°";
    if (quality === "augmented") roman = roman + "+";

    chords.push({
      degree: i + 1,
      roman,
      root: NOTE_NAMES[chordRoot],
      rootIndex: chordRoot,
      quality,
      notes: [chordRoot, (chordRoot + interval3) % 12, (chordRoot + interval5) % 12],
    });
  }

  return chords;
}

export function getScaleDegreeLabel(degree: number, quality: DiatonicChord["quality"]): string {
  let roman = ROMAN_NUMERALS[degree - 1] ?? `${degree}`;
  if (quality === "minor") roman = roman.toLowerCase();
  if (quality === "diminished") roman = roman.toLowerCase() + "°";
  if (quality === "augmented") roman = roman + "+";
  return roman;
}

/* ── Mode helpers ── */
export const MODE_NAMES: Record<string, string[]> = {
  Major: ["Ionian", "Dorian", "Phrygian", "Lydian", "Mixolydian", "Aeolian", "Locrian"],
};

export function getModeIntervals(parentScaleIntervals: number[], modeIndex: number): number[] {
  const len = parentScaleIntervals.length;
  const offset = parentScaleIntervals[modeIndex];
  return parentScaleIntervals.map((_, i) => {
    const raw = parentScaleIntervals[(modeIndex + i) % len] - offset;
    return ((raw % 12) + 12) % 12;
  });
}

/* ── Common progressions ── */
export const COMMON_PROGRESSIONS: { name: string; numerals: string[]; degrees: number[] }[] = [
  { name: "I – IV – V – I", numerals: ["I", "IV", "V", "I"], degrees: [0, 3, 4, 0] },
  { name: "I – V – vi – IV", numerals: ["I", "V", "vi", "IV"], degrees: [0, 4, 5, 3] },
  { name: "ii – V – I", numerals: ["ii", "V", "I"], degrees: [1, 4, 0] },
  { name: "I – vi – IV – V", numerals: ["I", "vi", "IV", "V"], degrees: [0, 5, 3, 4] },
  { name: "vi – IV – I – V", numerals: ["vi", "IV", "I", "V"], degrees: [5, 3, 0, 4] },
  { name: "I – IV – vi – V", numerals: ["I", "IV", "vi", "V"], degrees: [0, 3, 5, 4] },
  { name: "I – iii – IV – V", numerals: ["I", "iii", "IV", "V"], degrees: [0, 2, 3, 4] },
  { name: "I – V – IV – V", numerals: ["I", "V", "IV", "V"], degrees: [0, 4, 3, 4] },
];

/* ── Transpose helper ── */
export function transposeNotes(pitches: number[], semitones: number): number[] {
  return pitches.map((p) => p + semitones);
}

/* ── Interval pattern helper ── */
export function getIntervalPattern(scaleIntervals: number[]): string[] {
  const labels: string[] = [];
  for (let i = 0; i < scaleIntervals.length; i++) {
    const next = i + 1 < scaleIntervals.length ? scaleIntervals[i + 1] : 12;
    const gap = next - scaleIntervals[i];
    if (gap === 2) labels.push("W");
    else if (gap === 1) labels.push("H");
    else if (gap === 3) labels.push("W+H");
    else labels.push(`${gap}`);
  }
  return labels;
}

/* ── Re-exports for convenience ── */
export { NOTE_NAMES, SCALES } from "@/components/studio/pianoroll/constants";
