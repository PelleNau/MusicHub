import { useState, useEffect, useMemo, useCallback } from "react";
import { CheckCircle, XCircle, SkipForward, Eye, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CHALLENGE_DATA, Challenge } from "./challengeData";
import { useChallengeProgress } from "@/hooks/useChallengeProgress";
import { useTheoryStats, XP_FIRST_TRY, XP_RETRY, XP_MODULE_BONUS } from "@/hooks/useTheoryStats";
import { XPDisplay } from "./XPDisplay";
import { useToast } from "@/hooks/use-toast";

interface TheoryChallengeProps {
  moduleKey: string;
  activeNotes?: number[];
  onShowAnswer?: (notes: number[]) => void;
}

function arraysMatchUnordered(a: number[], b: number[]): boolean {
  const sa = [...new Set(a.map((n) => ((n % 12) + 12) % 12))].sort((x, y) => x - y);
  const sb = [...new Set(b.map((n) => ((n % 12) + 12) % 12))].sort((x, y) => x - y);
  return sa.length === sb.length && sa.every((v, i) => v === sb[i]);
}

export function TheoryChallenge({ moduleKey, activeNotes = [], onShowAnswer }: TheoryChallengeProps) {
  const challenges = useMemo(() => CHALLENGE_DATA[moduleKey] ?? [], [moduleKey]);
  const { completedSet, loading, markCompleted, resetProgress } = useChallengeProgress(moduleKey);
  const { xp, currentStreak, loading: statsLoading, awardXP } = useTheoryStats();
  const { toast } = useToast();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [status, setStatus] = useState<"waiting" | "correct" | "wrong">("waiting");
  const [showHint, setShowHint] = useState(false);
  const [hadWrongAttempt, setHadWrongAttempt] = useState(false);

  const challenge: Challenge | undefined = challenges[currentIdx];
  const pct = challenges.length > 0 ? Math.round((completedSet.size / challenges.length) * 100) : 0;
  const allDone = challenges.length > 0 && completedSet.size === challenges.length;

  useEffect(() => {
    setSelectedAnswer(null);
    setStatus(completedSet.has(currentIdx) ? "correct" : "waiting");
    setShowHint(false);
    setHadWrongAttempt(false);
  }, [currentIdx, completedSet]);

  const handleCorrect = useCallback(() => {
    const earned = hadWrongAttempt ? XP_RETRY : XP_FIRST_TRY;
    awardXP(earned);
    toast({ title: `+${earned} XP`, description: hadWrongAttempt ? "Correct on retry" : "First try!", duration: 1500 });

    // Check if this completion finishes the module
    const newSize = completedSet.size + (completedSet.has(currentIdx) ? 0 : 1);
    if (newSize === challenges.length && !allDone) {
      setTimeout(() => {
        awardXP(XP_MODULE_BONUS);
        toast({ title: `+${XP_MODULE_BONUS} XP Bonus!`, description: "Module complete 🏆", duration: 2500 });
      }, 600);
    }
  }, [hadWrongAttempt, awardXP, toast, completedSet, currentIdx, challenges.length, allDone]);

  useEffect(() => {
    if (!challenge || challenge.type !== "play-notes" || !challenge.expectedNotes) return;
    if (status === "correct") return;
    if (activeNotes.length === 0) return;
    if (arraysMatchUnordered(activeNotes, challenge.expectedNotes)) {
      setStatus("correct");
      markCompleted(currentIdx);
      handleCorrect();
    }
  }, [activeNotes, challenge, currentIdx, status, markCompleted, handleCorrect]);

  const handleIdentifyAnswer = useCallback((option: string) => {
    if (status === "correct") return;
    setSelectedAnswer(option);
    if (challenge?.answer === option) {
      setStatus("correct");
      markCompleted(currentIdx);
      handleCorrect();
    } else {
      setStatus("wrong");
      setHadWrongAttempt(true);
    }
  }, [challenge, currentIdx, status, markCompleted, handleCorrect]);

  const goNext = () => { if (currentIdx < challenges.length - 1) setCurrentIdx(currentIdx + 1); };
  const goSkip = () => { if (currentIdx < challenges.length - 1) setCurrentIdx(currentIdx + 1); };
  const handleReset = () => { setCurrentIdx(0); setStatus("waiting"); setSelectedAnswer(null); setShowHint(false); setHadWrongAttempt(false); resetProgress(); };

  const handleShowAnswer = () => {
    setShowHint(true);
    if (challenge?.expectedNotes && onShowAnswer) onShowAnswer(challenge.expectedNotes);
  };

  if (challenges.length === 0) {
    return <p className="text-[10px] font-mono text-muted-foreground/50">No challenges available for this module yet.</p>;
  }

  if (loading || statsLoading) {
    return <p className="text-[10px] font-mono text-muted-foreground/50 animate-pulse">Loading progress…</p>;
  }

  return (
    <div className="space-y-3">
      {/* XP & Streak display */}
      <XPDisplay xp={xp} streak={currentStreak} />

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider">
            Progress
          </span>
          <span className="text-[9px] font-mono text-muted-foreground">
            {completedSet.size}/{challenges.length} completed
          </span>
        </div>
        <Progress value={pct} className="h-1.5" />
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1.5">
        {challenges.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIdx(i)}
            className={`h-2 w-2 rounded-full transition-colors ${
              completedSet.has(i)
                ? "bg-primary"
                : i === currentIdx
                  ? "bg-foreground/40 ring-1 ring-foreground/20"
                  : "bg-muted-foreground/20"
            }`}
          />
        ))}
        <span className="text-[9px] font-mono text-muted-foreground ml-2">
          {currentIdx + 1} of {challenges.length}
        </span>
      </div>

      {allDone && (
        <div className="flex items-center gap-2 p-2 rounded-md bg-primary/10 border border-primary/20">
          <Trophy className="h-4 w-4 text-primary" />
          <span className="text-xs font-mono font-semibold text-primary">All challenges completed!</span>
        </div>
      )}

      {challenge && (
        <>
          <p className="text-sm font-mono font-semibold text-foreground leading-relaxed">
            {challenge.prompt}
          </p>

          {challenge.type === "identify" && challenge.options && (
            <div className="grid grid-cols-2 gap-2">
              {challenge.options.map((opt) => {
                const isSelected = selectedAnswer === opt;
                const isCorrect = opt === challenge.answer;
                const showCorrect = status === "correct" && isCorrect;
                const showWrong = status === "wrong" && isSelected && !isCorrect;
                return (
                  <button
                    key={opt}
                    onClick={() => handleIdentifyAnswer(opt)}
                    disabled={status === "correct"}
                    className={`px-3 py-2 rounded-md text-xs font-mono text-left transition-colors ${
                      showCorrect ? "bg-primary/20 text-primary ring-1 ring-primary/40"
                        : showWrong ? "bg-destructive/15 text-destructive ring-1 ring-destructive/30"
                        : isSelected ? "bg-muted ring-1 ring-border"
                        : "bg-muted/40 hover:bg-muted/60 text-foreground"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {challenge.type === "play-notes" && status !== "correct" && (
            <p className="text-[10px] font-mono text-muted-foreground/60">Use the keyboard above to select the notes.</p>
          )}

          {challenge.type === "build" && status !== "correct" && (
            <p className="text-[10px] font-mono text-muted-foreground/60">Use the controls above to build the answer.</p>
          )}

          {status === "correct" && (
            <div className="flex items-center gap-2 text-primary">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs font-mono font-semibold">Correct!</span>
            </div>
          )}

          {status === "wrong" && (
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-4 w-4" />
              <span className="text-xs font-mono">Try again</span>
            </div>
          )}

          {showHint && challenge.hint && (
            <div className="p-2 rounded bg-muted/50 border border-border">
              <p className="text-[10px] font-mono text-muted-foreground">{challenge.hint}</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            {status === "correct" && currentIdx < challenges.length - 1 && (
              <Button variant="outline" size="sm" className="text-[10px] font-mono h-7 gap-1.5" onClick={goNext}>
                Next <SkipForward className="h-3 w-3" />
              </Button>
            )}
            {status !== "correct" && (
              <>
                <Button variant="ghost" size="sm" className="text-[10px] font-mono h-7 gap-1.5" onClick={handleShowAnswer}>
                  <Eye className="h-3 w-3" /> Show Answer
                </Button>
                {currentIdx < challenges.length - 1 && (
                  <Button variant="ghost" size="sm" className="text-[10px] font-mono h-7 gap-1.5" onClick={goSkip}>
                    Skip <SkipForward className="h-3 w-3" />
                  </Button>
                )}
              </>
            )}
            {completedSet.size > 0 && (
              <Button variant="ghost" size="sm" className="text-[10px] font-mono h-7 gap-1.5 ml-auto" onClick={handleReset}>
                <RotateCcw className="h-3 w-3" /> Reset
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
