import { useState, useCallback, useRef } from "react";
import { PianoKeyboard } from "./PianoKeyboard";
import { NOTE_NAMES, SCALES, getIntervalPattern } from "@/lib/musicTheory";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TheoryLearnPractice } from "./TheoryLearnPractice";
import { useNoteAudition } from "@/hooks/useNoteAudition";
import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";

export function ScalePanel() {
  const [root, setRoot] = useState(0);
  const [scaleName, setScaleName] = useState("Major");
  const [answerHighlight, setAnswerHighlight] = useState<number[]>([]);
  const [playingNote, setPlayingNote] = useState<number | null>(null);
  const { playNote, stopNote } = useNoteAudition();
  const playingRef = useRef(false);

  const scaleIntervals = SCALES[scaleName] ?? SCALES["Major"];
  const scaleNotes = scaleIntervals.map((i) => (i + root) % 12);
  const intervalPattern = getIntervalPattern(scaleIntervals);

  const handleNoteClick = useCallback((pc: number) => {
    setRoot(pc);
    playNote(60 + pc, 100);
  }, [playNote]);

  const playScale = useCallback(async () => {
    if (playingRef.current) {
      playingRef.current = false;
      stopNote();
      setPlayingNote(null);
      return;
    }
    playingRef.current = true;
    const basePitch = 60 + root;
    for (let i = 0; i < scaleIntervals.length + 1; i++) {
      if (!playingRef.current) break;
      const interval = i < scaleIntervals.length ? scaleIntervals[i] : 12;
      const pitch = basePitch + interval;
      const pc = (root + interval) % 12;
      setPlayingNote(pc);
      playNote(pitch, 100);
      await new Promise((r) => setTimeout(r, 220));
    }
    playingRef.current = false;
    setPlayingNote(null);
  }, [root, scaleIntervals, playNote, stopNote]);

  const activeNotes = playingNote !== null ? [playingNote] : [];

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
            {Object.keys(SCALES).filter((s) => s !== "Chromatic").map((s) => (
              <SelectItem key={s} value={s} className="font-mono text-xs">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 font-mono text-xs" onClick={playScale}>
          {playingRef.current ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playingRef.current ? "Stop" : "Play"}
        </Button>
      </div>
      <PianoKeyboard
        octaves={2}
        highlightedNotes={answerHighlight.length > 0 ? answerHighlight : scaleNotes}
        activeNotes={activeNotes}
        rootNote={root}
        onNoteClick={handleNoteClick}
        
      />
      <div className="flex flex-wrap gap-1.5">
        {scaleNotes.map((n, i) => (
          <span key={i} className="px-2 py-0.5 rounded bg-primary/15 text-primary text-[10px] font-mono font-semibold">
            {i + 1}:{NOTE_NAMES[n]}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {intervalPattern.map((label, i) => (
          <span key={i} className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[9px] font-mono font-medium">
            {label}
          </span>
        ))}
      </div>
      <TheoryLearnPractice topicKey="scales" moduleKey="scales" activeNotes={scaleNotes} onShowAnswer={setAnswerHighlight} />
    </div>
  );
}
