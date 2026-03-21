export interface FigmaLessonProgressStep {
  id: string;
  label: string;
  completed: boolean;
}

export interface FigmaLessonProgressRailProps {
  steps?: FigmaLessonProgressStep[];
  currentStep?: number;
  onStepClick?: (index: number) => void;
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function FigmaLessonProgressRail({
  steps = [],
  currentStep = 0,
  onStepClick,
  orientation = "horizontal",
  className = "",
}: FigmaLessonProgressRailProps) {
  return (
    <div className={`flex ${orientation === "vertical" ? "flex-col" : "flex-row"} items-center gap-2 ${className}`}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center gap-2">
          <button
            onClick={() => onStepClick?.(index)}
            className={[
              "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold",
              index === currentStep ? "bg-indigo-600 text-white ring-2 ring-indigo-300" : "",
              step.completed ? "bg-green-600 text-white" : "",
              !step.completed && index !== currentStep ? "bg-[var(--surface-2)] text-[var(--muted-foreground)]" : "",
            ].join(" ")}
          >
            {step.completed ? "✓" : index + 1}
          </button>
          {index < steps.length - 1 ? (
            <div
              className={`${orientation === "vertical" ? "h-8 w-0.5" : "h-0.5 w-8"} ${step.completed ? "bg-green-600" : "bg-[var(--border)]"}`}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
