import { Check } from "lucide-react";

export const TRACK_COLOR_PALETTE = {
  reds: ["#d32f2f", "#e53935", "#f44336", "#ef5350", "#e57373", "#ff6b6b", "#ff8a80"],
  oranges: ["#e64a19", "#f4511e", "#ff5722", "#ff7043", "#ff8a65", "#ffab91", "#ffccbc"],
  yellows: ["#f57c00", "#fb8c00", "#ff9800", "#ffa726", "#ffb74d", "#ffe66d", "#fff9c4"],
  greens: ["#388e3c", "#43a047", "#4caf50", "#66bb6a", "#81c784", "#a8e6cf", "#c8e6c9"],
  teals: ["#00796b", "#00897b", "#009688", "#26a69a", "#4db6ac", "#4ecdc4", "#80cbc4"],
  blues: ["#1976d2", "#1e88e5", "#2196f3", "#42a5f5", "#64b5f6", "#4a9eff", "#90caf9"],
  purples: ["#512da8", "#5e35b1", "#673ab7", "#7e57c2", "#9575cd", "#b39ddb", "#d1c4e9"],
  pinks: ["#c2185b", "#d81b60", "#e91e63", "#ec407a", "#f06292", "#ff8ed4", "#f8bbd0"],
  neutrals: ["#424242", "#616161", "#757575", "#9e9e9e", "#bdbdbd", "#e0e0e0", "#f5f5f5"],
} as const;

interface TrackColorPickerProps {
  currentColor: string;
  onColorChange: (color: string) => void;
  onClose?: () => void;
}

export function TrackColorPicker({
  currentColor,
  onColorChange,
  onClose,
}: TrackColorPickerProps) {
  const handleColorSelect = (color: string) => {
    onColorChange(color);
    onClose?.();
  };

  return (
    <div className="min-w-[280px] rounded-lg border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_14%)] p-3 text-white shadow-xl">
      <div className="mb-2 text-xs font-medium uppercase tracking-wider text-white/60">
        Track Color
      </div>

      <div className="space-y-2">
        {Object.entries(TRACK_COLOR_PALETTE).map(([categoryName, colors]) => (
          <div key={categoryName} className="flex items-center gap-1">
            <div className="w-14 text-[10px] capitalize text-white/40">{categoryName}</div>
            <div className="flex flex-1 flex-wrap gap-1">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleColorSelect(color)}
                  className="relative h-6 w-6 rounded border-2 border-transparent transition-all hover:scale-110 hover:border-white/40"
                  style={{ backgroundColor: color }}
                  title={color}
                >
                  {currentColor.toLowerCase() === color.toLowerCase() ? (
                    <Check className="absolute inset-0 m-auto h-3 w-3 text-white drop-shadow-lg" strokeWidth={3} />
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-[hsl(240_8%_20%)] pt-3">
        <div className="text-[10px] text-white/40">Current</div>
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-8 rounded border border-[hsl(240_8%_24%)]"
            style={{ backgroundColor: currentColor }}
          />
          <div className="font-mono text-xs text-white/60">{currentColor}</div>
        </div>
      </div>
    </div>
  );
}
