import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, Square, Lightbulb, AlertTriangle, BookmarkCheck, Volume2, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PianoKeyboard } from "./PianoKeyboard";
import { useNoteAudition } from "@/hooks/useNoteAudition";
import { useTheoryStats, XP_LESSON_COMPLETE } from "@/hooks/useTheoryStats";
import { THEORY_CONTENT, type LessonStep, type LessonQuiz } from "./theoryContent";
import { cn } from "@/lib/utils";

interface TheoryInfoSectionProps {
  topicKey: string;
}

const STORAGE_PREFIX = "theory-lesson-step-";
const COMPLETED_PREFIX = "theory-lesson-done-";
const QUIZ_PREFIX = "theory-quiz-passed-";

function getStoredStep(topicKey: string): number {
  try {
    const v = localStorage.getItem(STORAGE_PREFIX + topicKey);
    return v ? parseInt(v, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

function setStoredStep(topicKey: string, step: number) {
  try {
    localStorage.setItem(STORAGE_PREFIX + topicKey, String(step));
  } catch { /* noop */ }
}

function isLessonCompleted(topicKey: string): boolean {
  try {
    return localStorage.getItem(COMPLETED_PREFIX + topicKey) === "1";
  } catch {
    return false;
  }
}

function markLessonCompleted(topicKey: string) {
  try {
    localStorage.setItem(COMPLETED_PREFIX + topicKey, "1");
  } catch { /* noop */ }
}

function getPassedQuizzes(topicKey: string): Set<number> {
  try {
    const v = localStorage.getItem(QUIZ_PREFIX + topicKey);
    return v ? new Set(JSON.parse(v) as number[]) : new Set();
  } catch {
    return new Set();
  }
}

function markQuizPassed(topicKey: string, stepIndex: number) {
  try {
    const passed = getPassedQuizzes(topicKey);
    passed.add(stepIndex);
    localStorage.setItem(QUIZ_PREFIX + topicKey, JSON.stringify([...passed]));
  } catch { /* noop */ }
}

export function TheoryInfoSection({ topicKey }: TheoryInfoSectionProps) {
  const content = THEORY_CONTENT[topicKey];
  const { playNote } = useNoteAudition();
  const { awardXP } = useTheoryStats();
  const playingRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const lessons = content?.lessons;
  const hasLessons = lessons && lessons.length > 0;

  const [step, setStep] = useState(() => (hasLessons ? getStoredStep(topicKey) : 0));
  const [completed, setCompleted] = useState(() => isLessonCompleted(topicKey));
  const [passedQuizzes, setPassedQuizzes] = useState<Set<number>>(() => getPassedQuizzes(topicKey));

  // Reset when topic changes
  useEffect(() => {
    if (hasLessons) {
      const stored = getStoredStep(topicKey);
      setStep(Math.min(stored, lessons.length - 1));
      setCompleted(isLessonCompleted(topicKey));
      setPassedQuizzes(getPassedQuizzes(topicKey));
    } else {
      setStep(0);
      setCompleted(false);
      setPassedQuizzes(new Set());
    }
    playingRef.current = false;
    setIsPlaying(false);
  }, [topicKey, hasLessons, lessons?.length]);

  // Persist step
  useEffect(() => {
    if (hasLessons) setStoredStep(topicKey, step);
  }, [topicKey, step, hasLessons]);

  // Award XP on reaching last step for the first time
  useEffect(() => {
    if (hasLessons && step === lessons.length - 1 && !completed) {
      setCompleted(true);
      markLessonCompleted(topicKey);
      awardXP(XP_LESSON_COMPLETE);
    }
  }, [step, hasLessons, lessons?.length, completed, topicKey, awardXP]);

  const playExample = useCallback(
    (notes: number[]) => {
      if (playingRef.current) {
        playingRef.current = false;
        setIsPlaying(false);
        return;
      }
      playingRef.current = true;
      setIsPlaying(true);

      const baseOctave = 60; // C4
      let i = 0;
      const play = () => {
        if (!playingRef.current || i >= notes.length) {
          playingRef.current = false;
          setIsPlaying(false);
          return;
        }
        playNote(baseOctave + notes[i], 90);
        i++;
        setTimeout(play, 280);
      };
      play();
    },
    [playNote]
  );

  const handleQuizPass = useCallback(
    (stepIndex: number) => {
      setPassedQuizzes((prev) => {
        const next = new Set(prev);
        next.add(stepIndex);
        return next;
      });
      markQuizPassed(topicKey, stepIndex);
    },
    [topicKey]
  );

  if (!content) return null;

  // Fallback: no lessons defined
  if (!hasLessons) {
    return (
      <div className="space-y-3">
        <p className="text-[11px] font-mono text-foreground/85 leading-relaxed">
          <span className="text-primary font-semibold">What — </span>{content.whatIsIt}
        </p>
        <p className="text-[11px] font-mono text-foreground/85 leading-relaxed">
          <span className="text-primary font-semibold">Why — </span>{content.whyItMatters}
        </p>
      </div>
    );
  }

  const lesson = lessons[step];
  const total = lessons.length;
  const isFirst = step === 0;
  const isLast = step === total - 1;

  // Gate: if current lesson has a quiz and it hasn't been passed, block Next
  const hasQuiz = !!lesson.quiz;
  const quizPassed = passedQuizzes.has(step);
  const nextBlocked = hasQuiz && !quizPassed;

  return (
    <div className="space-y-3">
      {/* Header: step title + nav */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
            Lesson {step + 1} of {total}
          </p>
          <h4 className="text-xs font-semibold text-foreground truncate">{lesson.title}</h4>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={isFirst}
            onClick={() => setStep((s) => s - 1)}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            disabled={isLast || nextBlocked}
            onClick={() => setStep((s) => s + 1)}
            title={nextBlocked ? "Answer the quiz to continue" : undefined}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1">
        {lessons.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              // Can only jump back, or forward if no quiz blocks
              if (i <= step) setStep(i);
              else if (i === step + 1 && !nextBlocked) setStep(i);
            }}
            className={cn(
              "h-1.5 rounded-full transition-all duration-200",
              i === step
                ? "w-4 bg-primary"
                : i < step
                  ? "w-1.5 bg-primary/50"
                  : "w-1.5 bg-muted-foreground/25",
            )}
            aria-label={`Go to lesson ${i + 1}`}
          />
        ))}
        {completed && (
          <span className="ml-auto text-[8px] font-mono text-primary flex items-center gap-0.5">
            <BookmarkCheck className="h-3 w-3" /> Complete
          </span>
        )}
      </div>

      {/* Body text */}
      <p className="text-[11px] font-mono text-foreground/85 leading-relaxed">
        {lesson.body}
      </p>

      {/* Example block */}
      {lesson.example && (
        <LessonExample
          example={lesson.example}
          isPlaying={isPlaying}
          onPlay={playExample}
        />
      )}

      {/* Callout */}
      {lesson.callout && <LessonCallout callout={lesson.callout} />}

      {/* Key takeaway */}
      <div className="rounded-md border-l-2 border-primary bg-primary/5 px-3 py-2">
        <p className="text-[10px] font-mono font-semibold text-foreground leading-relaxed">
          <span className="text-primary">↳ </span>
          {lesson.keyTakeaway}
        </p>
      </div>

      {/* Inline quiz */}
      {hasQuiz && (
        <InlineQuiz
          quiz={lesson.quiz!}
          passed={quizPassed}
          onPass={() => handleQuizPass(step)}
        />
      )}
    </div>
  );
}

/* ─── Sub-components ───────────────────────── */

function LessonExample({
  example,
  isPlaying,
  onPlay,
}: {
  example: NonNullable<LessonStep["example"]>;
  isPlaying: boolean;
  onPlay: (notes: number[]) => void;
}) {
  const hasNotes = example.notes && example.notes.length > 0;

  return (
    <div className="rounded-md border border-border/60 bg-muted/30 overflow-hidden">
      <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-border/40">
        <Volume2 className="h-3 w-3 text-primary shrink-0" />
        <span className="text-[9px] font-mono uppercase tracking-wider text-primary font-semibold">
          Example
        </span>
      </div>
      <div className="px-2.5 py-2 space-y-2">
        <div className="flex items-center gap-2">
          {hasNotes && (
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-[10px] font-mono gap-1"
              onClick={() => onPlay(example.notes!)}
            >
              {isPlaying ? <Square className="h-2.5 w-2.5" /> : <Play className="h-2.5 w-2.5" />}
              {isPlaying ? "Stop" : "Play"}
            </Button>
          )}
          <span className="text-[10px] font-mono text-foreground/70">{example.label}</span>
        </div>
        {example.type === "keyboard" && hasNotes && (
          <div className="flex justify-center">
            <PianoKeyboard
              octaves={2}
              startOctave={4}
              highlightedNotes={example.notes!}
              compact
            />
          </div>
        )}
      </div>
    </div>
  );
}

function LessonCallout({ callout }: { callout: NonNullable<LessonStep["callout"]> }) {
  const config = {
    tip: {
      icon: Lightbulb,
      label: "Tip",
      border: "border-primary/20",
      bg: "bg-primary/5",
      iconColor: "text-primary",
    },
    warning: {
      icon: AlertTriangle,
      label: "Watch Out",
      border: "border-destructive/20",
      bg: "bg-destructive/5",
      iconColor: "text-destructive",
    },
    remember: {
      icon: BookmarkCheck,
      label: "Remember",
      border: "border-accent/20",
      bg: "bg-accent/10",
      iconColor: "text-accent-foreground",
    },
  }[callout.type];

  const Icon = config.icon;

  return (
    <div className={cn("rounded-md border px-2.5 py-2", config.border, config.bg)}>
      <div className="flex items-start gap-1.5">
        <Icon className={cn("h-3 w-3 mt-0.5 shrink-0", config.iconColor)} />
        <div>
          <span className="text-[8px] font-mono uppercase tracking-wider font-semibold text-muted-foreground">
            {config.label}
          </span>
          <p className="text-[10px] font-mono text-foreground/75 leading-relaxed mt-0.5">
            {callout.text}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Inline Quiz ───────────────────────── */

function InlineQuiz({
  quiz,
  passed,
  onPass,
}: {
  quiz: LessonQuiz;
  passed: boolean;
  onPass: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  // Reset when quiz changes
  useEffect(() => {
    if (!passed) {
      setSelected(null);
      setRevealed(false);
    }
  }, [quiz.question, passed]);

  const isCorrect = selected === quiz.correctIndex;

  const handleSelect = (index: number) => {
    if (passed || revealed) return;
    setSelected(index);
    setRevealed(true);
    if (index === quiz.correctIndex) {
      onPass();
    }
  };

  const handleRetry = () => {
    setSelected(null);
    setRevealed(false);
  };

  return (
    <div className={cn(
      "rounded-md border overflow-hidden transition-colors",
      passed
        ? "border-primary/30 bg-primary/5"
        : "border-border/60 bg-muted/20",
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 px-2.5 py-1.5 border-b border-border/40">
        <HelpCircle className="h-3 w-3 text-primary shrink-0" />
        <span className="text-[9px] font-mono uppercase tracking-wider text-primary font-semibold">
          Check Your Understanding
        </span>
        {passed && (
          <CheckCircle2 className="h-3 w-3 text-primary ml-auto" />
        )}
      </div>

      <div className="px-2.5 py-2 space-y-2">
        <p className="text-[10px] font-mono font-semibold text-foreground leading-relaxed">
          {quiz.question}
        </p>

        <div className="grid gap-1">
          {quiz.options.map((option, i) => {
            const isThis = selected === i;
            const isRight = i === quiz.correctIndex;

            let optionStyle = "border-border/40 bg-background hover:bg-muted/50";
            if (revealed || passed) {
              if (isRight) {
                optionStyle = "border-primary/50 bg-primary/10";
              } else if (isThis && !isRight) {
                optionStyle = "border-destructive/50 bg-destructive/5";
              } else {
                optionStyle = "border-border/20 bg-background opacity-50";
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={passed || revealed}
                className={cn(
                  "flex items-center gap-2 w-full text-left px-2.5 py-1.5 rounded-md border transition-all text-[10px] font-mono",
                  optionStyle,
                  !revealed && !passed && "cursor-pointer",
                )}
              >
                <span className={cn(
                  "flex items-center justify-center h-4 w-4 rounded-full border text-[8px] font-bold shrink-0",
                  revealed && isRight
                    ? "border-primary bg-primary text-primary-foreground"
                    : revealed && isThis && !isRight
                      ? "border-destructive bg-destructive text-destructive-foreground"
                      : "border-muted-foreground/30 text-muted-foreground",
                )}>
                  {revealed && isRight ? "✓" : revealed && isThis && !isRight ? "✗" : String.fromCharCode(65 + i)}
                </span>
                <span className="text-foreground/80">{option}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {revealed && (
          <div className={cn(
            "rounded-md px-2.5 py-2 text-[10px] font-mono leading-relaxed",
            isCorrect
              ? "bg-primary/10 text-foreground"
              : "bg-destructive/5 text-foreground",
          )}>
            <div className="flex items-start gap-1.5">
              {isCorrect ? (
                <CheckCircle2 className="h-3 w-3 text-primary shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-3 w-3 text-destructive shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-semibold">
                  {isCorrect ? "Correct! " : "Not quite. "}
                </span>
                {quiz.explanation}
              </div>
            </div>
            {!isCorrect && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-[10px] font-mono mt-2"
                onClick={handleRetry}
              >
                Try Again
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
