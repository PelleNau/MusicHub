import { Flag, Pencil, Trash2 } from "lucide-react";
import type { StudioMarker } from "@/types/musicHubStudioMarkers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TimelineMarkerOverlayProps {
  markers: StudioMarker[];
  pixelsPerBeat: number;
  onJump: (markerId: string) => void;
  onRename: (markerId: string, name: string) => void;
  onDelete: (markerId: string) => void;
}

export function TimelineMarkerLines({
  markers,
  pixelsPerBeat,
}: Pick<TimelineMarkerOverlayProps, "markers" | "pixelsPerBeat">) {
  return (
    <>
      {markers.map((marker) => (
        <div
          key={marker.id}
          className="absolute inset-y-0 w-px pointer-events-none opacity-80"
          style={{
            left: `${marker.beat * pixelsPerBeat}px`,
            backgroundColor: marker.color,
          }}
        />
      ))}
    </>
  );
}

export function TimelineMarkerFlags({
  markers,
  pixelsPerBeat,
  onJump,
  onRename,
  onDelete,
}: TimelineMarkerOverlayProps) {
  return (
    <>
      {markers.map((marker) => (
        <div
          key={marker.id}
          className="absolute inset-y-0 z-[2]"
          style={{ left: `${marker.beat * pixelsPerBeat}px` }}
        >
          <div
            className="absolute inset-y-0 w-px pointer-events-none opacity-90"
            style={{
              backgroundColor: marker.color,
            }}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="absolute left-0 top-0 -translate-x-1/2 rounded-b px-1.5 py-0.5 text-[10px] font-mono text-white shadow-sm transition hover:brightness-110"
                style={{ backgroundColor: marker.color }}
                onDoubleClick={() => onJump(marker.id)}
                title={marker.name}
              >
                <span className="flex items-center gap-1 whitespace-nowrap">
                  <Flag className="h-3 w-3" />
                  <span>{marker.name}</span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuItem onClick={() => onJump(marker.id)}>
                <Flag className="mr-2 h-4 w-4" />
                Jump to marker
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const nextName = window.prompt("Rename marker", marker.name);
                  if (nextName) onRename(marker.id, nextName);
                }}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(marker.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </>
  );
}
