import React, { useState, useRef, useEffect } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "@/components/ui/context-menu";
import { Copy, Link2, Palette, Repeat, Scissors, Trash2, Type, Volume2, VolumeX } from "lucide-react";
import { TRACK_COLORS } from "./trackColors";

interface ClipContextMenuProps {
  children: React.ReactNode;
  clipId: string;
  clipName: string;
  isMidi: boolean;
  isMuted?: boolean;
  onDelete?: (clipId: string) => void;
  onDuplicate?: (clipId: string) => void;
  onLinkedDuplicate?: (clipId: string) => void;
  onRename?: (clipId: string, name: string) => void;
  onColorChange?: (clipId: string, color: number) => void;
  onSplit?: (clipId: string) => void;
  onMuteToggle?: (clipId: string) => void;
  onSetAsLoop?: (clipId: string) => void;
}

export function ClipContextMenu({
  children,
  clipId,
  clipName,
  isMidi,
  isMuted,
  onDelete,
  onDuplicate,
  onLinkedDuplicate,
  onRename,
  onColorChange,
  onSplit,
  onMuteToggle,
  onSetAsLoop,
}: ClipContextMenuProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(clipName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRenameSubmit = () => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== clipName) {
      onRename?.(clipId, trimmed);
    }
    setIsRenaming(false);
  };

  if (isRenaming) {
    return (
      <div className="relative">
        {children}
        <div className="absolute inset-x-0 top-0 z-30 flex items-center bg-card border border-border rounded px-1 py-0.5 shadow-lg">
          <input
            ref={inputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRenameSubmit();
              if (e.key === "Escape") setIsRenaming(false);
            }}
            className="w-full text-[10px] font-mono bg-transparent text-foreground outline-none"
          />
        </div>
      </div>
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem
          className="gap-2"
          onClick={() => onDuplicate?.(clipId)}
        >
          <Copy className="h-3 w-3" /> Duplicate
        </ContextMenuItem>
        {isMidi && (
          <ContextMenuItem
            className="gap-2"
            onClick={() => onLinkedDuplicate?.(clipId)}
          >
            <Link2 className="h-3 w-3" /> Linked Duplicate
          </ContextMenuItem>
        )}
        <ContextMenuItem
          className="gap-2"
          onClick={() => onSplit?.(clipId)}
        >
          <Scissors className="h-3 w-3" /> Split at Playhead
        </ContextMenuItem>
        {onSetAsLoop && (
          <ContextMenuItem
            className="gap-2"
            onClick={() => onSetAsLoop(clipId)}
          >
            <Repeat className="h-3 w-3" /> Loop to Selection
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem
          className="gap-2"
          onClick={() => onMuteToggle?.(clipId)}
        >
          {isMuted ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
          {isMuted ? "Unmute" : "Mute"}
        </ContextMenuItem>
        <ContextMenuItem
          className="gap-2"
          onClick={() => {
            setRenameValue(clipName);
            setIsRenaming(true);
          }}
        >
          <Type className="h-3 w-3" /> Rename
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2">
            <Palette className="h-3 w-3" /> Color
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="grid w-auto min-w-0 grid-cols-7 gap-1 p-1.5">
            {Object.entries(TRACK_COLORS).map(([idx, c]) => (
              <button
                key={idx}
                className="h-4 w-4 rounded-[3px] border border-black/10 transition-transform hover:scale-105 hover:ring-1 hover:ring-white/40"
                style={{ backgroundColor: c }}
                onClick={() => onColorChange?.(clipId, Number(idx))}
              />
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem
          className="gap-2 text-destructive focus:text-destructive"
          onClick={() => onDelete?.(clipId)}
        >
          <Trash2 className="h-3 w-3" /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
