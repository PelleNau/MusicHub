import { Check, Repeat } from "lucide-react";

export interface SendRoutingTrack {
  id: string;
  name: string;
  color: string;
}

interface SendRoutingMenuProps {
  sendId: string;
  sendLabel: string;
  currentTargetId?: string;
  returnTracks: SendRoutingTrack[];
  onRoute: (returnTrackId: string | undefined) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

export function SendRoutingMenu({
  sendId: _sendId,
  sendLabel,
  currentTargetId,
  returnTracks,
  onRoute,
  onClose,
  position,
}: SendRoutingMenuProps) {
  const handleSelect = (returnTrackId?: string) => {
    onRoute(returnTrackId);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />

      <div
        className="fixed z-50 min-w-[180px] overflow-hidden rounded-lg border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_14%)] text-white shadow-2xl"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-[hsl(240_8%_20%)] bg-[hsl(240_10%_16%)] px-3 py-2">
          <div className="text-[10px] font-medium uppercase tracking-wider text-white/60">
            Send {sendLabel} Routing
          </div>
        </div>

        <div className="py-1">
          <button
            onClick={() => handleSelect(undefined)}
            className={[
              "flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-[hsl(240_10%_18%)]",
              !currentTargetId ? "bg-[hsl(240_10%_18%)]" : "",
            ].join(" ")}
          >
            <span className="text-xs text-white/60">None</span>
            {!currentTargetId ? <Check className="h-3.5 w-3.5 text-[hsl(212_78%_60%)]" /> : null}
          </button>

          {returnTracks.length > 0 ? <div className="my-1 h-px bg-[hsl(240_8%_20%)]" /> : null}

          {returnTracks.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-white/40">
              <Repeat className="mx-auto mb-1 h-4 w-4 opacity-40" />
              No return tracks
              <div className="mt-1 text-[10px]">Create a return track first</div>
            </div>
          ) : (
            returnTracks.map((returnTrack) => {
              const isSelected = currentTargetId === returnTrack.id;

              return (
                <button
                  key={returnTrack.id}
                  onClick={() => handleSelect(returnTrack.id)}
                  className={[
                    "flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-[hsl(240_10%_18%)]",
                    isSelected ? "bg-[hsla(212,78%,60%,0.12)]" : "",
                  ].join(" ")}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <div
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: returnTrack.color }}
                    />
                    <span
                      className={[
                        "truncate text-xs",
                        isSelected ? "font-medium text-[hsl(212_78%_60%)]" : "text-white",
                      ].join(" ")}
                    >
                      {returnTrack.name}
                    </span>
                  </div>
                  {isSelected ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-[hsl(212_78%_60%)]" />
                  ) : null}
                </button>
              );
            })
          )}
        </div>

        <div className="border-t border-[hsl(240_8%_20%)] bg-[hsl(240_10%_16%)] px-3 py-2">
          <div className="text-[9px] text-white/40">Double-click knob to reset</div>
        </div>
      </div>
    </>
  );
}
