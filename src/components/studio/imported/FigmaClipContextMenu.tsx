import { Check, ChevronRight, Copy, Edit3, Eraser, Eye, EyeOff, Grab, MousePointer, Plus, Scissors, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type PointerMode = "draw" | "select" | "erase";

export interface FigmaClipContextMenuProps {
  x: number;
  y: number;
  clipName: string;
  hasAutomation: boolean;
  pointerMode: PointerMode;
  onClose: () => void;
  onSplit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onAddFadeIn?: () => void;
  onAddFadeOut?: () => void;
  onPointerModeChange: (mode: PointerMode) => void;
  onShowAutomation: () => void;
  onHideAutomation: () => void;
  onAddAutomation: () => void;
}

export function FigmaClipContextMenu({
  x,
  y,
  clipName,
  hasAutomation,
  pointerMode,
  onClose,
  onSplit,
  onDuplicate,
  onDelete,
  onAddFadeIn,
  onAddFadeOut,
  onPointerModeChange,
  onShowAutomation,
  onHideAutomation,
  onAddAutomation,
}: FigmaClipContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x, y });
  const [submenu, setSubmenu] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    setPosition({
      x: Math.min(x, window.innerWidth - rect.width - 8),
      y: Math.min(y, window.innerHeight - rect.height - 8),
    });
  }, [x, y]);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) onClose();
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const actionButton =
    "w-full px-3 py-1.5 flex items-center gap-2 text-sm text-foreground hover:bg-[var(--surface-2)] transition-colors text-left";

  return (
    <>
      <div className="fixed inset-0 z-[999]" onClick={onClose} />
      <div
        ref={menuRef}
        className="fixed z-[1000] min-w-[220px] rounded-lg border border-[var(--border)] bg-[var(--surface-1)] py-1 shadow-2xl"
        style={{ left: position.x, top: position.y }}
      >
        <div className="px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">{clipName}</div>
        <button type="button" onClick={() => { onSplit?.(); onClose(); }} className={actionButton}>
          <Scissors className="h-4 w-4" />
          <span className="flex-1">Split at Cursor</span>
          <span className="text-xs text-foreground/40">S</span>
        </button>
        <button type="button" onClick={() => { onDuplicate?.(); onClose(); }} className={actionButton}>
          <Copy className="h-4 w-4" />
          <span className="flex-1">Duplicate</span>
          <span className="text-xs text-foreground/40">⌘D</span>
        </button>
        <button type="button" onClick={() => { onDelete?.(); onClose(); }} className={`${actionButton} text-[var(--destructive)] hover:bg-[var(--destructive)]/10`}>
          <Trash2 className="h-4 w-4" />
          <span className="flex-1">Delete</span>
          <span className="text-xs text-foreground/40">⌫</span>
        </button>
        <div className="my-1 h-px bg-[var(--border)]" />
        <button type="button" onClick={() => { onAddFadeIn?.(); onClose(); }} className={actionButton}>
          <Grab className="h-4 w-4" />
          <span className="flex-1">Add Fade In</span>
        </button>
        <button type="button" onClick={() => { onAddFadeOut?.(); onClose(); }} className={actionButton}>
          <Grab className="h-4 w-4" />
          <span className="flex-1">Add Fade Out</span>
        </button>
        <div className="my-1 h-px bg-[var(--border)]" />
        <div
          className="relative"
          onMouseEnter={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            setSubmenu({ x: rect.right + 4, y: rect.top });
          }}
          onMouseLeave={(event) => {
            const target = event.relatedTarget as HTMLElement | null;
            if (!target?.closest(".figma-clip-pointer-submenu")) setSubmenu(null);
          }}
        >
          <button type="button" className={actionButton}>
            <MousePointer className="h-4 w-4" />
            <span className="flex-1">Pointer Options</span>
            <ChevronRight className="h-3.5 w-3.5 text-foreground/40" />
          </button>
          {submenu ? (
            <div
              className="figma-clip-pointer-submenu fixed z-[1001] min-w-[190px] rounded-lg border border-[var(--border)] bg-[var(--surface-1)] py-1 shadow-2xl"
              style={{ left: submenu.x, top: submenu.y }}
              onMouseEnter={() => setSubmenu(submenu)}
              onMouseLeave={() => setSubmenu(null)}
            >
              {[
                { mode: "draw" as const, label: "Draw Mode", icon: Edit3 },
                { mode: "select" as const, label: "Select Mode", icon: MousePointer },
                { mode: "erase" as const, label: "Erase Mode", icon: Eraser },
              ].map(({ mode, label, icon: Icon }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    onPointerModeChange(mode);
                    onClose();
                  }}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-left text-[13px] text-foreground/90 transition-colors hover:bg-[var(--surface-2)] hover:text-foreground"
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </span>
                  {pointerMode === mode ? <Check className="h-3.5 w-3.5 text-[var(--primary)]" /> : null}
                </button>
              ))}
              <div className="my-1 h-px bg-[var(--border)]" />
              {hasAutomation ? (
                <>
                  <button type="button" onClick={() => { onShowAutomation(); onClose(); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-foreground/90 transition-colors hover:bg-[var(--surface-2)] hover:text-foreground">
                    <Eye className="h-3.5 w-3.5" />
                    Show Automation
                  </button>
                  <button type="button" onClick={() => { onHideAutomation(); onClose(); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-foreground/90 transition-colors hover:bg-[var(--surface-2)] hover:text-foreground">
                    <EyeOff className="h-3.5 w-3.5" />
                    Hide Automation
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => { onAddAutomation(); onClose(); }} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] text-foreground/90 transition-colors hover:bg-[var(--surface-2)] hover:text-foreground">
                  <Plus className="h-3.5 w-3.5" />
                  Add Automation
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
