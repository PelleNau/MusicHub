import { useState } from "react";
import { CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface KnowledgeCheckQuizProps {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  onPass: () => void;
}

export function KnowledgeCheckQuiz({ question, options, correctIndex, explanation, onPass }: KnowledgeCheckQuizProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");

  const handleSelect = (idx: number) => {
    if (status === "correct") return;
    setSelected(idx);
    if (idx === correctIndex) {
      setStatus("correct");
    } else {
      setStatus("wrong");
    }
  };

  const handleRetry = () => {
    setSelected(null);
    setStatus("idle");
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-mono font-semibold">Knowledge Check</h4>
        </div>

        <p className="text-sm leading-relaxed">{question}</p>

        <div className="space-y-2">
          {options.map((opt, idx) => {
            const isSelected = selected === idx;
            const isCorrectOption = idx === correctIndex;
            let borderClass = "border-border hover:border-primary/40";
            if (isSelected && status === "correct") borderClass = "border-primary bg-primary/10";
            else if (isSelected && status === "wrong") borderClass = "border-destructive bg-destructive/10";
            else if (status === "correct" && isCorrectOption) borderClass = "border-primary/30";

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={status === "correct"}
                className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${borderClass} ${
                  status === "correct" && !isCorrectOption ? "opacity-40" : ""
                }`}
              >
                <span className="font-mono text-xs text-muted-foreground mr-2">
                  {String.fromCharCode(65 + idx)}.
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {status === "correct" && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 animate-fade-in">
            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-primary">Correct!</p>
              <p className="text-xs text-muted-foreground mt-1">{explanation}</p>
            </div>
          </div>
        )}

        {status === "wrong" && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 animate-fade-in">
            <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-destructive">Not quite — try again!</p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          {status === "wrong" && (
            <Button variant="ghost" size="sm" className="text-xs" onClick={handleRetry}>
              Try Again
            </Button>
          )}
          {status === "correct" && (
            <Button size="sm" className="text-xs" onClick={onPass}>
              Continue to Practice →
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
