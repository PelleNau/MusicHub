import { Flag, Plus, Trash2 } from "lucide-react";

import type { StudioMarker } from "@/types/musicHubStudioMarkers";

interface MarkerListProps {
  markers: StudioMarker[];
  playheadBeat: number;
  onAddMarker: (marker: Omit<StudioMarker, "id">) => void;
  onDeleteMarker: (markerId: string) => void;
  onJumpToMarker: (markerId: string) => void;
}

const MARKER_COLORS = [
  "#ff6b6b",
  "#4ecdc4",
  "#ffe66d",
  "#a8e6cf",
  "#ff8787",
  "#95e1d3",
  "#ffd93d",
  "#6bcf7f",
];

function formatBeat(beat: number) {
  const bars = Math.floor(beat / 4) + 1;
  const localBeat = (beat % 4) + 1;
  return `${bars}.${localBeat.toFixed(0)}`;
}

export function MarkerList({
  markers,
  playheadBeat,
  onAddMarker,
  onDeleteMarker,
  onJumpToMarker,
}: MarkerListProps) {
  const sortedMarkers = [...markers].sort((a, b) => a.beat - b.beat);

  const handleAddMarker = () => {
    const markerNumber = markers.length + 1;
    onAddMarker({
      name: `Marker ${markerNumber}`,
      beat: playheadBeat,
      color: MARKER_COLORS[markerNumber % MARKER_COLORS.length],
    });
  };

  return (
    <div className="flex h-full min-h-[360px] flex-col border-l border-[var(--border)] bg-[var(--panel-bg)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2">
        <div className="flex items-center gap-2">
          <Flag className="h-4 w-4 text-[var(--text-secondary)]" />
          <span className="text-sm font-medium text-[var(--text-primary)]">Markers</span>
        </div>
        <button
          type="button"
          onClick={handleAddMarker}
          className="rounded p-1 transition-colors hover:bg-[var(--surface-2)]"
          title="Add Marker at Playhead"
        >
          <Plus className="h-4 w-4 text-[var(--text-secondary)]" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sortedMarkers.length === 0 ? (
          <div className="p-4 text-center text-sm text-[var(--text-tertiary)]">
            No markers yet
            <div className="mt-2 text-xs">
              Press <kbd className="rounded bg-[var(--surface-2)] px-1 py-0.5">M</kbd> to add marker
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {sortedMarkers.map((marker) => (
              <div
                key={marker.id}
                className="group cursor-pointer px-3 py-2 transition-colors hover:bg-[var(--surface-1)]"
                onClick={() => onJumpToMarker(marker.id)}
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 flex-shrink-0 rounded-sm" style={{ backgroundColor: marker.color }} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm text-[var(--text-primary)]">{marker.name}</div>
                    <div className="font-mono text-xs text-[var(--text-tertiary)]">{formatBeat(marker.beat)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDeleteMarker(marker.id);
                    }}
                    className="rounded p-1 opacity-0 transition-all hover:bg-[var(--destructive)]/10 group-hover:opacity-100"
                    title="Delete Marker"
                  >
                    <Trash2 className="h-3 w-3 text-[var(--destructive)]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-[var(--border)] px-3 py-2">
        <button
          type="button"
          onClick={handleAddMarker}
          className="flex w-full items-center justify-center gap-2 rounded bg-[var(--primary)] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary-hover)]"
        >
          <Plus className="h-4 w-4" />
          Add at Playhead
        </button>
      </div>
    </div>
  );
}
