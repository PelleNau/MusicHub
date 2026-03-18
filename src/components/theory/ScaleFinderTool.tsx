import { useState } from "react";
import { PianoKeyboard } from "./PianoKeyboard";
import { NOTE_NAMES, findMatchingScales } from "@/lib/musicTheory";
import { Button } from "@/components/ui/button";
import { TheoryLearnPractice } from "./TheoryLearnPractice";

export function ScaleFinderTool() {
  const [notes, setNotes] = useState<number[]>([]);
  const [answerHighlight, setAnswerHighlight] = useState<number[]>([]);

  const toggleNote = (pc: number) => {
    setAnswerHighlight([]);
    setNotes((prev) => prev.includes(pc) ? prev.filter((n) => n !== pc) : [...prev, pc]);
  };

  const matches = findMatchingScales(notes);

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-muted-foreground">Click notes to find scales containing all of them.</p>
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
      {matches.length > 0 && (
        <div className="max-h-48 overflow-y-auto space-y-1">
          {matches.slice(0, 20).map((m, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded bg-muted/40 hover:bg-muted/60 transition-colors">
              <span className="text-xs font-mono font-semibold text-primary w-8">{m.root}</span>
              <span className="text-xs font-mono text-foreground">{m.scaleName}</span>
              <span className="text-[9px] font-mono text-muted-foreground ml-auto">{m.totalNotes} notes</span>
            </div>
          ))}
        </div>
      )}
      {notes.length > 0 && matches.length === 0 && (
        <p className="text-xs font-mono text-muted-foreground/60">No scales contain all selected notes</p>
      )}
      <TheoryLearnPractice topicKey="scale-finder" moduleKey="scale-finder" activeNotes={notes} onShowAnswer={setAnswerHighlight} />
    </div>
  );
}
