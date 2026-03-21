export interface TempoTapToolProps {
  currentTempo?: number;
  onTap?: () => void;
  onReset?: () => void;
  className?: string;
}

export function TempoTapTool({
  currentTempo = 0,
  onTap,
  onReset,
  className = "",
}: TempoTapToolProps) {
  return (
    <div className={`rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-6 text-center ${className}`}>
      <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Tempo Tap</h3>
      <div className="mb-6 text-5xl font-bold text-indigo-400">
        {currentTempo > 0 ? `${currentTempo} BPM` : "-- BPM"}
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onTap}
          className="flex-1 rounded-lg bg-indigo-600 px-6 py-4 text-xl font-bold text-white transition-colors hover:bg-indigo-700"
        >
          TAP
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg bg-[var(--surface-2)] px-6 py-4 text-[var(--foreground)] transition-colors hover:bg-[var(--surface-3)]"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
