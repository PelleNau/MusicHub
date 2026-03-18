import { ReactNode } from "react";

interface AnchorHighlightProps {
  anchorId: string;
  activeAnchor: string | null;
  children: ReactNode;
  className?: string;
}

/**
 * Wraps a studio zone and applies a pulsing highlight when anchorId matches the active step's anchor.
 */
export function AnchorHighlight({ anchorId, activeAnchor, children, className = "" }: AnchorHighlightProps) {
  const isActive = activeAnchor === anchorId;

  return (
    <div
      data-anchor={anchorId}
      className={`relative transition-all duration-300 ${isActive ? "ring-2 ring-primary/60 rounded-md shadow-[0_0_16px_-4px_hsl(var(--primary)/0.35)]" : ""} ${className}`}
    >
      {children}
      {isActive && (
        <div className="absolute -top-1 -right-1 z-20">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/60" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
          </span>
        </div>
      )}
    </div>
  );
}
