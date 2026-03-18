import { useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WaveformVisual } from "./WaveformVisual";
import { KnowledgeCheckQuiz } from "./KnowledgeCheckQuiz";
import type { LearnPage } from "@/data/module1Content";

interface LessonContentViewerProps {
  pages: LearnPage[];
  onComplete: () => void;
}

export function LessonContentViewer({ pages, onComplete }: LessonContentViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const page = pages[currentPage];
  const isLast = currentPage === pages.length - 1;

  const goNext = () => {
    if (isLast) return;
    setCurrentPage((p) => p + 1);
  };

  const goBack = () => setCurrentPage((p) => Math.max(0, p - 1));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page content */}
      <div className="space-y-4">
        <h3 className="text-lg font-mono font-bold">{page.title}</h3>

        {/* Body text with markdown-like bold */}
        <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
          {page.body.split(/(\*\*.*?\*\*)/g).map((part, i) =>
            part.startsWith("**") && part.endsWith("**") ? (
              <strong key={i} className="text-foreground font-semibold">
                {part.slice(2, -2)}
              </strong>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </div>

        {/* Interactive waveform */}
        {page.interactive === "waveform" && <WaveformVisual />}

        {/* Key takeaway */}
        {page.keyTakeaway && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 flex items-start gap-3">
              <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-mono text-primary uppercase tracking-wider mb-1">Key Takeaway</p>
                <p className="text-sm font-medium">{page.keyTakeaway}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quiz gate */}
        {page.quiz && (
          <KnowledgeCheckQuiz
            question={page.quiz.question}
            options={page.quiz.options}
            correctIndex={page.quiz.correctIndex}
            explanation={page.quiz.explanation}
            onPass={onComplete}
          />
        )}
      </div>

      {/* Navigation */}
      {!page.quiz && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1"
            onClick={goBack}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-3 w-3" /> Back
          </Button>

          {/* Progress dots */}
          <div className="flex gap-1.5">
            {pages.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === currentPage
                    ? "w-4 bg-primary"
                    : i < currentPage
                    ? "w-1.5 bg-primary/40"
                    : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>

          <Button size="sm" className="text-xs gap-1" onClick={goNext} disabled={isLast}>
            Next <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
