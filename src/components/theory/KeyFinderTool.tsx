import { useState } from "react";
import { PianoKeyboard } from "./PianoKeyboard";
import { NOTE_NAMES, suggestKey } from "@/lib/musicTheory";
import { Button } from "@/components/ui/button";
import { TheoryLearnPractice } from "./TheoryLearnPractice";

export function KeyFinderTool() {
  const [notes, setNotes] = useState<number[]>([]);
  const [answerHighlight, setAnswerHighlight] = useState<number[]>([]);

  const toggleNote = (pc: number) => {
    setAnswerHighlight([]);
    setNotes((prev) => prev.includes(pc) ? prev.filter((n) => n !== pc) : [...prev, pc]);
  };

  const suggestions = suggestKey(notes);

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-muted-foreground">Enter the notes you're using to find the most likely key.</p>
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
      {suggestions.length > 0 && (
        <div className="space-y-1">
          {suggestions.slice(0, 6).map((s, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 rounded bg-muted/40">
              <span className="text-sm font-mono font-bold text-primary">{s.root} {s.scaleName}</span>
              <div className="flex-1" />
              <div className="h-1.5 w-24 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${s.confidence}%` }} />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground w-10 text-right">{s.confidence}%</span>
            </div>
          ))}
        </div>
      )}
      <TheoryLearnPractice topicKey="key-finder" moduleKey="key-finder" activeNotes={notes} onShowAnswer={setAnswerHighlight} />
    </div>
  );
}
