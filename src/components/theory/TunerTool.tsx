export interface TunerToolProps {
  detectedNote?: string;
  frequency?: number;
  cents?: number;
  isInTune?: boolean;
  className?: string;
}

export function TunerTool({
  detectedNote = "A4",
  frequency = 440,
  cents = 0,
  isInTune = true,
  className = "",
}: TunerToolProps) {
  return (
    <div className={`rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-6 text-center ${className}`}>
      <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Tuner</h3>
      <div className="mb-2 text-6xl font-bold" style={{ color: isInTune ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)" }}>
        {detectedNote}
      </div>
      <div className="mb-4 text-sm text-[var(--muted-foreground)]">{frequency.toFixed(2)} Hz</div>
      <div className="mb-4 flex items-center justify-center gap-2">
        <div className="flex-1 overflow-hidden rounded-full bg-[var(--surface-2)] h-2">
          <div
            className="h-full w-[2px] bg-gradient-to-r from-red-600 via-green-600 to-red-600"
            style={{ marginLeft: `${Math.max(0, Math.min(100, 50 + cents))}%` }}
          />
        </div>
      </div>
      <div className={`text-2xl font-bold ${Math.abs(cents) < 5 ? "text-green-500" : "text-orange-500"}`}>
        {cents > 0 ? "+" : ""}
        {cents} cents
      </div>
    </div>
  );
}
