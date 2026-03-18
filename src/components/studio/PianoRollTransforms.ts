/**
 * Pure transform functions for MIDI notes in the Piano Roll.
 * Each function takes a set of notes and returns a new array.
 */

export interface MidiNote {
  id: string;
  pitch: number;
  start: number;
  duration: number;
  velocity: number;
}

/* ── Quantize with strength ── */
export function quantizeNotes(
  notes: MidiNote[],
  selectedIds: Set<string>,
  snapBeats: number,
  strength: number = 1 // 0–1
): MidiNote[] {
  return notes.map((n) => {
    if (!selectedIds.has(n.id)) return n;
    const snapped = Math.round(n.start / snapBeats) * snapBeats;
    const newStart = n.start + (snapped - n.start) * strength;
    return { ...n, start: Math.max(0, newStart) };
  });
}

/* ── Swing quantize ── */
export function swingQuantize(
  notes: MidiNote[],
  selectedIds: Set<string>,
  snapBeats: number,
  swingAmount: number // 0–100
): MidiNote[] {
  const swingRatio = swingAmount / 100;
  const swingOffset = snapBeats * 0.5 * swingRatio; // max swing is half a grid step
  return notes.map((n) => {
    if (!selectedIds.has(n.id)) return n;
    // Quantize to grid first
    const gridPos = Math.round(n.start / snapBeats);
    let snapped = gridPos * snapBeats;
    // Apply swing to even positions (0-indexed: position 1, 3, 5... are "offbeats")
    if (gridPos % 2 === 1) {
      snapped += swingOffset;
    }
    return { ...n, start: Math.max(0, snapped) };
  });
}

/* ── Legato ── */
export function legatoNotes(
  notes: MidiNote[],
  selectedIds: Set<string>,
  mode: "same-pitch" | "any" = "any"
): MidiNote[] {
  const selected = notes.filter((n) => selectedIds.has(n.id));
  if (selected.length < 2) return notes;

  const sorted = [...selected].sort((a, b) => a.start - b.start || a.pitch - b.pitch);

  const newDurations = new Map<string, number>();
  for (let i = 0; i < sorted.length - 1; i++) {
    const curr = sorted[i];
    // Find the next note (same pitch or any)
    let next: MidiNote | undefined;
    for (let j = i + 1; j < sorted.length; j++) {
      if (mode === "any" || sorted[j].pitch === curr.pitch) {
        next = sorted[j];
        break;
      }
    }
    if (next && next.start > curr.start) {
      newDurations.set(curr.id, next.start - curr.start);
    }
  }

  return notes.map((n) => {
    const dur = newDurations.get(n.id);
    return dur !== undefined ? { ...n, duration: dur } : n;
  });
}

/* ── Strum ── */
export function strumNotes(
  notes: MidiNote[],
  selectedIds: Set<string>,
  offsetPerStep: number = 0.05, // beats per step
  direction: "up" | "down" = "up" // up = low pitch first
): MidiNote[] {
  const selected = notes.filter((n) => selectedIds.has(n.id));
  if (selected.length < 2) return notes;

  const sorted = [...selected].sort((a, b) =>
    direction === "up" ? a.pitch - b.pitch : b.pitch - a.pitch
  );

  const offsets = new Map<string, number>();
  sorted.forEach((n, i) => offsets.set(n.id, i * offsetPerStep));

  return notes.map((n) => {
    const offset = offsets.get(n.id);
    return offset !== undefined ? { ...n, start: n.start + offset } : n;
  });
}

/* ── Flam ── */
export function flamNotes(
  notes: MidiNote[],
  selectedIds: Set<string>,
  offset: number = 0.0625, // beats before main note
  velocityRatio: number = 0.5 // grace note velocity multiplier
): MidiNote[] {
  const result: MidiNote[] = [];
  for (const n of notes) {
    result.push(n);
    if (selectedIds.has(n.id)) {
      result.push({
        id: crypto.randomUUID(),
        pitch: n.pitch,
        start: Math.max(0, n.start - offset),
        duration: offset,
        velocity: Math.max(1, Math.round(n.velocity * velocityRatio)),
      });
    }
  }
  return result;
}

/* ── Reverse ── */
export function reverseNotes(
  notes: MidiNote[],
  selectedIds: Set<string>
): MidiNote[] {
  const selected = notes.filter((n) => selectedIds.has(n.id));
  if (selected.length < 2) return notes;

  const minStart = Math.min(...selected.map((n) => n.start));
  const maxEnd = Math.max(...selected.map((n) => n.start + n.duration));
  const span = maxEnd - minStart;

  const reversed = new Map<string, number>();
  for (const n of selected) {
    // Mirror: new start = minStart + (span - (n.start - minStart) - n.duration)
    reversed.set(n.id, minStart + span - (n.start - minStart) - n.duration);
  }

  return notes.map((n) => {
    const newStart = reversed.get(n.id);
    return newStart !== undefined ? { ...n, start: Math.max(0, newStart) } : n;
  });
}

/* ── Invert ── */
export function invertNotes(
  notes: MidiNote[],
  selectedIds: Set<string>
): MidiNote[] {
  const selected = notes.filter((n) => selectedIds.has(n.id));
  if (selected.length < 2) return notes;

  const pitches = selected.map((n) => n.pitch);
  const centerPitch = (Math.min(...pitches) + Math.max(...pitches)) / 2;

  return notes.map((n) => {
    if (!selectedIds.has(n.id)) return n;
    const mirrored = Math.round(2 * centerPitch - n.pitch);
    return { ...n, pitch: Math.max(0, Math.min(127, mirrored)) };
  });
}

/* ── Humanize ── */
export function humanizeNotes(
  notes: MidiNote[],
  selectedIds: Set<string>,
  timingRange: number = 0.03, // beats
  velocityRange: number = 10 // ±velocity units
): MidiNote[] {
  return notes.map((n) => {
    if (!selectedIds.has(n.id)) return n;
    const timeShift = (Math.random() - 0.5) * 2 * timingRange;
    const velShift = Math.round((Math.random() - 0.5) * 2 * velocityRange);
    return {
      ...n,
      start: Math.max(0, n.start + timeShift),
      velocity: Math.max(1, Math.min(127, n.velocity + velShift)),
    };
  });
}

/* ── Velocity color helpers ── */
export type NoteColorMode = "default" | "velocity" | "pitch";

export function noteColor(
  note: MidiNote,
  mode: NoteColorMode,
  isSelected: boolean
): string {
  if (mode === "default") {
    const alpha = 0.4 + (note.velocity / 127) * 0.55;
    return `hsl(var(--primary) / ${alpha})`;
  }
  if (mode === "velocity") {
    // Blue (low) → Green (mid) → Orange/Red (high)
    const t = note.velocity / 127;
    const hue = 240 - t * 200; // 240 (blue) → 40 (orange)
    const sat = 70 + t * 20;
    const light = 45 + t * 15;
    const alpha = isSelected ? 0.9 : 0.75;
    return `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
  }
  // pitch mode
  const hue = ((note.pitch - 21) / 87) * 300; // spread across hue wheel
  const alpha = isSelected ? 0.85 : 0.7;
  return `hsla(${hue}, 65%, 55%, ${alpha})`;
}

/* ── Transpose ── */
export function transposeNotes(
  notes: MidiNote[],
  selectedIds: Set<string>,
  semitones: number
): MidiNote[] {
  return notes.map((n) => {
    if (!selectedIds.has(n.id)) return n;
    return { ...n, pitch: Math.max(0, Math.min(127, n.pitch + semitones)) };
  });
}

/* ── Scale lock: snap pitch to nearest in-scale pitch ── */
export function snapPitchToScale(
  pitch: number,
  root: number,
  scaleIntervals: number[]
): number {
  if (scaleIntervals.length === 12) return pitch; // chromatic
  // Try current pitch, then ±1, ±2, etc.
  for (let offset = 0; offset <= 6; offset++) {
    for (const dir of [0, 1, -1]) {
      const candidate = pitch + dir * offset;
      if (candidate < 0 || candidate > 127) continue;
      const relative = ((candidate % 12) - root + 12) % 12;
      if (scaleIntervals.includes(relative)) return candidate;
    }
  }
  return pitch;
}

/* ── Fold keyboard helpers ── */
export function getVisiblePitches(
  minPitch: number,
  maxPitch: number,
  root: number,
  scaleIntervals: number[],
  fold: boolean
): number[] {
  const pitches: number[] = [];
  for (let p = maxPitch; p >= minPitch; p--) {
    if (!fold || scaleIntervals.length === 12) {
      pitches.push(p);
    } else {
      const relative = ((p % 12) - root + 12) % 12;
      if (scaleIntervals.includes(relative)) {
        pitches.push(p);
      }
    }
  }
  return pitches;
}
