import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import type { GuideResolvedAnchor } from "@/types/musicHubGuideRuntime";

interface GuideAnchorHighlightProps {
  currentAnchor?: {
    targetId: string;
    highlight?: string;
  };
  resolvedAnchors: Record<string, GuideResolvedAnchor>;
  lessonActive: boolean;
}

interface HighlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function GuideAnchorHighlight({
  currentAnchor,
  resolvedAnchors,
  lessonActive,
}: GuideAnchorHighlightProps) {
  const [rect, setRect] = useState<HighlightRect | null>(null);

  const measureTarget = useCallback(() => {
    if (!lessonActive || !currentAnchor?.targetId) {
      setRect(null);
      return;
    }

    const el = document.querySelector(
      `[data-guide-anchor="${currentAnchor.targetId}"]`
    );
    if (!el) {
      setRect(null);
      return;
    }

    const bounds = el.getBoundingClientRect();
    setRect({
      top: bounds.top,
      left: bounds.left,
      width: bounds.width,
      height: bounds.height,
    });
  }, [lessonActive, currentAnchor?.targetId]);

  useEffect(() => {
    measureTarget();
    // Re-measure on scroll/resize
    const handleUpdate = () => measureTarget();
    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);
    const interval = setInterval(handleUpdate, 1000);
    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
      clearInterval(interval);
    };
  }, [measureTarget]);

  if (!rect) return null;

  const pad = 4;

  return createPortal(
    <div
      className="pointer-events-none fixed z-50"
      style={{
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }}
    >
      {/* Pulsing ring */}
      <div className="absolute inset-0 rounded-md ring-2 ring-primary/50 animate-pulse" />
      {/* Glow */}
      <div className="absolute inset-0 rounded-md shadow-[0_0_20px_-4px_hsl(var(--primary)/0.4)]" />
      {/* Beacon dot */}
      <div className="absolute -top-1.5 -right-1.5">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/50" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
        </span>
      </div>
    </div>,
    document.body
  );
}
