/**
 * MixerPanel — Traditional console-style vertical mixer.
 * Features: pre/post send toggles, solo mode selector (SIP/AFL/PFL),
 * configurable strip sections, track delay display, and DIM on master.
 */

import React, { memo, useCallback, useMemo, useState } from "react";
import { Volume2, Music2, Undo2, Crown, Layers, Settings2 } from "lucide-react";
import { useStudioInfo, STUDIO_INFO } from "./StudioInfoContext";
import type { SessionTrack, TrackSend, DeviceInstance, SoloMode, MixerStripSection } from "@/types/studio";
import type { MeterLevel } from "@/services/pluginHostSocket";
import { getTrackColor, TRACK_COLORS } from "./track/trackColors";
import { panToDisplay } from "./track/trackHelpers";
import {
  TrackToggle,
  SendKnob,
  VerticalFader,
  PeakDisplay,
  AutomationModeButton,
  type AutomationMode,
} from "./track/TrackControls";
import { VerticalMeter } from "./NativeMeterBridge";
import { setSendLevel, toggleSendPreFader } from "@/domain/studio/studioDeviceRouting";
import {
  ContextMenu, ContextMenuContent, ContextMenuItem,
  ContextMenuSeparator, ContextMenuTrigger, ContextMenuSub,
  ContextMenuSubContent, ContextMenuSubTrigger,
} from "@/components/ui/context-menu";

/* ── Track type icons ── */
const STRIP_ICON: Record<string, React.ReactNode> = {
  midi: <Music2 className="h-2.5 w-2.5" />,
  audio: <Volume2 className="h-2.5 w-2.5" />,
  return: <Undo2 className="h-2.5 w-2.5" />,
  master: <Crown className="h-2.5 w-2.5" />,
  group: <Layers className="h-2.5 w-2.5" />,
};

const ALL_SECTIONS: MixerStripSection[] = ["io", "inserts", "eq", "sends"];
const SECTION_LABELS: Record<MixerStripSection, string> = {
  io: "I/O",
  inserts: "Inserts",
  eq: "EQ",
  sends: "Sends",
};

/* ── Section divider line ── */
function SectionDivider() {
  return <div className="w-full h-px bg-border my-[2px]" />;
}

/* ── Rotary Pan Knob (console style) ── */
function PanKnob({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const startY = React.useRef(0);
  const startVal = React.useRef(0);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    startY.current = e.clientY;
    startVal.current = value;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [value]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const delta = (startY.current - e.clientY) / 60;
    onChange(Math.max(-1, Math.min(1, startVal.current + delta)));
  }, [dragging, onChange]);

  const handlePointerUp = useCallback(() => setDragging(false), []);
  const handleDoubleClick = useCallback(() => onChange(0), [onChange]);

  const angle = value * 135;

  return (
    <div className="flex flex-col items-center gap-[2px]">
      <div
        ref={ref}
        className="relative h-[24px] w-[24px] rounded-full cursor-ns-resize"
        style={{ background: "hsl(var(--studio-knob-bg))", border: "1px solid hsl(var(--studio-knob-track))" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      >
        <svg className="absolute inset-0" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="9" fill="none" stroke="hsl(var(--studio-knob-track))" strokeWidth="2" strokeDasharray="28.3 28.3" strokeLinecap="round" transform="rotate(-225 12 12)" />
          <circle
            cx="12" cy="12" r="9"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeDasharray={`${Math.abs(value) * 14.1} 56.6`}
            strokeLinecap="round"
            transform={`rotate(${value >= 0 ? -90 : -90 + value * 135} 12 12)`}
            opacity="0.7"
          />
        </svg>
        <div
          className="absolute top-[3px] left-1/2 w-[2px] h-[7px] rounded-full"
          style={{ backgroundColor: "hsl(var(--studio-needle))", transform: `translateX(-50%) rotate(${angle}deg)`, transformOrigin: "50% 900%" }}
        />
      </div>
      <span className="font-mono text-[7px] leading-none tabular-nums" style={{ color: "hsl(var(--studio-text-dim))" }}>{panToDisplay(value)}</span>
    </div>
  );
}

/* ── Mini EQ thumbnail ── */
function EqThumbnail({ devices }: { devices: DeviceInstance[] }) {
  const eq = devices.find((d) => d.type === "eq3" && d.enabled);

  if (!eq) {
    return (
      <div className="w-full h-[20px] rounded-[2px] overflow-hidden flex items-center justify-center" style={{ backgroundColor: "hsl(var(--studio-surface))" }}>
        <span className="text-[6px] uppercase font-mono" style={{ color: "hsl(var(--studio-text-dim))" }}>EQ</span>
      </div>
    );
  }

  const low = eq.params.lowGain ?? 0;
  const mid = eq.params.midGain ?? 0;
  const high = eq.params.highGain ?? 0;
  const toY = (db: number) => 15 - (db / 12) * 13;

  return (
    <div className="w-full h-[20px] rounded-[2px] overflow-hidden" title="EQ Three" style={{ backgroundColor: "hsl(var(--studio-surface))" }}>
      <svg viewBox="0 0 40 30" className="w-full h-full">
        <line x1="0" y1="15" x2="40" y2="15" stroke="hsl(var(--studio-knob-track))" strokeWidth="0.5" />
        <polyline
          points={`0,${toY(low)} 10,${toY(low)} 20,${toY(mid)} 30,${toY(high)} 40,${toY(high)}`}
          fill="none"
          stroke="hsl(var(--primary) / 0.7)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/* ── Insert slots (console style) ── */
function InsertSlots({ devices, onClick }: { devices: DeviceInstance[]; onClick?: () => void }) {
  const slots = devices.slice(0, 4);

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      className="w-full flex flex-col gap-[1px] cursor-pointer group"
      title={slots.length ? `${devices.length} insert(s)` : "No inserts"}
    >
      {slots.length === 0 ? (
        <div className="h-[16px] w-full rounded-[2px] flex items-center justify-center" style={{ backgroundColor: "hsl(var(--studio-surface))" }}>
          <span className="text-[6px] uppercase" style={{ color: "hsl(var(--studio-text-dim))" }}>Empty</span>
        </div>
      ) : (
        slots.map((d) => (
          <div
            key={d.id}
            className={`h-[14px] w-full rounded-[2px] flex items-center px-1 text-[7px] font-mono leading-none truncate transition-colors ${
              d.enabled
                ? "bg-primary/15 text-primary/80 group-hover:bg-primary/25"
                : "line-through"
            }`}
            style={!d.enabled ? { backgroundColor: "hsl(var(--studio-surface))", color: "hsl(var(--studio-text-dim))" } : undefined}
          >
            {d.type}
          </div>
        ))
      )}
      {devices.length > 4 && (
        <span className="text-[6px] text-center" style={{ color: "hsl(var(--studio-text-dim))" }}>+{devices.length - 4}</span>
      )}
    </button>
  );
}

/* ── I/O routing labels ── */
function IOSection({ track }: { track: SessionTrack }) {
  const input = track.input_from || (track.type === "midi" ? "All MIDI" : track.type === "audio" ? "Ext. In" : "—");
  const output = track.type === "return" ? "Master" : track.type === "master" ? "1-2" : "Master";

  return (
    <div className="w-full space-y-[1px]">
      <div className="h-[14px] rounded-[2px] flex items-center px-1 gap-1" style={{ backgroundColor: "hsl(var(--studio-surface))" }}>
        <span className="text-[6px] font-mono" style={{ color: "hsl(var(--studio-text-dim))" }}>IN</span>
        <span className="text-[7px] font-mono truncate flex-1" style={{ color: "hsl(var(--studio-text-muted))" }}>{input}</span>
      </div>
      <div className="h-[14px] rounded-[2px] flex items-center px-1 gap-1" style={{ backgroundColor: "hsl(var(--studio-surface))" }}>
        <span className="text-[6px] font-mono" style={{ color: "hsl(var(--studio-text-dim))" }}>OUT</span>
        <span className="text-[7px] font-mono truncate flex-1" style={{ color: "hsl(var(--studio-text-muted))" }}>{output}</span>
      </div>
    </div>
  );
}

/* ── Scribble strip (name area at bottom) ── */
function ScribbleStrip({ name, color, isSelected }: { name: string; color: string; isSelected: boolean }) {
  return (
    <div
      className="w-full rounded-[2px] py-[3px] px-1 text-center transition-colors"
      style={{
        backgroundColor: isSelected ? "hsl(var(--studio-surface-active))" : "hsl(var(--studio-surface))",
        borderBottom: `2px solid ${color}`,
      }}
    >
      <span className="font-mono text-[8px] text-foreground truncate block leading-tight">{name}</span>
    </div>
  );
}

/* ── Pre/Post send knob with toggle ── */
function SendKnobWithPrePost({
  label,
  value,
  color,
  preFader,
  onChange,
  onTogglePrePost,
}: {
  label: string;
  value: number;
  color: string;
  preFader: boolean;
  onChange: (v: number) => void;
  onTogglePrePost: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-0">
      <SendKnob label={label} value={value} color={color} onChange={onChange} />
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onTogglePrePost(); }}
        className={`font-mono text-[5px] leading-none px-1 py-[1px] rounded-[1px] transition-colors ${
          preFader
            ? "bg-accent/20 text-accent"
            : ""
        }`}
        style={!preFader ? { backgroundColor: "hsl(var(--studio-surface))", color: "hsl(var(--studio-text-dim))" } : undefined}
        title={preFader ? "Pre-fader (click for Post)" : "Post-fader (click for Pre)"}
      >
        {preFader ? "PRE" : "PST"}
      </button>
    </div>
  );
}

/* ─────────────────────────────────────── */
/*  Channel Strip                          */
/* ─────────────────────────────────────── */

interface MixerStripProps {
  track: SessionTrack;
  returnTracks: SessionTrack[];
  isSelected: boolean;
  meter: MeterLevel | null;
  faderHeight: number;
  visibleSections: Set<MixerStripSection>;
  onSelect: (trackId: string) => void;
  onMuteToggle: (trackId: string) => void;
  onSoloToggle: (trackId: string) => void;
  onVolumeChange: (trackId: string, volume: number) => void;
  onPanChange: (trackId: string, pan: number) => void;
  onSendChange: (trackId: string, sends: TrackSend[]) => void;
  onInsertClick?: (trackId: string) => void;
  onRenameTrack?: (trackId: string, name: string) => void;
  onDeleteTrack?: (trackId: string) => void;
  onColorChange?: (trackId: string, color: number) => void;
}

const MixerStrip = memo(function MixerStrip({
  track,
  returnTracks,
  isSelected,
  meter,
  faderHeight,
  visibleSections,
  onSelect,
  onMuteToggle,
  onSoloToggle,
  onVolumeChange,
  onPanChange,
  onSendChange,
  onInsertClick,
  onRenameTrack,
  onDeleteTrack,
  onColorChange,
}: MixerStripProps) {
  const color = getTrackColor(track.color);
  const devices = (track.device_chain ?? []) as DeviceInstance[];
  const [autoMode, setAutoMode] = useState<AutomationMode>("off");
  const { setHoveredInfo } = useStudioInfo();
  const hp = (key: keyof typeof STUDIO_INFO) => ({
    onMouseEnter: () => setHoveredInfo(STUDIO_INFO[key]),
    onMouseLeave: () => setHoveredInfo(null),
  });

  const handleVolume = useCallback((v: number) => onVolumeChange(track.id, v), [track.id, onVolumeChange]);
  const handlePan = useCallback((v: number) => onPanChange(track.id, v), [track.id, onPanChange]);
  const handleMute = useCallback(() => onMuteToggle(track.id), [track.id, onMuteToggle]);
  const handleSolo = useCallback(() => onSoloToggle(track.id), [track.id, onSoloToggle]);
  const handleSelect = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest("[data-track-control='true']")) return;
    onSelect(track.id);
  }, [track.id, onSelect]);
  const handleInsert = useCallback(() => onInsertClick?.(track.id), [track.id, onInsertClick]);

  const handleSendLevel = useCallback(
    (returnId: string, level: number) => {
      onSendChange(track.id, setSendLevel(track.sends, returnId, level));
    },
    [track.id, track.sends, onSendChange],
  );

  const handleSendPrePost = useCallback(
    (returnId: string) => {
      onSendChange(track.id, toggleSendPreFader(track.sends, returnId));
    },
    [track.id, track.sends, onSendChange],
  );

  const showIO = visibleSections.has("io");
  const showInserts = visibleSections.has("inserts");
  const showEQ = visibleSections.has("eq");
  const showSends = visibleSections.has("sends");

  const handleRename = useCallback(() => {
    const newName = prompt("Rename track:", track.name);
    if (newName && newName.trim() && onRenameTrack) onRenameTrack(track.id, newName.trim());
  }, [track.id, track.name, onRenameTrack]);

  const handleResetFader = useCallback(() => onVolumeChange(track.id, 0.8), [track.id, onVolumeChange]);
  const handleResetPan = useCallback(() => onPanChange(track.id, 0), [track.id, onPanChange]);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
    <div
      className={`flex h-full min-h-0 w-[76px] min-w-[76px] flex-col items-center rounded-none border-r border-white/8 px-[6px] py-1.5 transition-colors cursor-pointer select-none ${
        isSelected ? "bg-white/[0.03]" : "bg-[#26272c]"
      }`}
      style={{
        boxShadow: isSelected
          ? `inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 0 1px ${color}55`
          : "inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
      onClick={handleSelect}
    >
      {/* ── Top section: Type icon ── */}
      <div className="mb-1 flex items-center gap-1" style={{ color: "hsl(var(--studio-text-dim))" }}>
        {STRIP_ICON[track.type]}
        <span className="font-mono text-[7px] uppercase">{track.type}</span>
      </div>

      {showIO && (
        <div className="w-full" style={{ minHeight: 32 }} {...hp("io")}>
          <IOSection track={track} />
          <SectionDivider />
        </div>
      )}

      {showInserts && (
        <div className="w-full" style={{ minHeight: 62 }} {...hp("inserts")}>
          <InsertSlots devices={devices} onClick={handleInsert} />
          <SectionDivider />
        </div>
      )}

      {showEQ && (
        <div className="w-full" style={{ minHeight: 24 }} {...hp("eqThumb")}>
          <EqThumbnail devices={devices} />
          <SectionDivider />
        </div>
      )}

      {/* ── Sends section with pre/post ── */}
      {showSends && (
        <div className="w-full" style={{ minHeight: 40 }} {...hp("sends")}>
          {track.type !== "return" && track.type !== "master" ? (
            returnTracks.length > 0 ? (
              <div className="flex gap-[3px] justify-center flex-wrap">
                {returnTracks.map((rt) => {
                  const send = (track.sends || []).find((s) => s.return_track_id === rt.id);
                  return (
                    <SendKnobWithPrePost
                      key={rt.id}
                      label={rt.name.slice(0, 3)}
                      value={send?.level ?? 0}
                      color={getTrackColor(rt.color)}
                      preFader={send?.pre_fader ?? false}
                      onChange={(v) => handleSendLevel(rt.id, v)}
                      onTogglePrePost={() => handleSendPrePost(rt.id)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-[7px] text-center py-1 font-mono" style={{ color: "hsl(var(--studio-text-dim))" }}>No returns</div>
            )
          ) : (
            <div />
          )}
          <SectionDivider />
        </div>
      )}

      {/* ── Pan knob ── */}
      <div {...hp("pan")}><PanKnob value={track.pan} onChange={handlePan} /></div>

      <SectionDivider />

      {/* ── Automation mode ── */}
      <AutomationModeButton mode={autoMode} onChange={setAutoMode} />

      {/* ── M / S / R toggles ── */}
      <div
        data-track-control="true"
        className="flex gap-[3px] my-1"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div {...hp("mute")}><TrackToggle label="M" active={track.is_muted} activeClass="bg-warning text-warning-foreground" onClick={handleMute} /></div>
        <div {...hp("solo")}><TrackToggle label="S" active={track.is_soloed} activeClass="bg-primary text-primary-foreground" onClick={handleSolo} /></div>
        <div {...hp("arm")}><TrackToggle label="R" active={false} activeClass="bg-destructive text-destructive-foreground" onClick={() => {}} /></div>
      </div>

      {/* ── Fader + Meter section (side by side) ── */}
      <div className="flex min-h-0 flex-1 items-end gap-[3px]" {...hp("volume")}>
        <VerticalFader
          value={track.volume}
          onChange={handleVolume}
          height={faderHeight}
          width={24}
          trackColor={color}
        />
        <div className="flex gap-px">
          <VerticalMeter meter={track.is_muted ? null : meter} width={4} height={faderHeight} />
          <VerticalMeter
            meter={track.is_muted || !meter ? null : { peak: meter.peak - 0.3, rms: meter.rms - 0.5 }}
            width={4}
            height={faderHeight}
          />
        </div>
      </div>

      {/* ── Peak display ── */}
      <PeakDisplay meter={meter} isMuted={track.is_muted} />

      {/* ── Scribble strip ── */}
      <div className="mt-1 w-full" {...hp("trackName")}><ScribbleStrip name={track.name} color={color} isSelected={isSelected} /></div>
    </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="min-w-[160px]">
        <ContextMenuItem onClick={handleRename} className="text-xs font-mono">
          Rename
        </ContextMenuItem>
        {onColorChange && (
          <ContextMenuSub>
            <ContextMenuSubTrigger className="text-xs font-mono">Color</ContextMenuSubTrigger>
            <ContextMenuSubContent className="grid grid-cols-7 gap-1 p-2 min-w-0 w-auto">
              {Object.entries(TRACK_COLORS).map(([idx, c]) => (
                <button
                  key={idx}
                  className="w-4 h-4 rounded-full border border-foreground/10 hover:scale-125 transition-transform"
                  style={{ backgroundColor: c }}
                  onClick={() => onColorChange(track.id, parseInt(idx))}
                />
              ))}
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleMute} className="text-xs font-mono">
          {track.is_muted ? "Unmute" : "Mute"}
        </ContextMenuItem>
        <ContextMenuItem onClick={handleSolo} className="text-xs font-mono">
          {track.is_soloed ? "Unsolo" : "Solo"}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleResetFader} className="text-xs font-mono">
          Reset Fader
        </ContextMenuItem>
        <ContextMenuItem onClick={handleResetPan} className="text-xs font-mono">
          Reset Pan
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleInsert} className="text-xs font-mono">
          Show Inserts
        </ContextMenuItem>
        {onDeleteTrack && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => onDeleteTrack(track.id)} className="text-xs font-mono text-destructive">
              Delete Track
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
});

/* ─────────────────────────────────────── */
/*  Master Strip                           */
/* ─────────────────────────────────────── */

interface MasterStripProps {
  masterMeter: MeterLevel | null;
  masterVolume: number;
  onMasterVolumeChange: (v: number) => void;
  faderHeight: number;
}

const MasterStrip = memo(function MasterStrip({
  masterMeter,
  masterVolume,
  onMasterVolumeChange,
  faderHeight,
}: MasterStripProps) {
  const [dimmed, setDimmed] = useState(false);
  const effectiveVolume = dimmed ? masterVolume * 0.1 : masterVolume;
  const { setHoveredInfo } = useStudioInfo();
  const hp = (key: keyof typeof STUDIO_INFO) => ({
    onMouseEnter: () => setHoveredInfo(STUDIO_INFO[key]),
    onMouseLeave: () => setHoveredInfo(null),
  });

  const handleVolChange = useCallback((v: number) => {
    onMasterVolumeChange(dimmed ? v * 10 : v);
  }, [dimmed, onMasterVolumeChange]);

  return (
    <div
      className="flex h-full min-h-0 w-[88px] min-w-[88px] flex-col items-center border-l border-white/10 px-2 py-1.5"
      style={{
        background: "linear-gradient(180deg, rgba(34,35,40,0.98) 0%, rgba(28,29,33,1) 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      <Crown className="h-3 w-3 text-primary mb-0.5" />
      <span className="font-mono text-[9px] font-semibold text-primary mb-1">MASTER</span>

      <div className="h-[14px] w-full rounded-[2px] flex items-center justify-center mb-1" style={{ backgroundColor: "hsl(var(--studio-surface))" }}>
        <span className="text-[7px] font-mono" style={{ color: "hsl(var(--studio-text-dim))" }}>Out 1-2</span>
      </div>

      <div className="flex-1" />

      {/* Dim button */}
      <button
        onClick={() => setDimmed(!dimmed)}
        className={`font-mono text-[7px] px-2 py-[2px] rounded-[2px] mb-1 transition-colors ${
          dimmed
            ? "bg-warning/20 text-warning"
            : ""
        }`}
        style={!dimmed ? { backgroundColor: "hsl(var(--studio-surface))", color: "hsl(var(--studio-text-dim))" } : undefined}
      >
        DIM
      </button>

      {/* Fader + Meter */}
      <div className="flex items-end gap-[3px]" {...hp("masterFader")}>
        <VerticalFader
          value={effectiveVolume}
          onChange={handleVolChange}
          height={faderHeight + 30}
          width={28}
          trackColor="hsl(var(--primary))"
        />
        <div className="flex gap-px">
          <VerticalMeter meter={masterMeter} width={5} height={faderHeight + 30} />
          <VerticalMeter
            meter={masterMeter ? { peak: masterMeter.peak - 0.3, rms: masterMeter.rms - 0.5 } : null}
            width={5}
            height={faderHeight + 30}
          />
        </div>
      </div>

      <PeakDisplay meter={masterMeter} isMuted={false} />

      <div
        className="w-full rounded-[2px] py-[3px] px-1 text-center bg-primary/10 mt-1"
        style={{ borderBottom: "2px solid hsl(var(--primary))" }}
      >
        <span className="font-mono text-[8px] text-primary font-semibold">Master</span>
      </div>
    </div>
  );
});

/* ─────────────────────────────────────── */
/*  Section header label                   */
/* ─────────────────────────────────────── */

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="relative w-px shrink-0 bg-white/10">
      <span className="absolute top-2 left-1/2 -translate-x-1/2 font-mono text-[7px] uppercase whitespace-nowrap -rotate-90 origin-center" style={{ transform: "translateX(-50%) rotate(-90deg)", top: 30, color: "hsl(var(--studio-text-dim))" }}>
        {label}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────── */
/*  Solo mode selector                     */
/* ─────────────────────────────────────── */

function SoloModeSelector({ mode, onChange }: { mode: SoloMode; onChange: (m: SoloMode) => void }) {
  const modes: SoloMode[] = ["sip", "afl", "pfl"];
  const labels: Record<SoloMode, string> = { sip: "SIP", afl: "AFL", pfl: "PFL" };
  const descriptions: Record<SoloMode, string> = {
    sip: "Solo In Place — mutes other tracks",
    afl: "After Fader Listen — solo after fader",
    pfl: "Pre Fader Listen — solo before fader",
  };

  return (
    <div className="flex items-center gap-[2px]">
      <span className="font-mono text-[7px] mr-1" style={{ color: "hsl(var(--studio-text-dim))" }}>SOLO</span>
      {modes.map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`font-mono text-[7px] px-1.5 py-[2px] rounded-[2px] transition-colors ${
            mode === m
              ? "bg-primary/20 text-primary"
              : ""
          }`}
          style={mode !== m ? { backgroundColor: "hsl(var(--studio-surface))", color: "hsl(var(--studio-text-dim))" } : undefined}
          title={descriptions[m]}
        >
          {labels[m]}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────── */
/*  Strip config menu                      */
/* ─────────────────────────────────────── */

function StripConfigMenu({
  visibleSections,
  onToggle,
}: {
  visibleSections: Set<MixerStripSection>;
  onToggle: (section: MixerStripSection) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1 rounded-[2px] transition-colors"
        style={{ color: "hsl(var(--studio-text-dim))" }}
        title="Configure strip sections"
      >
        <Settings2 className="h-3 w-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-card border border-border rounded-md p-1.5 shadow-lg min-w-[100px]">
            <span className="font-mono text-[7px] uppercase px-1 mb-1 block" style={{ color: "hsl(var(--studio-text-dim))" }}>Show</span>
            {ALL_SECTIONS.map((section) => (
              <button
                key={section}
                onClick={() => onToggle(section)}
                className={`w-full text-left px-1.5 py-1 rounded-[2px] font-mono text-[8px] transition-colors flex items-center gap-1.5 ${
                  visibleSections.has(section)
                    ? "text-foreground"
                    : ""
                } hover:bg-foreground/5`}
                style={!visibleSections.has(section) ? { color: "hsl(var(--studio-text-dim))" } : undefined}
              >
                <div className={`w-2 h-2 rounded-[2px] border transition-colors ${
                  visibleSections.has(section)
                    ? "bg-primary border-primary"
                    : ""
                }`} style={!visibleSections.has(section) ? { borderColor: "hsl(var(--studio-border))" } : undefined} />
                {SECTION_LABELS[section]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────── */
/*  Mixer Panel (top-level)                */
/* ─────────────────────────────────────── */

export interface MixerPanelProps {
  tracks: SessionTrack[];
  selectedTrackId: string | null;
  masterMeter: MeterLevel | null;
  masterVolume: number;
  trackMeters: Record<string, MeterLevel>;
  onMasterVolumeChange: (v: number) => void;
  onMuteToggle: (trackId: string) => void;
  onSoloToggle: (trackId: string) => void;
  onVolumeChange: (trackId: string, volume: number) => void;
  onPanChange: (trackId: string, pan: number) => void;
  onSendChange: (trackId: string, sends: TrackSend[]) => void;
  onSelectTrack: (trackId: string) => void;
  onInsertClick?: (trackId: string) => void;
  onRenameTrack?: (trackId: string, name: string) => void;
  onDeleteTrack?: (trackId: string) => void;
  onColorChange?: (trackId: string, color: number) => void;
  captureVariant?: "figma" | null;
}

export const MixerPanel = memo(function MixerPanel({
  tracks,
  selectedTrackId,
  masterMeter,
  masterVolume,
  trackMeters,
  onMasterVolumeChange,
  onMuteToggle,
  onSoloToggle,
  onVolumeChange,
  onPanChange,
  onSendChange,
  onSelectTrack,
  onInsertClick,
  onRenameTrack,
  onDeleteTrack,
  onColorChange,
  captureVariant = null,
}: MixerPanelProps) {
  const regularTracks = useMemo(() => tracks.filter((t) => t.type !== "return" && t.type !== "master"), [tracks]);
  const returnTracks = useMemo(() => tracks.filter((t) => t.type === "return"), [tracks]);

  const [soloMode, setSoloMode] = useState<SoloMode>("sip");
  const [visibleSections, setVisibleSections] = useState<Set<MixerStripSection>>(
    () => new Set(ALL_SECTIONS)
  );

  const handleToggleSection = useCallback((section: MixerStripSection) => {
    setVisibleSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }, []);

  const faderHeight = 140;
  const figmaCapture = captureVariant === "figma";
  const leftLabels = [
    "Setting",
    "Gain Reduction",
    "EQ",
    "MIDI FX",
    "Input",
    "Audio FX",
    "Sends",
    "Output",
    "Group",
    "Automation",
    "Pan",
    "dB",
  ];

  return (
    <div className="h-full flex flex-col" style={{ background: "hsl(var(--background))" }}>
      {figmaCapture ? (
        <div className="flex items-center justify-between border-b border-white/8 bg-[#5b5b5f] px-3 py-1.5 text-white">
          <div className="flex items-center gap-3">
            <button className="rounded-md border border-white/10 bg-white/6 px-3 py-1 text-[12px] font-medium text-white/95">
              Edit
            </button>
            <button className="rounded-md border border-white/10 bg-white/6 px-3 py-1 text-[12px] font-medium text-white/95">
              Options
            </button>
            <button className="rounded-md border border-white/10 bg-white/6 px-3 py-1 text-[12px] font-medium text-white/95">
              View
            </button>
            <div className="ml-2 flex items-center gap-2 text-[12px] text-white/88">
              <span>Sends on Faders:</span>
              <button className="rounded-md border border-white/10 bg-white/6 px-2 py-1 text-white/95">Off</button>
            </div>
          </div>
          <div className="flex items-center overflow-hidden rounded-xl border border-white/10 bg-[#444448]">
            {["Single", "Tracks", "All"].map((label) => (
              <button
                key={label}
                className={`px-4 py-1.5 text-[12px] font-medium ${
                  label === "Tracks" ? "bg-[#2f7de1] text-white" : "text-white/82"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : (
      <div className="flex shrink-0 items-center gap-2 border-b border-white/8 bg-[#202126] px-3 py-1.5">
        <div className="flex items-center gap-2">
          <Volume2 className="h-3.5 w-3.5 text-white/55" />
          <span className="text-[12px] font-medium text-white/84">Mixer</span>
          <span className="text-[11px] text-white/38">{tracks.length} tracks</span>
        </div>
          <SoloModeSelector mode={soloMode} onChange={setSoloMode} />
          <div className="flex-1" />
          <StripConfigMenu visibleSections={visibleSections} onToggle={handleToggleSection} />
        </div>
      )}

      {/* ── Strips ── */}
      <div className="flex min-h-0 flex-1 overflow-x-auto overflow-y-hidden bg-[#1c1d22]">
        {figmaCapture ? (
          <div className="flex w-[108px] shrink-0 flex-col items-end justify-start gap-[20px] border-r border-white/10 bg-[#666669] px-3 py-6 text-right text-[10px] font-medium text-white/72">
            {leftLabels.map((label) => (
              <div key={label} className="leading-none">
                {label}
              </div>
            ))}
          </div>
        ) : null}
        <div className="flex min-h-0 items-stretch px-1.5 py-1.5">
        {regularTracks.map((track) => (
          <MixerStrip
            key={track.id}
            track={track}
            returnTracks={returnTracks}
            isSelected={selectedTrackId === track.id}
            meter={trackMeters[track.id] ?? null}
            faderHeight={faderHeight}
            visibleSections={visibleSections}
            onSelect={onSelectTrack}
            onMuteToggle={onMuteToggle}
            onSoloToggle={onSoloToggle}
            onVolumeChange={onVolumeChange}
            onPanChange={onPanChange}
            onSendChange={onSendChange}
            onInsertClick={onInsertClick}
            onRenameTrack={onRenameTrack}
            onDeleteTrack={onDeleteTrack}
            onColorChange={onColorChange}
          />
        ))}

        {returnTracks.length > 0 && (
          <>
            <SectionLabel label="Returns" />
            {returnTracks.map((track) => (
              <MixerStrip
                key={track.id}
                track={track}
                returnTracks={[]}
                isSelected={selectedTrackId === track.id}
                meter={trackMeters[track.id] ?? null}
                faderHeight={faderHeight}
                visibleSections={visibleSections}
                onSelect={onSelectTrack}
                onMuteToggle={onMuteToggle}
                onSoloToggle={onSoloToggle}
                onVolumeChange={onVolumeChange}
                onPanChange={onPanChange}
                onSendChange={onSendChange}
                onInsertClick={onInsertClick}
                onRenameTrack={onRenameTrack}
                onDeleteTrack={onDeleteTrack}
                onColorChange={onColorChange}
              />
            ))}
          </>
        )}

        <MasterStrip
          masterMeter={masterMeter}
          masterVolume={masterVolume}
          onMasterVolumeChange={onMasterVolumeChange}
          faderHeight={faderHeight}
        />

        <div className="min-w-[20px] flex-1" />
        </div>
      </div>
    </div>
  );
});
