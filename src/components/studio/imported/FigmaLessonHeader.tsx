export interface FigmaLessonHeaderProps {
  title?: string;
  subtitle?: string;
  progress?: number;
  onBack?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onClose?: () => void;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  className?: string;
}

export function FigmaLessonHeader({
  title = "Lesson",
  subtitle,
  progress = 0,
  onBack,
  onNext,
  onPrevious,
  onClose,
  canGoNext = true,
  canGoPrevious = false,
  className = "",
}: FigmaLessonHeaderProps) {
  return (
    <div className={`flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-1)] px-4 py-3 ${className}`}>
      <div className="flex items-center gap-3">
        {onBack ? (
          <button onClick={onBack} className="rounded p-1.5 hover:bg-[var(--surface-2)]">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ) : null}
        <div>
          <h1 className="text-lg font-semibold">{title}</h1>
          {subtitle ? <p className="text-xs text-[var(--muted-foreground)]">{subtitle}</p> : null}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {progress > 0 ? (
          <div className="mr-4 flex items-center gap-2">
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-[var(--surface-2)]">
              <div className="h-full bg-indigo-600" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-[var(--muted-foreground)]">{Math.round(progress)}%</span>
          </div>
        ) : null}

        {onPrevious ? (
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="rounded bg-[var(--surface-2)] px-3 py-1.5 disabled:opacity-40 hover:bg-[var(--surface-3)]"
          >
            Previous
          </button>
        ) : null}
        {onNext ? (
          <button
            onClick={onNext}
            disabled={!canGoNext}
            className="rounded bg-indigo-600 px-3 py-1.5 text-white disabled:opacity-40 hover:bg-indigo-700"
          >
            Next
          </button>
        ) : null}
        {onClose ? (
          <button onClick={onClose} className="rounded p-1.5 hover:bg-[var(--surface-2)]">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
}
