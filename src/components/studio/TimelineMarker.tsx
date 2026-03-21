import { useEffect, useRef, useState } from "react";
import { Edit2, Flag, Trash2 } from "lucide-react";

import type { StudioMarker } from "@/types/musicHubStudioMarkers";

interface TimelineMarkerProps {
  marker: StudioMarker;
  pixelsPerBeat: number;
  onUpdate: (id: string, updates: Partial<StudioMarker>) => void;
  onDelete: (id: string) => void;
  onJump: (id: string) => void;
}

export function TimelineMarker({
  marker,
  pixelsPerBeat,
  onUpdate,
  onDelete,
  onJump,
}: TimelineMarkerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(marker.name);
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const leftPosition = marker.beat * pixelsPerBeat;

  const handleSaveName = () => {
    if (editName.trim()) onUpdate(marker.id, { name: editName.trim() });
    setIsEditing(false);
  };

  return (
    <>
      <div
        className="group absolute bottom-0 top-0 z-20"
        style={{ left: `${leftPosition}px` }}
        onDoubleClick={() => onJump(marker.id)}
        onContextMenu={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setShowMenu(true);
        }}
      >
        <div className="pointer-events-none absolute bottom-0 top-0 w-0.5" style={{ backgroundColor: marker.color }} />
        <div className="absolute top-0 -translate-x-1/2">
          <div
            className="flex items-center gap-1 rounded-b px-2 py-1 text-xs font-medium text-white shadow-lg"
            style={{ backgroundColor: marker.color }}
          >
            <Flag className="h-3 w-3" />
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSaveName();
                  if (event.key === "Escape") {
                    setEditName(marker.name);
                    setIsEditing(false);
                  }
                }}
                className="w-24 rounded bg-white/20 px-1 text-xs outline-none"
                onClick={(event) => event.stopPropagation()}
              />
            ) : (
              <span className="select-none whitespace-nowrap">{marker.name}</span>
            )}
          </div>
        </div>

        <div className="pointer-events-none absolute left-0 top-8 -translate-x-1/2 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
          <div className="flex gap-1 rounded border border-[var(--border-strong)] bg-[var(--panel-bg)] p-1 shadow-lg">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setIsEditing(true);
              }}
              className="rounded p-1 transition-colors hover:bg-[var(--surface-2)]"
              title="Rename"
            >
              <Edit2 className="h-3 w-3 text-[var(--text-secondary)]" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(marker.id);
              }}
              className="rounded p-1 transition-colors hover:bg-[var(--destructive)]/10"
              title="Delete"
            >
              <Trash2 className="h-3 w-3 text-[var(--destructive)]" />
            </button>
          </div>
        </div>
      </div>

      {showMenu ? (
        <div
          className="fixed z-50 min-w-[160px] rounded-lg border border-[var(--border-strong)] bg-[rgba(24,24,27,0.98)] py-1 shadow-2xl backdrop-blur-xl"
          style={{ left: `${leftPosition + 20}px`, top: "60px" }}
          onMouseLeave={() => setShowMenu(false)}
        >
          <button
            type="button"
            onClick={() => {
              onJump(marker.id);
              setShowMenu(false);
            }}
            className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-2)]"
          >
            <Flag className="h-4 w-4" />
            <span>Jump to Marker</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
              setShowMenu(false);
            }}
            className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-2)]"
          >
            <Edit2 className="h-4 w-4" />
            <span>Rename</span>
          </button>
          <div className="my-1 h-px bg-[var(--border)]" />
          <button
            type="button"
            onClick={() => {
              onDelete(marker.id);
              setShowMenu(false);
            }}
            className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-[var(--destructive)] transition-colors hover:bg-[var(--destructive)]/10"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      ) : null}
    </>
  );
}
