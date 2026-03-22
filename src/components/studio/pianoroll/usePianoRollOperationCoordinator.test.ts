import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MidiNote } from "@/components/studio/PianoRollTransforms";
import { usePianoRollOperationCoordinator } from "@/components/studio/pianoroll/usePianoRollOperationCoordinator";
import type { SessionClip } from "@/types/studio";

function createClip(overrides: Partial<SessionClip> = {}): SessionClip {
  return {
    id: "clip-1",
    track_id: "track-1",
    name: "Clip",
    start_beats: 16,
    end_beats: 24,
    color: 0,
    is_midi: true,
    is_muted: false,
    midi_data: { notes: [] },
    audio_url: null,
    waveform_peaks: null,
    alias_of: null,
    ...overrides,
  };
}

function createNote(id: string, pitch: number, start: number, duration: number, velocity = 100): MidiNote {
  return { id, pitch, start, duration, velocity };
}

describe("usePianoRollOperationCoordinator", () => {
  let randomId = 0;

  beforeEach(() => {
    randomId = 0;
    vi.spyOn(crypto, "randomUUID").mockImplementation(() => `generated-${++randomId}`);
  });

  it("repeat2x adds exactly one additional copy of the selected phrase", () => {
    const notes = [
      createNote("n1", 60, 0, 1),
      createNote("n2", 64, 1, 1),
    ];
    const onNotesChange = vi.fn();
    const setSelectedIds = vi.fn();

    const { result } = renderHook(() =>
      usePianoRollOperationCoordinator({
        clip: createClip(),
        notes,
        selectedIds: new Set(["n1", "n2"]),
        setSelectedIds,
        beatsPerBar: 4,
        snapBeats: 0.25,
        currentBeat: 16,
        transposeOpen: false,
        setTransposeOpen: vi.fn(),
        onNotesChange,
      }),
    );

    act(() => {
      result.current.applyNoteOperation("repeat2x");
    });

    const updated = onNotesChange.mock.calls.at(-1)?.[1] as MidiNote[];
    expect(updated).toHaveLength(4);
    expect(updated.map((note) => note.start)).toEqual([0, 1, 2, 3]);
    expect(setSelectedIds).toHaveBeenCalledWith(new Set(["generated-1", "generated-2"]));
  });

  it("splitAtBar uses the provided time signature instead of assuming 4/4", () => {
    const notes = [createNote("n1", 60, 2.5, 2)];
    const onNotesChange = vi.fn();

    const { result } = renderHook(() =>
      usePianoRollOperationCoordinator({
        clip: createClip(),
        notes,
        selectedIds: new Set(["n1"]),
        setSelectedIds: vi.fn(),
        beatsPerBar: 3,
        snapBeats: 0.25,
        currentBeat: 16,
        transposeOpen: false,
        setTransposeOpen: vi.fn(),
        onNotesChange,
      }),
    );

    act(() => {
      result.current.applyNoteOperation("splitAtBar");
    });

    const updated = onNotesChange.mock.calls.at(-1)?.[1] as MidiNote[];
    expect(updated).toHaveLength(2);
    expect(updated.map((note) => [note.start, note.duration])).toEqual([
      [2.5, 0.5],
      [3, 1.5],
    ]);
  });

  it("arpeggiator emits at least one full pitch cycle for multi-octave patterns", () => {
    const notes = [
      createNote("n1", 60, 0, 0.5),
      createNote("n2", 64, 0, 0.5),
      createNote("n3", 67, 0, 0.5),
    ];
    const onNotesChange = vi.fn();
    const setSelectedIds = vi.fn();

    const { result } = renderHook(() =>
      usePianoRollOperationCoordinator({
        clip: createClip({ start_beats: 0, end_beats: 4 }),
        notes,
        selectedIds: new Set(["n1", "n2", "n3"]),
        setSelectedIds,
        beatsPerBar: 4,
        snapBeats: 0.25,
        currentBeat: 0,
        transposeOpen: false,
        setTransposeOpen: vi.fn(),
        onNotesChange,
      }),
    );

    act(() => {
      result.current.applyArpeggiator({
        pattern: "up",
        scope: "perChord",
        rate: 1,
        octaves: 2,
        velocity: 90,
        gate: 75,
      });
    });

    const updated = onNotesChange.mock.calls.at(-1)?.[1] as MidiNote[];
    expect(updated).toHaveLength(6);
    expect(updated.map((note) => note.pitch)).toEqual([60, 64, 67, 72, 76, 79]);
    expect(setSelectedIds).toHaveBeenCalledWith(
      new Set(["generated-1", "generated-2", "generated-3", "generated-4", "generated-5", "generated-6"]),
    );
  });

  it("arpeggiates a progression per chord by default instead of pooling all pitches together", () => {
    const notes = [
      createNote("c1", 60, 0, 1),
      createNote("c2", 64, 0, 1),
      createNote("c3", 67, 0, 1),
      createNote("f1", 65, 2, 1),
      createNote("f2", 69, 2, 1),
      createNote("f3", 72, 2, 1),
    ];
    const onNotesChange = vi.fn();

    const { result } = renderHook(() =>
      usePianoRollOperationCoordinator({
        clip: createClip({ start_beats: 0, end_beats: 8 }),
        notes,
        selectedIds: new Set(notes.map((note) => note.id)),
        setSelectedIds: vi.fn(),
        beatsPerBar: 4,
        snapBeats: 0.25,
        currentBeat: 0,
        transposeOpen: false,
        setTransposeOpen: vi.fn(),
        onNotesChange,
      }),
    );

    act(() => {
      result.current.applyArpeggiator({
        pattern: "up",
        scope: "perChord",
        rate: 0.5,
        octaves: 1,
        velocity: 90,
        gate: 80,
      });
    });

    const updated = onNotesChange.mock.calls.at(-1)?.[1] as MidiNote[];
    expect(updated.map((note) => [note.start, note.pitch])).toEqual([
      [0, 60],
      [0.5, 64],
      [1, 67],
      [2, 65],
      [2.5, 69],
      [3, 72],
    ]);
  });

  it("can still arpeggiate the whole selection as one pooled pitch set", () => {
    const notes = [
      createNote("c1", 60, 0, 1),
      createNote("c2", 64, 0, 1),
      createNote("c3", 67, 0, 1),
      createNote("f1", 65, 2, 1),
      createNote("f2", 69, 2, 1),
      createNote("f3", 72, 2, 1),
    ];
    const onNotesChange = vi.fn();

    const { result } = renderHook(() =>
      usePianoRollOperationCoordinator({
        clip: createClip({ start_beats: 0, end_beats: 8 }),
        notes,
        selectedIds: new Set(notes.map((note) => note.id)),
        setSelectedIds: vi.fn(),
        beatsPerBar: 4,
        snapBeats: 0.25,
        currentBeat: 0,
        transposeOpen: false,
        setTransposeOpen: vi.fn(),
        onNotesChange,
      }),
    );

    act(() => {
      result.current.applyArpeggiator({
        pattern: "up",
        scope: "wholeSelection",
        rate: 0.5,
        octaves: 1,
        velocity: 90,
        gate: 80,
      });
    });

    const updated = onNotesChange.mock.calls.at(-1)?.[1] as MidiNote[];
    expect(updated.map((note) => [note.start, note.pitch])).toEqual([
      [0, 60],
      [0.5, 64],
      [1, 65],
      [1.5, 67],
      [2, 69],
      [2.5, 72],
    ]);
  });

  it("chord-tools apply selects newly generated notes when they are introduced", () => {
    const notes = [createNote("n1", 60, 0, 1)];
    const onNotesChange = vi.fn();
    const setSelectedIds = vi.fn();

    const { result } = renderHook(() =>
      usePianoRollOperationCoordinator({
        clip: createClip({ start_beats: 0, end_beats: 4 }),
        notes,
        selectedIds: new Set(["n1"]),
        setSelectedIds,
        beatsPerBar: 4,
        snapBeats: 0.25,
        currentBeat: 0,
        transposeOpen: false,
        setTransposeOpen: vi.fn(),
        onNotesChange,
      }),
    );

    const generated = [
      notes[0],
      createNote("new-1", 64, 0, 1),
      createNote("new-2", 67, 0, 1),
    ];

    act(() => {
      result.current.applyChordTools(generated);
    });

    expect(onNotesChange).toHaveBeenCalledWith("clip-1", generated);
    expect(setSelectedIds).toHaveBeenCalledWith(new Set(["new-1", "new-2"]));
  });
});
