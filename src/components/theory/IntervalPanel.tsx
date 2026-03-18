import { useState, useCallback } from "react";
import { PianoKeyboard } from "./PianoKeyboard";
import { getIntervalName, getIntervalQuality, NOTE_NAMES } from "@/lib/musicTheory";
import { TheoryLearnPractice } from "./TheoryLearnPractice";

export function IntervalPanel() {
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

  return (
    <div className="space-y-4">
      <p className="text-xs font-mono text-muted-foreground">Click two notes to see the interval between them.</p>
      <PianoKeyboard octaves={2} activeNotes={notes} highlightedNotes={answerHighlight} onNoteClick={handleNoteClick} />
      {semitones !== null && (
        <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono font-semibold text-primary">{NOTE_NAMES[notes[0]]}</span>
            <span className="text-xs text-muted-foreground">→</span>
            <span className="text-sm font-mono font-semibold text-primary">{NOTE_NAMES[notes[1]]}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div>
            <span className="text-sm font-mono font-semibold text-foreground">{getIntervalName(semitones)}</span>
            <span className="text-xs font-mono text-muted-foreground ml-2">({semitones} semitones)</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded ${
            getIntervalQuality(semitones) === "perfect" ? "bg-primary/20 text-primary" :
            getIntervalQuality(semitones) === "consonant" ? "bg-accent/60 text-accent-foreground" :
            "bg-destructive/20 text-destructive"
          }`}>
            {getIntervalQuality(semitones)}
          </span>
        </div>
      )}
      {notes.length < 2 && (
        <p className="text-[10px] font-mono text-muted-foreground/60">
          {notes.length === 0 ? "Select the first note" : "Select the second note"}
        </p>
      )}
      <TheoryLearnPractice topicKey="intervals" moduleKey="intervals" activeNotes={notes} onShowAnswer={setAnswerHighlight} />
    </div>
  );
}
