export interface ImportSourceCardProps {
  sourceName?: string;
  sourceIcon?: string;
  itemCount?: number;
  onImport?: () => void;
  className?: string;
}

export function ImportSourceCard({
  sourceName = "Apple Music",
  sourceIcon = "🎵",
  itemCount = 0,
  onImport,
  className = "",
}: ImportSourceCardProps) {
  return (
    <div className={`rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-4 transition-colors hover:border-indigo-600 ${className}`}>
      <div className="mb-3 text-4xl">{sourceIcon}</div>
      <h3 className="mb-1 text-lg font-semibold">{sourceName}</h3>
      <p className="mb-4 text-sm text-[var(--muted-foreground)]">{itemCount} items available</p>
      <button type="button" onClick={onImport} className="w-full rounded bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700">
        Import
      </button>
    </div>
  );
}
