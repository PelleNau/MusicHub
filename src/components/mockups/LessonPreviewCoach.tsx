import { CheckCircle2, Circle, ChevronRight, Lightbulb, RotateCcw, Zap, Target, PartyPopper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { LessonDefinition } from "@/types/lessonDsl";
import { useState } from "react";

interface LessonPreviewCoachProps {
  lesson: LessonDefinition;
  currentStepIndex: number;
  onAdvance: () => void;
  onReset: () => void;
}

export function LessonPreviewCoach({ lesson, currentStepIndex, onAdvance, onReset }: LessonPreviewCoachProps) {
  const [showHint, setShowHint] = useState(false);
  const isComplete = currentStepIndex >= lesson.steps.length;

  // Reset hint visibility when step changes
  const activeStep = lesson.steps[currentStepIndex] ?? null;

  return (
    <div className="w-80 border-l border-border bg-chrome shrink-0 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-accent/5">
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{lesson.module}</p>
        <h3 className="text-sm font-mono font-semibold mt-1">{lesson.title}</h3>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary" className="text-[9px] h-4 px-1.5">{lesson.lessonId}</Badge>
          <span className="text-[10px] text-muted-foreground">{lesson.duration}</span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-5">
          {/* Completion state */}
          {isComplete ? (
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                <PartyPopper className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Lesson Complete!</h4>
                <p className="text-xs text-muted-foreground mt-1">All steps finished.</p>
              </div>
              <Separator />
              <div className="text-left space-y-2">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Objectives</p>
                {lesson.objectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-xs text-foreground">{obj}</span>
                  </div>
                ))}
              </div>
              {lesson.capstone && (
                <>
                  <Separator />
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-3">
                      <p className="text-[10px] font-mono text-primary uppercase tracking-wider mb-1">Capstone</p>
                      <ul className="text-[11px] text-muted-foreground space-y-0.5">
                        {lesson.capstone.requirements.minimumTracks && (
                          <li>≥ {lesson.capstone.requirements.minimumTracks} track(s)</li>
                        )}
                        {lesson.capstone.requirements.parameterChanges && (
                          <li>≥ {lesson.capstone.requirements.parameterChanges} parameter change(s)</li>
                        )}
                        {lesson.capstone.requirements.playbackOccurred && <li>Playback verified</li>}
                      </ul>
                    </CardContent>
                  </Card>
                </>
              )}
              <Button variant="outline" size="sm" className="w-full text-xs" onClick={onReset}>
                <RotateCcw className="h-3 w-3 mr-1" /> Restart Lesson
              </Button>
            </div>
          ) : (
            <>
              {/* Progress */}
              <div className="flex items-center gap-1.5">
                {lesson.steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i < currentStepIndex ? "bg-primary" : i === currentStepIndex ? "bg-primary/50" : "bg-muted"
                    }`}
                  />
                ))}
                <span className="text-[10px] font-mono text-muted-foreground ml-1">
                  {currentStepIndex + 1}/{lesson.steps.length}
                </span>
              </div>

              {/* Vertical stepper */}
              <div className="relative pl-5">
                <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-border" />
                {lesson.steps.map((step, i) => {
                  const isDone = i < currentStepIndex;
                  const isActive = i === currentStepIndex;
                  return (
                    <div
                      key={step.stepId}
                      className="relative flex items-start gap-3 mb-4 last:mb-0 animate-fade-in"
                      style={{ animationDelay: `${i * 50}ms`, animationFillMode: "backwards" }}
                    >
                      <div className="absolute -left-5 shrink-0 z-10">
                        {isDone ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : isActive ? (
                          <div className="h-5 w-5 rounded-full border-2 border-primary bg-primary/20 animate-pulse" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground/40" />
                        )}
                      </div>
                      <div
                        className={`text-xs leading-relaxed pt-0.5 ${
                          isDone
                            ? "text-muted-foreground line-through"
                            : isActive
                              ? "text-foreground font-semibold"
                              : "text-muted-foreground/60"
                        }`}
                      >
                        {step.instruction}
                        {isActive && step.expectedAction && (
                          <Badge variant="outline" className="text-[9px] h-4 px-1.5 ml-1 font-mono">
                            {step.expectedAction}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator />

              {/* Active step detail */}
              {activeStep && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                      Anchor: <span className="text-foreground">{activeStep.anchor}</span>
                    </span>
                  </div>

                  {activeStep.validation && (
                    <Card className="bg-secondary/30 border-border">
                      <CardContent className="p-3 text-[11px] text-muted-foreground space-y-0.5">
                        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80 mb-1">Validation</p>
                        <p>param: <span className="text-foreground font-mono">{activeStep.validation.parameter}</span></p>
                        {activeStep.validation.delta !== undefined && <p>delta: {activeStep.validation.delta}</p>}
                        {activeStep.validation.changed !== undefined && <p>changed: {String(activeStep.validation.changed)}</p>}
                        {activeStep.validation.eventCount !== undefined && <p>eventCount: ≥ {activeStep.validation.eventCount}</p>}
                      </CardContent>
                    </Card>
                  )}

                  {activeStep.hint && (
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
                    >
                      <Lightbulb className="h-3.5 w-3.5 text-warning" />
                      <span>{showHint ? "Hide hint" : "Show hint"}</span>
                    </button>
                  )}
                  {showHint && activeStep.hint && (
                    <p className="text-xs text-warning/90 bg-warning/10 rounded-lg p-3 animate-fade-in">
                      {activeStep.hint}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <Button
                  className="w-full h-10 text-xs bg-gradient-to-r from-primary to-primary/80 font-semibold gap-1.5"
                  onClick={() => { onAdvance(); setShowHint(false); }}
                >
                  <ChevronRight className="h-4 w-4" /> Simulate Complete
                </Button>
                <Button variant="ghost" className="w-full h-8 text-xs text-muted-foreground" onClick={onReset}>
                  <RotateCcw className="h-3 w-3 mr-1" /> Reset
                </Button>
              </div>

              {/* XP reward */}
              <div className="flex items-center gap-2 text-xs font-mono p-3 rounded-lg bg-secondary/50">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Reward:</span>
                <span className="font-semibold">15 XP</span>
              </div>
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
