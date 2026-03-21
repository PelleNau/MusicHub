export interface PitchAnalyzerProps {
  detectedPitch?: string;
  confidence?: number;
  frequency?: number;
  className?: string;
}

export function PitchAnalyzer({
  detectedPitch = "C4",
  confidence = 95,
  frequency = 261.63,
  className = "",
}: PitchAnalyzerProps) {
  return (
    <div className={`rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-4 ${className}`}>
      <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">Pitch Detection</h3>
      <div className="mb-4 text-center">
        <div className="mb-1 text-4xl font-bold text-indigo-400">{detectedPitch}</div>
        <div className="text-xs text-[var(--muted-foreground)]">{frequency.toFixed(2)} Hz</div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-[var(--foreground)]">
          <span>Confidence</span>
          <span>{confidence}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div className="h-full bg-green-600" style={{ width: `${confidence}%` }} />
        </div>
      </div>
    </div>
  );
}
