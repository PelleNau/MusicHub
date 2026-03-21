export interface BPMDetectorProps {
  detectedBPM?: number;
  confidence?: number;
  onAnalyze?: () => void;
  isAnalyzing?: boolean;
  className?: string;
}

export function BPMDetector({
  detectedBPM = 0,
  confidence = 0,
  onAnalyze,
  isAnalyzing = false,
  className = "",
}: BPMDetectorProps) {
  return (
    <div className={`rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-4 ${className}`}>
      <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">BPM Detection</h3>
      <div className="mb-4 text-center">
        <div className="mb-1 text-5xl font-bold text-indigo-400">{detectedBPM > 0 ? detectedBPM : "--"}</div>
        <div className="text-xs text-[var(--muted-foreground)]">BPM</div>
      </div>
      {confidence > 0 ? (
        <div className="mb-3">
          <div className="mb-1 text-xs text-[var(--muted-foreground)]">Confidence: {confidence}%</div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-2)]">
            <div className="h-full bg-indigo-600" style={{ width: `${confidence}%` }} />
          </div>
        </div>
      ) : null}
      <button
        type="button"
        onClick={onAnalyze}
        disabled={isAnalyzing}
        className="w-full rounded bg-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-40"
      >
        {isAnalyzing ? "Analyzing..." : "Analyze BPM"}
      </button>
    </div>
  );
}
