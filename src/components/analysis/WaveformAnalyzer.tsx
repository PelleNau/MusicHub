export interface WaveformAnalyzerProps {
  peakLevel?: number;
  rmsLevel?: number;
  className?: string;
}

export function WaveformAnalyzer({
  peakLevel = -6,
  rmsLevel = -12,
  className = "",
}: WaveformAnalyzerProps) {
  return (
    <div className={`rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-4 ${className}`}>
      <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">Waveform Analysis</h3>
      <div className="mb-3 flex h-32 items-center justify-center rounded bg-[var(--surface-2)]">
        <svg className="h-full w-full" preserveAspectRatio="none">
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="var(--border)" strokeWidth="1" />
        </svg>
      </div>
      <div className="space-y-2 text-xs text-[var(--foreground)]">
        <div className="flex justify-between">
          <span>Peak:</span>
          <span className="font-mono">{peakLevel.toFixed(1)} dB</span>
        </div>
        <div className="flex justify-between">
          <span>RMS:</span>
          <span className="font-mono">{rmsLevel.toFixed(1)} dB</span>
        </div>
      </div>
    </div>
  );
}
