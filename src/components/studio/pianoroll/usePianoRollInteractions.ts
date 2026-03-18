import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import type { SessionClip } from "@/types/studio";
import { useNoteAudition } from "@/hooks/useNoteAudition";
import {
  quantizeNotes, swingQuantize, humanizeNotes,
  snapPitchToScale, getVisiblePitches, transposeNotes,
  type MidiNote,
} from "@/components/studio/PianoRollTransforms";
import { extractMidiNotesFromData } from "@/domain/studio/studioMidiCommandProtocol";
import { type CCPoint } from "@/components/studio/CCLane";
import {
  SCALES, DEFAULT_VELOCITY,
  MIN_PITCH, MAX_PITCH,
  DRAG_THRESHOLD,
  type Tool, type DragMode, type CCLaneType,
  parseCCData, buildMidiData,
} from "./constants";
import type { ChordType } from "@/components/studio/ChordPalette";

interface UsePianoRollInteractionsArgs {
  clip: SessionClip;
  onNotesChange: (clipId: string, notes: MidiNote[]) => void;
  onClipResize?: (clipId: string, newEndBeats: number) => void;
  onMidiDataChange?: (clipId: string, midiData: unknown) => void;
  beatsPerBar: number;
  globalBeat?: number;

  /** When provided, note audition is routed through this callback (connected mode). */
  onNativeNote?: (pitch: number, velocity: number) => void;

  // From toolbar
  tool: Tool;
  snapBeats: number;
  scaleName: string;
  rootNote: number;
  splitMode: boolean;
  setSplitMode: (v: boolean) => void;
  scaleLock: boolean;
  foldKeyboard: boolean;
  drawDuration: number;
  quantizeStrength: number;
  activeChord: ChordType | null;
  pxPerBeat: number;
  keyHeight: number;
  ccLaneType: CCLaneType;
  setShowTranspose: (v: boolean) => void;
  setTool: (t: Tool) => void;
}

export function usePianoRollInteractions({
  clip,
  onNotesChange,
  onClipResize,
  onMidiDataChange,
  beatsPerBar,
  globalBeat,
  onNativeNote,
  tool, snapBeats, scaleName, rootNote, splitMode, setSplitMode,
  scaleLock, foldKeyboard, drawDuration, quantizeStrength,
  activeChord, pxPerBeat, keyHeight, ccLaneType,
  setShowTranspose, setTool,
}: UsePianoRollInteractionsArgs) {
  const { playNote: localPlayNote } = useNoteAudition();
  // In connected mode, route audition through native MIDI; fallback to local oscillator
  const playNote = useCallback((pitch: number, velocity: number) => {
    if (onNativeNote) {
      onNativeNote(pitch, velocity);
    } else {
      localPlayNote(pitch, velocity);
    }
  }, [onNativeNote, localPlayNote]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [marquee, setMarquee] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null);
  const [dragDelta, setDragDelta] = useState<{ dx: number; dy: number; mode: DragMode } | null>(null);
  const [clipExtendDelta, setClipExtendDelta] = useState<number>(0);

  /* ── Derived ── */
  const scaleIntervals = SCALES[scaleName];
  const visiblePitches = useMemo(
    () => getVisiblePitches(MIN_PITCH, MAX_PITCH, rootNote, scaleIntervals, foldKeyboard),
    [rootNote, scaleIntervals, foldKeyboard]
  );
  const clipDuration = clip.end_beats - clip.start_beats;

  const pitchToRow = useMemo(() => {
    const map = new Map<number, number>();
    visiblePitches.forEach((p, i) => map.set(p, i));
    return map;
  }, [visiblePitches]);

  const { notes, ccData, pitchBendData } = useMemo(() => {
    if (!clip.midi_data) return { notes: [] as MidiNote[], ccData: {} as Record<string, CCPoint[]>, pitchBendData: [] as CCPoint[] };
    const parsedCC = parseCCData(clip.midi_data);
    return {
      notes: extractMidiNotesFromData(clip.midi_data),
      ccData: parsedCC.cc,
      pitchBendData: parsedCC.pitchBend,
    };
  }, [clip.midi_data]);

  // Scroll to middle C on mount
  useEffect(() => {
    if (scrollRef.current) {
      const middleC = 60;
      const rowIdx = pitchToRow.get(middleC) ?? Math.floor(visiblePitches.length / 2);
      const offset = rowIdx * keyHeight - scrollRef.current.clientHeight / 2;
      scrollRef.current.scrollTop = Math.max(0, offset);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── CC data change ── */
  const handleCCChange = useCallback((laneType: CCLaneType, points: CCPoint[]) => {
    const newCC = { ...ccData };
    if (laneType === "cc1") newCC["1"] = points;
    else if (laneType === "cc11") newCC["11"] = points;
    const newPB = laneType === "pitchBend" ? points : pitchBendData;
    onMidiDataChange?.(clip.id, buildMidiData(notes, newCC, newPB));
  }, [notes, ccData, pitchBendData, clip.id, onMidiDataChange]);

  /* ── Coordinate helpers ── */
  const snap = useCallback((beats: number) => {
    if (snapBeats <= 0) return beats;
    return Math.round(beats / snapBeats) * snapBeats;
  }, [snapBeats]);

  const pitchFromY = useCallback((y: number) => {
    const row = Math.floor(y / keyHeight);
    if (row < 0 || row >= visiblePitches.length) return visiblePitches[0] ?? MAX_PITCH;
    return visiblePitches[row];
  }, [keyHeight, visiblePitches]);

  const beatFromX = useCallback((x: number) => snap(x / pxPerBeat), [snap, pxPerBeat]);
  const rawBeatFromX = useCallback((x: number) => x / pxPerBeat, [pxPerBeat]);

  const maybeLockPitch = useCallback((pitch: number) => {
    if (!scaleLock) return pitch;
    return snapPitchToScale(pitch, rootNote, scaleIntervals);
  }, [scaleLock, rootNote, scaleIntervals]);

  /* ── Drag state ── */
  const dragRef = useRef<{
    mode: DragMode;
    noteId?: string;
    startX: number;
    startY: number;
    origStart?: number;
    origPitch?: number;
    origDuration?: number;
    origVelocity?: number;
    marqueeX0?: number;
    marqueeY0?: number;
    paintedBeats?: Set<string>;
    paintPitch?: number;
    origClipEnd?: number;
  } | null>(null);

  /* ── Note hit test ── */
  const hitTestNote = useCallback((x: number, y: number) => {
    const pitch = pitchFromY(y);
    const beat = rawBeatFromX(x);
    return notes.find((n) => n.pitch === pitch && beat >= n.start && beat < n.start + n.duration);
  }, [notes, pitchFromY, rawBeatFromX]);

  /* ── Split / Chop ── */
  const splitNoteAt = useCallback((noteId: string, splitBeat: number) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    const snappedBeat = snap(splitBeat);
    if (snappedBeat <= note.start || snappedBeat >= note.start + note.duration) return;
    const left: MidiNote = { ...note, duration: snappedBeat - note.start };
    const right: MidiNote = { ...note, id: crypto.randomUUID(), start: snappedBeat, duration: note.start + note.duration - snappedBeat };
    onNotesChange(clip.id, notes.map(n => n.id === noteId ? left : n).concat(right));
    setSelectedIds(new Set([left.id, right.id]));
  }, [notes, clip.id, snap, onNotesChange]);

  const chopNotesOnGrid = useCallback(() => {
    if (selectedIds.size === 0) return;
    const chopStep = snapBeats > 0 ? snapBeats : 0.25;
    const result: MidiNote[] = [];
    for (const note of notes) {
      if (!selectedIds.has(note.id)) { result.push(note); continue; }
      let pos = note.start;
      const end = note.start + note.duration;
      let first = true;
      while (pos < end - 0.001) {
        const nextGrid = snap(pos + chopStep);
        const segEnd = Math.min(nextGrid > pos ? nextGrid : pos + chopStep, end);
        const dur = segEnd - pos;
        if (dur > 0.001) {
          result.push({ ...note, id: first ? note.id : crypto.randomUUID(), start: pos, duration: dur });
          first = false;
        }
        pos = segEnd;
      }
    }
    onNotesChange(clip.id, result);
  }, [notes, clip.id, selectedIds, snapBeats, snap, onNotesChange]);

  /* ── Canvas pointer handlers ── */
  const handleCanvasPointerDown = useCallback((e: React.PointerEvent) => {
    containerRef.current?.focus();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (splitMode) {
      const hit = hitTestNote(x, y);
      if (hit) splitNoteAt(hit.id, rawBeatFromX(x));
      return;
    }

    if (tool === "erase") {
      const hit = hitTestNote(x, y);
      if (hit) {
        onNotesChange(clip.id, notes.filter((n) => n.id !== hit.id));
        setSelectedIds((prev) => { const next = new Set(prev); next.delete(hit.id); return next; });
      }
      return;
    }

    const hit = hitTestNote(x, y);

    if (hit && tool !== "paint") {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      const noteX = hit.start * pxPerBeat;
      const noteW = hit.duration * pxPerBeat;
      const isRightEdge = x > noteX + noteW - 10;
      if (isRightEdge) {
        dragRef.current = { mode: "resize", noteId: hit.id, startX: e.clientX, startY: e.clientY, origDuration: hit.duration };
      } else {
        dragRef.current = { mode: "none", noteId: hit.id, startX: e.clientX, startY: e.clientY, origStart: hit.start, origPitch: hit.pitch };
      }
      if (e.shiftKey) {
        setSelectedIds((prev) => { const next = new Set(prev); if (next.has(hit.id)) next.delete(hit.id); else next.add(hit.id); return next; });
      } else if (!selectedIds.has(hit.id)) {
        setSelectedIds(new Set([hit.id]));
      }
      playNote(hit.pitch, hit.velocity);
    } else if (tool === "paint") {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      let pitch = pitchFromY(y);
      pitch = maybeLockPitch(pitch);
      const beat = beatFromX(x);
      if (pitch < MIN_PITCH || pitch > MAX_PITCH || beat < 0) return;
      // Auto-extend clip if drawing past end
      if (beat + drawDuration > clipDuration && onClipResize) {
        const newEnd = clip.start_beats + Math.ceil((beat + drawDuration) / beatsPerBar) * beatsPerBar;
        onClipResize(clip.id, newEnd);
      }
      const key = `${pitch}:${beat}`;
      const exists = notes.some(n => n.pitch === pitch && Math.abs(n.start - beat) < 0.001);
      if (!exists) {
        onNotesChange(clip.id, [...notes, { id: crypto.randomUUID(), pitch, start: beat, duration: drawDuration, velocity: DEFAULT_VELOCITY }]);
        playNote(pitch, DEFAULT_VELOCITY);
      }
      dragRef.current = { mode: "paint", startX: e.clientX, startY: e.clientY, paintedBeats: new Set([key]), paintPitch: pitch };
    } else if (tool === "draw") {
      let pitch = pitchFromY(y);
      pitch = maybeLockPitch(pitch);
      const beat = beatFromX(x);
      if (pitch < MIN_PITCH || pitch > MAX_PITCH || beat < 0) return;
      // Auto-extend clip if drawing past end
      if (beat + drawDuration > clipDuration && onClipResize) {
        const newEnd = clip.start_beats + Math.ceil((beat + drawDuration) / beatsPerBar) * beatsPerBar;
        onClipResize(clip.id, newEnd);
      }
      if (activeChord) {
        const chordNotes: MidiNote[] = activeChord.intervals.map((interval) => ({
          id: crypto.randomUUID(), pitch: Math.min(127, pitch + interval), start: beat, duration: drawDuration, velocity: DEFAULT_VELOCITY,
        }));
        onNotesChange(clip.id, [...notes, ...chordNotes]);
        setSelectedIds(new Set(chordNotes.map(n => n.id)));
        playNote(pitch, DEFAULT_VELOCITY);
      } else {
        const newNote: MidiNote = { id: crypto.randomUUID(), pitch, start: beat, duration: drawDuration, velocity: DEFAULT_VELOCITY };
        onNotesChange(clip.id, [...notes, newNote]);
        setSelectedIds(new Set([newNote.id]));
        playNote(pitch, DEFAULT_VELOCITY);
      }
    } else if (tool === "select") {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = { mode: "marquee", startX: e.clientX, startY: e.clientY, marqueeX0: x, marqueeY0: y };
      if (!e.shiftKey) setSelectedIds(new Set());
    }
  }, [tool, notes, clip.id, clip.start_beats, clipDuration, snapBeats, hitTestNote, selectedIds, onNotesChange, onClipResize, pitchFromY, beatFromX, rawBeatFromX, splitMode, splitNoteAt, playNote, pxPerBeat, maybeLockPitch, drawDuration, activeChord, beatsPerBar]);

  const handleCanvasPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    if (dragRef.current.mode === "none") {
      if (Math.hypot(dx, dy) > DRAG_THRESHOLD) dragRef.current.mode = "move";
      return;
    }
    if (dragRef.current.mode === "move" || dragRef.current.mode === "resize") {
      setDragDelta({ dx, dy, mode: dragRef.current.mode });
    }
    if (dragRef.current.mode === "paint") {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      let pitch = pitchFromY(y);
      pitch = maybeLockPitch(pitch);
      const beat = beatFromX(x);
      if (pitch < MIN_PITCH || pitch > MAX_PITCH || beat < 0) return;
      // Auto-extend clip when painting past end
      if (beat + drawDuration > clipDuration && onClipResize) {
        const newEnd = clip.start_beats + Math.ceil((beat + drawDuration) / beatsPerBar) * beatsPerBar;
        onClipResize(clip.id, newEnd);
      }
      const key = `${pitch}:${beat}`;
      if (!dragRef.current.paintedBeats!.has(key)) {
        dragRef.current.paintedBeats!.add(key);
        const exists = notes.some(n => n.pitch === pitch && Math.abs(n.start - beat) < 0.001);
        if (!exists) {
          onNotesChange(clip.id, [...notes, { id: crypto.randomUUID(), pitch, start: beat, duration: drawDuration, velocity: DEFAULT_VELOCITY }]);
        }
      }
    }
    if (dragRef.current.mode === "marquee") {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMarquee({ x0: dragRef.current.marqueeX0!, y0: dragRef.current.marqueeY0!, x1: x, y1: y });
    }
  }, [notes, clip.id, clip.start_beats, clipDuration, pitchFromY, beatFromX, onNotesChange, onClipResize, maybeLockPitch, drawDuration, pxPerBeat, beatsPerBar]);

  const handleCanvasPointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const d = dragRef.current;

    if (d.mode === "none" && d.noteId) {
      if (!e.shiftKey) setSelectedIds(new Set([d.noteId]));
    }

    if (d.mode === "move" && d.noteId) {
      const dx = e.clientX - d.startX;
      const dy = e.clientY - d.startY;
      const deltaBeats = snap(dx / pxPerBeat);
      const deltaRows = -Math.round(dy / keyHeight);
      const updated = notes.map((n) => {
        if (!selectedIds.has(n.id)) return n;
        const newStart = Math.max(0, n.start + deltaBeats);
        const currentRow = pitchToRow.get(n.pitch);
        let newPitch = n.pitch;
        if (currentRow !== undefined) {
          const targetRow = Math.max(0, Math.min(visiblePitches.length - 1, currentRow - deltaRows));
          newPitch = visiblePitches[targetRow];
        } else {
          newPitch = Math.max(MIN_PITCH, Math.min(MAX_PITCH, n.pitch + deltaRows));
        }
        newPitch = maybeLockPitch(newPitch);
        return { ...n, start: newStart, pitch: newPitch };
      });
      onNotesChange(clip.id, updated);
    }

    if (d.mode === "resize" && d.noteId) {
      const dx = e.clientX - d.startX;
      const deltaBeats = dx / pxPerBeat;
      const newDuration = Math.max(snapBeats, snap(d.origDuration! + deltaBeats));
      onNotesChange(clip.id, notes.map((n) => n.id === d.noteId ? { ...n, duration: newDuration } : n));
    }

    if (d.mode === "marquee" && marquee) {
      const left = Math.min(marquee.x0, marquee.x1);
      const right = Math.max(marquee.x0, marquee.x1);
      const top = Math.min(marquee.y0, marquee.y1);
      const bottom = Math.max(marquee.y0, marquee.y1);
      const ids = new Set(e.shiftKey ? selectedIds : new Set<string>());
      for (const note of notes) {
        const nx = note.start * pxPerBeat;
        const nw = note.duration * pxPerBeat;
        const row = pitchToRow.get(note.pitch);
        if (row === undefined) continue;
        const ny = row * keyHeight;
        const nh = keyHeight;
        if (nx + nw > left && nx < right && ny + nh > top && ny < bottom) ids.add(note.id);
      }
      setSelectedIds(ids);
      setMarquee(null);
    }

    setDragDelta(null);
    dragRef.current = null;
  }, [notes, clip.id, selectedIds, marquee, snap, snapBeats, onNotesChange, pxPerBeat, keyHeight, pitchToRow, visiblePitches, maybeLockPitch]);

  /* ── Clip extend handle ── */
  const handleClipExtendDown = useCallback((e: React.PointerEvent) => {
    if (!onClipResize) return;
    e.preventDefault(); e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { mode: "clip-extend", startX: e.clientX, startY: e.clientY, origClipEnd: clip.end_beats };
  }, [clip.end_beats, onClipResize]);

  const handleClipExtendMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current || dragRef.current.mode !== "clip-extend") return;
    setClipExtendDelta(e.clientX - dragRef.current.startX);
  }, []);

  const handleClipExtendUp = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current || dragRef.current.mode !== "clip-extend") return;
    const dx = e.clientX - dragRef.current.startX;
    const deltaBeats = snap(dx / pxPerBeat);
    const newEnd = Math.max(clip.start_beats + beatsPerBar, dragRef.current.origClipEnd! + deltaBeats);
    onClipResize?.(clip.id, newEnd);
    setClipExtendDelta(0);
    dragRef.current = null;
  }, [clip.id, clip.start_beats, beatsPerBar, snap, onClipResize, pxPerBeat]);

  /* ── Clipboard ── */
  const clipboardRef = useRef<MidiNote[]>([]);

  /* ── Keyboard shortcuts ── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "e" || e.key === "E") {
        if (!e.metaKey && !e.ctrlKey) setSplitMode(true);
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIds.size === 0) return;
        e.preventDefault();
        onNotesChange(clip.id, notes.filter((n) => !selectedIds.has(n.id)));
        setSelectedIds(new Set());
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "a") {
        e.preventDefault();
        setSelectedIds(new Set(notes.map((n) => n.id)));
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "c") {
        e.preventDefault();
        const selected = notes.filter((n) => selectedIds.has(n.id));
        if (selected.length === 0) return;
        const minStart = Math.min(...selected.map((n) => n.start));
        clipboardRef.current = selected.map((n) => ({ ...n, start: n.start - minStart }));
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "v") {
        e.preventDefault();
        if (clipboardRef.current.length === 0) return;
        let pasteAt = 0;
        if (globalBeat !== undefined) pasteAt = Math.max(0, globalBeat - clip.start_beats);
        else if (selectedIds.size > 0) {
          const selNotes = notes.filter((n) => selectedIds.has(n.id));
          pasteAt = Math.max(...selNotes.map((n) => n.start + n.duration));
        }
        pasteAt = snap(pasteAt);
        const pasted = clipboardRef.current.map((n) => ({ ...n, id: crypto.randomUUID(), start: n.start + pasteAt }));
        const pasteMaxEnd = Math.max(...pasted.map((n) => n.start + n.duration));
        if (pasteMaxEnd > clipDuration && onClipResize) {
          onClipResize(clip.id, clip.start_beats + Math.ceil(pasteMaxEnd / beatsPerBar) * beatsPerBar);
        }
        onNotesChange(clip.id, [...notes, ...pasted]);
        setSelectedIds(new Set(pasted.map((n) => n.id)));
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "d") {
        e.preventDefault();
        const source = selectedIds.size > 0 ? notes.filter((n) => selectedIds.has(n.id)) : notes;
        if (source.length === 0) return;
        const maxEnd = Math.max(...source.map((n) => n.start + n.duration));
        const minStart = Math.min(...source.map((n) => n.start));
        const offset = maxEnd - minStart;
        const dupes = source.map((n) => ({ ...n, id: crypto.randomUUID(), start: n.start + offset }));
        const dupeMaxEnd = Math.max(...dupes.map(n => n.start + n.duration));
        if (dupeMaxEnd > clipDuration && onClipResize) {
          onClipResize(clip.id, clip.start_beats + Math.ceil(dupeMaxEnd / beatsPerBar) * beatsPerBar);
        }
        onNotesChange(clip.id, [...notes, ...dupes]);
        setSelectedIds(new Set(dupes.map((n) => n.id)));
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "e") { e.preventDefault(); chopNotesOnGrid(); }
      if ((e.metaKey || e.ctrlKey) && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
        if (selectedIds.size === 0) return;
        onNotesChange(clip.id, quantizeNotes(notes, selectedIds, snapBeats, quantizeStrength / 100));
      }

      if ((e.key === "t" || e.key === "T") && !e.metaKey && !e.ctrlKey && selectedIds.size > 0) {
        e.preventDefault(); setShowTranspose(true);
      }
      if ((e.key === "h" || e.key === "H") && !e.metaKey && !e.ctrlKey && selectedIds.size > 0) {
        e.preventDefault();
        onNotesChange(clip.id, humanizeNotes(notes, selectedIds));
      }

      // Arrow keys
      if (e.key.startsWith("Arrow") && selectedIds.size > 0 && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const step = e.shiftKey ? beatsPerBar : snapBeats;
        const pitchStep = e.shiftKey ? 12 : 1;
        const updated = notes.map((n) => {
          if (!selectedIds.has(n.id)) return n;
          switch (e.key) {
            case "ArrowRight": return { ...n, start: Math.max(0, n.start + step) };
            case "ArrowLeft": return { ...n, start: Math.max(0, n.start - step) };
            case "ArrowUp": return { ...n, pitch: Math.min(MAX_PITCH, maybeLockPitch(n.pitch + pitchStep)) };
            case "ArrowDown": return { ...n, pitch: Math.max(MIN_PITCH, maybeLockPitch(n.pitch - pitchStep)) };
            default: return n;
          }
        });
        onNotesChange(clip.id, updated);
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          const firstSelected = updated.find((n) => selectedIds.has(n.id));
          if (firstSelected) playNote(firstSelected.pitch, firstSelected.velocity);
        }
      }

      if (!e.metaKey && !e.ctrlKey) {
        if (e.key === "1") setTool("select");
        if (e.key === "2") setTool("draw");
        if (e.key === "3") setTool("paint");
        if (e.key === "4") setTool("erase");
        if (e.key === "b" || e.key === "B") setTool("paint");
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "e" || e.key === "E") setSplitMode(false);
    };

    el.addEventListener("keydown", handleKeyDown);
    el.addEventListener("keyup", handleKeyUp);
    return () => { el.removeEventListener("keydown", handleKeyDown); el.removeEventListener("keyup", handleKeyUp); };
  }, [notes, clip.id, clip.start_beats, selectedIds, onNotesChange, clipDuration, beatsPerBar, snapBeats, onClipResize, chopNotesOnGrid, snap, globalBeat, playNote, quantizeStrength, maybeLockPitch, setSplitMode, setShowTranspose, setTool]);

  /* ── Computed ── */
  const displayClipDuration = useMemo(() => {
    const base = clipExtendDelta === 0 ? clipDuration : Math.max(beatsPerBar, clipDuration + clipExtendDelta / pxPerBeat);
    // Always show at least 1 extra bar so user can draw beyond current clip end
    return base + beatsPerBar;
  }, [clipDuration, clipExtendDelta, beatsPerBar, pxPerBeat]);

  const applyTransform = useCallback((fn: (notes: MidiNote[], ids: Set<string>) => MidiNote[]) => {
    if (selectedIds.size === 0) return;
    onNotesChange(clip.id, fn(notes, selectedIds));
  }, [notes, clip.id, selectedIds, onNotesChange]);

  const handleTranspose = useCallback((transposeSemitones: number, transposeOctaves: number) => {
    const total = transposeSemitones + transposeOctaves * 12;
    if (total === 0 || selectedIds.size === 0) return;
    onNotesChange(clip.id, transposeNotes(notes, selectedIds, total));
  }, [notes, clip.id, selectedIds, onNotesChange]);

  const handleMinimapScroll = useCallback((fraction: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = fraction * (scrollRef.current.scrollWidth - scrollRef.current.clientWidth);
    }
  }, []);

  const currentCCPoints = useMemo(() => {
    if (ccLaneType === "cc1") return ccData["1"] || [];
    if (ccLaneType === "cc11") return ccData["11"] || [];
    if (ccLaneType === "pitchBend") return pitchBendData;
    return [];
  }, [ccLaneType, ccData, pitchBendData]);

  const ccLaneConfig = useMemo(() => {
    if (ccLaneType === "pitchBend") return { min: -8192, max: 8191, defaultValue: 0, label: "PITCH BEND" };
    if (ccLaneType === "cc1") return { min: 0, max: 127, defaultValue: 0, label: "CC1 MOD" };
    if (ccLaneType === "cc11") return { min: 0, max: 127, defaultValue: 0, label: "CC11 EXPR" };
    return null;
  }, [ccLaneType]);

  /* ── Velocity lane callbacks ── */
  const handleVelNotesChange = useCallback((updatedNotes: MidiNote[]) => {
    onNotesChange(clip.id, updatedNotes);
  }, [clip.id, onNotesChange]);

  const handleVelSelectNote = useCallback((noteId: string) => {
    setSelectedIds(new Set([noteId]));
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(notes.map(n => n.id)));
  }, [notes]);

  const deselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const deleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    onNotesChange(clip.id, notes.filter(n => !selectedIds.has(n.id)));
    setSelectedIds(new Set());
  }, [notes, clip.id, selectedIds, onNotesChange]);

  const copySelected = useCallback(() => {
    const selected = notes.filter(n => selectedIds.has(n.id));
    if (selected.length === 0) return;
    const minStart = Math.min(...selected.map(n => n.start));
    clipboardRef.current = selected.map(n => ({ ...n, start: n.start - minStart }));
  }, [notes, selectedIds]);

  const cutSelected = useCallback(() => {
    copySelected();
    deleteSelected();
  }, [copySelected, deleteSelected]);

  const pasteNotes = useCallback(() => {
    if (clipboardRef.current.length === 0) return;
    let pasteAt = 0;
    if (globalBeat !== undefined) pasteAt = Math.max(0, globalBeat - clip.start_beats);
    else if (selectedIds.size > 0) {
      const selNotes = notes.filter(n => selectedIds.has(n.id));
      pasteAt = Math.max(...selNotes.map(n => n.start + n.duration));
    }
    pasteAt = snap(pasteAt);
    const pasted = clipboardRef.current.map(n => ({ ...n, id: crypto.randomUUID(), start: n.start + pasteAt }));
    const pasteMaxEnd = Math.max(...pasted.map(n => n.start + n.duration));
    if (pasteMaxEnd > clipDuration && onClipResize) {
      onClipResize(clip.id, clip.start_beats + Math.ceil(pasteMaxEnd / beatsPerBar) * beatsPerBar);
    }
    onNotesChange(clip.id, [...notes, ...pasted]);
    setSelectedIds(new Set(pasted.map(n => n.id)));
  }, [notes, clip, selectedIds, globalBeat, snap, clipDuration, beatsPerBar, onClipResize, onNotesChange]);

  const hasClipboard = clipboardRef.current.length > 0;

  return {
    // Refs
    canvasRef,
    scrollRef,
    containerRef,
    // State
    selectedIds,
    setSelectedIds,
    marquee,
    dragDelta,
    clipExtendDelta,
    // Derived
    scaleIntervals,
    visiblePitches,
    clipDuration,
    pitchToRow,
    notes,
    ccData,
    pitchBendData,
    displayClipDuration,
    currentCCPoints,
    ccLaneConfig,
    // Handlers
    handleCanvasPointerDown,
    handleCanvasPointerMove,
    handleCanvasPointerUp,
    handleClipExtendDown,
    handleClipExtendMove,
    handleClipExtendUp,
    handleCCChange,
    applyTransform,
    handleTranspose,
    handleMinimapScroll,
    handleVelNotesChange,
    handleVelSelectNote,
    snap,
    // Context menu actions
    selectAll,
    deselectAll,
    deleteSelected,
    copySelected,
    cutSelected,
    pasteNotes,
    hasClipboard,
  };
}
