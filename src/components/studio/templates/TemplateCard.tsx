export interface TemplateCardProps {
  templateName?: string;
  description?: string;
  trackCount?: number;
  thumbnail?: string;
  onSelect?: () => void;
  onDelete?: () => void;
  className?: string;
}

export function TemplateCard({
  templateName = "Template",
  description = "Template description",
  trackCount = 0,
  thumbnail,
  onSelect,
  onDelete,
  className = "",
}: TemplateCardProps) {
  return (
    <div
      className={`group relative cursor-pointer overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-1)] transition-all hover:border-indigo-600 ${className}`}
      onClick={onSelect}
    >
      <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-indigo-600/20 to-purple-600/20">
        {thumbnail ? (
          <img src={thumbnail} alt={templateName} className="h-full w-full object-cover" />
        ) : (
          <span className="text-4xl">🎵</span>
        )}
      </div>
      <div className="p-3">
        <h4 className="mb-1 truncate font-semibold">{templateName}</h4>
        <p className="mb-2 line-clamp-2 text-xs text-[var(--muted-foreground)]">{description}</p>
        <div className="text-xs text-[var(--muted-foreground)]">{trackCount} tracks</div>
      </div>
      {onDelete ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className="absolute right-2 top-2 rounded bg-[var(--surface-1)]/80 p-1.5 opacity-0 transition-all group-hover:opacity-100 hover:bg-red-600"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
