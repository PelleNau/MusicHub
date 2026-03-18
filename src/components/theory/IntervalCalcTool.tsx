import { useState } from "react";
import { PianoKeyboard } from "./PianoKeyboard";
import { NOTE_NAMES, getIntervalName, getIntervalQuality } from "@/lib/musicTheory";
import { TheoryLearnPractice } from "./TheoryLearnPractice";

export function IntervalCalcTool() {
  const [notes, setNotes] = useState<number[]>([]);
  const [answerHighlight, setAnswerHighlight] = useState<number[]>([]);

  const handleNoteClick = (pc: number) => {
    setAnswerHighlight([]);
    setNotes((prev) => {
      if (prev.length >= 2) return [pc];
      if (prev.includes(pc)) return prev.filter((n) => n !== pc);
      return [...prev, pc];
    });
  };

  const semitones = notes.length === 2 ? ((notes[1] - notes[0] + 12) % 12) : null;
  const semitonesDown = notes.length === 2 ? ((notes[0] - notes[1] + 12) % 12) : null;

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-muted-foreground">Select two notes to calculate the interval.</p>
      <PianoKeyboard octaves={2} activeNotes={notes} highlightedNotes={answerHighlight} onNoteClick={handleNoteClick} compact />
      {semitones !== null && semitonesDown !== null && (
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
            <span className="text-sm font-mono font-semibold text-primary">{NOTE_NAMES[notes[0]]}</span>
            <span className="text-xs text-muted-foreground">↑</span>
            <span className="text-sm font-mono font-semibold text-primary">{NOTE_NAMES[notes[1]]}</span>
            <div className="h-4 w-px bg-border" />
            <span className="text-sm font-mono text-foreground">{getIntervalName(semitones)}</span>
            <span className="text-[10px] font-mono text-muted-foreground">({semitones} st)</span>
            <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${
              getIntervalQuality(semitones) === "perfect" ? "bg-primary/20 text-primary" :
              getIntervalQuality(semitones) === "consonant" ? "bg-accent/60 text-accent-foreground" :
              "bg-destructive/20 text-destructive"
            }`}>{getIntervalQuality(semitones)}</span>
          </div>
          {semitonesDown !== semitones && (
            <div className="flex items-center gap-3 p-2 rounded bg-muted/30">
              <span className="text-xs font-mono text-muted-foreground">Descending:</span>
              <span className="text-xs font-mono text-foreground">{getIntervalName(semitonesDown)}</span>
              <span className="text-[10px] font-mono text-muted-foreground">({semitonesDown} st)</span>
            </div>
          )}
        </div>
      )}
      <TheoryLearnPractice topicKey="interval-calc" moduleKey="interval-calc" activeNotes={notes} onShowAnswer={setAnswerHighlight} />
    </div>
  );
}
