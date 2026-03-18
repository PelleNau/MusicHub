import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, CheckCircle2, Sparkles, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PhaseTransitionOverlay } from "@/components/mockups/PhaseTransitionOverlay";
import { ModuleCompletionCelebration } from "@/components/mockups/ModuleCompletionCelebration";
import { InteractionGate } from "@/components/mockups/InteractionGate";
import { MODULE_1_LESSONS, CAPSTONE_LESSON, MODULE_1_META, type ModuleLesson } from "@/data/module1Content";
import { LessonRenderer } from "@/components/mockups/LessonRenderer";

const ALL_LESSONS = [...MODULE_1_LESSONS, CAPSTONE_LESSON];

export default function MockModuleFlow() {
  const navigate = useNavigate();
  const [lessonIdx, setLessonIdx] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [transition, setTransition] = useState<{ from: string; to: string } | null>(null);
  const [moduleComplete, setModuleComplete] = useState(false);
  const [requirements, setRequirements] = useState<Record<string, boolean>>({});

  const lesson = ALL_LESSONS[lessonIdx];
  const isCapstone = lesson.id === "capstone";
  const isLast = lessonIdx === ALL_LESSONS.length - 1;

  // Initialize requirements for current lesson
  const resetRequirements = useCallback((l: ModuleLesson) => {
    const reqs: Record<string, boolean> = {};
    Object.entries(l.requirements).forEach(([key, label]) => {
      reqs[label] = false;
    });
    setRequirements(reqs);
  }, []);

  // Mark a requirement as met
  const markRequirement = useCallback((label: string) => {
    setRequirements((prev) => ({ ...prev, [label]: true }));
  }, []);

  // Advance to next lesson
  const advanceLesson = useCallback(() => {
    const currentId = ALL_LESSONS[lessonIdx].id;
    setCompletedLessons((prev) => new Set([...prev, currentId]));

    if (isLast) {
      setModuleComplete(true);
      return;
    }

    const nextIdx = lessonIdx + 1;
    const nextLesson = ALL_LESSONS[nextIdx];
    setTransition({ from: currentId, to: nextLesson.id });
  }, [lessonIdx, isLast]);

  const handleTransitionDone = useCallback(() => {
    if (!transition) return;
    const nextIdx = ALL_LESSONS.findIndex((l) => l.id === transition.to);
    setLessonIdx(nextIdx);
    resetRequirements(ALL_LESSONS[nextIdx]);
    setTransition(null);
  }, [transition, resetRequirements]);

  // Initialize first lesson requirements
  useState(() => { resetRequirements(ALL_LESSONS[0]); });

  // XP
  const earnedXp = useMemo(() => {
    return ALL_LESSONS.filter((l) => completedLessons.has(l.id)).reduce((sum, l) => sum + l.xp, 0);
  }, [completedLessons]);

  const totalXp = ALL_LESSONS.reduce((sum, l) => sum + l.xp, 0);

  // Module complete
  if (moduleComplete) {
    return (
      <div className="flex items-center justify-center p-6 h-full">
        <ModuleCompletionCelebration
          title={MODULE_1_META.title}
          objectives={["Explored pitch", "Explored loudness", "Explored waveform differences", "Navigated Studio", "Created a sound scene"]}
          totalXp={totalXp}
          onNext={() => navigate("/mockup/learn/level")}
        />
      </div>
    );
  }

  return (
    <div className="text-foreground flex flex-col h-full">
      {/* Transition overlay */}
      {transition && (
        <PhaseTransitionOverlay
          completedPhase="learn"
          nextPhase="practice"
          onDone={handleTransitionDone}
        />
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Lesson stepper sidebar */}
        <div className="w-56 shrink-0 border-r border-border bg-chrome/50 overflow-auto py-3">
          {ALL_LESSONS.map((l, i) => {
            const isDone = completedLessons.has(l.id);
            const isActive = i === lessonIdx;
            const isLocked = i > lessonIdx && !isDone;
            return (
              <button
                key={l.id}
                onClick={() => {
                  if (!isLocked) {
                    setLessonIdx(i);
                    resetRequirements(ALL_LESSONS[i]);
                  }
                }}
                disabled={isLocked}
                className={`w-full flex items-start gap-2.5 px-4 py-2.5 text-left transition-all ${
                  isActive
                    ? "bg-primary/10 border-r-2 border-primary"
                    : isDone
                    ? "opacity-60 hover:opacity-80"
                    : isLocked
                    ? "opacity-30"
                    : ""
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  ) : isActive ? (
                    <div className="h-4 w-4 rounded-full border-2 border-primary shadow-[0_0_6px_hsl(var(--primary)/0.4)]" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-border" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className={`text-[10px] font-mono ${l.id === "capstone" ? "text-accent" : "text-muted-foreground"}`}>
                    {l.id === "capstone" ? "Capstone" : `Lesson ${l.id}`}
                  </p>
                  <p className={`text-xs font-mono truncate ${isActive ? "font-semibold" : ""}`}>{l.title}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: Lesson content */}
        <ScrollArea className="flex-1">
          <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
            {/* Lesson header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono uppercase tracking-wider ${
                  isCapstone ? "text-accent" : "text-primary"
                }`}>
                  {isCapstone ? "Capstone Project" : `Lesson ${lesson.id}`}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">· {lesson.xp} XP</span>
              </div>
              <h2 className="text-xl font-mono font-bold">{lesson.title}</h2>
              <p className="text-xs font-mono text-muted-foreground">{lesson.subtitle}</p>
            </div>

            {/* Body text with basic markdown */}
            <div className="text-sm leading-relaxed text-muted-foreground space-y-3">
              {lesson.body.split("\n\n").map((para, i) => (
                <p key={i} dangerouslySetInnerHTML={{
                  __html: para
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                }} />
              ))}
            </div>

            {/* Key takeaway */}
            {lesson.keyTakeaway && (
              <div className="flex gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs font-mono text-foreground leading-relaxed">{lesson.keyTakeaway}</p>
              </div>
            )}

            {/* Interactive widget */}
            <LessonRenderer
              interactive={lesson.interactive}
              onRequirementMet={markRequirement}
              requirements={lesson.requirements}
            />

            {/* Interaction gate */}
            <InteractionGate
              requirements={requirements}
              onContinue={advanceLesson}
              continueLabel={isLast ? "Complete Module" : "Next Lesson"}
            />
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
