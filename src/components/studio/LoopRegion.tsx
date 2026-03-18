import { useCallback, useRef, useEffect, memo } from "react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";

import { TRACK_HEADER_WIDTH, beatToAbsoluteX, beatToContentX } from "./timelineMath";
const BRACE_HEIGHT = 12;
const HANDLE_WIDTH = 10;

interface LoopRegionProps {
  loopStart: number;
  loopEnd: number;
  loopEnabled: boolean;
  pixelsPerBeat: number;
  totalBeats: number;
  snapBeats: number;
  onLoopChange: (start: number, end: number) => void;
  onLoopToggle: () => void;
  onLoopToSelection?: () => void;
  onLoopFocus?: () => void;
}

/** Draggable loop brace displayed on the timeline ruler area */
export const LoopRegion = memo(function LoopRegion({
  loopStart,
  loopEnd,
  loopEnabled,
  pixelsPerBeat,
  totalBeats,
  snapBeats,
  onLoopChange,
  onLoopToggle,
  onLoopToSelection,
  onLoopFocus,
}: LoopRegionProps) {
  const dragRef = useRef<{
    type: "move" | "start" | "end";
    origStart: number;
    origEnd: number;
    startX: number;
    rawStart: number;
    rawEnd: number;
  } | null>(null);

  const propsRef = useRef({ loopStart, loopEnd, pixelsPerBeat, totalBeats, snapBeats, onLoopChange });
  propsRef.current = { loopStart, loopEnd, pixelsPerBeat, totalBeats, snapBeats, onLoopChange };

  const snap = useCallback((v: number) => {
    const sb = propsRef.current.snapBeats;
    return sb > 0 ? Math.round(v / sb) * sb : v;
  }, []);

  const handlePointerDown = useCallback(
    (type: "move" | "start" | "end") => (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const { loopStart: ls, loopEnd: le } = propsRef.current;
      dragRef.current = {
        type,
        origStart: ls,
        origEnd: le,
        startX: e.clientX,
        rawStart: ls,
        rawEnd: le,
      };
      onLoopFocus?.();
    },
    [onLoopFocus]
  );

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragRef.current) return;
      const { pixelsPerBeat: ppb, totalBeats: tb, onLoopChange: onChange } = propsRef.current;
      const deltaPx = e.clientX - dragRef.current.startX;
      const deltaBeats = deltaPx / ppb;
      const { type, origStart, origEnd } = dragRef.current;
      const minLen = 0.125; // always allow fine movement during drag

      let newStart: number, newEnd: number;

      if (type === "move") {
        const len = origEnd - origStart;
        newStart = Math.max(0, Math.min(origStart + deltaBeats, tb - len));
        newEnd = newStart + len;
      } else if (type === "start") {
        newStart = Math.max(0, Math.min(origStart + deltaBeats, origEnd - minLen));
        newEnd = origEnd;
      } else {
        newStart = origStart;
        newEnd = Math.max(origStart + minLen, Math.min(origEnd + deltaBeats, tb));
      }

      // Store raw (unsnapped) values for fluid movement
      dragRef.current.rawStart = newStart;
      dragRef.current.rawEnd = newEnd;
      onChange(newStart, newEnd);
    };

    const onUp = () => {
      if (!dragRef.current) return;
      // Snap to grid on release
      const { snapBeats: sb, totalBeats: tb, onLoopChange: onChange } = propsRef.current;
      const { rawStart, rawEnd, type, origStart, origEnd } = dragRef.current;

      if (sb > 0) {
        let snappedStart: number, snappedEnd: number;

        if (type === "move") {
          const len = origEnd - origStart;
          snappedStart = Math.round(rawStart / sb) * sb;
          snappedStart = Math.max(0, Math.min(snappedStart, tb - len));
          snappedEnd = snappedStart + len;
        } else if (type === "start") {
          snappedStart = Math.round(rawStart / sb) * sb;
          snappedStart = Math.max(0, Math.min(snappedStart, rawEnd - (sb || 0.25)));
          snappedEnd = rawEnd;
        } else {
          snappedStart = rawStart;
          snappedEnd = Math.round(rawEnd / sb) * sb;
          snappedEnd = Math.max(rawStart + (sb || 0.25), Math.min(snappedEnd, tb));
        }

        onChange(snappedStart, snappedEnd);
      }

      dragRef.current = null;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [snap]);

  const loopLen = loopEnd - loopStart;

  const handleDoubleLength = useCallback(() => {
    const newEnd = Math.min(loopStart + loopLen * 2, totalBeats);
    onLoopChange(loopStart, newEnd);
  }, [loopStart, loopLen, totalBeats, onLoopChange]);

  const handleHalveLength = useCallback(() => {
    if (loopLen <= (snapBeats || 0.25)) return;
    onLoopChange(loopStart, loopStart + loopLen / 2);
  }, [loopStart, loopLen, snapBeats, onLoopChange]);

  const left = beatToAbsoluteX(loopStart, pixelsPerBeat);
  const width = beatToContentX(loopLen, pixelsPerBeat);

  const braceColor = loopEnabled
    ? "hsl(var(--primary) / 0.6)"
    : "hsl(var(--foreground) / 0.15)";
  const handleColor = loopEnabled
    ? "hsl(var(--primary) / 0.8)"
    : "hsl(var(--foreground) / 0.25)";

  // Brace sits at the bottom of the ruler (ruler is h-6 = 24px)
  const braceTop = 24 - BRACE_HEIGHT;

  return (
    <>
      {/* Loop highlight band across full timeline height */}
      {loopEnabled && (
        <div
          className="absolute top-0 bottom-0 pointer-events-none z-[5]"
          style={{
            left,
            width,
            backgroundColor: "hsl(var(--primary) / 0.06)",
            borderLeft: "1px solid hsl(var(--primary) / 0.3)",
            borderRight: "1px solid hsl(var(--primary) / 0.3)",
          }}
        />
      )}

      {/* Loop brace on ruler (draggable) — sits at bottom of ruler */}
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div
            className="absolute z-20"
            style={{
              left,
              width,
              height: BRACE_HEIGHT,
              top: braceTop,
              backgroundColor: braceColor,
              borderRadius: "0 0 3px 3px",
              cursor: "grab",
              touchAction: "none",
            }}
            onPointerDown={handlePointerDown("move")}
            onDoubleClick={(e) => {
              e.stopPropagation();
              onLoopToggle();
            }}
          />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={onLoopToggle}>
            {loopEnabled ? "Disable Loop" : "Enable Loop"}
          </ContextMenuItem>
          {onLoopToSelection && (
            <ContextMenuItem onClick={onLoopToSelection}>
              Set Loop to Selection
            </ContextMenuItem>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem onClick={handleDoubleLength}>
            Double Loop Length
          </ContextMenuItem>
          <ContextMenuItem onClick={handleHalveLength} disabled={loopLen <= (snapBeats || 0.25)}>
            Halve Loop Length
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Left handle */}
      <div
        className="absolute z-20 cursor-col-resize"
        style={{
          left: left - HANDLE_WIDTH / 2,
          width: HANDLE_WIDTH,
          height: BRACE_HEIGHT,
          top: braceTop,
          backgroundColor: handleColor,
          borderRadius: "0 0 0 3px",
          touchAction: "none",
        }}
        onPointerDown={handlePointerDown("start")}
      />

      {/* Right handle */}
      <div
        className="absolute z-20 cursor-col-resize"
        style={{
          left: left + width - HANDLE_WIDTH / 2,
          width: HANDLE_WIDTH,
          height: BRACE_HEIGHT,
          top: braceTop,
          backgroundColor: handleColor,
          borderRadius: "0 0 3px 0",
          touchAction: "none",
        }}
        onPointerDown={handlePointerDown("end")}
      />
    </>
  );
});
