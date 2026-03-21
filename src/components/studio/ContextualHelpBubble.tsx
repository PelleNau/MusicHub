export interface ContextualHelpBubbleProps {
  message?: string;
  position?: "top" | "bottom" | "left" | "right";
  onDismiss?: () => void;
  className?: string;
}

const positions = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
} as const;

export function ContextualHelpBubble({
  message = "Tip",
  position = "top",
  onDismiss,
  className = "",
}: ContextualHelpBubbleProps) {
  return (
    <div className={["absolute z-50", positions[position], className].join(" ")}>
      <div className="max-w-xs rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white shadow-lg">
        <div className="flex items-start gap-2">
          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11 17h2v-6h-2v6zm1-15C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zM11 9h2V7h-2v2z" />
          </svg>
          <span className="flex-1">{message}</span>
          {onDismiss ? (
            <button
              type="button"
              onClick={onDismiss}
              className="rounded p-0.5 hover:bg-white/20"
            >
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
