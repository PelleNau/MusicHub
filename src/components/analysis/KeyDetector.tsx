export interface KeyDetectorProps {
  detectedKey?: string;
  detectedScale?: string;
  confidence?: number;
  onAnalyze?: () => void;
  className?: string;
}

export function KeyDetector({
  detectedKey = "",
  detectedScale = "",
  confidence = 0,
  onAnalyze,
  className = "",
}: KeyDetectorProps) {
  return (
    <div className={`rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-4 ${className}`}>
      <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">Key Detection</h3>
      {detectedKey ? (
        <div className="mb-4 text-center">
          <div className="mb-1 text-3xl font-bold text-indigo-400">
            {detectedKey} {detectedScale}
          </div>
          <div className="text-xs text-[var(--muted-foreground)]">Confidence: {confidence}%</div>
        </div>
      ) : (
        <div className="py-6 text-center text-[var(--muted-foreground)]">No key detected</div>
      )}
      <button
        type="button"
        onClick={onAnalyze}
        className="w-full rounded bg-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-700"
      >
        Analyze Key
      </button>
    </div>
  );
}
