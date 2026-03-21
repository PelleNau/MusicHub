export interface MetronomeToolProps {
  isPlaying?: boolean;
  tempo?: number;
  timeSignature?: string;
  onPlay?: () => void;
  onStop?: () => void;
  onTempoChange?: (tempo: number) => void;
  className?: string;
}

export function MetronomeTool({
  isPlaying = false,
  tempo = 120,
  timeSignature = "4/4",
  onPlay,
  onStop,
  onTempoChange,
  className = "",
}: MetronomeToolProps) {
  return (
    <div className={`rounded-lg border border-[var(--border)] bg-[var(--surface-1)] p-4 ${className}`}>
      <h3 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Metronome</h3>
      <div className="mb-4 text-center">
        <div className="mb-2 text-4xl font-bold text-[var(--foreground)]">
          {tempo} <span className="text-lg text-[var(--muted-foreground)]">BPM</span>
        </div>
        <div className="text-sm text-[var(--muted-foreground)]">{timeSignature}</div>
      </div>
      <input
        type="range"
        min="40"
        max="240"
        value={tempo}
        onChange={(event) => onTempoChange?.(Number(event.target.value))}
        className="mb-4 w-full accent-green-500"
      />
      <button
        type="button"
        onClick={isPlaying ? onStop : onPlay}
        className={`w-full rounded px-4 py-3 font-medium text-white transition-colors ${
          isPlaying ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {isPlaying ? "Stop" : "Start"}
      </button>
    </div>
  );
}
