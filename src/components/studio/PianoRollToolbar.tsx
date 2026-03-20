import { ArrowUpDown, Search, X, ZoomIn, ZoomOut } from "lucide-react";

interface PianoRollToolbarProps {
  clipName: string;
  snapEnabled: boolean;
  snapDivision: string;
  onToggleSnap: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFit?: () => void;
  onClose?: () => void;
}

export function PianoRollToolbar({
  clipName,
  snapEnabled,
  snapDivision,
  onToggleSnap,
  onZoomIn,
  onZoomOut,
  onFit,
  onClose,
}: PianoRollToolbarProps) {
  return (
    <div
      className="flex h-9 items-center justify-between border-b px-3 text-white/90"
      style={{
        borderColor: "hsl(var(--border))",
        backgroundColor: "hsl(240 10% 16%)",
      }}
    >
      <div className="flex items-center gap-2.5 text-[12px]">
        <span className="font-medium text-white/92">Piano Roll</span>
        <span className="text-white/34">•</span>
        <span className="text-white/52">{clipName}</span>
      </div>

      <div className="flex items-center gap-3 text-white/56">
        <button
          type="button"
          className="inline-flex h-4 w-4 items-center justify-center transition-colors hover:text-white/80"
          title="Search"
        >
          <Search className="h-3.5 w-3.5" />
        </button>
        {onZoomOut ? (
          <button
            type="button"
            onClick={onZoomOut}
            className="inline-flex h-4 w-4 items-center justify-center transition-colors hover:text-white/80"
            title="Zoom out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
        ) : null}
        {onZoomIn ? (
          <button
            type="button"
            onClick={onZoomIn}
            className="inline-flex h-4 w-4 items-center justify-center transition-colors hover:text-white/80"
            title="Zoom in"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onToggleSnap}
          className={`text-[12px] font-medium transition-colors ${
            snapEnabled ? "text-[#4f8df5]" : "text-white/50 hover:text-white/72"
          }`}
          title="Toggle snap"
        >
          Snap
        </button>
        <span className="text-[12px] text-white/72">{snapDivision}</span>
        {onFit ? (
          <button
            type="button"
            onClick={onFit}
            className="inline-flex h-4 w-4 items-center justify-center transition-colors hover:text-white/80"
            title="Fit"
          >
            <ArrowUpDown className="h-3.5 w-3.5" />
          </button>
        ) : null}
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-4 w-4 items-center justify-center transition-colors hover:text-white/80"
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
