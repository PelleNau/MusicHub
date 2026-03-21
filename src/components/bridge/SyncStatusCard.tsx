export interface SyncStatusCardProps {
  service?: string;
  lastSync?: string;
  isSyncing?: boolean;
  onSync?: () => void;
  className?: string;
}

export function SyncStatusCard({
  service = "Cloud Storage",
  lastSync = "2 hours ago",
  isSyncing = false,
  onSync,
  className = "",
}: SyncStatusCardProps) {
  return (
    <div className={`rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-4 ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{service}</h3>
        {isSyncing ? (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        ) : null}
      </div>
      <p className="mb-3 text-xs text-[var(--muted-foreground)]">Last sync: {lastSync}</p>
      <button
        type="button"
        onClick={onSync}
        disabled={isSyncing}
        className="w-full rounded bg-[var(--surface-2)] px-3 py-1.5 text-sm font-medium disabled:opacity-40 hover:bg-[var(--surface-3)]"
      >
        {isSyncing ? "Syncing..." : "Sync Now"}
      </button>
    </div>
  );
}
