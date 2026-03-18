import { useState } from "react";
import { PianoKeyboard } from "./PianoKeyboard";
import { NOTE_NAMES, transposeNotes } from "@/lib/musicTheory";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { TheoryLearnPractice } from "./TheoryLearnPractice";

export function TransposeTool() {
  const [notes, setNotes] = useState<number[]>([]);
  const [semitones, setSemitones] = useState(0);

  const toggleNote = (pc: number) => {
    setNotes((prev) => prev.includes(pc) ? prev.filter((n) => n !== pc) : [...prev, pc]);
  };

  const transposed = transposeNotes(notes, semitones).map((n) => ((n % 12) + 12) % 12);

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-muted-foreground">Select notes, then choose a transposition offset.</p>
      <PianoKeyboard octaves={2} activeNotes={notes} highlightedNotes={transposed} onNoteClick={toggleNote} compact />
      <div className="flex items-center gap-3">
        <div className="flex flex-wrap gap-1">
          {notes.map((n) => (
            <span key={n} className="px-2 py-0.5 rounded bg-muted text-foreground text-[10px] font-mono font-semibold">{NOTE_NAMES[n]}</span>
          ))}
        </div>
        {notes.length > 0 && (
          <Button variant="ghost" size="sm" className="text-[10px] font-mono h-6" onClick={() => setNotes([])}>Clear</Button>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs font-mono text-muted-foreground w-24">Transpose:</span>
        <Slider value={[semitones]} onValueChange={([v]) => setSemitones(v)} min={-12} max={12} step={1} className="flex-1" />
        <span className={`text-sm font-mono font-bold w-12 text-right ${semitones > 0 ? "text-primary" : semitones < 0 ? "text-destructive" : "text-muted-foreground"}`}>
          {semitones > 0 ? `+${semitones}` : semitones}
        </span>
      </div>
      {notes.length > 0 && semitones !== 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
          <span className="text-xs font-mono text-muted-foreground">Result:</span>
          <div className="flex flex-wrap gap-1">
            {transposed.map((n, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-primary/15 text-primary text-[10px] font-mono font-semibold">{NOTE_NAMES[n]}</span>
            ))}
          </div>
        </div>
      )}
      <TheoryLearnPractice topicKey="transpose" moduleKey="transpose" />
    </div>
  );
}
