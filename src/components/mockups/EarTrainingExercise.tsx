import { useState, useCallback, useRef } from "react";
import { Volume2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PracticeExercise } from "@/data/module1Content";

interface EarTrainingExerciseProps {
  exercises: PracticeExercise[];
  onComplete: (score: number, total: number) => void;
}

function playTone(frequency: number, duration = 0.6) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency;
    gain.gain.value = 0.15;
    gain.gain.setValueAtTime(0.15, ctx.currentTime + duration - 0.1);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch { /* audio unavailable */ }
}

export function EarTrainingExercise({ exercises, onComplete }: EarTrainingExerciseProps) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [selected, setSelected] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const ex = exercises[idx];
  const isLast = idx === exercises.length - 1;

  const handlePlay = useCallback((freq: number) => {
    playTone(freq, 0.8);
  }, []);

  const handleAnswer = (answer: string) => {
    if (status !== "idle") return;
    setSelected(answer);
    const correct = answer === ex.correctAnswer;
    setStatus(correct ? "correct" : "wrong");
    if (correct) setScore((s) => s + 1);

    timeoutRef.current = setTimeout(() => {
      if (isLast) {
        onComplete(score + (correct ? 1 : 0), exercises.length);
      } else {
        setIdx((i) => i + 1);
        setStatus("idle");
        setSelected(null);
      }
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Progress */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((idx + (status !== "idle" ? 1 : 0)) / exercises.length) * 100}%` }}
          />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">
          {idx + 1}/{exercises.length}
        </span>
      </div>

      {/* Question */}
      <p className="text-sm font-medium">{ex.prompt}</p>

      {/* Play buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-xs"
          onClick={() => handlePlay(ex.frequencyA)}
        >
          <Volume2 className="h-3.5 w-3.5" />
          {ex.type === "compare" ? "Tone A" : "Play"}
        </Button>
        {ex.type === "compare" && ex.frequencyB && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => handlePlay(ex.frequencyB!)}
          >
            <Play className="h-3.5 w-3.5" />
            Tone B
          </Button>
        )}
      </div>

      {/* Answer options */}
      <div className="flex gap-2">
        {ex.options.map((opt) => {
          let cls = "border-border hover:border-primary/40";
          if (selected === opt && status === "correct") cls = "border-primary bg-primary/10 text-primary";
          else if (selected === opt && status === "wrong") cls = "border-destructive bg-destructive/10 text-destructive";

          return (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={status !== "idle"}
              className={`flex-1 py-3 rounded-lg border text-sm font-mono font-semibold transition-all ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {status === "correct" && (
        <p className="text-xs text-primary font-mono animate-fade-in">✓ Correct!</p>
      )}
      {status === "wrong" && (
        <p className="text-xs text-destructive font-mono animate-fade-in">✗ The answer was: {ex.correctAnswer}</p>
      )}

      {/* Score */}
      <p className="text-[10px] font-mono text-muted-foreground text-center">
        Score: {score}/{idx + (status !== "idle" ? 1 : 0)}
      </p>
    </div>
  );
}
