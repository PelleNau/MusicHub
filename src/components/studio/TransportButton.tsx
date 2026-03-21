import {
  Circle,
  Pause,
  Play,
  Repeat,
  SkipBack,
  SkipForward,
  Square,
} from "lucide-react";

export type TransportAction =
  | "play"
  | "pause"
  | "stop"
  | "record"
  | "loop"
  | "rewind"
  | "forward";

interface TransportButtonProps {
  action: TransportAction;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  title?: string;
}

const sizeStyles = {
  sm: { button: "h-[30px] w-[30px]", icon: "h-3.5 w-3.5" },
  md: { button: "h-10 w-10", icon: "h-4 w-4" },
  lg: { button: "h-12 w-12", icon: "h-5 w-5" },
} as const;

const iconMap = {
  play: Play,
  pause: Pause,
  stop: Square,
  record: Circle,
  loop: Repeat,
  rewind: SkipBack,
  forward: SkipForward,
} as const;

export function TransportButton({
  action,
  active = false,
  disabled = false,
  onClick,
  size = "md",
  className = "",
  title,
}: TransportButtonProps) {
  const Icon = iconMap[action];
  const label =
    title ??
    {
      play: "Play",
      pause: "Pause",
      stop: "Stop",
      record: "Record",
      loop: "Toggle loop (⌘L)",
      rewind: "Return to start",
      forward: "Skip forward",
    }[action];

  const toneClass =
    action === "record"
      ? active
        ? "bg-[hsl(358_75%_55%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_0_18px_rgba(239,68,68,0.3)]"
        : "bg-[hsl(240_10%_18%)] text-[hsl(358_75%_62%)] hover:bg-[hsl(240_10%_20%)]"
      : action === "play" || action === "pause"
        ? active
          ? "bg-[hsl(212_82%_58%)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_0_18px_rgba(59,130,246,0.22)]"
          : "bg-[hsl(240_10%_18%)] text-white/78 hover:bg-[hsl(240_10%_20%)]"
        : active
          ? "bg-[hsl(240_10%_20%)] text-primary text-[hsl(212_82%_62%)]"
          : "bg-[hsl(240_10%_18%)] text-white/72 hover:bg-[hsl(240_10%_20%)]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={[
        "flex items-center justify-center rounded-full border border-[hsl(240_8%_24%)] transition-all duration-150",
        sizeStyles[size].button,
        toneClass,
        disabled ? "cursor-not-allowed opacity-50" : "",
        className,
      ].join(" ")}
    >
      <Icon
        className={sizeStyles[size].icon}
        fill={action === "record" && active ? "currentColor" : "none"}
      />
    </button>
  );
}

interface TransportControlsProps {
  isPlaying: boolean;
  isRecording: boolean;
  isLooping: boolean;
  onPlay: () => void;
  onStop: () => void;
  onRecord: () => void;
  onLoop: () => void;
  className?: string;
}

export function TransportControls({
  isPlaying,
  isRecording,
  isLooping,
  onPlay,
  onStop,
  onRecord,
  onLoop,
  className = "",
}: TransportControlsProps) {
  return (
    <div className={["flex items-center gap-2", className].join(" ")}>
      <TransportButton action="rewind" size="md" />
      <TransportButton
        action={isPlaying ? "pause" : "play"}
        active={isPlaying}
        onClick={onPlay}
        size="lg"
      />
      <TransportButton action="stop" onClick={onStop} size="md" />
      <div className="mx-1 h-8 w-px bg-[hsl(240_8%_24%)]" />
      <TransportButton
        action="record"
        active={isRecording}
        onClick={onRecord}
        size="lg"
      />
      <div className="mx-1 h-8 w-px bg-[hsl(240_8%_24%)]" />
      <TransportButton
        action="loop"
        active={isLooping}
        onClick={onLoop}
        size="md"
      />
    </div>
  );
}
