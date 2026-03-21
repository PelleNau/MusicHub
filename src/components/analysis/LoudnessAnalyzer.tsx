export interface LoudnessAnalyzerProps {
  lufs?: number;
  truePeak?: number;
  dynamicRange?: number;
  className?: string;
}

export function LoudnessAnalyzer({
  lufs = -14,
  truePeak = -1,
  dynamicRange = 8,
  className = "",
}: LoudnessAnalyzerProps) {
  return (
    <div className={`rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-4 ${className}`}>
      <h3 className="mb-4 text-sm font-semibold text-[var(--foreground)]">Loudness Analysis</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded bg-[var(--surface-2)] p-2">
          <span className="text-xs text-[var(--muted-foreground)]">Integrated LUFS</span>
          <span className="font-mono font-semibold text-[var(--foreground)]">{lufs.toFixed(1)}</span>
        </div>
        <div className="flex items-center justify-between rounded bg-[var(--surface-2)] p-2">
          <span className="text-xs text-[var(--muted-foreground)]">True Peak</span>
          <span className="font-mono font-semibold text-[var(--foreground)]">{truePeak.toFixed(1)} dB</span>
        </div>
        <div className="flex items-center justify-between rounded bg-[var(--surface-2)] p-2">
          <span className="text-xs text-[var(--muted-foreground)]">Dynamic Range</span>
          <span className="font-mono font-semibold text-[var(--foreground)]">{dynamicRange.toFixed(1)} LU</span>
        </div>
      </div>
    </div>
  );
}
