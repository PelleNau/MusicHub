import { BookOpen, Check, ChevronRight } from "lucide-react";

import { LessonPanel, type LessonPanelLesson } from "@/components/studio/LessonPanel";

const lesson: LessonPanelLesson = {
  title: "Creating Your First Track",
  currentStep: 1,
  steps: [
    {
      id: "add-track",
      title: "Add an audio track",
      description: "Click the + button in the arrangement view to create your first audio track.",
      completed: true,
      action: "click",
    },
    {
      id: "arm-track",
      title: "Arm the track for recording",
      description: "Enable record arm on the new audio track so it can capture incoming audio.",
      action: "toggle",
    },
    {
      id: "start-recording",
      title: "Start recording",
      description: "Press record and capture a short phrase in the empty section of the arrangement.",
    },
    {
      id: "stop-review",
      title: "Stop and review",
      description: "Stop transport playback and review the newly recorded clip in the arrangement view.",
    },
  ],
};

function RawLessonPanel({ lesson }: { lesson: LessonPanelLesson }) {
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
        <div className="space-y-2">
          <h4 className="text-sm text-white">{currentStep.title}</h4>
          <p className="text-xs leading-relaxed text-white/70">{currentStep.description}</p>
          {currentStep.action ? (
            <div className="flex items-center gap-2 text-xs text-[hsl(212_78%_60%)]">
              <ChevronRight className="h-3 w-3" />
              <span className="capitalize">{currentStep.action}</span>
            </div>
          ) : null}
        </div>
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
                  {index === lesson.currentStep ? <div className="line-clamp-2 text-xs text-white/60">{step.description}</div> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-[hsl(240_8%_24%)] p-4">
        <button className="flex w-full items-center justify-center gap-2 rounded bg-[hsl(212_78%_60%)] py-2 text-white">
          <span className="text-sm">Continue</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function LessonPanelThemePreview() {
  return (
    <div className="min-h-screen bg-[hsl(240_10%_10%)] px-6 py-8 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="space-y-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/45">Preview</div>
          <h1 className="font-mono text-xl font-semibold tracking-tight text-white">Lesson Panel Theme Comparison</h1>
          <p className="max-w-3xl font-mono text-sm text-white/60">
            Left: raw imported styling. Right: design-token treatment using the MusicHub semantic lesson and surface tokens.
          </p>
        </header>

        <div className="grid gap-8 xl:grid-cols-2">
          <section className="space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">Raw Imported</div>
            <RawLessonPanel lesson={lesson} />
          </section>

          <section className="space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">Tokenized</div>
            <LessonPanel lesson={lesson} />
          </section>
        </div>
      </div>
    </div>
  );
}
