import { useState } from "react";
import { PianoKeyboard } from "./PianoKeyboard";
import { NOTE_NAMES, identifyChord } from "@/lib/musicTheory";
import { Button } from "@/components/ui/button";
import { TheoryLearnPractice } from "./TheoryLearnPractice";

export function ChordFinderTool() {
  const [notes, setNotes] = useState<number[]>([]);
  const [answerHighlight, setAnswerHighlight] = useState<number[]>([]);

  const toggleNote = (pc: number) => {
    setAnswerHighlight([]);
    setNotes((prev) => prev.includes(pc) ? prev.filter((n) => n !== pc) : [...prev, pc]);
  };

  const detected = identifyChord(notes);

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-muted-foreground">Click notes to identify the chord.</p>
      <PianoKeyboard octaves={2} activeNotes={notes} highlightedNotes={answerHighlight} onNoteClick={toggleNote} compact />
      <div className="flex items-center gap-3">
        <div className="flex flex-wrap gap-1">
          {notes.map((n) => (
            <span key={n} className="px-2 py-0.5 rounded bg-primary/15 text-primary text-[10px] font-mono font-semibold">{NOTE_NAMES[n]}</span>
          ))}
        </div>
        {notes.length > 0 && (
          <Button variant="ghost" size="sm" className="text-[10px] font-mono h-6" onClick={() => setNotes([])}>Clear</Button>
        )}
      </div>
      {detected ? (
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <span className="text-lg font-mono font-bold text-primary">{detected.name}</span>
          {detected.inversion > 0 && (
            <span className="text-xs font-mono text-muted-foreground ml-2">(inversion {detected.inversion})</span>
          )}
        </div>
      ) : notes.length >= 2 ? (
        <p className="text-xs font-mono text-muted-foreground/60">No recognized chord</p>
      ) : null}
      <TheoryLearnPractice topicKey="chord-finder" moduleKey="chord-finder" activeNotes={notes} onShowAnswer={setAnswerHighlight} />
    </div>
  );
}
