import { BookOpen, Check, ChevronRight, X } from "lucide-react";

export interface LessonPanelStep {
  id: string;
  title: string;
  description: string;
  completed?: boolean;
  action?: string;
}

export interface LessonPanelLesson {
  title: string;
  currentStep: number;
  steps: LessonPanelStep[];
}

interface LessonPanelProps {
  lesson: LessonPanelLesson | null;
  onClose?: () => void;
}

function LessonStepCard({
  step,
}: {
  step: LessonPanelStep;
}) {
  return (
    <div className="space-y-2">
      <h4 className="font-mono text-sm font-semibold tracking-tight text-foreground">{step.title}</h4>
      <p className="font-mono text-xs leading-relaxed text-muted-foreground">{step.description}</p>
      {step.action ? (
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-primary">
          <ChevronRight className="h-3 w-3" />
          <span className="capitalize">{step.action}</span>
        </div>
      ) : null}
    </div>
  );
}

export function LessonPanel({ lesson, onClose }: LessonPanelProps) {
  if (!lesson) {
    return (
      <div className="flex w-80 flex-col overflow-hidden rounded-[24px] border border-[color:var(--lesson-border)] bg-[var(--lesson-bg)] shadow-[var(--shadow-xl)] backdrop-blur-xl">
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <BookOpen className="mb-4 h-12 w-12 text-foreground/20" />
          <p className="text-center font-mono text-sm text-muted-foreground">No active lesson</p>
        </div>
      </div>
    );
  }

  const currentStep = lesson.steps[lesson.currentStep];
  const progress = ((lesson.currentStep + 1) / lesson.steps.length) * 100;

  return (
    <div className="flex w-80 flex-col overflow-hidden rounded-[24px] border border-[color:var(--lesson-border)] bg-[var(--lesson-bg)] shadow-[var(--shadow-xl)] backdrop-blur-xl">
      <div className="border-b border-[color:var(--lesson-border)] bg-[color:color-mix(in_srgb,var(--surface-2)_78%,transparent)] p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Lesson</span>
            </div>
            <h3 className="font-mono text-sm font-semibold tracking-tight text-foreground">{lesson.title}</h3>
          </div>
          {onClose ? (
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors hover:border-[color:var(--lesson-border)] hover:bg-[var(--surface-2)] hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
            <span>Step {lesson.currentStep + 1} of {lesson.steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-3)]">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="border-b border-[color:var(--lesson-border)] bg-[var(--lesson-highlight)] p-4">
        <LessonStepCard step={currentStep} />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {lesson.steps.map((step, index) => (
            <div
              key={step.id}
              className={[
                "rounded-xl p-3 transition-colors",
                index === lesson.currentStep
                  ? "border border-[color:var(--lesson-border)] bg-[var(--lesson-highlight)]"
                  : step.completed
                    ? "bg-[var(--surface-1)] opacity-70"
                    : "bg-[var(--surface-1)]",
              ].join(" ")}
            >
              <div className="flex items-start gap-2">
                <div
                  className={[
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                    step.completed
                      ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]"
                      : index === lesson.currentStep
                        ? "bg-primary text-primary-foreground"
                        : "bg-[var(--surface-3)] text-muted-foreground",
                  ].join(" ")}
                >
                  {step.completed ? <Check className="h-3 w-3" /> : <span className="text-xs">{index + 1}</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 font-mono text-xs font-medium text-foreground">{step.title}</div>
                  {index === lesson.currentStep ? (
                    <div className="line-clamp-2 font-mono text-xs text-muted-foreground">{step.description}</div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[color:var(--lesson-border)] bg-[color:color-mix(in_srgb,var(--surface-2)_74%,transparent)] p-4">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-primary-foreground shadow-[var(--shadow-sm)] transition-colors hover:brightness-110">
          <span className="font-mono text-sm font-medium">Continue</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
