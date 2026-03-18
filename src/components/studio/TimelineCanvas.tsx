import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GridDivision } from "@/hooks/useTimelineGrid";
import { drawGrid } from "@/components/studio/canvas/drawGrid";
import { drawPlayhead } from "@/components/studio/canvas/drawPlayhead";
import { drawRuler } from "@/components/studio/canvas/drawRuler";
import {
  RULER_HEIGHT,
  TRACK_HEADER_WIDTH,
  getViewportRange,
  xToBeat,
} from "@/components/studio/timelineMath";

interface TimelineCanvasProps {
  totalBeats: number;
  pixelsPerBeat: number;
  beatsPerBar: number;
  activeDivision: GridDivision;
  tripletMode: boolean;
  scrollContainerRef: React.RefObject<HTMLElement | null>;
  onSeek?: (beat: number) => void;
  beatGetter?: () => number;
  staticBeat?: number;
  zoomHandle?: React.ReactNode;
  loopOverlay?: React.ReactNode;
  children: React.ReactNode;
}

function resizeCanvas(canvas: HTMLCanvasElement, cssWidth: number, cssHeight: number) {
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(cssWidth));
  const height = Math.max(1, Math.round(cssHeight));

  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));

  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  return ctx;
}

export function TimelineCanvas({
  totalBeats,
  pixelsPerBeat,
  beatsPerBar,
  activeDivision,
  tripletMode,
  scrollContainerRef,
  onSeek,
  beatGetter,
  staticBeat = 0,
  zoomHandle,
  loopOverlay,
  children,
}: TimelineCanvasProps) {
  const rulerBgRef = useRef<HTMLCanvasElement>(null);
  const rulerContentRef = useRef<HTMLCanvasElement>(null);
  const rulerOverlayRef = useRef<HTMLCanvasElement>(null);
  const gridBgRef = useRef<HTMLCanvasElement>(null);
  const gridContentRef = useRef<HTMLCanvasElement>(null);
  const gridOverlayRef = useRef<HTMLCanvasElement>(null);
  const trackAreaRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [scrollState, setScrollState] = useState({ left: 0, viewportWidth: 0 });

  const totalWidth = totalBeats * pixelsPerBeat;

  useEffect(() => {
    const element = trackAreaRef.current;
    if (!element) return;

    const observer = new ResizeObserver(() => {
      setContentHeight(element.offsetHeight);
    });

    observer.observe(element);
    setContentHeight(element.offsetHeight);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const scrollElement = scrollContainerRef.current;
    if (!scrollElement) return;

    const sync = () => {
      setScrollState({
        left: scrollElement.scrollLeft,
        viewportWidth: scrollElement.clientWidth - TRACK_HEADER_WIDTH,
      });
    };

    sync();
    scrollElement.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      scrollElement.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [scrollContainerRef]);

  const viewport = useMemo(
    () => getViewportRange(scrollState.left, scrollState.viewportWidth, pixelsPerBeat, totalBeats),
    [scrollState.left, scrollState.viewportWidth, pixelsPerBeat, totalBeats],
  );

  const redrawStatic = useCallback(() => {
    const rulerWidth = Math.max(1, scrollState.viewportWidth);
    const gridWidth = Math.max(1, scrollState.viewportWidth);
    const gridHeight = Math.max(1, contentHeight);

    const rulerBgCtx = rulerBgRef.current ? resizeCanvas(rulerBgRef.current, rulerWidth, RULER_HEIGHT) : null;
    const rulerContentCtx = rulerContentRef.current ? resizeCanvas(rulerContentRef.current, rulerWidth, RULER_HEIGHT) : null;
    const gridBgCtx = gridBgRef.current ? resizeCanvas(gridBgRef.current, gridWidth, gridHeight) : null;
    const gridContentCtx = gridContentRef.current ? resizeCanvas(gridContentRef.current, gridWidth, gridHeight) : null;

    if (rulerBgCtx) {
      rulerBgCtx.clearRect(0, 0, rulerWidth, RULER_HEIGHT);
      rulerBgCtx.fillStyle = "hsl(var(--muted) / 0.2)";
      rulerBgCtx.fillRect(0, 0, rulerWidth, RULER_HEIGHT);
    }

    if (rulerContentCtx) {
      drawRuler({
        ctx: rulerContentCtx,
        width: rulerWidth,
        height: RULER_HEIGHT,
        totalBeats,
        pixelsPerBeat,
        beatsPerBar,
        activeDivision,
        tripletMode,
        viewport,
      });
    }

    if (gridBgCtx) {
      gridBgCtx.clearRect(0, 0, gridWidth, gridHeight);
    }

    if (gridContentCtx) {
      drawGrid({
        ctx: gridContentCtx,
        width: gridWidth,
        height: gridHeight,
        totalBeats,
        pixelsPerBeat,
        beatsPerBar,
        activeDivision,
        tripletMode,
        viewport,
      });
    }
  }, [
    activeDivision,
    beatsPerBar,
    contentHeight,
    pixelsPerBeat,
    scrollState.viewportWidth,
    totalBeats,
    tripletMode,
    viewport,
  ]);

  useEffect(() => {
    redrawStatic();
  }, [redrawStatic]);

  useEffect(() => {
    let frameId = 0;

    const render = () => {
      const rulerWidth = Math.max(1, scrollState.viewportWidth);
      const gridWidth = Math.max(1, scrollState.viewportWidth);
      const gridHeight = Math.max(1, contentHeight);
      const beat = beatGetter ? beatGetter() : staticBeat;

      const rulerOverlayCtx = rulerOverlayRef.current ? resizeCanvas(rulerOverlayRef.current, rulerWidth, RULER_HEIGHT) : null;
      const gridOverlayCtx = gridOverlayRef.current ? resizeCanvas(gridOverlayRef.current, gridWidth, gridHeight) : null;

      if (rulerOverlayCtx) {
        drawPlayhead({
          ctx: rulerOverlayCtx,
          beat: Math.max(0, beat - viewport.startBeat),
          pixelsPerBeat,
          height: RULER_HEIGHT,
          showTriangle: true,
        });
      }

      if (gridOverlayCtx) {
        drawPlayhead({
          ctx: gridOverlayCtx,
          beat: Math.max(0, beat - viewport.startBeat),
          pixelsPerBeat,
          height: gridHeight,
        });
      }

      frameId = window.requestAnimationFrame(render);
    };

    frameId = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(frameId);
  }, [beatGetter, contentHeight, pixelsPerBeat, scrollState.viewportWidth, staticBeat, viewport.startBeat]);

  const handleRulerClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left + viewport.startX;
    onSeek(xToBeat(x, pixelsPerBeat));
  }, [onSeek, pixelsPerBeat, viewport.startX]);

  return (
    <>
      <div className="flex border-b border-border sticky top-0 z-10 bg-card">
        {zoomHandle || <div className="w-52 shrink-0 border-r border-border/60 bg-card sticky left-0 z-10" />}
        <div className="relative h-6 bg-muted/20" style={{ minWidth: totalWidth }}>
          <canvas ref={rulerBgRef} className="absolute inset-0 pointer-events-none" />
          <canvas ref={rulerContentRef} className="absolute inset-0 pointer-events-none" />
          <canvas ref={rulerOverlayRef} className="absolute inset-0 pointer-events-none" />
          <div className="absolute inset-0 cursor-default" onClick={handleRulerClick} />
        </div>
      </div>

      <div className="relative">
        <div
          className="absolute inset-y-0 pointer-events-none"
          style={{ left: TRACK_HEADER_WIDTH, width: totalWidth }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <canvas ref={gridBgRef} className="absolute inset-0" />
            <canvas ref={gridContentRef} className="absolute inset-0" />
            <canvas ref={gridOverlayRef} className="absolute inset-0" />
            {loopOverlay}
          </div>
        </div>

        <div ref={trackAreaRef} className="relative z-[1]">
          {children}
        </div>
      </div>
    </>
  );
}
