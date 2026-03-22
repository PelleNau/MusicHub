import { useCallback, useMemo, useState } from "react";

import {
  humanizeNotes,
  invertNotes,
  legatoNotes,
  quantizeNotes,
  reverseNotes,
  strumNotes,
  transposeNotes,
  type MidiNote,
} from "@/components/studio/PianoRollTransforms";
import type { SessionClip } from "@/types/studio";
import type { HumanizeOptions } from "@/components/studio/HumanizeDialog";
import type { QuantizeOptions } from "@/components/studio/QuantizeDialog";
import type { StrummingOptions } from "@/components/studio/StrummingDialog";
import type { TransposeOptions } from "@/components/studio/TransposeDialog";
import type { ArpeggiatorOptions, ArpeggiatorPattern, ArpeggiatorScope } from "@/components/studio/ArpeggiatorDialog";

interface UsePianoRollOperationCoordinatorArgs {
  clip: SessionClip;
  notes: MidiNote[];
  selectedIds: Set<string>;
  setSelectedIds: (ids: Set<string>) => void;
  beatsPerBar: number;
  snapBeats: number;
  currentBeat?: number;
  transposeOpen: boolean;
  setTransposeOpen: (open: boolean) => void;
  onNotesChange: (clipId: string, notes: MidiNote[]) => void;
}

function getTargetIds(notes: MidiNote[], selectedIds: Set<string>) {
  return selectedIds.size > 0 ? new Set(selectedIds) : new Set(notes.map((note) => note.id));
}

function getTargetNotes(notes: MidiNote[], selectedIds: Set<string>) {
  const targetIds = getTargetIds(notes, selectedIds);
  return notes.filter((note) => targetIds.has(note.id));
}

function clampVelocity(value: number) {
  return Math.max(1, Math.min(127, Math.round(value)));
}

function quantizeEndTimes(notes: MidiNote[], selectedIds: Set<string>, snapSize: number, strength: number) {
  return notes.map((note) => {
    if (!selectedIds.has(note.id)) return note;
    const noteEnd = note.start + note.duration;
    const snappedEnd = Math.round(noteEnd / snapSize) * snapSize;
    const nextEnd = noteEnd + (snappedEnd - noteEnd) * strength;
    return { ...note, duration: Math.max(snapSize / 4, nextEnd - note.start) };
  });
}

function splitNotesAtPositions(notes: MidiNote[], targetIds: Set<string>, positions: number[]) {
  const next: MidiNote[] = [];

  for (const note of notes) {
    if (!targetIds.has(note.id)) {
      next.push(note);
      continue;
    }

    const noteStart = note.start;
    const noteEnd = note.start + note.duration;
    const cuts = positions.filter((position) => position > noteStart && position < noteEnd).sort((a, b) => a - b);

    if (cuts.length === 0) {
      next.push(note);
      continue;
    }

    let segmentStart = noteStart;
    cuts.forEach((cut, index) => {
      next.push({
        ...note,
        id: index === 0 ? note.id : crypto.randomUUID(),
        start: segmentStart,
        duration: cut - segmentStart,
      });
      segmentStart = cut;
    });

    next.push({
      ...note,
      id: crypto.randomUUID(),
      start: segmentStart,
      duration: noteEnd - segmentStart,
    });
  }

  return next;
}

function joinConsecutiveNotes(notes: MidiNote[], targetIds: Set<string>) {
  const untouched = notes.filter((note) => !targetIds.has(note.id));
  const selected = notes
    .filter((note) => targetIds.has(note.id))
    .sort((a, b) => a.pitch - b.pitch || a.start - b.start);

  if (selected.length < 2) return notes;

  const merged: MidiNote[] = [];
  let current = { ...selected[0] };

  for (let index = 1; index < selected.length; index += 1) {
    const next = selected[index];
    const currentEnd = current.start + current.duration;
    const contiguous = next.pitch === current.pitch && Math.abs(next.start - currentEnd) < 0.0001;

    if (contiguous) {
      current.duration = next.start + next.duration - current.start;
      continue;
    }

    merged.push(current);
    current = { ...next };
  }

  merged.push(current);
  return [...untouched, ...merged].sort((a, b) => a.start - b.start || a.pitch - b.pitch);
}

function uniquePitchesInOrder(pitches: number[]) {
  const seen = new Set<number>();
  const result: number[] = [];

  for (const pitch of pitches) {
    if (seen.has(pitch)) continue;
    seen.add(pitch);
    result.push(pitch);
  }

  return result;
}

function buildPatternSequence(pitches: number[], pattern: ArpeggiatorPattern) {
  if (pitches.length === 0) return [];

  switch (pattern) {
    case "down":
      return [...pitches].reverse();
    case "upDown":
      return [...pitches, ...pitches.slice(1, -1).reverse()];
    case "downUp":
      return [...pitches].reverse().concat(pitches.slice(1, -1));
    case "upDownInclusive":
      return [...pitches, ...pitches.slice().reverse()];
    case "downUpInclusive":
      return [...pitches].reverse().concat(pitches);
    case "random":
      return [...pitches].sort(() => Math.random() - 0.5);
    case "asPlayed":
      return [...pitches];
    case "up":
    default:
      return [...pitches].sort((a, b) => a - b);
  }
}

function groupNotesForArpeggiator(notes: MidiNote[], scope: ArpeggiatorScope) {
  const sorted = [...notes].sort((a, b) => a.start - b.start || a.pitch - b.pitch);
  if (sorted.length === 0) return [];
  if (scope === "wholeSelection") return [sorted];

  const groups: MidiNote[][] = [];
  const startTolerance = 0.01;

  for (const note of sorted) {
    const currentGroup = groups.at(-1);
    if (!currentGroup) {
      groups.push([note]);
      continue;
    }

    const referenceStart = currentGroup[0].start;
    if (Math.abs(note.start - referenceStart) <= startTolerance) {
      currentGroup.push(note);
      continue;
    }

    groups.push([note]);
  }

  return groups;
}

export function usePianoRollOperationCoordinator({
  clip,
  notes,
  selectedIds,
  setSelectedIds,
  beatsPerBar,
  snapBeats,
  currentBeat,
  transposeOpen,
  setTransposeOpen,
  onNotesChange,
}: UsePianoRollOperationCoordinatorArgs) {
  const [quantizeOpen, setQuantizeOpen] = useState(false);
  const [humanizeOpen, setHumanizeOpen] = useState(false);
  const [strummingOpen, setStrummingOpen] = useState(false);
  const [chordToolsOpen, setChordToolsOpen] = useState(false);
  const [arpeggiatorOpen, setArpeggiatorOpen] = useState(false);

  const targetIds = useMemo(() => getTargetIds(notes, selectedIds), [notes, selectedIds]);
  const targetNotes = useMemo(() => getTargetNotes(notes, selectedIds), [notes, selectedIds]);
  const playheadPosition = Math.max(0, (currentBeat ?? clip.start_beats) - clip.start_beats);

  const replaceNotes = useCallback((updatedNotes: MidiNote[]) => {
    onNotesChange(clip.id, updatedNotes);
  }, [clip.id, onNotesChange]);

  const applyDirectTransform = useCallback((transform: (allNotes: MidiNote[], ids: Set<string>) => MidiNote[]) => {
    if (targetIds.size === 0) return;
    replaceNotes(transform(notes, targetIds));
  }, [notes, replaceNotes, targetIds]);

  const applyQuantize = useCallback((options: QuantizeOptions) => {
    if (targetIds.size === 0) return;

    const snapSize = 4 / options.division;
    let updated = options.quantizeStart
      ? quantizeNotes(notes, targetIds, snapSize, options.strength / 100)
      : notes;

    if (options.quantizeEnd) {
      updated = quantizeEndTimes(updated, targetIds, snapSize, options.strength / 100);
    }

    replaceNotes(updated);
  }, [notes, replaceNotes, targetIds]);

  const applyHumanize = useCallback((options: HumanizeOptions) => {
    if (targetIds.size === 0) return;

    const intensity = options.strength / 100;
    const timingRangeInBeats = (options.timing / 480) * intensity;
    const velocityRange = options.velocity * intensity;
    const durationRange = (options.duration / 100) * intensity;

    const updated = humanizeNotes(notes, targetIds, timingRangeInBeats, velocityRange).map((note) => {
      if (!targetIds.has(note.id)) return note;
      const durationShift = (Math.random() - 0.5) * 2 * durationRange;
      return {
        ...note,
        duration: Math.max(snapBeats / 4, note.duration * (1 + durationShift)),
      };
    });

    replaceNotes(updated);
  }, [notes, replaceNotes, snapBeats, targetIds]);

  const applyTranspose = useCallback((options: TransposeOptions) => {
    if (targetIds.size === 0 || options.semitones === 0) return;

    const updated = notes.flatMap((note) => {
      if (!targetIds.has(note.id)) return [note];
      const nextPitch = note.pitch + options.semitones;
      if (options.clampToRange) {
        return [{ ...note, pitch: Math.max(0, Math.min(127, nextPitch)) }];
      }
      return nextPitch < 0 || nextPitch > 127 ? [note] : [{ ...note, pitch: nextPitch }];
    });

    replaceNotes(updated);
  }, [notes, replaceNotes, targetIds]);

  const applyStrumming = useCallback((options: StrummingOptions) => {
    if (targetIds.size < 2) return;

    const offsetPerStep = Math.max(0.005, options.speed / 500);
    let updated = strumNotes(notes, targetIds, offsetPerStep, options.direction);

    if (options.randomness > 0) {
      const randomnessScale = offsetPerStep * (options.randomness / 100);
      updated = updated.map((note) => {
        if (!targetIds.has(note.id)) return note;
        return {
          ...note,
          start: Math.max(0, note.start + (Math.random() - 0.5) * 2 * randomnessScale),
        };
      });
    }

    replaceNotes(updated);
  }, [notes, replaceNotes, targetIds]);

  const applyChordTools = useCallback((updatedNotes: MidiNote[]) => {
    const previousIds = new Set(notes.map((note) => note.id));
    const generatedIds = updatedNotes
      .filter((note) => !previousIds.has(note.id))
      .map((note) => note.id);

    replaceNotes(updatedNotes);

    if (generatedIds.length > 0) {
      setSelectedIds(new Set(generatedIds));
      return;
    }

    const retainedTargets = [...targetIds].filter((id) => updatedNotes.some((note) => note.id === id));
    setSelectedIds(new Set(retainedTargets));
  }, [notes, replaceNotes, setSelectedIds, targetIds]);

  const applyArpeggiator = useCallback((options: ArpeggiatorOptions) => {
    if (targetNotes.length < 2) return;
    const generated = groupNotesForArpeggiator(targetNotes, options.scope).flatMap((group) => {
      if (group.length === 0) return [];

      const notesByPlayback = [...group].sort((a, b) => a.start - b.start || a.pitch - b.pitch);
      const minStart = notesByPlayback[0].start;
      const maxEnd = Math.max(...notesByPlayback.map((note) => note.start + note.duration));
      const basePitches = uniquePitchesInOrder(
        options.pattern === "asPlayed"
          ? notesByPlayback.map((note) => note.pitch)
          : notesByPlayback.map((note) => note.pitch).sort((a, b) => a - b),
      );
      const pitchCycle: number[] = [];

      for (let octave = 0; octave < options.octaves; octave += 1) {
        for (const pitch of basePitches) {
          pitchCycle.push(Math.min(127, pitch + octave * 12));
        }
      }

      const sequence = buildPatternSequence(pitchCycle, options.pattern);
      if (sequence.length === 0) return [];

      const span = Math.max(options.rate, maxEnd - minStart);
      const stepCount = Math.max(sequence.length, Math.ceil(span / options.rate));
      return Array.from({ length: stepCount }, (_, index) => ({
        id: crypto.randomUUID(),
        pitch: sequence[index % sequence.length],
        start: minStart + index * options.rate,
        duration: Math.max(options.rate * 0.2, options.rate * (options.gate / 100)),
        velocity: options.velocity,
      }));
    });

    if (generated.length === 0) return;

    const retained = notes.filter((note) => !targetIds.has(note.id));
    replaceNotes([...retained, ...generated].sort((a, b) => a.start - b.start || a.pitch - b.pitch));
    setSelectedIds(new Set(generated.map((note) => note.id)));
  }, [notes, replaceNotes, setSelectedIds, targetIds, targetNotes]);

  const applyNoteOperation = useCallback((type: string) => {
    if (targetIds.size === 0) return;

    switch (type) {
      case "splitAtPlayhead": {
        replaceNotes(splitNotesAtPositions(notes, targetIds, [playheadPosition]));
        break;
      }
      case "splitAtBar": {
        const positions: number[] = [];
        const minStart = Math.min(...targetNotes.map((note) => note.start));
        const maxEnd = Math.max(...targetNotes.map((note) => note.start + note.duration));
        const firstBoundary = Math.floor(minStart / beatsPerBar) * beatsPerBar + beatsPerBar;
        for (let beat = firstBoundary; beat < maxEnd; beat += beatsPerBar) {
          positions.push(beat);
        }
        replaceNotes(splitNotesAtPositions(notes, targetIds, positions));
        break;
      }
      case "splitAtBeat": {
        const positions: number[] = [];
        const minStart = Math.min(...targetNotes.map((note) => note.start));
        const maxEnd = Math.max(...targetNotes.map((note) => note.start + note.duration));
        const firstBoundary = Math.floor(minStart) + 1;
        for (let beat = firstBoundary; beat < maxEnd; beat += 1) {
          positions.push(beat);
        }
        replaceNotes(splitNotesAtPositions(notes, targetIds, positions));
        break;
      }
      case "joinConsecutive":
        replaceNotes(joinConsecutiveNotes(notes, targetIds));
        break;
      case "reverse":
      case "mirrorHorizontal":
        replaceNotes(reverseNotes(notes, targetIds));
        break;
      case "mirrorVertical":
        replaceNotes(invertNotes(notes, targetIds));
        break;
      case "repeat2x":
      case "repeat4x": {
        const copiesToAdd = type === "repeat2x" ? 1 : 3;
        const source = [...targetNotes].sort((a, b) => a.start - b.start || a.pitch - b.pitch);
        const minStart = source[0]?.start ?? 0;
        const maxEnd = Math.max(...source.map((note) => note.start + note.duration));
        const span = Math.max(
          snapBeats,
          maxEnd - minStart,
          Math.max(...source.map((note) => note.duration)),
        );
        const duplicates: MidiNote[] = [];

        for (let repeatIndex = 1; repeatIndex <= copiesToAdd; repeatIndex += 1) {
          for (const note of source) {
            duplicates.push({
              ...note,
              id: crypto.randomUUID(),
              start: note.start + span * repeatIndex,
            });
          }
        }

        replaceNotes([...notes, ...duplicates]);
        setSelectedIds(new Set(duplicates.map((note) => note.id)));
        break;
      }
      case "removeShort":
        replaceNotes(notes.filter((note) => !targetIds.has(note.id) || note.duration >= 0.1));
        break;
      default:
        break;
    }
  }, [beatsPerBar, notes, playheadPosition, replaceNotes, setSelectedIds, snapBeats, targetIds, targetNotes]);

  return {
    targetNotes,
    targetIds,
    playheadPosition,
    quantizeOpen,
    setQuantizeOpen,
    humanizeOpen,
    setHumanizeOpen,
    transposeOpen,
    setTransposeOpen,
    strummingOpen,
    setStrummingOpen,
    chordToolsOpen,
    setChordToolsOpen,
    arpeggiatorOpen,
    setArpeggiatorOpen,
    replaceNotes,
    applyDirectTransform,
    applyQuantize,
    applyHumanize,
    applyTranspose,
    applyStrumming,
    applyChordTools,
    applyArpeggiator,
    applyNoteOperation,
    selectNotes: setSelectedIds,
    openTranspose: () => setTransposeOpen(true),
    openQuantize: () => setQuantizeOpen(true),
    openHumanize: () => setHumanizeOpen(true),
    openStrumming: () => setStrummingOpen(true),
    openChordTools: () => setChordToolsOpen(true),
    openArpeggiator: () => setArpeggiatorOpen(true),
    closeQuantize: () => setQuantizeOpen(false),
    closeHumanize: () => setHumanizeOpen(false),
    closeStrumming: () => setStrummingOpen(false),
    closeChordTools: () => setChordToolsOpen(false),
    closeArpeggiator: () => setArpeggiatorOpen(false),
  };
}
