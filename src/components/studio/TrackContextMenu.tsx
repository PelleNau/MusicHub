import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

import { TRACK_COLOR_PALETTE } from "@/components/studio/TrackColorPicker";

interface TrackContextMenuProps {
  x: number;
  y: number;
  trackType: "audio" | "midi" | "group" | "return";
  currentColor: string;
  isMuted: boolean;
  isSoloed: boolean;
  isArmed: boolean;
  hasAutomation: boolean;
  pointerMode: "draw" | "select" | "erase";
  onClose: () => void;
  onColorChange: (color: string) => void;
  onChangeIcon: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onConvertToGroup: () => void;
  onToggleMute: () => void;
  onToggleSolo: () => void;
  onToggleArm: () => void;
  onShowAutomation: () => void;
  onHideAutomation: () => void;
  onAddAutomation: () => void;
  onPointerModeChange: (mode: "draw" | "select" | "erase") => void;
  onSaveAsTemplate?: () => void;
}

const ALL_COLORS = Object.values(TRACK_COLOR_PALETTE).flat();

export function TrackContextMenu({
  x,
  y,
  trackType,
  currentColor,
  isMuted,
  isSoloed,
  isArmed,
  hasAutomation,
  pointerMode,
  onClose,
  onColorChange,
  onChangeIcon,
  onDuplicate,
  onDelete,
  onConvertToGroup,
  onToggleMute,
  onToggleSolo,
  onToggleArm,
  onShowAutomation,
  onHideAutomation,
  onAddAutomation,
  onPointerModeChange,
  onSaveAsTemplate,
}: TrackContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });

  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    const adjustedX = x + rect.width > window.innerWidth ? window.innerWidth - rect.width - 8 : x;
    const adjustedY = y + rect.height > window.innerHeight ? window.innerHeight - rect.height - 8 : y;
    setPosition({ x: adjustedX, y: adjustedY });
  }, [x, y]);

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[9998]"
        onClick={onClose}
        onContextMenu={(event) => {
          event.preventDefault();
          onClose();
        }}
      />
      <div
        ref={menuRef}
        className="fixed z-[9999] min-w-[220px] rounded border border-[var(--border-strong)] bg-[var(--surface-1)] py-0.5 shadow-2xl"
        style={{ left: position.x, top: position.y }}
      >
        <Item onClick={() => handleAction(onChangeIcon)}>Change Icon</Item>
        <Item onClick={() => handleAction(onDuplicate)} suffix="⌘D">Duplicate</Item>
        {onSaveAsTemplate ? <Item onClick={() => handleAction(onSaveAsTemplate)}>Save as Template</Item> : null}
        {trackType !== "group" ? <Item onClick={() => handleAction(onConvertToGroup)}>Convert to Group</Item> : null}
        <Item onClick={() => handleAction(onDelete)} destructive suffix="⌫">Delete</Item>

        <Divider />
        <Item onClick={() => handleAction(onToggleMute)} suffix="M">{isMuted ? "Unmute" : "Mute"}</Item>
        <Item onClick={() => handleAction(onToggleSolo)} suffix="S">{isSoloed ? "Unsolo" : "Solo"}</Item>
        {trackType === "audio" || trackType === "midi" ? (
          <Item onClick={() => handleAction(onToggleArm)} suffix="R">{isArmed ? "Disarm" : "Arm"}</Item>
        ) : null}

        <Divider />
        <Item onClick={() => handleAction(hasAutomation ? onHideAutomation : onShowAutomation)}>
          {hasAutomation ? "Hide Automation" : "Show Automation"}
        </Item>
        <Item onClick={() => handleAction(onAddAutomation)}>Add Automation</Item>

        <Divider />
        <Item onClick={() => handleAction(() => onPointerModeChange("select"))}>{pointerMode === "select" ? "Pointer: Select ✓" : "Pointer: Select"}</Item>
        <Item onClick={() => handleAction(() => onPointerModeChange("draw"))}>{pointerMode === "draw" ? "Pointer: Draw ✓" : "Pointer: Draw"}</Item>
        <Item onClick={() => handleAction(() => onPointerModeChange("erase"))}>{pointerMode === "erase" ? "Pointer: Erase ✓" : "Pointer: Erase"}</Item>

        <Divider />
        <div className="px-2 py-2">
          <div className="mb-1.5 px-1 text-[11px] text-foreground/50">Track Color</div>
          <div className="grid grid-cols-8 gap-1">
            {ALL_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  onColorChange(color);
                  onClose();
                }}
                className="relative h-5 w-5 rounded border border-black/20 transition-transform hover:scale-110"
                style={{ backgroundColor: color }}
                title={color}
              >
                {currentColor.toLowerCase() === color.toLowerCase() ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" strokeWidth={3} />
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Item({
  children,
  onClick,
  suffix,
  destructive = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  suffix?: string;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between px-3 py-1.5 text-left text-[13px] transition-colors ${
        destructive
          ? "text-destructive hover:bg-[var(--destructive)]/10"
          : "text-foreground/90 hover:bg-[var(--surface-2)] hover:text-foreground"
      }`}
    >
      <span>{children}</span>
      {suffix ? <span className="font-mono text-[11px] text-foreground/40">{suffix}</span> : null}
    </button>
  );
}

function Divider() {
  return <div className="my-0.5 h-px bg-[var(--border)]" />;
}
