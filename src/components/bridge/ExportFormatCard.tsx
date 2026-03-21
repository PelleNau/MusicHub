export interface ExportFormatCardProps {
  formatName?: string;
  formatExtension?: string;
  isSupported?: boolean;
  onExport?: () => void;
  className?: string;
}

export function ExportFormatCard({
  formatName = "WAV",
  formatExtension = ".wav",
  isSupported = true,
  onExport,
  className = "",
}: ExportFormatCardProps) {
  return (
    <div
      className={`rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-4 transition-colors ${
        isSupported ? "hover:border-indigo-600" : "opacity-50"
      } ${className}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{formatName}</h3>
        <span className="font-mono text-xs text-[var(--muted-foreground)]">{formatExtension}</span>
      </div>
      <button
        type="button"
        onClick={onExport}
        disabled={!isSupported}
        className="w-full rounded bg-indigo-600 px-4 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-indigo-700"
      >
        Export as {formatName}
      </button>
    </div>
  );
}
