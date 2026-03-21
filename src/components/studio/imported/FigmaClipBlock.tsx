import type { MouseEvent, ReactNode } from "react";

export interface FigmaClipBlockProps {
  clipName?: string;
  clipColor?: string;
  startTime?: number;
  duration?: number;
  isSelected?: boolean;
  isMuted?: boolean;
  isLooped?: boolean;
  fadeIn?: number;
  fadeOut?: number;
  children?: ReactNode;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onContextMenu?: (event: MouseEvent) => void;
  pixelsPerBeat?: number;
  className?: string;
}

export function FigmaClipBlock({
  clipName = "Clip",
  clipColor = "#6366f1",
  startTime = 0,
  duration = 4,
  isSelected = false,
  isMuted = false,
  isLooped = false,
  fadeIn = 0,
  fadeOut = 0,
  children,
  onClick,
  onDoubleClick,
  onContextMenu,
  pixelsPerBeat = 40,
  className = "",
}: FigmaClipBlockProps) {
  const width = duration * pixelsPerBeat;
  const left = startTime * pixelsPerBeat;

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      className={`absolute cursor-move overflow-hidden rounded ${
        isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-black" : ""
      } ${isMuted ? "opacity-40" : ""} ${className}`}
      style={{ left: `${left}px`, width: `${width}px`, backgroundColor: clipColor, height: "100%" }}
    >
      {fadeIn > 0 ? (
        <div
          className="pointer-events-none absolute inset-y-0 left-0 bg-gradient-to-r from-black/40 to-transparent"
          style={{ width: `${(fadeIn / duration) * 100}%` }}
        />
      ) : null}
      <div className="absolute inset-0">{children}</div>
      <div className="pointer-events-none absolute left-2 top-1 truncate pr-8 text-xs font-medium text-white drop-shadow-lg">
        {clipName}
        {isLooped ? <span className="ml-1">Loop</span> : null}
      </div>
      {fadeOut > 0 ? (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 bg-gradient-to-l from-black/40 to-transparent"
          style={{ width: `${(fadeOut / duration) * 100}%` }}
        />
      ) : null}
      <div className="absolute bottom-0 left-0 top-0 w-2 cursor-ew-resize hover:bg-white/20" />
      <div className="absolute bottom-0 right-0 top-0 w-2 cursor-ew-resize hover:bg-white/20" />
    </div>
  );
}
