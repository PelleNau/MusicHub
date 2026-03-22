import { Volume2, Music2, Undo2, Crown, Layers, Trash2, ChevronUp, ChevronDown, Activity } from "lucide-react";
import React, { useRef, useEffect, useState, useCallback, useMemo, memo } from "react";
import { useStudioInfo, STUDIO_INFO } from "./StudioInfoContext";
import type { SessionTrack, TrackSend, AutomationLaneData, AutomationPoint } from "@/types/studio";
import type { GridDivision } from "@/hooks/useTimelineGrid";
import { getAutomatableParams } from "@/types/studio";
import type { MeterLevel } from "@/services/pluginHostSocket";
import { getTrackColor } from "./track/trackColors";
import { volumeToDb, panToDisplay } from "./track/trackHelpers";
import { TRACK_HEADER_WIDTH } from "./timelineMath";
import { ClipBlock } from "./track/ClipBlock";
import { AutomationLane, AUTOMATION_LANE_HEIGHT } from "./AutomationLane";
import { setSendLevel } from "@/domain/studio/studioDeviceRouting";
import {
  TrackToggle,
  VolumeFader,
  PanControl,
  LevelMeter,
  SendKnob,
  ColorPicker,
  TrackDivider,
} from "./track/TrackControls";

// Re-export for backward compatibility
export { getTrackColor } from "./track/trackColors";

const TRACK_ICON: Record<string, React.ReactNode> = {
  midi: <Music2 className="h-3 w-3" />,
  audio: <Volume2 className="h-3 w-3" />,
  return: <Undo2 className="h-3 w-3" />,
  master: <Crown className="h-3 w-3" />,
  group: <Layers className="h-3 w-3" />,
};

interface TrackLaneProps {
  track: SessionTrack;
  trackIndex?: number;
  returnTracks: SessionTrack[];
  pixelsPerBeat: number;
  totalBeats: number;
  beatsPerBar?: number;
  trackHeight?: number;
  onTrackHeightChange?: (height: number) => void;
  isSelected?: boolean;
  selectedClipIds?: Set<string>;
  onSelect?: (trackId: string) => void;
  onMuteToggle: (trackId: string) => void;
  onSoloToggle: (trackId: string) => void;
  onNativeMonitorToggle?: (trackId: string, monitoring: boolean) => void;
  onNativeArmToggle?: (trackId: string, armed: boolean) => void;
  onVolumeChange: (trackId: string, volume: number) => void;
  onPanChange: (trackId: string, pan: number) => void;
  onSendChange: (trackId: string, sends: TrackSend[]) => void;
  onRenameTrack: (trackId: string, name: string) => void;
  onDeleteTrack: (trackId: string) => void;
  onColorChange: (trackId: string, color: number) => void;
  onClipMove?: (clipId: string, newStartBeats: number, deltaY?: number) => void;
  onClipResize?: (clipId: string, newStartBeats: number, newEndBeats: number) => void;
  onReorder?: (trackId: string, direction: "up" | "down") => void;
  onClipSelect?: (clipId: string, trackId: string) => void;
  onClipClick?: (clipId: string, trackId: string, e: React.MouseEvent) => void;
  onCreateMidiClip?: (trackId: string, startBeats: number) => void;
  onAutomationChange?: (trackId: string, laneId: string, points: AutomationPoint[]) => void;
  onAutomationAdd?: (trackId: string, target: string, label: string) => void;
  onAutomationRemove?: (trackId: string, laneId: string) => void;
  onDeleteClip?: (clipId: string) => void;
  onDuplicateClip?: (clipId: string) => void;
  onLinkedDuplicateClip?: (clipId: string) => void;
  onRenameClip?: (clipId: string, name: string) => void;
  onClipColorChange?: (clipId: string, color: number) => void;
  onSplitClip?: (clipId: string, beatPosition: number) => void;
  onMuteClip?: (clipId: string) => void;
  onSetAsLoop?: (clipId: string) => void;
  snapBeats?: number;
  activeDivision?: GridDivision;
  tripletMode?: boolean;
  nativeMeter?: MeterLevel | null;
  nativeMonitoring?: boolean;
  nativeArmed?: boolean;
  captureVariant?: "figma" | "figma-compact" | null;
}

export const TrackLane = memo(function TrackLane({
  track,
  trackIndex,
  returnTracks,
  pixelsPerBeat,
  totalBeats,
  beatsPerBar = 4,
  trackHeight,
  onTrackHeightChange,
  isSelected,
  selectedClipIds,
  onSelect,
  onMuteToggle,
  onSoloToggle,
  onNativeMonitorToggle,
  onNativeArmToggle,
  onVolumeChange,
  onPanChange,
  onSendChange,
  onRenameTrack,
  onDeleteTrack,
  onColorChange,
  onClipMove,
  onClipResize,
  onReorder,
  onClipSelect,
  onClipClick,
  onCreateMidiClip,
  onAutomationChange,
  onAutomationAdd,
  onAutomationRemove,
  onDeleteClip,
  onDuplicateClip,
  onLinkedDuplicateClip,
  onRenameClip,
  onClipColorChange,
  onSplitClip,
  onMuteClip,
  onSetAsLoop,
  snapBeats = 0.25,
  activeDivision = "1/4",
  tripletMode = false,
  nativeMeter,
  nativeMonitoring = false,
  nativeArmed = false,
  captureVariant = null,
}: TrackLaneProps) {
  const color = getTrackColor(track.color);
  const laneWidth = totalBeats * pixelsPerBeat;
  const isReturn = track.type === "return";
  const isMaster = track.type === "master";
  const { setHoveredInfo } = useStudioInfo();
  const hp = (key: keyof typeof STUDIO_INFO) => ({
    onMouseEnter: () => setHoveredInfo(STUDIO_INFO[key]),
    onMouseLeave: () => setHoveredInfo(null),
  });

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(track.name);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showAutoMenu, setShowAutoMenu] = useState(false);

  const automationLanes = (track.automation_lanes || []) as AutomationLaneData[];
  const visibleLanes = automationLanes.filter(l => l.visible);
  const automatableParams = getAutomatableParams(track);

  const handleAutoLaneChange = useCallback((laneId: string, points: AutomationPoint[]) => {
    onAutomationChange?.(track.id, laneId, points);
  }, [track.id, onAutomationChange]);

  const handleAutoLaneRemove = useCallback((laneId: string) => {
    onAutomationRemove?.(track.id, laneId);
  }, [track.id, onAutomationRemove]);

  const handleRenameSubmit = useCallback(() => {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== track.name) {
      onRenameTrack(track.id, trimmed);
    }
    setIsRenaming(false);
  }, [renameValue, track.name, track.id, onRenameTrack]);

  const handleRenameKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRenameSubmit();
    if (e.key === "Escape") { setRenameValue(track.name); setIsRenaming(false); }
  }, [handleRenameSubmit, track.name]);

  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isRenaming]);

  const sends = useMemo(() => track.sends || [], [track.sends]);
  const compactCapture = captureVariant === "figma" || captureVariant === "figma-compact";
  const ultraCompactCapture = captureVariant === "figma-compact";
  const compactMeterPct = Math.max(10, Math.min(100, Math.sqrt((track.is_muted ? 0 : track.volume) / 1.25) * 100));
  const trackSubtype =
    track.type === "midi"
      ? "Midi"
      : track.type === "audio"
        ? "Audio"
        : track.type === "group"
          ? "Group"
          : track.type === "return"
            ? "Return"
            : "Track";

  const handleSendLevel = useCallback((returnTrackId: string, level: number) => {
    onSendChange(track.id, setSendLevel(sends, returnTrackId, level));
  }, [sends, onSendChange, track.id]);

  const getSendLevel = useCallback((returnTrackId: string) => {
    return sends.find((s) => s.return_track_id === returnTrackId)?.level ?? 0;
  }, [sends]);

  const handleLaneSelect = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest("[data-track-control='true']")) return;
    onSelect?.(track.id);
  }, [onSelect, track.id]);

  return (
    <div className="group/track border-b border-white/[0.055] bg-[#121318]">
      {/* ── Main track row ── */}
      <div
        className={`relative flex cursor-pointer transition-colors ${
          isSelected ? "bg-white/[0.025]" : "hover:bg-white/[0.015]"
        }`}
        style={{ height: trackHeight ?? 72, minHeight: trackHeight ?? 72, maxHeight: trackHeight ?? 72 }}
        onClick={handleLaneSelect}
      >
        {/* ── Track header ── */}
        <div
          className={`relative sticky left-0 z-10 flex shrink-0 select-none border-r border-white/8 ${
            compactCapture ? "bg-[#20232a]" : "bg-[#1c1e23]"
          }`}
          style={{ width: TRACK_HEADER_WIDTH, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.024), inset -1px 0 0 rgba(255,255,255,0.02)" }}
        >
          <button
            className="w-[5px] shrink-0 transition-all hover:w-[8px]"
            style={{ backgroundColor: color }}
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Change color"
          />
          {showColorPicker && (
            <ColorPicker
              currentColor={track.color}
              onSelect={(c) => onColorChange(track.id, c)}
              onClose={() => setShowColorPicker(false)}
            />
          )}

          <div className={`flex min-w-0 flex-1 flex-col justify-center overflow-hidden ${ultraCompactCapture ? "min-h-[30px] gap-[1px] px-2.5 py-1.5" : compactCapture ? "min-h-[34px] gap-[2px] px-2.5 py-1.5" : "min-h-[50px] gap-[4px] px-2 py-1.5"}`}>
            {/* Row 1: Icon + Name + M/S toggles + delete + automation */}
            <div className="flex min-w-0 items-center gap-2">
              {compactCapture ? null : (
                <span className="shrink-0 text-white/42">
                  {TRACK_ICON[track.type] || TRACK_ICON.audio}
                </span>
              )}
              {isRenaming ? (
                <input
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={handleRenameSubmit}
                  onKeyDown={handleRenameKeyDown}
                  className="text-[11px] font-mono font-medium text-foreground/90 bg-foreground/10 border border-foreground/20 rounded px-1 py-0 flex-1 min-w-0 outline-none focus:border-primary"
                />
              ) : (
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex min-w-0 items-center gap-2">
                    {typeof trackIndex === "number" ? (
                      <span className="shrink-0 text-[9.5px] font-medium leading-none text-white/38">
                        {trackIndex}
                      </span>
                    ) : null}
                    <span
                      className={`${compactCapture ? "text-[12px] font-medium text-white/93" : "text-[11px] font-medium tracking-[0.01em] text-white/84"} truncate leading-none cursor-text hover:text-white`}
                      onDoubleClick={() => { setRenameValue(track.name); setIsRenaming(true); }}
                      title="Double-click to rename"
                      {...hp("trackName")}
                    >
                      {track.name}
                    </span>
                  </div>
                  <span className={`${compactCapture && ultraCompactCapture ? "hidden" : "mt-px"} flex items-center gap-1 text-[7.5px] leading-none ${compactCapture ? "text-white/32" : "text-white/30"}`}>
                    <span>{trackSubtype}</span>
                  </span>
                </div>
              )}
              {isReturn && (
                <span className="text-[7px] font-mono bg-accent/20 text-accent-foreground px-1 rounded leading-none py-0.5 shrink-0">
                  RCV
                </span>
              )}
              {!compactCapture ? (
                <div
                  data-track-control="true"
                  className="shrink-0 flex items-center gap-[3px]"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div {...hp("mute")}><TrackToggle label="M" active={track.is_muted} activeClass="bg-destructive text-destructive-foreground" onClick={() => onMuteToggle(track.id)} /></div>
                  <div {...hp("solo")}><TrackToggle label="S" active={track.is_soloed} activeClass="bg-warning text-warning-foreground" onClick={() => onSoloToggle(track.id)} /></div>
                  {onNativeMonitorToggle && (
                    <TrackToggle
                      label="I"
                      active={nativeMonitoring}
                      activeClass="bg-primary text-primary-foreground"
                      onClick={() => onNativeMonitorToggle(track.id, !nativeMonitoring)}
                    />
                  )}
                  {onNativeArmToggle && (
                    <TrackToggle
                      label="R"
                      active={nativeArmed}
                      activeClass="bg-red-600 text-white"
                      onClick={() => onNativeArmToggle(track.id, !nativeArmed)}
                    />
                  )}
                  {onReorder && (
                    <>
                      <button type="button" className="h-[18px] w-[14px] flex items-center justify-center rounded-[3px] transition-colors opacity-0 group-hover/track:opacity-100 bg-foreground/[0.08] text-foreground/55 border border-foreground/15 hover:bg-foreground/20 hover:text-foreground" onClick={() => onReorder(track.id, "up")} title="Move up">
                        <ChevronUp className="h-2.5 w-2.5" />
                      </button>
                      <button type="button" className="h-[18px] w-[14px] flex items-center justify-center rounded-[3px] transition-colors opacity-0 group-hover/track:opacity-100 bg-foreground/[0.08] text-foreground/55 border border-foreground/15 hover:bg-foreground/20 hover:text-foreground" onClick={() => onReorder(track.id, "down")} title="Move down">
                        <ChevronDown className="h-2.5 w-2.5" />
                      </button>
                    </>
                  )}
                  <button type="button" className="h-[18px] w-[18px] flex items-center justify-center rounded-[3px] text-[9px] transition-colors opacity-0 group-hover/track:opacity-100 bg-foreground/[0.08] text-foreground/55 border border-foreground/15 hover:bg-destructive/20 hover:text-destructive hover:border-destructive/30" onClick={() => onDeleteTrack(track.id)} title="Delete track">
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                  {onAutomationAdd && (
                    <div className="relative">
                      <button
                        type="button"
                        className={`h-[18px] w-[18px] flex items-center justify-center rounded-[3px] text-[9px] transition-colors border ${
                          visibleLanes.length > 0
                          ? "bg-primary/20 text-primary border-primary/30"
                            : "opacity-0 group-hover/track:opacity-100 bg-foreground/[0.08] text-foreground/55 border-foreground/15 hover:bg-primary/20 hover:text-primary hover:border-primary/30"
                        }`}
                        onClick={(e) => { e.stopPropagation(); setShowAutoMenu(!showAutoMenu); }}
                        title="Automation"
                      >
                        <Activity className="h-2.5 w-2.5" />
                      </button>
                      {showAutoMenu && (
                        <div className="absolute left-0 top-full mt-1 z-50 bg-card border border-border rounded-md shadow-lg py-1 w-44 max-h-48 overflow-y-auto">
                          {automatableParams.map((p) => {
                            const exists = automationLanes.some(l => l.target === p.target);
                            return (
                              <button
                                type="button"
                                key={p.target}
                                className={`w-full text-left px-2 py-1 text-[10px] font-mono transition-colors truncate ${
                                  exists
                                    ? "text-primary bg-primary/5"
                                    : "text-foreground/80 hover:bg-muted"
                                }`}
                                onClick={() => {
                                  if (!exists) {
                                    onAutomationAdd(track.id, p.target, p.label);
                                  }
                                  setShowAutoMenu(false);
                                }}
                              >
                                {exists ? "✓ " : ""}{p.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            {/* Row 2: Volume fader + dB readout + Pan */}
            <div className={`flex items-center gap-1.5 ${compactCapture ? "rounded-[4px] border border-white/8 bg-black/16 px-1.75 py-1.5" : "rounded-[4px] border border-white/5 bg-black/12 px-1.5 py-1"}`}>
              {compactCapture ? (
                <div
                  data-track-control="true"
                  className="flex shrink-0 items-center gap-[3px]"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div {...hp("mute")}><TrackToggle label="M" active={track.is_muted} activeClass="bg-destructive text-destructive-foreground" onClick={() => onMuteToggle(track.id)} /></div>
                  <div {...hp("solo")}><TrackToggle label="S" active={track.is_soloed} activeClass="bg-warning text-warning-foreground" onClick={() => onSoloToggle(track.id)} /></div>
                  <button
                    type="button"
                    className="flex h-[14px] w-[14px] items-center justify-center rounded-[3px] border border-white/12 bg-[#262930] text-[6.5px] font-bold leading-none text-white/42"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    title="Track option"
                  >
                    O
                  </button>
                </div>
              ) : null}
              <div {...hp("volume")} className="flex min-w-0 flex-1"><VolumeFader value={track.volume} onChange={(v) => onVolumeChange(track.id, v)} /></div>
              {compactCapture ? null : (
                <>
                  <span className="w-7 shrink-0 text-right font-mono text-[8px] leading-none tabular-nums text-white/58">{volumeToDb(track.volume)}</span>
                  <div {...hp("pan")}><PanControl value={track.pan} onChange={(p) => onPanChange(track.id, p)} /></div>
                  <span className="w-4 shrink-0 text-right font-mono text-[8px] leading-none tabular-nums text-white/58">{panToDisplay(track.pan)}</span>
                </>
              )}
              {compactCapture ? (
                <div className={`ml-[1px] flex shrink-0 items-center justify-center border border-white/12 bg-white/[0.04] text-white/42 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${ultraCompactCapture ? "h-[18px] w-[18px] rounded-md text-[7px]" : "h-[20px] w-[20px] rounded-full text-[8px]"}`}>
                  {nativeArmed ? "●" : "I"}
                </div>
              ) : null}
            </div>

            {/* Row 3: Send knobs */}
            {!compactCapture && !isReturn && !isMaster && returnTracks.length > 0 && (
              <div className="mt-[2px] flex items-center gap-2 rounded-[4px] border border-white/6 bg-black/10 px-1.5 py-1" {...hp("sends")}>
                <span className="shrink-0 text-[7px] font-mono uppercase leading-none text-white/42">SND</span>
                {returnTracks.map((rt) => (
                  <SendKnob key={rt.id} label={rt.name.length > 4 ? rt.name.slice(0, 4) : rt.name} value={getSendLevel(rt.id)} color={getTrackColor(rt.color)} onChange={(v) => handleSendLevel(rt.id, v)} />
                ))}
              </div>
            )}

            {!compactCapture && <LevelMeter volume={track.volume} isMuted={track.is_muted} nativeMeter={nativeMeter} />}
          </div>

          {compactCapture ? (
            <div className="flex w-[8px] shrink-0 items-stretch justify-center py-1.5 pr-[2px]">
              <div className="relative h-full w-[3px] rounded-full bg-white/8">
                <div
                  className="absolute inset-x-0 bottom-0 rounded-full"
                  style={{
                    height: `${compactMeterPct}%`,
                    backgroundColor: color,
                    opacity: track.is_muted ? 0.28 : 0.95,
                    boxShadow: `0 0 6px ${color}55`,
                  }}
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* ── Clip lane ── */}
        <div
          className="relative flex-1 overflow-visible bg-[#111317]"
          style={{ minWidth: laneWidth }}
          onDoubleClick={(e) => {
            if (track.type === "midi" && onCreateMidiClip) {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const beat = snapBeats > 0
                ? Math.floor(x / pixelsPerBeat / snapBeats) * snapBeats
                : x / pixelsPerBeat;
              onCreateMidiClip(track.id, Math.max(0, beat));
            }
          }}
        >
          <div
            className="absolute h-full"
            style={{
              width: laneWidth,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.006) 0%, rgba(255,255,255,0.002) 18%, rgba(0,0,0,0.018) 100%)",
            }}
          />
          {(track.clips || []).map((clip) => (
            <ClipBlock
              key={clip.id}
              clip={clip}
              pixelsPerBeat={pixelsPerBeat}
              beatsPerBar={beatsPerBar}
              snapBeats={snapBeats}
              activeDivision={activeDivision}
              tripletMode={tripletMode}
              isSelected={selectedClipIds?.has(clip.id) ?? false}
              onMove={onClipMove}
              onResize={onClipResize}
              onDoubleClick={clip.is_midi ? () => onClipSelect?.(clip.id, track.id) : undefined}
              onClick={(clipId, e) => onClipClick?.(clipId, track.id, e)}
              onDelete={onDeleteClip}
              onDuplicate={onDuplicateClip}
              onLinkedDuplicate={onLinkedDuplicateClip}
              onRename={onRenameClip}
              onColorChange={onClipColorChange}
              onSplit={(clipId, beat) => onSplitClip?.(clipId, beat)}
              onMuteToggle={onMuteClip}
              onSetAsLoop={onSetAsLoop}
            />
          ))}
        </div>

        {onTrackHeightChange && (
          <TrackDivider onHeightChange={onTrackHeightChange} currentHeight={trackHeight ?? 72} />
        )}
      </div>

      {/* ── Automation lanes ── */}
      {visibleLanes.map((lane) => (
        <AutomationLane
          key={lane.id}
          lane={lane}
          pixelsPerBeat={pixelsPerBeat}
          totalBeats={totalBeats}
          trackColor={color}
          onChange={handleAutoLaneChange}
          onRemove={handleAutoLaneRemove}
          captureVariant={captureVariant}
        />
      ))}
    </div>
  );
});
