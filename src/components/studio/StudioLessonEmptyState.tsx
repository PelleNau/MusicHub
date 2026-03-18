interface StudioLessonEmptyStateProps {
  instruction?: string;
  fallback: string;
  centered?: boolean;
}

export function StudioLessonEmptyState({
  instruction,
  fallback,
  centered = true,
}: StudioLessonEmptyStateProps) {
  const classes = centered
    ? "flex h-full items-center justify-center"
    : "flex h-full min-h-[120px] items-center justify-center";

  return (
    <div className={classes}>
      <div className="text-center space-y-1">
        {instruction ? (
          <>
            <p className="text-sm text-foreground/70">{instruction}</p>
            <p className="text-xs text-muted-foreground">Follow the guide to get started</p>
          </>
        ) : (
          <p className="font-mono text-[11px] text-foreground/45">{fallback}</p>
        )}
      </div>
    </div>
  );
}
