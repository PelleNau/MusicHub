import { useMemo, useState } from "react";
import { Music2, RotateCcw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { MidiNote } from "@/components/studio/PianoRollTransforms";

type DialogMode = "detect" | "invert" | "generate";
type ChordType = "major" | "minor" | "diminished" | "augmented" | "sus2" | "sus4" | "dom7" | "maj7" | "min7";

interface DetectedChord {
  name: string;
  type: ChordType;
  notes: MidiNote[];
  inversion: number;
}

interface ChordToolsDialogProps {
  open: boolean;
  notes: MidiNote[];
  onApply: (notes: MidiNote[]) => void;
  onClose: () => void;
}

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const CHORD_INTERVALS: Record<ChordType, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  dom7: [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
};
const CHORD_LABELS: Record<ChordType, string> = {
  major: "",
  minor: "m",
  diminished: "dim",
  augmented: "aug",
  sus2: "sus2",
  sus4: "sus4",
  dom7: "7",
  maj7: "maj7",
  min7: "m7",
};

function noteName(pitch: number) {
  return NOTE_NAMES[((pitch % 12) + 12) % 12];
}

function formatOrdinal(value: number) {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${value}th`;

  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

function detectChordType(pitches: number[]): { type: ChordType; inversion: number } | null {
  const unique = Array.from(new Set(pitches.map((pitch) => ((pitch % 12) + 12) % 12)));
  if (unique.length < 3) return null;

  for (let rootIndex = 0; rootIndex < unique.length; rootIndex += 1) {
    const root = unique[rootIndex];
    const relative = unique
      .map((pitch) => (pitch - root + 12) % 12)
      .sort((a, b) => a - b);

    for (const [type, intervals] of Object.entries(CHORD_INTERVALS) as [ChordType, number[]][]) {
      if (intervals.length !== relative.length) continue;
      if (intervals.every((interval, index) => interval === relative[index])) {
        return { type, inversion: rootIndex };
      }
    }
  }

  return null;
}

function detectChords(notes: MidiNote[]) {
  const groups = new Map<number, MidiNote[]>();

  for (const note of notes) {
    const key = Math.round(note.start * 100);
    const group = groups.get(key) ?? [];
    group.push(note);
    groups.set(key, group);
  }

  return Array.from(groups.values())
    .filter((group) => group.length >= 3)
    .map((group) => {
      const detected = detectChordType(group.map((note) => note.pitch));
      if (!detected) return null;
      const rootPitch = [...group].sort((a, b) => a.pitch - b.pitch)[0]?.pitch ?? group[0].pitch;
      return {
        name: `${noteName(rootPitch)}${CHORD_LABELS[detected.type]}`,
        type: detected.type,
        inversion: detected.inversion,
        notes: group,
      } satisfies DetectedChord;
    })
    .filter((chord): chord is DetectedChord => chord !== null);
}

function invertChord(notes: MidiNote[], steps: number) {
  const sorted = [...notes].sort((a, b) => a.pitch - b.pitch);
  const result = sorted.map((note) => ({ ...note }));
  for (let index = 0; index < steps; index += 1) {
    const note = result[index % result.length];
    note.pitch = Math.min(127, note.pitch + 12);
  }
  return result.sort((a, b) => a.pitch - b.pitch);
}

function generateChord(root: number, type: ChordType, start: number, duration: number, velocity: number) {
  return CHORD_INTERVALS[type].map((interval, index) => ({
    id: `generated-${type}-${root}-${index}-${crypto.randomUUID()}`,
    pitch: Math.min(127, root + interval),
    start,
    duration,
    velocity,
  }));
}

export function ChordToolsDialog({ open, notes, onApply, onClose }: ChordToolsDialogProps) {
  const [mode, setMode] = useState<DialogMode>("detect");
  const [selectedChordIndex, setSelectedChordIndex] = useState(0);
  const [inversionSteps, setInversionSteps] = useState(1);
  const [generateRoot, setGenerateRoot] = useState(60);
  const [generateType, setGenerateType] = useState<ChordType>("major");
  const [generateTime, setGenerateTime] = useState(0);

  const detectedChords = useMemo(() => detectChords(notes), [notes]);

  const handleInvert = () => {
    const selectedChord = detectedChords[selectedChordIndex];
    if (!selectedChord) return;

    const chordIds = new Set(selectedChord.notes.map((note) => note.id));
    const remainder = notes.filter((note) => !chordIds.has(note.id));
    const inverted = invertChord(selectedChord.notes, inversionSteps);
    onApply([...remainder, ...inverted]);
    onClose();
  };

  const handleGenerate = () => {
    const newChord = generateChord(generateRoot, generateType, generateTime, 1, 84);
    onApply([...notes, ...newChord]);
    onClose();
  };

  const selectedChord = detectedChords[selectedChordIndex];

  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : null)}>
      <DialogContent className="max-w-[520px] border-border/90 bg-[hsl(240_10%_16%)] p-0 text-foreground shadow-2xl">
        <DialogHeader className="flex-row items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Music2 className="h-4 w-4 text-primary" />
            <DialogTitle className="text-sm font-semibold">Chord Tools</DialogTitle>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>

        <div className="border-b border-border bg-[var(--surface-1)]">
          <div className="grid grid-cols-3">
            {([
              ["detect", "Detect Chords"],
              ["invert", "Invert Chords"],
              ["generate", "Generate Chord"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={`px-4 py-2 text-xs font-medium transition-colors ${
                  mode === value
                    ? "border-b-2 border-primary bg-[var(--surface-2)] text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 p-4">
          {mode === "detect" ? (
            detectedChords.length > 0 ? (
              <>
                <p className="text-xs text-muted-foreground">
                  Detected {detectedChords.length} chord{detectedChords.length === 1 ? "" : "s"} in the current note set.
                </p>
                <div className="space-y-2">
                  {detectedChords.map((chord, index) => (
                    <div key={`${chord.name}-${index}`} className="rounded-lg border border-border bg-[var(--surface-3)] p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-primary">{chord.name}</span>
                          <span className="text-xs text-muted-foreground">{chord.notes.length} notes</span>
                        </div>
                        {chord.inversion > 0 ? (
                          <span className="text-xs text-amber-400">{formatOrdinal(chord.inversion)} inversion</span>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {chord.notes
                          .slice()
                          .sort((a, b) => a.pitch - b.pitch)
                          .map((note) => (
                            <span key={note.id} className="rounded bg-blue-500/15 px-2 py-0.5 font-mono text-xs text-blue-300">
                              {noteName(note.pitch)}
                            </span>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded border border-amber-500/20 bg-amber-500/10 px-3 py-3 text-center text-xs text-amber-300">
                No chords detected. Select three or more simultaneous notes.
              </div>
            )
          ) : null}

          {mode === "invert" ? (
            detectedChords.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">Select chord</label>
                  <select
                    value={selectedChordIndex}
                    onChange={(event) => setSelectedChordIndex(Number(event.target.value))}
                    className="w-full rounded border border-border bg-[var(--surface-1)] px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
                  >
                    {detectedChords.map((chord, index) => (
                      <option key={`${chord.name}-${index}`} value={index}>
                        {chord.name} at {chord.notes[0]?.start.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-medium text-muted-foreground">Inversion</label>
                    <span className="text-xs font-mono text-foreground">{inversionSteps}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((step) => (
                      <button
                        key={step}
                        type="button"
                        onClick={() => setInversionSteps(step)}
                        className={`rounded px-3 py-2 text-xs font-medium transition-colors ${
                          inversionSteps === step
                            ? "bg-primary text-primary-foreground"
                            : "bg-[var(--surface-3)] text-foreground hover:bg-[color:color-mix(in_srgb,var(--surface-3)_80%,white_4%)]"
                        }`}
                      >
                        {formatOrdinal(step)}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedChord ? (
                  <div className="rounded border border-blue-500/20 bg-blue-500/10 px-3 py-3 text-xs text-blue-300">
                    Invert <span className="font-semibold text-blue-200">{selectedChord.name}</span> by moving the lowest note up one octave {inversionSteps} time{inversionSteps === 1 ? "" : "s"}.
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded border border-amber-500/20 bg-amber-500/10 px-3 py-3 text-center text-xs text-amber-300">
                No chord group is available to invert.
              </div>
            )
          ) : null}

          {mode === "generate" ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">Root note</label>
                  <select
                    value={generateRoot}
                    onChange={(event) => setGenerateRoot(Number(event.target.value))}
                    className="w-full rounded border border-border bg-[var(--surface-1)] px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
                  >
                    {Array.from({ length: 24 }, (_, index) => 48 + index).map((pitch) => (
                      <option key={pitch} value={pitch}>
                        {noteName(pitch)}{Math.floor(pitch / 12) - 1}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-muted-foreground">Chord type</label>
                  <select
                    value={generateType}
                    onChange={(event) => setGenerateType(event.target.value as ChordType)}
                    className="w-full rounded border border-border bg-[var(--surface-1)] px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary"
                  >
                    {Object.keys(CHORD_INTERVALS).map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Start beat</label>
                  <span className="text-xs font-mono text-foreground">{generateTime.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={8}
                  step={0.5}
                  value={generateTime}
                  onChange={(event) => setGenerateTime(Number(event.target.value))}
                  className="w-full"
                />
              </div>

              <div className="rounded border border-blue-500/20 bg-blue-500/10 px-3 py-3 text-xs text-blue-300">
                Generate a <span className="font-semibold text-blue-200">{noteName(generateRoot)} {generateType}</span> chord at beat {generateTime.toFixed(1)}.
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter className="rounded-b-lg border-t border-border bg-[var(--surface-1)] px-4 py-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          {mode === "detect" ? (
            <Button size="sm" onClick={onClose}>
              Close
            </Button>
          ) : null}
          {mode === "invert" ? (
            <Button size="sm" onClick={handleInvert} disabled={!selectedChord}>
              <RotateCcw className="mr-2 h-3.5 w-3.5" />
              Apply Inversion
            </Button>
          ) : null}
          {mode === "generate" ? (
            <Button size="sm" onClick={handleGenerate}>
              Generate Chord
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
