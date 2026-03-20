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
      <h4 className="text-sm text-white">{step.title}</h4>
      <p className="text-xs leading-relaxed text-white/70">{step.description}</p>
      {step.action ? (
        <div className="flex items-center gap-2 text-xs text-[hsl(212_78%_60%)]">
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
      <div className="flex w-80 flex-col border-l border-[hsl(240_8%_24%)] bg-[hsl(240_10%_14%)]">
        <div className="flex flex-1 flex-col items-center justify-center p-6">
          <BookOpen className="mb-4 h-12 w-12 text-white/20" />
          <p className="text-center text-sm text-white/40">No active lesson</p>
        </div>
      </div>
    );
  }

  const currentStep = lesson.steps[lesson.currentStep];
  const progress = ((lesson.currentStep + 1) / lesson.steps.length) * 100;

  return (
    <div className="flex w-80 flex-col border-l border-[hsl(240_8%_24%)] bg-[hsl(240_10%_14%)]">
      <div className="border-b border-[hsl(240_8%_24%)] p-4">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-[hsl(212_78%_60%)]" />
              <span className="text-xs text-white/60">Lesson</span>
            </div>
            <h3 className="text-sm text-white">{lesson.title}</h3>
          </div>
          {onClose ? (
            <button
              onClick={onClose}
              className="flex h-6 w-6 items-center justify-center rounded text-white/60 transition-colors hover:bg-[hsl(240_10%_18%)] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>Step {lesson.currentStep + 1} of {lesson.steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[hsl(240_10%_18%)]">
            <div className="h-full bg-[hsl(212_78%_60%)] transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="border-b border-[hsl(240_8%_22%)] bg-[hsla(212,78%,60%,0.08)] p-4">
        <LessonStepCard step={currentStep} />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {lesson.steps.map((step, index) => (
            <div
              key={step.id}
              className={[
                "rounded p-3 transition-colors",
                index === lesson.currentStep
                  ? "border border-[hsl(240_8%_22%)] bg-[hsla(212,78%,60%,0.08)]"
                  : step.completed
                    ? "bg-[hsl(240_10%_15%)] opacity-60"
                    : "bg-[hsl(240_10%_15%)]",
              ].join(" ")}
            >
              <div className="flex items-start gap-2">
                <div
                  className={[
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                    step.completed
                      ? "bg-[hsl(140_65%_45%)] text-white"
                      : index === lesson.currentStep
                        ? "bg-[hsl(212_78%_60%)] text-white"
                        : "bg-[hsl(240_10%_18%)] text-white/40",
                  ].join(" ")}
                >
                  {step.completed ? <Check className="h-3 w-3" /> : <span className="text-xs">{index + 1}</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 text-xs text-white/90">{step.title}</div>
                  {index === lesson.currentStep ? (
                    <div className="line-clamp-2 text-xs text-white/60">{step.description}</div>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[hsl(240_8%_24%)] p-4">
        <button className="flex w-full items-center justify-center gap-2 rounded bg-[hsl(212_78%_60%)] py-2 text-white transition-colors hover:bg-[hsl(212_78%_64%)]">
          <span className="text-sm">Continue</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
