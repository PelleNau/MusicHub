import React, { useRef, useCallback, useMemo } from "react";
import { snapToGrid, getDivisionBeats, type GridDivision } from "@/hooks/useTimelineGrid";
import { getTrackColor } from "./trackColors";
import { ClipWaveform } from "./ClipWaveform";
import { ClipMidiPreview } from "./ClipMidiPreview";
import { ClipContextMenu } from "./ClipContextMenu";
import { getBarOffsetBeats, isBarDownbeat, GRID_EPSILON, beatToContentX, generateGridBeats } from "@/components/studio/timelineMath";
import { extractMidiNotesFromData } from "@/domain/studio/studioMidiCommandProtocol";
import type { SessionClip } from "@/types/studio";

interface MiniNote {
  pitch: number;
  start: number;
  duration: number;
  velocity: number;
}

interface ClipBlockProps {
  clip: SessionClip;
  pixelsPerBeat: number;
  beatsPerBar?: number;
  snapBeats?: number;
  activeDivision?: GridDivision;
  tripletMode?: boolean;
  isSelected?: boolean;
  onMove?: (clipId: string, newStartBeats: number, deltaY?: number) => void;
  onResize?: (clipId: string, newStartBeats: number, newEndBeats: number) => void;
  onDoubleClick?: () => void;
  onClick?: (clipId: string, e: React.MouseEvent) => void;
  onDelete?: (clipId: string) => void;
  onDuplicate?: (clipId: string) => void;
  onLinkedDuplicate?: (clipId: string) => void;
  onRename?: (clipId: string, name: string) => void;
  onColorChange?: (clipId: string, color: number) => void;
  onSplit?: (clipId: string, beatPosition: number) => void;
  onMuteToggle?: (clipId: string) => void;
  onSetAsLoop?: (clipId: string) => void;
}

function parseHslColor(color: string) {
  const match = color.match(/hsl\(([\d.]+),\s*([\d.]+)%,\s*([\d.]+)%\)/i);
  if (!match) {
    return { h: 0, s: 0, l: 40 };
  }

  return {
    h: Number(match[1]),
    s: Number(match[2]),
    l: Number(match[3]),
  };
}

function hsla(color: { h: number; s: number; l: number }, alpha = 1) {
  return `hsla(${color.h}, ${color.s}%, ${color.l}%, ${alpha})`;
}

export function ClipBlock({
  clip,
  pixelsPerBeat,
  beatsPerBar = 4,
  snapBeats = 0.25,
  activeDivision = "1/4",
  tripletMode = false,
  isSelected,
  onMove,
  onResize,
  onDoubleClick,
  onClick,
  onDelete,
  onDuplicate,
  onLinkedDuplicate,
  onRename,
  onColorChange,
  onSplit,
  onMuteToggle,
  onSetAsLoop,
}: ClipBlockProps) {
  const left = beatToContentX(clip.start_beats, pixelsPerBeat);
  const width = beatToContentX(clip.end_beats - clip.start_beats, pixelsPerBeat);
  const color = getTrackColor(clip.color);
  const isMuted = clip.is_muted === true;
  const baseColor = useMemo(() => parseHslColor(color), [color]);
  const clipChrome = useMemo(() => {
    const accent = { ...baseColor, s: Math.max(baseColor.s - 18, 20), l: Math.min(baseColor.l + 1, 54) };
    const body = { ...baseColor, s: Math.max(baseColor.s - 44, 10), l: 26 };
    const bodySelected = { ...baseColor, s: Math.max(baseColor.s - 34, 14), l: 29 };
    const title = { ...baseColor, s: Math.max(baseColor.s - 38, 12), l: 21 };
    const border = { ...baseColor, s: Math.max(baseColor.s - 36, 12), l: 34 };

    return {
      accent,
      body,
      bodySelected,
      title,
      border,
      waveform: hsla({ ...accent, l: Math.min(accent.l + 18, 72), s: Math.max(accent.s - 12, 12) }, isMuted ? 0.12 : 0.34),
      midi: hsla({ ...accent, l: Math.min(accent.l + 10, 64), s: Math.max(accent.s - 8, 16) }, 1),
    };
  }, [baseColor, isMuted]);
  const peaks = clip.waveform_peaks as number[] | null;

  // Parse MIDI notes for mini preview
  const midiNotes: MiniNote[] = useMemo(() => {
    if (!clip.is_midi) return [];
    return extractMidiNotesFromData(clip.midi_data) as MiniNote[];
  }, [clip.is_midi, clip.midi_data]);

  const clipDuration = clip.end_beats - clip.start_beats;

  // Internal lines aligned to ruler division/grid (bar, beat, or subdivision)
  const beatGridLines = useMemo(() => {
    const startBeat = clip.start_beats;
    const endBeat = clip.end_beats;
    if (endBeat <= startBeat || pixelsPerBeat <= 0) {
      return [] as { x: number; weight: "bar" | "beat" | "sub" }[];
    }

    let divisionBeats = getDivisionBeats(activeDivision, beatsPerBar);
    if (tripletMode) divisionBeats = divisionBeats * (2 / 3);

    const barOffsetBeats = getBarOffsetBeats(beatsPerBar);
    // Index-based generation to prevent cumulative drift
    const gridBeats = generateGridBeats(endBeat, divisionBeats, startBeat);
    const lines: { x: number; weight: "bar" | "beat" | "sub" }[] = [];

    for (const beat of gridBeats) {
      if (beat < startBeat || beat > endBeat) continue;
      const x = beatToContentX(beat - startBeat, pixelsPerBeat);

      const isBar = isBarDownbeat(beat, beatsPerBar, barOffsetBeats);
      const isBeatLine = Math.abs(beat - Math.round(beat)) < GRID_EPSILON;

      lines.push({ x, weight: isBar ? "bar" : isBeatLine ? "beat" : "sub" });
    }

    return lines;
  }, [clip.start_beats, clip.end_beats, pixelsPerBeat, beatsPerBar, activeDivision, tripletMode]);

  // Drag to move (horizontal + vertical for cross-track)
  const dragRef = useRef<{ startX: number; startY: number; origStart: number; moved: boolean } | null>(null);

  const handleDragStart = useCallback((e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.dataset.resize) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origStart: clip.start_beats, moved: false };
  }, [clip.start_beats]);

  const handleDragMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const deltaPx = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    if (Math.abs(deltaPx) > 2 || Math.abs(deltaY) > 2) dragRef.current.moved = true;
    const el = e.currentTarget as HTMLElement;
    const translateY = Math.abs(deltaY) > 4 ? deltaY : 0;
    el.style.transform = `translateX(${deltaPx}px) translateY(${translateY}px)`;
    el.style.zIndex = Math.abs(deltaY) > 4 ? '50' : '';
    el.style.opacity = Math.abs(deltaY) > 4 ? '0.8' : '';
  }, []);

  const handleDragEnd = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const wasMoved = dragRef.current.moved;
    const el = e.currentTarget as HTMLElement;
    el.style.transform = '';
    el.style.zIndex = '';
    el.style.opacity = '';
    if (wasMoved && onMove) {
      const deltaPx = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      const deltaBeats = deltaPx / pixelsPerBeat;
      const raw = dragRef.current.origStart + deltaBeats;
      const snapped = snapBeats > 0 ? snapToGrid(raw, snapBeats) : raw;
      const newStart = Math.max(0, snapped);
      onMove(clip.id, newStart, deltaY);
    } else if (!wasMoved) {
      onClick?.(clip.id, e as unknown as React.MouseEvent);
    }
    dragRef.current = null;
  }, [clip.id, onMove, onClick, pixelsPerBeat, snapBeats]);

  // Resize from right edge
  const resizeRef = useRef<{ startX: number; origEnd: number } | null>(null);

  const handleResizeStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    resizeRef.current = { startX: e.clientX, origEnd: clip.end_beats };
  }, [clip.end_beats]);

  const handleResizeMove = useCallback((e: React.PointerEvent) => {
    if (!resizeRef.current) return;
    e.stopPropagation();
    const deltaPx = e.clientX - resizeRef.current.startX;
    const deltaBeats = deltaPx / pixelsPerBeat;
    const raw = resizeRef.current.origEnd + deltaBeats;
    const newEnd = Math.max(clip.start_beats + (snapBeats || 0.25), snapBeats > 0 ? snapToGrid(raw, snapBeats) : raw);
    const clipEl = (e.currentTarget as HTMLElement).parentElement;
    if (clipEl) {
      clipEl.style.width = `${Math.max((newEnd - clip.start_beats) * pixelsPerBeat, 4)}px`;
    }
  }, [clip.start_beats, pixelsPerBeat, snapBeats]);

  const handleResizeEnd = useCallback((e: React.PointerEvent) => {
    if (!resizeRef.current || !onResize) return;
    e.stopPropagation();
    const deltaPx = e.clientX - resizeRef.current.startX;
    const deltaBeats = deltaPx / pixelsPerBeat;
    const raw = resizeRef.current.origEnd + deltaBeats;
    const newEnd = Math.max(clip.start_beats + (snapBeats || 0.25), snapBeats > 0 ? snapToGrid(raw, snapBeats) : raw);
    const clipEl = (e.currentTarget as HTMLElement).parentElement;
    if (clipEl) clipEl.style.width = '';
    onResize(clip.id, clip.start_beats, newEnd);
    resizeRef.current = null;
  }, [clip.id, clip.start_beats, onResize, pixelsPerBeat, snapBeats]);

  // Resize from left edge
  const resizeLRef = useRef<{ startX: number; origStart: number } | null>(null);

  const handleResizeLStart = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    resizeLRef.current = { startX: e.clientX, origStart: clip.start_beats };
  }, [clip.start_beats]);

  const handleResizeLMove = useCallback((e: React.PointerEvent) => {
    if (!resizeLRef.current) return;
    e.stopPropagation();
    const deltaPx = e.clientX - resizeLRef.current.startX;
    const deltaBeats = deltaPx / pixelsPerBeat;
    const raw = resizeLRef.current.origStart + deltaBeats;
    const newStart = Math.max(0, Math.min(clip.end_beats - (snapBeats || 0.25), snapBeats > 0 ? snapToGrid(raw, snapBeats) : raw));
    const clipEl = (e.currentTarget as HTMLElement).parentElement;
    if (clipEl) {
      clipEl.style.left = `${newStart * pixelsPerBeat}px`;
      clipEl.style.width = `${Math.max((clip.end_beats - newStart) * pixelsPerBeat, 4)}px`;
    }
  }, [clip.end_beats, pixelsPerBeat, snapBeats]);

  const handleResizeLEnd = useCallback((e: React.PointerEvent) => {
    if (!resizeLRef.current || !onResize) return;
    e.stopPropagation();
    const deltaPx = e.clientX - resizeLRef.current.startX;
    const deltaBeats = deltaPx / pixelsPerBeat;
    const raw = resizeLRef.current.origStart + deltaBeats;
    const newStart = Math.max(0, Math.min(clip.end_beats - (snapBeats || 0.25), snapBeats > 0 ? snapToGrid(raw, snapBeats) : raw));
    const clipEl = (e.currentTarget as HTMLElement).parentElement;
    if (clipEl) { clipEl.style.left = ''; clipEl.style.width = ''; }
    onResize(clip.id, newStart, clip.end_beats);
    resizeLRef.current = null;
  }, [clip.id, clip.end_beats, onResize, pixelsPerBeat, snapBeats]);

  // Split handler
  const handleSplitFromMenu = useCallback(() => {
    if (!onSplit) return;
    const mid = (clip.start_beats + clip.end_beats) / 2;
    let snapped = snapBeats > 0 ? snapToGrid(mid, snapBeats) : mid;
    if (snapped <= clip.start_beats || snapped >= clip.end_beats) {
      snapped = mid;
    }
    onSplit(clip.id, snapped);
  }, [clip.id, clip.start_beats, clip.end_beats, snapBeats, onSplit]);

  const showName = width >= 40;

  const clipElement = (
    <div
      className={`absolute top-[1px] bottom-[1px] overflow-hidden rounded-[3px] group cursor-grab active:cursor-grabbing transition-[box-shadow,opacity] ${
        isSelected ? "ring-1 ring-white/45" : ""
      }`}
      style={{
        left,
        width: Math.max(width, 4),
        backgroundColor: hsla(isSelected ? clipChrome.bodySelected : clipChrome.body),
        opacity: isMuted ? 0.52 : 1,
        boxShadow: isSelected
          ? `inset 0 0 0 1px rgba(255,255,255,0.16), 0 0 0 1px rgba(255,255,255,0.05)`
          : `inset 0 0 0 1px ${hsla(clipChrome.border, 0.38)}`,
        touchAction: "none",
      }}
      onPointerDown={handleDragStart}
      onPointerMove={handleDragMove}
      onPointerUp={handleDragEnd}
      onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick?.(); }}
    >
      <div
        className="absolute inset-y-0 left-0 w-[2px] z-[2]"
        style={{ backgroundColor: hsla(clipChrome.accent, isMuted ? 0.22 : 0.78) }}
      />

      <div className="absolute inset-0 pointer-events-none z-[1]">
        {beatGridLines.map((line, i) => (
          <div
            key={`grid-${i}`}
            className="absolute bottom-0"
            style={{
              left: line.x,
              height: line.weight === "bar" ? "100%" : line.weight === "beat" ? "60%" : "35%",
              borderLeft: `1px solid ${
                line.weight === "bar"
                  ? "rgba(255,255,255,0.12)"
                  : line.weight === "beat"
                    ? "rgba(255,255,255,0.07)"
                    : "rgba(255,255,255,0.035)"
              }`,
            }}
          />
        ))}
      </div>


      {/* Muted stripe overlay */}
      {isMuted && (
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 5px)",
          }}
        />
      )}
      {/* Left resize handle */}
      <div
        data-resize="left"
        className="absolute left-0 top-0 bottom-0 w-[6px] cursor-col-resize z-20 bg-transparent transition-all before:absolute before:inset-y-1 before:left-[1px] before:w-[1px] before:rounded-full before:bg-white/0 hover:before:bg-white/16"
        style={{ touchAction: "none" }}
        onPointerDown={handleResizeLStart}
        onPointerMove={handleResizeLMove}
        onPointerUp={handleResizeLEnd}
      />
      {/* Right resize handle */}
      <div
        data-resize="right"
        className="absolute right-0 top-0 bottom-0 w-[6px] cursor-col-resize z-20 bg-transparent transition-all before:absolute before:inset-y-1 before:right-[1px] before:w-[1px] before:rounded-full before:bg-white/0 hover:before:bg-white/16"
        style={{ touchAction: "none" }}
        onPointerDown={handleResizeStart}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeEnd}
      />
      {/* Waveform for audio clips */}
      {peaks && peaks.length > 0 && (
        <ClipWaveform
          peaks={peaks}
          color={clipChrome.waveform}
          width={Math.max(width, 4)}
          height={24}
        />
      )}
      {midiNotes.length > 0 && (
        <ClipMidiPreview
          notes={midiNotes}
          clipDuration={clipDuration}
          isMuted={isMuted}
          color={clipChrome.midi}
        />
      )}
      <div
        className="absolute inset-x-0 top-0 flex h-[10px] items-center px-1.5"
        style={{ backgroundColor: hsla(clipChrome.title, 0.98) }}
      >
        {isMuted && <VolumeXIcon className="h-2 w-2 text-white/50 mr-0.5 shrink-0" />}
        {showName && (
          <span className={`text-[7px] font-medium tracking-[0.01em] truncate leading-none ${isMuted ? "text-white/32 line-through" : "text-white/78"}`}>
            {clip.name}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <ClipContextMenu
      clipId={clip.id}
      clipName={clip.name}
      isMidi={clip.is_midi}
      isMuted={isMuted}
      onDelete={onDelete}
      onDuplicate={onDuplicate}
      onLinkedDuplicate={onLinkedDuplicate}
      onRename={onRename}
      onColorChange={onColorChange}
      onSplit={handleSplitFromMenu}
      onMuteToggle={onMuteToggle}
      onSetAsLoop={onSetAsLoop}
    >
      {clipElement}
    </ClipContextMenu>
  );
}

/** Tiny mute icon inline */
function VolumeXIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3L4.5 6H2v4h2.5L8 13V3z" />
      <line x1="12" y1="5" x2="12" y2="11" />
    </svg>
  );
}
