import { useState, useCallback, useRef, useMemo } from "react";
import { PianoKeyboard } from "./PianoKeyboard";
import { NOTE_NAMES, SCALES, getModeIntervals, MODE_NAMES } from "@/lib/musicTheory";
import { useNoteAudition } from "@/hooks/useNoteAudition";
import { useTheoryStats, XP_FIRST_TRY, XP_RETRY } from "@/hooks/useTheoryStats";
import { XPDisplay } from "./XPDisplay";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Play,
  RotateCcw,
  SkipForward,
  Volume2,
  CheckCircle,
  XCircle,
  Shuffle,
  Ear,
} from "lucide-react";

/* ── Question pool: scales + modes ── */
interface EarQuestion {
  label: string;
  intervals: number[];
  category: "scale" | "mode";
}

function buildQuestionPool(): EarQuestion[] {
  const pool: EarQuestion[] = [];

  // Scales (exclude Chromatic)
  for (const [name, intervals] of Object.entries(SCALES)) {
    if (name === "Chromatic") continue;
    pool.push({ label: name, intervals, category: "scale" });
  }

  // Modes of Major
  const majorIntervals = SCALES["Major"];
  const modeNames = MODE_NAMES["Major"] ?? [];
  for (let i = 0; i < modeNames.length; i++) {
    const modeIntervals = getModeIntervals(majorIntervals, i);
    // Skip Ionian (same as Major) and Aeolian (same as Minor) to avoid duplicates
    if (i === 0 || i === 5) continue;
    pool.push({ label: modeNames[i], intervals: modeIntervals, category: "mode" });
  }

  return pool;
}

function pickRandom<T>(arr: T[], exclude?: T): T {
  const filtered = exclude !== undefined ? arr.filter((x) => x !== exclude) : arr;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

function generateRound(pool: EarQuestion[]): { question: EarQuestion; root: number; options: string[] } {
  const question = pickRandom(pool);
  const root = Math.floor(Math.random() * 12);

  // Build 4 options: correct + 3 distractors from same category preferentially
  const sameCategory = pool.filter((q) => q !== question && q.category === question.category);
  const otherCategory = pool.filter((q) => q !== question && q.category !== question.category);
  const distractorPool = sameCategory.length >= 3 ? sameCategory : [...sameCategory, ...otherCategory];

  const distractors: string[] = [];
  const used = new Set([question.label]);
  while (distractors.length < 3 && distractorPool.length > 0) {
    const d = pickRandom(distractorPool);
    if (!used.has(d.label)) {
      distractors.push(d.label);
      used.add(d.label);
    }
    if (used.size >= distractorPool.length + 1) break;
  }

  // Shuffle options
  const options = [question.label, ...distractors].sort(() => Math.random() - 0.5);
  return { question, root, options };
}

export function EarTrainingPanel() {
  const pool = useMemo(() => buildQuestionPool(), []);
  const { playNote, stopNote } = useNoteAudition();
  const { xp, currentStreak, awardXP } = useTheoryStats();
  const { toast } = useToast();
  const playingRef = useRef(false);

  const [round, setRound] = useState(() => generateRound(pool));
  const [status, setStatus] = useState<"listening" | "guessing" | "correct" | "wrong">("listening");
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [hadWrongAttempt, setHadWrongAttempt] = useState(false);
  const [playingNote, setPlayingNote] = useState<number | null>(null);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [showNotes, setShowNotes] = useState(false);

  const scaleNotes = round.question.intervals.map((i) => (i + round.root) % 12);

  const playScale = useCallback(async () => {
    if (playingRef.current) {
      playingRef.current = false;
      stopNote();
      setPlayingNote(null);
      return;
    }
    playingRef.current = true;
    setHasPlayed(true);
    if (status === "listening") setStatus("guessing");

    const basePitch = 60 + round.root;
    const intervals = round.question.intervals;
    for (let i = 0; i < intervals.length + 1; i++) {
      if (!playingRef.current) break;
      const interval = i < intervals.length ? intervals[i] : 12;
      const pitch = basePitch + interval;
      const pc = (round.root + interval) % 12;
      setPlayingNote(pc);
      playNote(pitch, 100);
      await new Promise((r) => setTimeout(r, 250));
    }
    playingRef.current = false;
    setPlayingNote(null);
  }, [round, playNote, stopNote, status]);

  const handleAnswer = useCallback(
    (option: string) => {
      if (status === "correct") return;
      setSelectedAnswer(option);
      if (option === round.question.label) {
        setStatus("correct");
        setShowNotes(true);
        const earned = hadWrongAttempt ? XP_RETRY : XP_FIRST_TRY;
        awardXP(earned);
        toast({ title: `+${earned} XP`, description: `Correct! It was ${round.question.label}`, duration: 1800 });
        setScore((s) => ({ correct: s.correct + 1, total: s.total + 1 }));
      } else {
        setStatus("wrong");
        setHadWrongAttempt(true);
        setScore((s) => ({ ...s, total: s.total + 1 }));
      }
    },
    [round, status, hadWrongAttempt, awardXP, toast],
  );

  const nextRound = useCallback(() => {
    playingRef.current = false;
    stopNote();
    setRound(generateRound(pool));
    setStatus("listening");
    setSelectedAnswer(null);
    setHadWrongAttempt(false);
    setPlayingNote(null);
    setHasPlayed(false);
    setShowNotes(false);
  }, [pool, stopNote]);

  const activeNotes = playingNote !== null ? [playingNote] : [];

  return (
    <div className="space-y-5">
      {/* Header stats */}
      <div className="flex items-center justify-between">
        <XPDisplay xp={xp} streak={currentStreak} />
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground">
            Score: {score.correct}/{score.total}
          </span>
        </div>
      </div>

      {/* Play prompt */}
      <div className="flex flex-col items-center gap-4 py-4 px-6 rounded-lg border border-border bg-card/50">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Ear className="h-4 w-4" />
          <span className="text-xs font-mono">
            {status === "listening"
              ? "Press Play to hear the scale or mode"
              : status === "correct"
                ? `It was: ${NOTE_NAMES[round.root]} ${round.question.label}`
                : "Listen again and pick the correct answer"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant={hasPlayed ? "outline" : "default"}
            size="sm"
            className="gap-2 font-mono text-xs"
            onClick={playScale}
          >
            {playingRef.current ? (
              <Volume2 className="h-3.5 w-3.5 animate-pulse" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}
            {playingRef.current ? "Playing…" : hasPlayed ? "Replay" : "Play"}
          </Button>
        </div>

        {/* Root hint - only shown after answering correctly */}
        {status === "correct" && (
          <span className="text-[10px] font-mono text-primary font-semibold">
            Root: {NOTE_NAMES[round.root]} — {round.question.category === "mode" ? "Mode" : "Scale"}
          </span>
        )}
      </div>

      {/* Keyboard - shows notes after correct answer */}
      <PianoKeyboard
        octaves={2}
        highlightedNotes={showNotes ? scaleNotes : []}
        activeNotes={activeNotes}
        rootNote={showNotes ? round.root : undefined}
        
      />

      {/* Answer options */}
      {hasPlayed && (
        <div className="space-y-2">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            What scale or mode is this?
          </span>
          <div className="grid grid-cols-2 gap-2">
            {round.options.map((opt) => {
              const isSelected = selectedAnswer === opt;
              const isCorrect = opt === round.question.label;
              const showCorrectStyle = status === "correct" && isCorrect;
              const showWrongStyle = status === "wrong" && isSelected && !isCorrect;
              return (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  disabled={status === "correct"}
                  className={`px-3 py-2.5 rounded-md text-xs font-mono text-left transition-colors ${
                    showCorrectStyle
                      ? "bg-primary/20 text-primary ring-1 ring-primary/40"
                      : showWrongStyle
                        ? "bg-destructive/15 text-destructive ring-1 ring-destructive/30"
                        : isSelected
                          ? "bg-muted ring-1 ring-border"
                          : "bg-muted/40 hover:bg-muted/60 text-foreground"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Feedback */}
      {status === "correct" && (
        <div className="flex items-center gap-2 text-primary">
          <CheckCircle className="h-4 w-4" />
          <span className="text-xs font-mono font-semibold">Correct!</span>
        </div>
      )}
      {status === "wrong" && (
        <div className="flex items-center gap-2 text-destructive">
          <XCircle className="h-4 w-4" />
          <span className="text-xs font-mono">Not quite — listen again and try another option</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {status === "correct" && (
          <Button variant="outline" size="sm" className="text-[10px] font-mono h-7 gap-1.5" onClick={nextRound}>
            Next <SkipForward className="h-3 w-3" />
          </Button>
        )}
        {status === "wrong" && (
          <Button variant="ghost" size="sm" className="text-[10px] font-mono h-7 gap-1.5" onClick={playScale}>
            <Volume2 className="h-3 w-3" /> Listen Again
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="text-[10px] font-mono h-7 gap-1.5 ml-auto"
          onClick={nextRound}
        >
          <Shuffle className="h-3 w-3" /> New Question
        </Button>
      </div>
    </div>
  );
}
