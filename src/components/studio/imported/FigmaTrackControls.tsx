import type { ReactNode } from "react";

export interface FigmaTrackControlsProps {
  trackName?: string;
  trackColor?: string;
  trackIcon?: ReactNode;
  volume?: number;
  pan?: number;
  isMuted?: boolean;
  isSoloed?: boolean;
  isArmed?: boolean;
  isSelected?: boolean;
  onNameChange?: (name: string) => void;
  onVolumeChange?: (volume: number) => void;
  onPanChange?: (pan: number) => void;
  onMuteToggle?: () => void;
  onSoloToggle?: () => void;
  onArmToggle?: () => void;
  onSelect?: () => void;
  onColorChange?: () => void;
  onIconChange?: () => void;
  className?: string;
}

export function FigmaTrackControls({
  trackName = "Track",
  trackColor = "#6366f1",
  trackIcon,
  volume = 0,
  pan = 0,
  isMuted = false,
  isSoloed = false,
  isArmed = false,
  isSelected = false,
  onNameChange,
  onVolumeChange,
  onPanChange,
  onMuteToggle,
  onSoloToggle,
  onArmToggle,
  onSelect,
  onColorChange,
  onIconChange,
  className = "",
}: FigmaTrackControlsProps) {
  return (
    <div
      onClick={onSelect}
      className={`flex flex-col gap-2 border-r border-[var(--border)] bg-[var(--surface-1)] p-2 ${
        isSelected ? "ring-1 ring-inset ring-indigo-600" : ""
      } ${className}`}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onColorChange?.();
          }}
          className="h-6 w-6 flex-shrink-0 rounded border border-white/20"
          style={{ backgroundColor: trackColor }}
          title="Change color"
        />
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onIconChange?.();
          }}
          className="rounded p-1 hover:bg-[var(--surface-2)]"
          title="Change icon"
        >
          {trackIcon ?? (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          )}
        </button>
      </div>

      <input
        type="text"
        value={trackName}
        onChange={(event) => {
          event.stopPropagation();
          onNameChange?.(event.target.value);
        }}
        onClick={(event) => event.stopPropagation()}
        className="w-full rounded border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1 text-xs focus:border-indigo-600 focus:outline-none"
      />

      <div className="flex gap-1">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onMuteToggle?.();
          }}
          className={`flex-1 rounded px-2 py-1 text-xs font-bold ${isMuted ? "bg-orange-600 text-white" : "bg-[var(--surface-2)] hover:bg-[var(--surface-3)]"}`}
          title="Mute"
        >
          M
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSoloToggle?.();
          }}
          className={`flex-1 rounded px-2 py-1 text-xs font-bold ${isSoloed ? "bg-yellow-600 text-white" : "bg-[var(--surface-2)] hover:bg-[var(--surface-3)]"}`}
          title="Solo"
        >
          S
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onArmToggle?.();
          }}
          className={`flex-1 rounded px-2 py-1 text-xs font-bold ${isArmed ? "bg-red-600 text-white" : "bg-[var(--surface-2)] hover:bg-[var(--surface-3)]"}`}
          title="Arm"
        >
          R
        </button>
      </div>

      <div>
        <label className="text-xs text-[var(--muted-foreground)]">Vol</label>
        <input
          type="range"
          min="-60"
          max="6"
          step="0.1"
          value={volume}
          onChange={(event) => {
            event.stopPropagation();
            onVolumeChange?.(Number(event.target.value));
          }}
          onClick={(event) => event.stopPropagation()}
          className="w-full"
        />
        <div className="text-center text-xs">{volume.toFixed(1)} dB</div>
      </div>

      <div>
        <label className="text-xs text-[var(--muted-foreground)]">Pan</label>
        <input
          type="range"
          min="-100"
          max="100"
          value={pan}
          onChange={(event) => {
            event.stopPropagation();
            onPanChange?.(Number(event.target.value));
          }}
          onClick={(event) => event.stopPropagation()}
          className="w-full"
        />
        <div className="text-center text-xs">{pan > 0 ? `${pan}R` : pan < 0 ? `${Math.abs(pan)}L` : "C"}</div>
      </div>
    </div>
  );
}
