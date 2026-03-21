import { Music } from "lucide-react";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

const SCALE_OPTIONS = [
  { value: "major", label: "Major (Ionian)" },
  { value: "minor", label: "Minor (Aeolian)" },
  { value: "dorian", label: "Dorian" },
  { value: "phrygian", label: "Phrygian" },
  { value: "lydian", label: "Lydian" },
  { value: "mixolydian", label: "Mixolydian" },
  { value: "locrian", label: "Locrian" },
  { value: "pentatonic-major", label: "Major Pentatonic" },
  { value: "pentatonic-minor", label: "Minor Pentatonic" },
] as const;

export interface KeySelectorProps {
  root: number;
  scale: string;
  onChangeRoot: (root: number) => void;
  onChangeScale: (scale: string) => void;
  compact?: boolean;
  className?: string;
}

export function KeySelector({
  root,
  scale,
  onChangeRoot,
  onChangeScale,
  compact = false,
  className = "",
}: KeySelectorProps) {
  const keyLabel = `${NOTE_NAMES[root] ?? "C"} ${SCALE_OPTIONS.find((option) => option.value === scale)?.label ?? scale}`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {!compact ? (
        <div className="flex items-center gap-1.5 text-xs text-[var(--foreground-muted)]">
          <Music className="h-3.5 w-3.5" />
          <span>Key:</span>
        </div>
      ) : null}

      <select
        value={root}
        onChange={(event) => onChangeRoot(Number(event.target.value))}
        className="rounded border border-[var(--border)] bg-[var(--background-elevated)] px-2 py-1 text-sm text-[var(--foreground)] transition-colors hover:border-[var(--border-strong)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
      >
        {NOTE_NAMES.map((noteName, index) => (
          <option key={noteName} value={index}>
            {noteName}
          </option>
        ))}
      </select>

      <select
        value={scale}
        onChange={(event) => onChangeScale(event.target.value)}
        className="min-w-[150px] rounded border border-[var(--border)] bg-[var(--background-elevated)] px-2 py-1 text-sm text-[var(--foreground)] transition-colors hover:border-[var(--border-strong)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
      >
        {SCALE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {!compact ? <div className="ml-1 text-xs text-[var(--foreground-muted)]">({keyLabel})</div> : null}
    </div>
  );
}
