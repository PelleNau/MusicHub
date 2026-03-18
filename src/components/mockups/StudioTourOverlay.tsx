import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, CheckCircle2 } from "lucide-react";

const TOUR_STEPS = [
  {
    anchor: "studio.transport",
    title: "Transport Bar",
    description: "This is where you control playback — play, stop, record, and set the tempo. It's like the remote control for your music.",
    icon: "⏯",
  },
  {
    anchor: "studio.browser",
    title: "Browser Panel",
    description: "Browse sounds, instruments, and effects here. Think of it as your sound library — drag items from here into your tracks.",
    icon: "📁",
  },
  {
    anchor: "studio.trackList",
    title: "Track Area",
    description: "Each horizontal lane is a track. Tracks hold your audio clips and MIDI patterns. This is where your music takes shape visually.",
    icon: "🎵",
  },
  {
    anchor: "studio.detailPanel",
    title: "Detail Panel",
    description: "Select a track or clip to see its properties here. Adjust pitch, volume, effects, and other parameters.",
    icon: "🎛",
  },
];

interface StudioTourOverlayProps {
  onComplete: () => void;
  onAnchorChange?: (anchor: string | null) => void;
  className?: string;
}

/**
 * Lesson 1.6 — Guided tour that sequentially highlights Studio regions.
 */
export function StudioTourOverlay({ onComplete, onAnchorChange, className = "" }: StudioTourOverlayProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([0]));

  const step = TOUR_STEPS[stepIdx];
  const isLast = stepIdx === TOUR_STEPS.length - 1;

  // Report anchor to parent for highlighting
  const reportAnchor = useCallback((idx: number) => {
    onAnchorChange?.(TOUR_STEPS[idx]?.anchor ?? null);
  }, [onAnchorChange]);

  const next = useCallback(() => {
    if (isLast) {
      onAnchorChange?.(null);
      onComplete();
      return;
    }
    const nextIdx = stepIdx + 1;
    setStepIdx(nextIdx);
    setVisitedSteps((prev) => new Set([...prev, nextIdx]));
    reportAnchor(nextIdx);
  }, [stepIdx, isLast, onComplete, onAnchorChange, reportAnchor]);

  // Report initial anchor
  useState(() => { reportAnchor(0); });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Progress */}
      <div className="flex gap-1.5">
        {TOUR_STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i < stepIdx ? "bg-primary" : i === stepIdx ? "bg-primary/60 animate-pulse" : "bg-secondary/40"
            }`}
          />
        ))}
      </div>

      {/* Current step card */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{step.icon}</span>
          <div className="flex-1">
            <h3 className="text-sm font-mono font-semibold">{step.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.description}</p>
          </div>
        </div>
      </div>

      {/* Step list */}
      <div className="space-y-1">
        {TOUR_STEPS.map((s, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono ${
              i === stepIdx ? "text-primary" : visitedSteps.has(i) ? "text-muted-foreground" : "text-muted-foreground/40"
            }`}
          >
            {visitedSteps.has(i) && i < stepIdx ? (
              <CheckCircle2 className="h-3 w-3 text-primary/60" />
            ) : i === stepIdx ? (
              <div className="h-3 w-3 rounded-full border-2 border-primary animate-pulse" />
            ) : (
              <div className="h-3 w-3 rounded-full border border-border" />
            )}
            {s.title}
          </div>
        ))}
      </div>

      <Button onClick={next} size="sm" className="w-full gap-1.5">
        {isLast ? "Complete Tour" : "Next"} <ChevronRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
