import type { ComponentType } from "react";
import {
  Check,
  Circle,
  Disc3,
  Guitar,
  Headphones,
  Hexagon,
  Mic,
  Music,
  Radio,
  Speaker,
  Square,
  Star,
  Triangle,
  Volume2,
  Waves,
  Zap,
} from "lucide-react";

export type TrackIcon =
  | "mic"
  | "music"
  | "headphones"
  | "radio"
  | "guitar"
  | "piano"
  | "drum"
  | "speaker"
  | "volume"
  | "waves"
  | "zap"
  | "star"
  | "circle"
  | "square"
  | "triangle"
  | "hexagon"
  | "none";

interface IconConfig {
  id: TrackIcon;
  component: ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
}

export const TRACK_ICONS: IconConfig[] = [
  { id: "none", component: Circle, label: "None" },
  { id: "mic", component: Mic, label: "Vocals/Mic" },
  { id: "music", component: Music, label: "Music" },
  { id: "headphones", component: Headphones, label: "Headphones" },
  { id: "guitar", component: Guitar, label: "Guitar" },
  { id: "piano", component: Disc3, label: "Piano" },
  { id: "drum", component: Disc3, label: "Drums" },
  { id: "speaker", component: Speaker, label: "Speaker" },
  { id: "volume", component: Volume2, label: "Volume" },
  { id: "waves", component: Waves, label: "Waves" },
  { id: "radio", component: Radio, label: "Radio" },
  { id: "zap", component: Zap, label: "FX" },
  { id: "star", component: Star, label: "Star" },
  { id: "circle", component: Circle, label: "Circle" },
  { id: "square", component: Square, label: "Square" },
  { id: "triangle", component: Triangle, label: "Triangle" },
  { id: "hexagon", component: Hexagon, label: "Hexagon" },
];

interface TrackIconPickerProps {
  currentIcon?: TrackIcon;
  onIconChange: (icon: TrackIcon) => void;
  onClose?: () => void;
}

export function TrackIconPicker({
  currentIcon,
  onIconChange,
  onClose,
}: TrackIconPickerProps) {
  const handleIconSelect = (icon: TrackIcon) => {
    onIconChange(icon);
    onClose?.();
  };

  return (
    <div className="min-w-[240px] rounded-lg border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_14%)] p-3 text-white shadow-xl">
      <div className="mb-3 text-xs font-medium uppercase tracking-wider text-white/60">
        Track Icon
      </div>

      <div className="grid grid-cols-5 gap-1">
        {TRACK_ICONS.map((iconConfig) => {
          const Icon = iconConfig.component;
          const isSelected = currentIcon === iconConfig.id || (!currentIcon && iconConfig.id === "none");

          return (
            <button
              key={iconConfig.id}
              onClick={() => handleIconSelect(iconConfig.id)}
              className={[
                "relative flex h-10 w-10 items-center justify-center rounded transition-all",
                isSelected
                  ? "bg-[hsl(212_78%_60%)] text-white"
                  : "text-white/60 hover:bg-[hsl(240_10%_18%)] hover:text-white",
              ].join(" ")}
              title={iconConfig.label}
            >
              {iconConfig.id === "none" ? (
                <div className="h-1 w-1 rounded-full bg-current opacity-40" />
              ) : (
                <Icon className="h-4 w-4" strokeWidth={2} />
              )}

              {isSelected ? (
                <div className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-white">
                  <Check className="h-2 w-2 text-[hsl(212_78%_60%)]" strokeWidth={3} />
                </div>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function getTrackIconComponent(iconId?: TrackIcon) {
  if (!iconId || iconId === "none") {
    return null;
  }

  const iconConfig = TRACK_ICONS.find((icon) => icon.id === iconId);
  return iconConfig?.component ?? null;
}
