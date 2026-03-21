import type { ReactNode } from "react";

export interface FigmaLessonStepCardProps {
  title?: string;
  description?: string;
  content?: ReactNode;
  imageUrl?: string;
  videoUrl?: string;
  actionLabel?: string;
  onAction?: () => void;
  onComplete?: () => void;
  isCompleted?: boolean;
  stepNumber?: number;
  totalSteps?: number;
  className?: string;
}

export function FigmaLessonStepCard({
  title = "Step",
  description,
  content,
  imageUrl,
  videoUrl,
  actionLabel = "Continue",
  onAction,
  onComplete,
  isCompleted = false,
  stepNumber,
  totalSteps,
  className = "",
}: FigmaLessonStepCardProps) {
  return (
    <div className={`overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-1)] ${className}`}>
      {imageUrl || videoUrl ? (
        <div className="aspect-video bg-gradient-to-br from-indigo-600/20 to-purple-600/20">
          {imageUrl ? <img src={imageUrl} alt={title} className="h-full w-full object-cover" /> : null}
          {videoUrl ? <video src={videoUrl} className="h-full w-full object-cover" controls /> : null}
        </div>
      ) : null}

      <div className="p-6">
        {stepNumber !== undefined && totalSteps !== undefined ? (
          <div className="mb-2 text-xs text-[var(--muted-foreground)]">
            Step {stepNumber} of {totalSteps}
          </div>
        ) : null}

        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        {description ? <p className="mb-4 text-sm text-[var(--muted-foreground)]">{description}</p> : null}
        {content ? <div className="mb-4">{content}</div> : null}

        <div className="flex items-center gap-3">
          {!isCompleted && onComplete ? (
            <button
              onClick={onComplete}
              className="rounded bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
            >
              Mark Complete
            </button>
          ) : null}

          {isCompleted ? (
            <div className="flex items-center gap-2 text-green-500">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              <span className="font-medium">Completed</span>
            </div>
          ) : null}

          {onAction ? (
            <button
              onClick={onAction}
              className="rounded bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
            >
              {actionLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
