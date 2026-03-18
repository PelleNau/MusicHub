import { useState, useCallback, useRef } from "react";
import { PianoKeyboard } from "./PianoKeyboard";
import { NOTE_NAMES, SCALES, getModeIntervals, MODE_NAMES, getIntervalPattern } from "@/lib/musicTheory";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TheoryLearnPractice } from "./TheoryLearnPractice";
import { useNoteAudition } from "@/hooks/useNoteAudition";
import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";

export function ModePanel() {
  const [root, setRoot] = useState(0);
  const [modeIndex, setModeIndex] = useState(0);
  const [answerHighlight, setAnswerHighlight] = useState<number[]>([]);
  const [playingNote, setPlayingNote] = useState<number | null>(null);
  const { playNote, stopNote } = useNoteAudition();
  const playingRef = useRef(false);

  const parentScale = SCALES["Major"];
  const modeNames = MODE_NAMES["Major"] ?? [];
  const modeIntervals = getModeIntervals(parentScale, modeIndex);
  const modeRoot = (root + parentScale[modeIndex]) % 12;
  const modeNotes = modeIntervals.map((i) => (i + modeRoot) % 12);
  const parentNotes = parentScale.map((i) => (i + root) % 12);
  const intervalPattern = getIntervalPattern(modeIntervals);

  const handleNoteClick = useCallback((pc: number) => {
    setRoot(pc);
    playNote(60 + pc, 100);
  }, [playNote]);

  const playMode = useCallback(async () => {
    if (playingRef.current) {
      playingRef.current = false;
      stopNote();
      setPlayingNote(null);
      return;
    }
    playingRef.current = true;
    const basePitch = 60 + modeRoot;
    for (let i = 0; i < modeIntervals.length + 1; i++) {
      if (!playingRef.current) break;
      const interval = i < modeIntervals.length ? modeIntervals[i] : 12;
      const pitch = basePitch + interval;
      const pc = (modeRoot + interval) % 12;
      setPlayingNote(pc);
      playNote(pitch, 100);
      await new Promise((r) => setTimeout(r, 220));
    }
    playingRef.current = false;
    setPlayingNote(null);
  }, [modeRoot, modeIntervals, playNote, stopNote]);

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
        <Select value={String(modeIndex)} onValueChange={(v) => setModeIndex(Number(v))}>
          <SelectTrigger className="w-40 h-8 font-mono text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {modeNames.map((name, i) => (
              <SelectItem key={i} value={String(i)} className="font-mono text-xs">{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 font-mono text-xs" onClick={playMode}>
          {playingRef.current ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {playingRef.current ? "Stop" : "Play"}
        </Button>
      </div>
      <PianoKeyboard
        octaves={2}
        highlightedNotes={answerHighlight.length > 0 ? answerHighlight : modeNotes}
        activeNotes={activeNotes}
        rootNote={modeRoot}
        onNoteClick={handleNoteClick}
        
      />
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-muted-foreground">Mode of</span>
        <span className="text-xs font-mono text-foreground font-semibold">{NOTE_NAMES[root]} Major</span>
        <span className="text-xs font-mono text-muted-foreground">starting on</span>
        <span className="text-xs font-mono text-primary font-semibold">{NOTE_NAMES[modeRoot]}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {modeIntervals.map((interval, i) => (
          <span key={i} className="px-2 py-0.5 rounded bg-primary/15 text-primary text-[10px] font-mono font-semibold">
            {i + 1}:{NOTE_NAMES[(modeRoot + interval) % 12]}
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
      {/* Parent scale comparison */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-mono text-muted-foreground/60">Parent:</span>
        <div className="flex flex-wrap gap-1">
          {parentNotes.map((n, i) => (
            <span key={i} className="px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground/50 text-[9px] font-mono">
              {NOTE_NAMES[n]}
            </span>
          ))}
        </div>
      </div>
      <TheoryLearnPractice topicKey="modes" moduleKey="modes" activeNotes={modeNotes} onShowAnswer={setAnswerHighlight} />
    </div>
  );
}
