import { useState } from "react";
import { PianoKeyboard } from "./PianoKeyboard";
import { NOTE_NAMES, SCALES, getDiatonicChords } from "@/lib/musicTheory";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TheoryLearnPractice } from "./TheoryLearnPractice";

export function HarmonicFunctionPanel() {
  const [root, setRoot] = useState(0);
  const [scaleName, setScaleName] = useState("Major");
  const [activeChordIdx, setActiveChordIdx] = useState<number | null>(null);

  const scaleIntervals = SCALES[scaleName] ?? SCALES["Major"];
  const chords = getDiatonicChords(root, scaleIntervals);
  const activeChord = activeChordIdx !== null ? chords[activeChordIdx] : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={String(root)} onValueChange={(v) => setRoot(Number(v))}>
          <SelectTrigger className="w-24 h-8 font-mono text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {NOTE_NAMES.map((n, i) => (
              <SelectItem key={i} value={String(i)} className="font-mono text-xs">{n}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={scaleName} onValueChange={setScaleName}>
          <SelectTrigger className="w-40 h-8 font-mono text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["Major", "Minor"].map((s) => (
              <SelectItem key={s} value={s} className="font-mono text-xs">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-1.5">
        {chords.map((chord, i) => (
          <button
            key={i}
            onClick={() => setActiveChordIdx(activeChordIdx === i ? null : i)}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-colors ${
              activeChordIdx === i ? "bg-primary/20 ring-1 ring-primary/30" : "bg-muted/50 hover:bg-muted"
            }`}
          >
            <span className="text-sm font-mono font-bold text-foreground">{chord.roman}</span>
            <span className="text-[9px] font-mono text-muted-foreground">{chord.root}{chord.quality === "minor" ? "m" : chord.quality === "diminished" ? "dim" : ""}</span>
          </button>
        ))}
      </div>
      <PianoKeyboard
        octaves={2}
        highlightedNotes={activeChord ? activeChord.notes : scaleIntervals.map((i) => (i + root) % 12)}
        activeNotes={activeChord ? [activeChord.rootIndex] : []}
        compact
      />
      {activeChord && (
        <div className="flex items-center gap-2 p-2 rounded bg-muted/50 border border-border">
          <span className="text-xs font-mono text-muted-foreground">Degree {activeChord.degree}:</span>
          <span className="text-sm font-mono font-semibold text-primary">{activeChord.roman}</span>
          <span className="text-xs font-mono text-muted-foreground">— {activeChord.quality}</span>
          <span className="text-xs font-mono text-foreground ml-auto">{activeChord.notes.map((n) => NOTE_NAMES[n]).join(" – ")}</span>
        </div>
      )}
      <TheoryLearnPractice topicKey="harmonic-function" moduleKey="harmonic-function" />
    </div>
  );
}
