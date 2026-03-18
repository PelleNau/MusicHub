import { Volume2, Music2, Undo2, Crown, Layers, Trash2, ChevronUp, ChevronDown, Activity } from "lucide-react";
import React, { useRef, useEffect, useState, useCallback, memo } from "react";
import { useStudioInfo, STUDIO_INFO } from "./StudioInfoContext";
import type { SessionTrack, TrackSend, AutomationLaneData, AutomationPoint } from "@/types/studio";
import type { GridDivision } from "@/hooks/useTimelineGrid";
import { getAutomatableParams } from "@/types/studio";
import type { MeterLevel } from "@/services/pluginHostSocket";
import { getTrackColor } from "./track/trackColors";
import { volumeToDb, panToDisplay } from "./track/trackHelpers";
import { ClipBlock } from "./track/ClipBlock";
import { AutomationLane, AUTOMATION_LANE_HEIGHT } from "./AutomationLane";
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
}

export const TrackLane = memo(function TrackLane({
  track,
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

  const sends = track.sends || [];

  const handleSendLevel = useCallback((returnTrackId: string, level: number) => {
    const updated = [...sends];
    const idx = updated.findIndex((s) => s.return_track_id === returnTrackId);
    if (idx >= 0) {
      updated[idx] = { ...updated[idx], level };
    } else {
      updated.push({ return_track_id: returnTrackId, level });
    }
    onSendChange(track.id, updated);
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
    <div className="border-b border-border/60 group/track">
      {/* ── Main track row ── */}
      <div
        className={`flex transition-colors cursor-pointer relative ${
          isSelected ? "bg-primary/[0.04]" : "hover:bg-muted/5"
        }`}
        style={{ height: trackHeight ?? 72, minHeight: trackHeight ?? 72, maxHeight: trackHeight ?? 72 }}
        onClick={handleLaneSelect}
      >
        {/* ── Track header ── */}
        <div className="w-52 shrink-0 flex bg-card border-r border-border/60 select-none relative sticky left-0 z-10">
          <button
            className="w-[4px] shrink-0 hover:w-[8px] transition-all"
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

          <div className="flex-1 min-w-0 flex flex-col justify-center gap-[3px] px-2 py-1.5 min-h-[52px] overflow-hidden">
            {/* Row 1: Icon + Name + M/S toggles + delete + automation */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-muted-foreground shrink-0">
                {TRACK_ICON[track.type] || TRACK_ICON.audio}
              </span>
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
                <span
                  className="text-[11px] font-mono font-medium text-foreground truncate flex-1 leading-none cursor-text hover:text-foreground"
                  onDoubleClick={() => { setRenameValue(track.name); setIsRenaming(true); }}
                  title="Double-click to rename"
                  {...hp("trackName")}
                >
                  {track.name}
                </span>
              )}
              {isReturn && (
                <span className="text-[7px] font-mono bg-accent/20 text-accent-foreground px-1 rounded leading-none py-0.5 shrink-0">
                  RCV
                </span>
              )}
              <div
                data-track-control="true"
                className="flex items-center gap-[3px] shrink-0"
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
            </div>

            {/* Row 2: Volume fader + dB readout + Pan */}
            <div className="flex items-center gap-1.5">
              <div {...hp("volume")} className="flex-1 flex"><VolumeFader value={track.volume} onChange={(v) => onVolumeChange(track.id, v)} /></div>
              <span className="text-[8px] font-mono text-foreground/65 tabular-nums w-7 text-right shrink-0 leading-none">{volumeToDb(track.volume)}</span>
              <div {...hp("pan")}><PanControl value={track.pan} onChange={(p) => onPanChange(track.id, p)} /></div>
              <span className="text-[8px] font-mono text-foreground/65 tabular-nums w-4 text-right shrink-0 leading-none">{panToDisplay(track.pan)}</span>
            </div>

            {/* Row 3: Send knobs */}
            {!isReturn && !isMaster && returnTracks.length > 0 && (
              <div className="flex items-center gap-2 mt-[2px]" {...hp("sends")}>
                <span className="text-[7px] font-mono text-foreground/55 uppercase shrink-0 leading-none">SND</span>
                {returnTracks.map((rt) => (
                  <SendKnob key={rt.id} label={rt.name.length > 4 ? rt.name.slice(0, 4) : rt.name} value={getSendLevel(rt.id)} color={getTrackColor(rt.color)} onChange={(v) => handleSendLevel(rt.id, v)} />
                ))}
              </div>
            )}

            <LevelMeter volume={track.volume} isMuted={track.is_muted} nativeMeter={nativeMeter} />
          </div>
        </div>

        {/* ── Clip lane ── */}
        <div
          className="relative flex-1 overflow-visible"
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
          <div className="absolute h-full bg-muted/20" style={{ width: laneWidth }} />
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
        />
      ))}
    </div>
  );
});
