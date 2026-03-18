import { useMemo, useState, useRef, useCallback, useEffect } from "react";
import { TrackInfo, ClipInfo, AutomationEnvelope, MidiNote } from "@/types/ableton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import {
  Music2,
  Volume2,
  Undo2,
  Crown,
  Layers,
  Mic2,
  Settings2,
  ChevronRight,
  ArrowRight,
  ZoomIn,
  ZoomOut,
  Activity,
  Link2,
} from "lucide-react";

/* ── Ableton color palette ── */
const ABLETON_COLORS: Record<number, string> = {
  0: "hsl(0, 75%, 50%)", 1: "hsl(20, 85%, 50%)", 2: "hsl(40, 90%, 50%)",
  3: "hsl(50, 90%, 50%)", 4: "hsl(75, 65%, 45%)", 5: "hsl(120, 55%, 40%)",
  6: "hsl(155, 80%, 40%)", 7: "hsl(190, 70%, 45%)", 8: "hsl(210, 70%, 50%)",
  9: "hsl(240, 55%, 50%)", 10: "hsl(270, 55%, 50%)", 11: "hsl(300, 50%, 50%)",
  12: "hsl(330, 60%, 50%)", 13: "hsl(345, 70%, 50%)", 14: "hsl(55, 85%, 55%)",
  15: "hsl(80, 60%, 45%)", 16: "hsl(340, 75%, 55%)", 17: "hsl(25, 90%, 55%)",
  18: "hsl(166, 80%, 45%)", 19: "hsl(200, 65%, 50%)", 20: "hsl(280, 60%, 55%)",
};

function getColor(idx: number): string {
  return ABLETON_COLORS[idx] || ABLETON_COLORS[idx % 21] || "hsl(0,0%,40%)";
}

function getColorAlpha(idx: number, a: number): string {
  const base = getColor(idx);
  const m = base.match(/hsl\(([^)]+)\)/);
  return m ? `hsla(${m[1]}, ${a})` : base;
}

const TRACK_ICON: Record<string, React.ReactNode> = {
  midi: <Music2 className="h-3 w-3" />,
  audio: <Volume2 className="h-3 w-3" />,
  return: <Undo2 className="h-3 w-3" />,
  master: <Crown className="h-3 w-3" />,
  group: <Layers className="h-3 w-3" />,
};

/* ── Beat → bar display ── */
function beatsToBar(beats: number, beatsPerBar = 4): string {
  const bar = Math.floor(beats / beatsPerBar) + 1;
  return `${bar}`;
}

function beatsToTime(beats: number, tempo: number): string {
  const seconds = (beats / (tempo || 120)) * 60;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ── Automation curve SVG ── */
function AutomationCurve({
  envelope,
  maxBeat,
  width,
  height,
  color,
}: {
  envelope: AutomationEnvelope;
  maxBeat: number;
  width: number;
  height: number;
  color: string;
}) {
  if (envelope.points.length < 2) return null;

  // Normalize values to 0-1 range
  const values = envelope.points.map((p) => p.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const points = envelope.points.map((p) => {
    const x = (p.time / maxBeat) * width;
    const y = height - ((p.value - minVal) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      width={width}
      height={height}
      style={{ overflow: "visible" }}
    >
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.7}
      />
    </svg>
  );
}

/* ── Signal Flow Panel ── */
function SignalFlowPanel({ track, clip }: { track: TrackInfo; clip: ClipInfo }) {
  const allDevices = track.devices;

  if (allDevices.length === 0) {
    return (
      <div className="px-4 py-3 text-muted-foreground font-mono text-[10px] italic">
        No devices on this track
      </div>
    );
  }

  return (
    <div className="px-4 py-3 space-y-2">
      <div className="flex items-center gap-2">
        <Settings2 className="h-3 w-3 text-primary" />
        <span className="font-mono text-[10px] text-primary font-semibold uppercase tracking-wider">
          {clip.name}
        </span>
        <span className="font-mono text-[9px] text-muted-foreground">
          on {track.name} · Bar {Math.floor(clip.startBeats / 4) + 1}–{Math.floor(clip.endBeats / 4) + 1}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {allDevices.map((d, i) => {
          const isInstrument = d.type === "instrument";
          const hasSidechain = !!d.sidechain;
          return (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`rounded-lg border-2 px-3 py-2.5 min-w-[100px] ${
                  isInstrument
                    ? "border-primary/50 bg-primary/15"
                    : hasSidechain
                    ? "border-amber-500/50 bg-amber-500/10"
                    : "border-border/40 bg-secondary/50"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  {isInstrument ? (
                    <Mic2 className="h-3.5 w-3.5 text-primary shrink-0" />
                  ) : hasSidechain ? (
                    <Link2 className="h-3 w-3 text-amber-500 shrink-0" />
                  ) : (
                    <Settings2 className="h-3 w-3 text-muted-foreground shrink-0" />
                  )}
                  <span className={`font-mono text-[11px] font-bold ${isInstrument ? "text-primary" : "text-foreground"}`}>
                    {d.name}
                  </span>
                  {d.isPlugin && d.pluginFormat && (
                    <span className="font-mono text-[8px] text-primary/60 bg-primary/10 rounded px-1 py-0.5">
                      {d.pluginFormat}
                    </span>
                  )}
                </div>
                {hasSidechain && d.sidechain && (
                  <div className="mt-1 border-t border-amber-500/20 pt-1">
                    <span className="font-mono text-[9px] text-amber-500 font-semibold">
                      SC: {d.sidechain.source}
                    </span>
                    <div className="flex gap-2 mt-0.5">
                      {d.sidechain.ratio && (
                        <span className="font-mono text-[8px] text-muted-foreground">R:{d.sidechain.ratio}</span>
                      )}
                      {d.sidechain.threshold && (
                        <span className="font-mono text-[8px] text-muted-foreground">T:{d.sidechain.threshold}</span>
                      )}
                      {d.sidechain.attack && (
                        <span className="font-mono text-[8px] text-muted-foreground">A:{d.sidechain.attack}</span>
                      )}
                      {d.sidechain.release && (
                        <span className="font-mono text-[8px] text-muted-foreground">Rel:{d.sidechain.release}</span>
                      )}
                    </div>
                  </div>
                )}
                {d.presetName && (
                  <span className="font-mono text-[9px] text-muted-foreground block">
                    Preset: {d.presetName}
                  </span>
                )}
                {d.parameters.length > 0 && (
                  <div className="mt-1.5 space-y-0.5 border-t border-border/20 pt-1.5">
                    {d.parameters.slice(0, 4).map((p, pi) => (
                      <div key={pi} className="flex justify-between gap-4">
                        <span className="font-mono text-[9px] text-muted-foreground truncate">{p.name}</span>
                        <span className="font-mono text-[9px] text-foreground shrink-0">{p.value}</span>
                      </div>
                    ))}
                    {d.parameters.length > 4 && (
                      <span className="font-mono text-[8px] text-muted-foreground/50">
                        +{d.parameters.length - 4} more params
                      </span>
                    )}
                  </div>
                )}
              </div>
              {i < allDevices.length - 1 && (
                <ArrowRight className="h-4 w-4 text-primary/40 shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Automation lane colors ── */
const AUTO_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--warning))",
  "hsl(280, 60%, 55%)",
  "hsl(160, 70%, 45%)",
  "hsl(350, 70%, 55%)",
];

/* ── Inline mini sparkline ── */
function MiniSparkline({
  envelope,
  maxBeat,
  width,
  color,
}: {
  envelope: AutomationEnvelope;
  maxBeat: number;
  width: number;
  color: string;
}) {
  const h = 14;
  if (envelope.points.length < 2) return null;
  const values = envelope.points.map((p) => p.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;
  const pts = envelope.points.map((p) => {
    const x = (p.time / maxBeat) * width;
    const y = h - ((p.value - minVal) / range) * (h - 2) - 1;
    return `${x},${y}`;
  });
  return (
    <polyline
      points={pts.join(" ")}
      fill="none"
      stroke={color}
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.6}
    />
  );
}
/* ── Mini Piano Roll inside clips ── */
const NOTE_COLORS: Record<number, string> = {
  0: "#ff6b6b", 1: "#e85d75", 2: "#ffa94d", 3: "#f59f00",
  4: "#ffd43b", 5: "#69db7c", 6: "#38d9a9", 7: "#4dabf7",
  8: "#5c7cfa", 9: "#7950f2", 10: "#cc5de8", 11: "#f06595",
};

function MiniPianoRoll({ notes, clipDurationBeats, height }: {
  notes: MidiNote[];
  clipDurationBeats: number;
  height: number;
}) {
  if (!notes || notes.length === 0 || height < 6) return null;

  const pitches = notes.map((n) => n.pitch);
  const minPitch = Math.min(...pitches) - 1;
  const maxPitch = Math.max(...pitches) + 1;
  const pitchRange = maxPitch - minPitch;

  const topPad = 12;
  const botPad = 2;
  const drawH = height - topPad - botPad;
  if (drawH < 6) return null;

  const vbW = 1000; // virtual viewBox width
  const noteH = Math.max(2, Math.min(8, (drawH / pitchRange) * 0.85));

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width="100%"
      height="100%"
      viewBox={`0 0 ${vbW} ${height}`}
      preserveAspectRatio="none"
    >
      {notes.slice(0, 200).map((note, i) => {
        const x = (note.start / clipDurationBeats) * vbW;
        const w = Math.max((note.duration / clipDurationBeats) * vbW, 2);
        const y = topPad + drawH - ((note.pitch - minPitch) / pitchRange) * drawH - noteH / 2;
        const opacity = note.mute ? 0.1 : 0.4 + (note.velocity / 127) * 0.6;
        return (
          <rect key={i} x={x} y={y} width={w} height={noteH} rx={0.5}
            fill={NOTE_COLORS[note.pitch % 12] || "white"} opacity={opacity} />
        );
      })}
    </svg>
  );
}

/* ── Velocity heatmap color ── */
function getVelocityHue(notes: MidiNote[]): string | null {
  if (!notes || notes.length === 0) return null;
  const avgVel = notes.reduce((s, n) => s + n.velocity, 0) / notes.length;
  // Map 0-127 velocity to hue: blue (low energy) → green → yellow → red (high energy)
  // 0 vel → hue 220 (blue), 127 vel → hue 0 (red)
  const hue = Math.round(220 - (avgVel / 127) * 220);
  return `hsla(${hue}, 70%, 50%, 0.15)`;
}

interface Props {
  tracks: TrackInfo[];
  tempo: number | null;
}

const BASE_TRACK_HEIGHT = 48;
const SPARKLINE_HEIGHT = 14;
const LABEL_WIDTH = 160;
const PIXELS_PER_BAR_BASE = 24;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 6;
const DEFAULT_ZOOM = 1;
const MIN_VZOOM = 0.5;
const MAX_VZOOM = 3;
const DEFAULT_VZOOM = 1;

export function ArrangementTimeline({ tracks, tempo }: Props) {
  const [hoveredClip, setHoveredClip] = useState<{ trackIdx: number; clipIdx: number } | null>(null);
  const [expandedClip, setExpandedClip] = useState<{ trackIdx: number; clipIdx: number } | null>(null);
  const [expandedAuto, setExpandedAuto] = useState<Set<number>>(new Set());

  // Zoom uses refs + direct DOM mutation for zero-latency response
  const hZoomRef = useRef(DEFAULT_ZOOM);
  const vZoomRef = useRef(DEFAULT_VZOOM);
  const [, forceUpdate] = useState(0); // only for expand/collapse re-renders
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const hLabelRef = useRef<HTMLSpanElement>(null);
  const vLabelRef = useRef<HTMLSpanElement>(null);
  const sizerRef = useRef<HTMLDivElement>(null);
  const baseWRef = useRef(600);
  const applyZoom = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    root.style.setProperty("--hz", String(hZoomRef.current));
    root.style.setProperty("--vz", String(vZoomRef.current));
    // Update sizer for scrollbar
    if (sizerRef.current) {
      sizerRef.current.style.width = `${baseWRef.current * hZoomRef.current + LABEL_WIDTH}px`;
    }
    if (hLabelRef.current) hLabelRef.current.textContent = `${Math.round(hZoomRef.current * 100)}%`;
    if (vLabelRef.current) vLabelRef.current.textContent = `${Math.round(vZoomRef.current * 100)}%`;
  }, []);

  const handleHZoom = useCallback((values: number[]) => {
    hZoomRef.current = values[0];
    applyZoom();
  }, [applyZoom]);

  const handleVZoom = useCallback((values: number[]) => {
    vZoomRef.current = values[0];
    applyZoom();
  }, [applyZoom]);

  const handleHZoomBtn = useCallback((delta: number) => {
    hZoomRef.current = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(hZoomRef.current + delta).toFixed(1)));
    applyZoom();
    forceUpdate((n) => n + 1); // update slider thumb position
  }, [applyZoom]);

  const handleVZoomBtn = useCallback((delta: number) => {
    vZoomRef.current = Math.min(MAX_VZOOM, Math.max(MIN_VZOOM, +(vZoomRef.current + delta).toFixed(2)));
    applyZoom();
    forceUpdate((n) => n + 1);
  }, [applyZoom]);

  // Initial CSS var setup
  useEffect(() => { applyZoom(); }, [applyZoom]);

  const TRACK_HEIGHT = BASE_TRACK_HEIGHT; // base height; vZoom applied via CSS

  const toggleClip = (trackIdx: number, clipIdx: number) => {
    setExpandedClip((prev) =>
      prev?.trackIdx === trackIdx && prev?.clipIdx === clipIdx ? null : { trackIdx, clipIdx }
    );
  };

  const toggleAutoLanes = useCallback((trackIdx: number) => {
    setExpandedAuto((prev) => {
      const next = new Set(prev);
      if (next.has(trackIdx)) next.delete(trackIdx);
      else next.add(trackIdx);
      return next;
    });
  }, []);

  // Ctrl+Scroll zoom
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const delta = -Math.sign(e.deltaY) * 0.25;
      if (e.shiftKey) {
        vZoomRef.current = Math.min(MAX_VZOOM, Math.max(MIN_VZOOM, +(vZoomRef.current + delta).toFixed(2)));
      } else {
        hZoomRef.current = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(hZoomRef.current + delta * 2).toFixed(1)));
      }
      applyZoom();
      forceUpdate((n) => n + 1);
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, [applyZoom]);

  const visibleTracks = useMemo(
    () => tracks.filter((t) => t.type !== "master"),
    [tracks]
  );

  const { maxBeat, totalBars } = useMemo(() => {
    let max = 0;
    for (const t of visibleTracks) {
      for (const c of (t.clips || [])) {
        if (c.endBeats > max) max = c.endBeats;
      }
      for (const e of (t.automationEnvelopes || [])) {
        for (const p of e.points) {
          if (p.time > max) max = p.time;
        }
      }
    }
    const bars = Math.ceil(max / 4);
    return { maxBeat: Math.max(max, 16), totalBars: Math.max(bars, 4) };
  }, [visibleTracks]);

  const autoStats = useMemo(() => {
    let totalEnvelopes = 0;
    let sidechainDevices = 0;
    for (const t of visibleTracks) {
      totalEnvelopes += (t.automationEnvelopes || []).length;
      for (const d of t.devices) {
        if (d.sidechain) sidechainDevices++;
      }
    }
    return { totalEnvelopes, sidechainDevices };
  }, [visibleTracks]);

  if (visibleTracks.length === 0) return null;

  const bpm = tempo || 120;
  // Base timeline width at 1x — CSS scaleX handles zoom
  const baseW = Math.max(600, totalBars * PIXELS_PER_BAR_BASE);
  baseWRef.current = baseW;

  const sectionMarkers: number[] = [];
  for (let i = 0; i <= totalBars; i += 8) sectionMarkers.push(i);

  // Beat position as percentage of timeline width
  function beatPct(beat: number): string {
    return `${(beat / maxBeat) * 100}%`;
  }

  const barLabelInterval = hZoomRef.current < 1 ? 8 : hZoomRef.current < 2 ? 4 : hZoomRef.current < 4 ? 2 : 1;

  return (
    <TooltipProvider delayDuration={100}>
      <div ref={rootRef} className="rounded-lg border border-border/30 bg-secondary/10 overflow-hidden"
        style={{ "--hz": DEFAULT_ZOOM, "--vz": DEFAULT_VZOOM } as React.CSSProperties}>
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border/20 bg-secondary/20">
          <Music2 className="h-3.5 w-3.5 text-primary shrink-0" />
          <h3 className="font-mono text-xs font-semibold text-foreground tracking-wider uppercase shrink-0">
            Arrangement Timeline
          </h3>
          <span className="font-mono text-[9px] text-muted-foreground shrink-0">
            {visibleTracks.length} tracks · {totalBars} bars · {beatsToTime(maxBeat, bpm)}
          </span>
          {autoStats.totalEnvelopes > 0 && (
            <span className="flex items-center gap-1 font-mono text-[9px] text-primary shrink-0">
              <Activity className="h-3 w-3" />
              {autoStats.totalEnvelopes} auto
            </span>
          )}
          {autoStats.sidechainDevices > 0 && (
            <span className="flex items-center gap-1 font-mono text-[9px] text-amber-500 shrink-0">
              <Link2 className="h-3 w-3" />
              {autoStats.sidechainDevices} SC
            </span>
          )}
          <div className="flex-1" />
          {/* H zoom */}
          <div className="flex items-center gap-1.5 shrink-0 border border-border/30 rounded-md px-2 py-1 bg-background/50">
            <span className="font-mono text-[8px] text-muted-foreground/60 uppercase">H</span>
            <button onClick={() => handleHZoomBtn(-0.5)} className="hover:text-foreground text-muted-foreground transition-colors p-0.5">
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <Slider
              defaultValue={[DEFAULT_ZOOM]}
              value={[hZoomRef.current]}
              onValueChange={handleHZoom}
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.25}
              className="w-32"
            />
            <button onClick={() => handleHZoomBtn(0.5)} className="hover:text-foreground text-muted-foreground transition-colors p-0.5">
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <span ref={hLabelRef} className="font-mono text-[9px] text-muted-foreground w-8 text-right tabular-nums">
              {Math.round(hZoomRef.current * 100)}%
            </span>
          </div>
          {/* V zoom */}
          <div className="flex items-center gap-1.5 shrink-0 border border-border/30 rounded-md px-2 py-1 bg-background/50">
            <span className="font-mono text-[8px] text-muted-foreground/60 uppercase">V</span>
            <button onClick={() => handleVZoomBtn(-0.25)} className="hover:text-foreground text-muted-foreground transition-colors p-0.5">
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
            <Slider
              defaultValue={[DEFAULT_VZOOM]}
              value={[vZoomRef.current]}
              onValueChange={handleVZoom}
              min={MIN_VZOOM}
              max={MAX_VZOOM}
              step={0.25}
              className="w-24"
            />
            <button onClick={() => handleVZoomBtn(0.25)} className="hover:text-foreground text-muted-foreground transition-colors p-0.5">
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <span ref={vLabelRef} className="font-mono text-[9px] text-muted-foreground w-8 text-right tabular-nums">
              {Math.round(vZoomRef.current * 100)}%
            </span>
          </div>
        </div>

        {/* Timeline body — uses CSS transform for zoom, no re-render */}
        <div
          ref={scrollContainerRef}
          className="overflow-x-auto"
          style={{ scrollbarWidth: "thin" }}
        >
          {/* Sizer div — width updated by applyZoom via ref */}
          <div ref={sizerRef} style={{ width: baseW * hZoomRef.current + LABEL_WIDTH }}>
            {/* Ruler */}
            <div className="flex border-b border-border/10">
              <div
                className="shrink-0 border-r border-border/20 backdrop-blur-md bg-secondary/70"
                style={{ width: LABEL_WIDTH, height: 24, position: "sticky", left: 0, zIndex: 2 }}
              />
              <div className="relative" style={{ width: baseW, height: 24, transformOrigin: "left", transform: `scaleX(var(--hz))` }}>
                {Array.from({ length: totalBars + 1 }, (_, bar) => {
                  const isSection = bar % 8 === 0;
                  const showLabel = bar % barLabelInterval === 0;
                  return (
                    <div
                      key={bar}
                      className="absolute top-0 h-full flex flex-col justify-end"
                      style={{ left: beatPct(bar * 4) }}
                    >
                      {showLabel && (
                        <span
                          className={`font-mono leading-none pb-1 pl-1 ${
                            isSection ? "text-[10px] text-foreground font-semibold" : "text-[8px] text-muted-foreground/50"
                          }`}
                          style={{ transform: `scaleX(calc(1 / var(--hz)))`, transformOrigin: "left" }}
                        >
                          {bar + 1}
                        </span>
                      )}
                      <div className={`w-px ${isSection ? "bg-border/40 h-full" : "bg-border/15 h-2"}`} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Track rows */}
            {visibleTracks.map((track, tIdx) => {
              const hasDevices = track.devices.length > 0;
              const trackHasExpandedClip = expandedClip?.trackIdx === tIdx;
              const expandedClipData = trackHasExpandedClip ? track.clips[expandedClip!.clipIdx] : null;
              const autoEnvelopes = track.automationEnvelopes || [];
              const hasAuto = autoEnvelopes.length > 0;
              const isAutoExpanded = expandedAuto.has(tIdx);
              const sidechainDevices = track.devices.filter((d) => d.sidechain);
              const hasSidechain = sidechainDevices.length > 0;

              return (
                <div key={tIdx}>
                  <div className="flex border-b border-border/5" style={{ height: `calc(${TRACK_HEIGHT}px * var(--vz))` }}>
                    {/* Sticky label */}
                    <div
                      className="shrink-0 border-r border-border/20 backdrop-blur-md bg-secondary/70 flex items-center gap-1.5 px-2"
                      style={{ width: LABEL_WIDTH, position: "sticky", left: 0, zIndex: 2 }}
                    >
                      <div
                        className="w-1 rounded-full shrink-0"
                        style={{ height: 24, backgroundColor: getColor(track.color) }}
                      />
                      <span className="text-muted-foreground shrink-0">{TRACK_ICON[track.type]}</span>
                      <span className="font-mono text-[10px] font-medium text-foreground truncate">{track.name}</span>
                      <div className="flex items-center gap-0.5 ml-auto shrink-0">
                        {hasSidechain && (
                          <Tooltip>
                            <TooltipTrigger><Link2 className="h-3 w-3 text-amber-500" /></TooltipTrigger>
                            <TooltipContent side="top" className="font-mono text-[10px]">
                              <p className="font-semibold text-amber-500">Sidechain</p>
                              {sidechainDevices.map((d, i) => <p key={i}>{d.name} ← {d.sidechain?.source}</p>)}
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {hasAuto && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={(e) => { e.stopPropagation(); toggleAutoLanes(tIdx); }}
                                className={`p-0.5 rounded transition-colors ${isAutoExpanded ? "text-primary bg-primary/10" : "text-muted-foreground/40 hover:text-muted-foreground"}`}
                              >
                                <Activity className="h-3 w-3" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="font-mono text-[10px]">
                              {autoEnvelopes.length} automation envelope{autoEnvelopes.length !== 1 ? "s" : ""} — click for details
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {hasDevices && !hasAuto && !hasSidechain && (
                          <span className="font-mono text-[8px] text-muted-foreground/40">{track.devices.length}fx</span>
                        )}
                      </div>
                    </div>

                    {/* Clip area — scaleX for H zoom, height via CSS var for V zoom */}
                    <div
                      className="relative flex-1"
                      style={{
                        width: baseW,
                        transformOrigin: "top left",
                        transform: `scaleX(var(--hz))`,
                      }}
                    >
                      {/* Section grid */}
                      {sectionMarkers.map((bar) => (
                        <div key={bar} className="absolute top-0 w-px bg-border/10 h-full" style={{ left: beatPct(bar * 4) }} />
                      ))}

                      {/* Clips */}
                      {track.clips.map((clip, cIdx) => {
                        const leftPct = (clip.startBeats / maxBeat) * 100;
                        const widthPct = ((clip.endBeats - clip.startBeats) / maxBeat) * 100;
                        const isHovered = hoveredClip?.trackIdx === tIdx && hoveredClip?.clipIdx === cIdx;
                        const isSelected = expandedClip?.trackIdx === tIdx && expandedClip?.clipIdx === cIdx;
                        const clipColor = clip.color >= 0 ? clip.color : track.color;
                        const hasMidiNotes = clip.isMidi && clip.notes && clip.notes.length > 0;
                        const velOverlay = hasMidiNotes ? getVelocityHue(clip.notes) : null;
                        const bgAlpha = hasMidiNotes ? (isHovered || isSelected ? 0.5 : 0.35) : (isHovered || isSelected ? 0.85 : 0.6);

                        return (
                          <Tooltip key={cIdx}>
                            <TooltipTrigger asChild>
                              <div
                                className={`absolute top-1 bottom-2 rounded-[3px] border overflow-hidden ${
                                  hasDevices ? "cursor-pointer" : "cursor-default"
                                } ${isSelected ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""}`}
                                onClick={(e) => { e.stopPropagation(); if (hasDevices) toggleClip(tIdx, cIdx); }}
                                style={{
                                  left: `${leftPct}%`,
                                  width: `${Math.max(widthPct, 0.2)}%`,
                                  backgroundColor: clip.isDisabled ? "hsl(var(--muted))" : getColorAlpha(clipColor, bgAlpha),
                                  borderColor: clip.isDisabled ? "hsl(var(--border))" : getColorAlpha(clipColor, isHovered || isSelected ? 1 : 0.3),
                                  opacity: clip.isDisabled ? 0.4 : 1,
                                }}
                                onMouseEnter={() => setHoveredClip({ trackIdx: tIdx, clipIdx: cIdx })}
                                onMouseLeave={() => setHoveredClip(null)}
                              >
                                {velOverlay && <div className="absolute inset-0 pointer-events-none rounded-[3px]" style={{ background: velOverlay }} />}
                                {/* Counter-scale text so it doesn't stretch */}
                                <div style={{ transform: `scaleX(calc(1 / var(--hz)))`, transformOrigin: "left" }}>
                                  <span className="font-mono text-[8px] text-white/90 px-1 truncate block leading-none pt-1 drop-shadow-sm relative z-10">
                                    {clip.name}
                                  </span>
                                </div>
                                {/* Mini piano roll — uses full clip area, stretched is OK for note bars */}
                                {hasMidiNotes && (
                                  <MiniPianoRoll
                                    notes={clip.notes}
                                    clipDurationBeats={clip.endBeats - clip.startBeats}
                                    height={TRACK_HEIGHT - 12}
                                  />
                                )}
                                {!hasMidiNotes && track.devices.filter(d => d.type !== "instrument").length > 0 && (
                                  <div className="flex gap-px px-0.5 pt-0.5 overflow-hidden relative z-10" style={{ transform: `scaleX(calc(1 / var(--hz)))`, transformOrigin: "left" }}>
                                    {track.devices.filter((d) => d.type !== "instrument").slice(0, 3).map((d, di) => (
                                      <span key={di} className="font-mono text-[6px] text-white/70 bg-black/25 rounded-sm px-1 py-px truncate max-w-[60px] shrink-0">{d.name}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </TooltipTrigger>
                            {hasMidiNotes && (
                              <TooltipContent side="top" className="font-mono text-[10px] space-y-0.5">
                                <p className="font-semibold text-foreground">{clip.name}</p>
                                <p>{clip.notes.length} notes · pitch {Math.min(...clip.notes.map(n => n.pitch))}–{Math.max(...clip.notes.map(n => n.pitch))}</p>
                                <p>vel avg {Math.round(clip.notes.reduce((s, n) => s + n.velocity, 0) / clip.notes.length)} · {clip.endBeats - clip.startBeats} beats</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        );
                      })}

                      {/* Sparklines */}
                      {hasAuto && (
                        <svg className="absolute left-0 bottom-0 pointer-events-none w-full" height={SPARKLINE_HEIGHT} viewBox={`0 0 ${baseW} ${SPARKLINE_HEIGHT}`} preserveAspectRatio="none">
                          {autoEnvelopes.slice(0, 5).map((env, eIdx) => (
                            <MiniSparkline key={eIdx} envelope={env} maxBeat={maxBeat} width={baseW} color={AUTO_COLORS[eIdx % AUTO_COLORS.length]} />
                          ))}
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Expanded automation */}
                  {isAutoExpanded && autoEnvelopes.length > 0 && (
                    <div className="border-b border-border/10 bg-secondary/20">
                      <div className="flex flex-wrap gap-x-4 gap-y-1 px-3 py-2">
                        {autoEnvelopes.map((env, eIdx) => (
                          <div key={eIdx} className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: AUTO_COLORS[eIdx % AUTO_COLORS.length] }} />
                            <span className="font-mono text-[9px] text-muted-foreground">
                              {env.deviceName ? `${env.deviceName} · ` : ""}{env.paramName}
                            </span>
                            <span className="font-mono text-[8px] text-muted-foreground/40">{env.points.length}pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Signal flow */}
                  {trackHasExpandedClip && expandedClipData && (
                    <div className="border-y border-primary/20 bg-secondary/20">
                      <SignalFlowPanel track={track} clip={expandedClipData} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-3 py-1.5 border-t border-border/10 bg-secondary/5">
          <span className="font-mono text-[8px] text-muted-foreground/60 uppercase tracking-wider">Click a clip to see its signal chain</span>
          {autoStats.totalEnvelopes > 0 && (
            <span className="flex items-center gap-1 font-mono text-[8px] text-muted-foreground/60"><Activity className="h-2.5 w-2.5" /> = automation</span>
          )}
          {autoStats.sidechainDevices > 0 && (
            <span className="flex items-center gap-1 font-mono text-[8px] text-muted-foreground/60"><Link2 className="h-2.5 w-2.5" /> = sidechain</span>
          )}
          <span className="font-mono text-[8px] text-muted-foreground/40 ml-auto">{bpm} BPM</span>
        </div>
      </div>
    </TooltipProvider>
  );
}