import { useState } from "react";
import { DeviceInfo, TrackInfo } from "@/types/ableton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Music2,
  Volume2,
  Undo2,
  Crown,
  VolumeX,
  Headphones,
  Mic2,
  Settings2,
  Disc3,
  ChevronDown,
  ChevronRight,
  Layers,
} from "lucide-react";

/* ── Ableton color palette (index → hsl) ── */
const ABLETON_COLORS: Record<number, string> = {
  0: "hsl(0, 75%, 50%)",
  1: "hsl(20, 85%, 50%)",
  2: "hsl(40, 90%, 50%)",
  3: "hsl(50, 90%, 50%)",
  4: "hsl(75, 65%, 45%)",
  5: "hsl(120, 55%, 40%)",
  6: "hsl(155, 80%, 40%)",
  7: "hsl(190, 70%, 45%)",
  8: "hsl(210, 70%, 50%)",
  9: "hsl(240, 55%, 50%)",
  10: "hsl(270, 55%, 50%)",
  11: "hsl(300, 50%, 50%)",
  12: "hsl(330, 60%, 50%)",
  13: "hsl(345, 70%, 50%)",
  14: "hsl(55, 85%, 55%)",     // yellow
  15: "hsl(80, 60%, 45%)",
  16: "hsl(340, 75%, 55%)",    // pink/magenta
  17: "hsl(25, 90%, 55%)",     // orange
  18: "hsl(166, 80%, 45%)",    // teal
  19: "hsl(200, 65%, 50%)",
  20: "hsl(280, 60%, 55%)",
};

function getTrackColor(colorIndex: number): string {
  return ABLETON_COLORS[colorIndex] || ABLETON_COLORS[colorIndex % 21] || "hsl(0, 0%, 40%)";
}

function getTrackColorAlpha(colorIndex: number, alpha: number): string {
  const base = getTrackColor(colorIndex);
  // Extract h, s, l and return with alpha
  const m = base.match(/hsl\(([^)]+)\)/);
  if (!m) return base;
  return `hsla(${m[1]}, ${alpha})`;
}

/* ── Helpers ── */
const TRACK_ICON: Record<string, React.ReactNode> = {
  midi: <Music2 className="h-3 w-3" />,
  audio: <Volume2 className="h-3 w-3" />,
  return: <Undo2 className="h-3 w-3" />,
  master: <Crown className="h-3 w-3" />,
  group: <Layers className="h-3 w-3" />,
};

function volumeToDb(v: number | null): string {
  if (v === null || v <= 0) return "-∞";
  const db = 20 * Math.log10(v);
  return db > -0.05 ? "0.0" : db.toFixed(1);
}

function panToDisplay(p: number | null): string {
  if (p === null || Math.abs(p) < 0.01) return "C";
  if (p < 0) return `${Math.round(Math.abs(p) * 50)}L`;
  return `${Math.round(p * 50)}R`;
}

/* ── Volume meter ── */
function VolumeMeter({ volume, color }: { volume: number | null; color: string }) {
  const pct = volume !== null ? Math.min(volume * 100, 100) : 0;
  return (
    <div className="w-1 h-full min-h-[28px] rounded-full bg-secondary/50 overflow-hidden flex flex-col-reverse">
      <div
        className="w-full rounded-full transition-all"
        style={{ height: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

/* ── Device chip inside the track lane ── */
function DeviceChip({ device }: { device: DeviceInfo & { owned: boolean } }) {
  const isInstrument = device.type === "instrument";
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`
              inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-medium cursor-default whitespace-nowrap border transition-colors
              ${isInstrument
                ? "border-foreground/20 bg-foreground/10 text-foreground"
                : device.owned
                  ? "border-foreground/10 bg-foreground/5 text-foreground/80"
                  : "border-accent/30 bg-accent/10 text-accent"
              }
            `}
          >
            {isInstrument ? (
              <Mic2 className="h-2.5 w-2.5 opacity-70" />
            ) : (
              <Settings2 className="h-2.5 w-2.5 opacity-40" />
            )}
            <span className="truncate max-w-[100px]">{device.name}</span>
            {!device.owned && (
              <span className="text-[7px] text-accent opacity-70">✗</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="font-mono text-xs max-w-[280px] space-y-1 z-50">
          <p className="font-semibold text-foreground">{device.name}</p>
          {device.presetName && (
            <p className="text-muted-foreground text-[11px]">Preset: {device.presetName}</p>
          )}
          {device.isPlugin && device.pluginFormat && (
            <p className="text-muted-foreground text-[11px]">Format: {device.pluginFormat}</p>
          )}
          <p className={device.owned ? "text-primary text-[11px]" : "text-accent text-[11px]"}>
            {device.owned ? "✓ In your inventory" : "✗ Not in inventory"}
          </p>
          {device.parameters.length > 0 && (
            <div className="border-t border-border/20 pt-1 mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5">
              {device.parameters.slice(0, 6).map((p, i) => (
                <div key={i} className="flex justify-between gap-1">
                  <span className="text-muted-foreground text-[10px] truncate">{p.name}</span>
                  <span className="text-foreground text-[10px] shrink-0">{p.value}</span>
                </div>
              ))}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/* ── Single track lane ── */
interface TrackBreakdown {
  track: TrackInfo;
  instruments: (DeviceInfo & { owned: boolean })[];
  effects: (DeviceInfo & { owned: boolean })[];
}

function TrackLane({ tb, isExpanded, onToggle }: { tb: TrackBreakdown; isExpanded: boolean; onToggle: () => void }) {
  const { track } = tb;
  const color = getTrackColor(track.color);
  const colorAlpha = getTrackColorAlpha(track.color, 0.15);
  const hasDevices = tb.instruments.length > 0 || tb.effects.length > 0;
  const hasSends = track.sends?.some(s => s.level > 0.001);

  return (
    <div className="group">
      {/* Main track row */}
      <div
        className="flex items-stretch cursor-pointer hover:brightness-110 transition-all"
        onClick={onToggle}
        style={{ minHeight: 40 }}
      >
        {/* Track color bar */}
        <div className="w-1 shrink-0" style={{ backgroundColor: color }} />

        {/* Track header - left sidebar like Ableton */}
        <div
          className="w-40 shrink-0 flex items-center gap-2 px-3 py-1.5 border-r border-black/20"
          style={{ backgroundColor: colorAlpha }}
        >
          <span style={{ color }} className="shrink-0">{TRACK_ICON[track.type]}</span>
          <span
            className="font-mono text-[11px] font-bold truncate"
            style={{ color }}
          >
            {track.name}
          </span>
          <div className="ml-auto flex items-center gap-1">
            {track.isMuted && <VolumeX className="h-2.5 w-2.5 text-destructive" />}
            {track.isSoloed && <Headphones className="h-2.5 w-2.5 text-warning" />}
          </div>
        </div>

        {/* Track content area - the "arrangement" area */}
        <div
          className="flex-1 flex items-center px-3 py-1.5 gap-2 overflow-hidden"
          style={{ backgroundColor: colorAlpha }}
        >
          {!hasDevices ? (
            <span className="font-mono text-[10px] italic" style={{ color: `${color}80` }}>
              Empty
            </span>
          ) : (
            <>
              {/* Instrument block - shown as a bigger "clip" block */}
              {tb.instruments.map((d, j) => (
                <div
                  key={`i-${j}`}
                  className="flex items-center gap-1.5 rounded px-2.5 py-1 border"
                  style={{
                    backgroundColor: getTrackColorAlpha(track.color, 0.6),
                    borderColor: color,
                  }}
                >
                  <Mic2 className="h-3 w-3 shrink-0" style={{ color }} />
                  <span className="font-mono text-[10px] font-bold truncate text-foreground">
                    {d.name}
                  </span>
                  {d.presetName && (
                    <span className="font-mono text-[9px] text-foreground/60 truncate max-w-[120px]">
                      {d.presetName}
                    </span>
                  )}
                  {!d.owned && (
                    <span className="text-[8px] text-accent font-bold">✗</span>
                  )}
                </div>
              ))}

              {/* Effect chain shown as smaller connected blocks */}
              {tb.effects.length > 0 && (
                <div className="flex items-center gap-0.5">
                  <span className="font-mono text-[9px] text-muted-foreground/50 mx-1">→</span>
                  {tb.effects.map((d, j) => (
                    <div
                      key={`e-${j}`}
                      className="flex items-center gap-0.5"
                    >
                      {j > 0 && <span className="font-mono text-[8px] text-muted-foreground/30">›</span>}
                      <div
                        className={`
                          rounded px-1.5 py-0.5 font-mono text-[9px] border truncate max-w-[100px]
                          ${d.owned
                            ? "bg-secondary/60 border-border/30 text-foreground/70"
                            : "bg-accent/10 border-accent/25 text-accent/80"
                          }
                        `}
                      >
                        {d.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Clip count indicator */}
          {track.clipCount > 0 && (
            <div className="ml-auto flex items-center gap-1 shrink-0">
              <Disc3 className="h-2.5 w-2.5" style={{ color: `${color}99` }} />
              <span className="font-mono text-[9px]" style={{ color: `${color}99` }}>
                {track.clipCount} clip{track.clipCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Mixer strip */}
        <div className="w-14 shrink-0 flex items-center justify-center gap-1.5 px-1.5 border-l border-black/20 bg-card/50">
          <VolumeMeter volume={track.volume} color={color} />
          <div className="flex flex-col items-center">
            <span className="font-mono text-[9px] text-foreground font-medium">
              {volumeToDb(track.volume)}
            </span>
            <span className="font-mono text-[8px] text-muted-foreground">
              {panToDisplay(track.pan)}
            </span>
          </div>
        </div>

        {/* Expand indicator */}
        <div className="w-6 shrink-0 flex items-center justify-center bg-card/30">
          {hasDevices ? (
            isExpanded ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )
          ) : null}
        </div>
      </div>

      {/* Expanded detail panel */}
      {isExpanded && hasDevices && (
        <div className="border-t border-border/10 bg-card/40">
          <div className="flex items-stretch">
            <div className="w-1 shrink-0" style={{ backgroundColor: `${color}40` }} />
            <div className="w-40 shrink-0" />
            <div className="flex-1 px-4 py-3">
              {/* Signal chain detail */}
              <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-2">
                Signal Chain
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {tb.instruments.map((d, j) => (
                  <DeviceChip key={`di-${j}`} device={d} />
                ))}
                {tb.instruments.length > 0 && tb.effects.length > 0 && (
                  <span className="font-mono text-xs text-muted-foreground/40">→</span>
                )}
                {tb.effects.map((d, j) => (
                  <div key={`de-${j}`} className="flex items-center gap-2">
                    {j > 0 && <span className="font-mono text-[10px] text-muted-foreground/30">→</span>}
                    <DeviceChip device={d} />
                  </div>
                ))}
              </div>

              {/* Sends */}
              {hasSends && (
                <div className="mt-3 pt-2 border-t border-border/10">
                  <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-1.5">
                    Sends
                  </p>
                  <div className="flex gap-3">
                    {track.sends.filter(s => s.level > 0.001).map((s, i) => (
                      <div key={i} className="flex items-center gap-1.5 rounded bg-secondary/40 px-2 py-1">
                        <Undo2 className="h-2.5 w-2.5 text-muted-foreground" />
                        <span className="font-mono text-[10px] text-foreground">{s.returnName}</span>
                        <span className="font-mono text-[10px] text-primary font-medium">
                          {volumeToDb(s.level)} dB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main component ── */
interface Props {
  trackBreakdown: TrackBreakdown[];
}

export function TrackDeviceMap({ trackBreakdown }: Props) {
  const [expandedTracks, setExpandedTracks] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    setExpandedTracks(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  if (trackBreakdown.length === 0) return null;

  // Group: regular tracks, then returns, then master
  const regular = trackBreakdown.filter(tb => tb.track.type === "midi" || tb.track.type === "audio" || tb.track.type === "group");
  const returns = trackBreakdown.filter(tb => tb.track.type === "return");
  const master = trackBreakdown.filter(tb => tb.track.type === "master");

  const renderGroup = (items: TrackBreakdown[], label: string, startIdx: number) => {
    if (items.length === 0) return null;
    return (
      <>
        {label && (
          <div className="flex items-center gap-2 px-4 py-1 bg-card/60 border-y border-border/10">
            <span className="font-mono text-[9px] text-muted-foreground/50 uppercase tracking-widest">{label}</span>
          </div>
        )}
        {items.map((tb, i) => (
          <TrackLane
            key={startIdx + i}
            tb={tb}
            isExpanded={expandedTracks.has(startIdx + i)}
            onToggle={() => toggle(startIdx + i)}
          />
        ))}
      </>
    );
  };

  return (
    <div className="rounded-lg border border-border/30 overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center bg-card/80 border-b border-border/20">
        <div className="w-1 shrink-0" />
        <div className="w-40 shrink-0 px-3 py-2">
          <span className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-wider">Track</span>
        </div>
        <div className="flex-1 px-3 py-2">
          <span className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-wider">Instruments & Effects</span>
        </div>
        <div className="w-14 shrink-0 px-1.5 py-2 text-center">
          <span className="font-mono text-[10px] text-muted-foreground/60 uppercase tracking-wider">Vol</span>
        </div>
        <div className="w-6 shrink-0" />
      </div>

      {/* Track lanes */}
      {renderGroup(regular, "", 0)}
      {renderGroup(returns, "Returns", regular.length)}
      {renderGroup(master, "Master", regular.length + returns.length)}

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 bg-card/60 border-t border-border/20">
        <div className="flex items-center gap-1.5">
          <Mic2 className="h-2.5 w-2.5 text-foreground/60" />
          <span className="font-mono text-[9px] text-muted-foreground">Instrument</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Settings2 className="h-2.5 w-2.5 text-foreground/40" />
          <span className="font-mono text-[9px] text-muted-foreground">Effect</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-accent text-[9px] font-mono font-bold">✗</span>
          <span className="font-mono text-[9px] text-muted-foreground">Not in inventory</span>
        </div>
        <span className="font-mono text-[9px] text-muted-foreground/40 ml-auto">Click track to expand signal chain</span>
      </div>
    </div>
  );
}
