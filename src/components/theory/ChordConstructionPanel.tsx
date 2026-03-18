import { useState, useCallback, useRef } from "react";
import { PianoKeyboard } from "./PianoKeyboard";
import { NOTE_NAMES, identifyChord } from "@/lib/musicTheory";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TheoryLearnPractice } from "./TheoryLearnPractice";
import { useNoteAudition } from "@/hooks/useNoteAudition";
import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";

const INTERVALS_AVAILABLE = [
  { label: "Minor 3rd", semitones: 3 },
  { label: "Major 3rd", semitones: 4 },
  { label: "Perfect 5th", semitones: 7 },
  { label: "Diminished 5th", semitones: 6 },
  { label: "Augmented 5th", semitones: 8 },
  { label: "Minor 7th", semitones: 10 },
  { label: "Major 7th", semitones: 11 },
  { label: "9th", semitones: 14 },
];

export function ChordConstructionPanel() {
  const [root, setRoot] = useState(0);
  const [selectedIntervals, setSelectedIntervals] = useState<number[]>([4, 7]);
  const [answerHighlight, setAnswerHighlight] = useState<number[]>([]);
  const [playingNote, setPlayingNote] = useState<number | null>(null);
  const { playNote, stopNote } = useNoteAudition();
  const playingRef = useRef(false);

  const toggleInterval = (semi: number) => {
    setAnswerHighlight([]);
    setSelectedIntervals((prev) =>
      prev.includes(semi) ? prev.filter((s) => s !== semi) : [...prev, semi].sort((a, b) => a - b)
    );
  };

  const chordIntervals = [0, ...selectedIntervals];
  const chordNotes = [root, ...selectedIntervals.map((i) => (root + i) % 12)];
  const uniqueNotes = [...new Set(chordNotes)];
  const detected = identifyChord(uniqueNotes);

  const handleNoteClick = useCallback((pc: number) => {
    setRoot(pc);
    setAnswerHighlight([]);
    playNote(60 + pc, 100);
  }, [playNote]);

  const playChord = useCallback(async () => {
    if (playingRef.current) {
      playingRef.current = false;
      stopNote();
      setPlayingNote(null);
      return;
    }
    playingRef.current = true;
    const basePitch = 60 + root;
    for (let i = 0; i < chordIntervals.length; i++) {
      if (!playingRef.current) break;
      const pitch = basePitch + chordIntervals[i];
      const pc = (root + chordIntervals[i]) % 12;
      setPlayingNote(pc);
      playNote(pitch, 100);
      await new Promise((r) => setTimeout(r, 280));
    }
    playingRef.current = false;
    setPlayingNote(null);
  }, [root, chordIntervals, playNote, stopNote]);

  const activeNotes = playingNote !== null ? [playingNote] : [root];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-muted-foreground">Root:</span>
        <Select value={String(root)} onValueChange={(v) => { setRoot(Number(v)); setAnswerHighlight([]); }}>
          <SelectTrigger className="w-24 h-8 font-mono text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {NOTE_NAMES.map((n, i) => (
              <SelectItem key={i} value={String(i)} className="font-mono text-xs">{n}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {detected && <span className="text-sm font-mono font-bold text-primary">{detected.name}</span>}
        <Button variant="outline" size="sm" className="h-8 gap-1.5 font-mono text-xs ml-auto" onClick={playChord}>
          {playingRef.current ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playingRef.current ? "Stop" : "Play"}
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {INTERVALS_AVAILABLE.map(({ label, semitones }) => (
          <button
            key={semitones}
            onClick={() => toggleInterval(semitones)}
            className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors ${
              selectedIntervals.includes(semitones)
                ? "bg-primary/20 text-primary ring-1 ring-primary/30"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <PianoKeyboard
        octaves={2}
        highlightedNotes={answerHighlight.length > 0 ? answerHighlight : uniqueNotes}
        activeNotes={activeNotes}
        rootNote={root}
        onNoteClick={handleNoteClick}
        
      />
      <div className="flex flex-wrap gap-1.5">
        {uniqueNotes.map((n, i) => (
          <span key={i} className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
            n === root ? "bg-primary text-primary-foreground" : "bg-primary/15 text-primary"
          }`}>{NOTE_NAMES[n]}</span>
        ))}
      </div>
      <TheoryLearnPractice topicKey="chord-construction" moduleKey="chord-construction" activeNotes={uniqueNotes} onShowAnswer={setAnswerHighlight} />
    </div>
  );
}
