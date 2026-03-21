export interface SpectrumAnalyzerProps {
  frequencyData?: number[];
  className?: string;
}

export function SpectrumAnalyzer({
  frequencyData = [],
  className = "",
}: SpectrumAnalyzerProps) {
  const bands = frequencyData.length > 0 ? frequencyData : Array.from({ length: 32 }, () => Math.random() * 100);

  return (
    <div className={`rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-4 ${className}`}>
      <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">Spectrum Analyzer</h3>
      <div className="flex h-40 items-end gap-0.5 rounded bg-[var(--surface-2)] p-2">
        {bands.map((value, index) => (
          <div
            key={`${index}-${value}`}
            className="flex-1 rounded-t bg-gradient-to-t from-indigo-600 to-purple-600"
            style={{ height: `${value}%` }}
          />
        ))}
      </div>
    </div>
  );
}
