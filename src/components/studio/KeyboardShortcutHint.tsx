export interface KeyboardShortcutHintProps {
  keys?: string[];
  description?: string;
  className?: string;
}

export function KeyboardShortcutHint({
  keys = ["Cmd", "S"],
  description = "Save",
  className = "",
}: KeyboardShortcutHintProps) {
  return (
    <div className={["flex items-center gap-2 text-xs", className].join(" ")}>
      <span className="text-muted-foreground">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <span key={`${key}-${index}`} className="flex items-center">
            <kbd className="rounded border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 font-mono font-semibold text-foreground">
              {key}
            </kbd>
            {index < keys.length - 1 ? (
              <span className="mx-1 text-muted-foreground">+</span>
            ) : null}
          </span>
        ))}
      </div>
    </div>
  );
}
