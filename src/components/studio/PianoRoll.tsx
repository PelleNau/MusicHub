import { useMemo, useCallback } from "react";
import {
  Pencil, Eraser, MousePointer, Music, X, Paintbrush, Scissors,
  Lock, FoldVertical, ArrowUpDown, Palette, ZoomIn, ZoomOut,
  ChevronDown, Grip, Layers
} from "lucide-react";
import {
  ContextMenu, ContextMenuContent, ContextMenuItem,
  ContextMenuSeparator, ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { SessionClip } from "@/types/studio";
import {
  quantizeNotes, swingQuantize, legatoNotes, strumNotes, flamNotes,
  reverseNotes, invertNotes, humanizeNotes, noteColor,
  type NoteColorMode, type MidiNote,
} from "@/components/studio/PianoRollTransforms";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub,
  DropdownMenuSubContent, DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CCLane, type CCPoint } from "@/components/studio/CCLane";
import { ChordPalette, type ChordType } from "@/components/studio/ChordPalette";
import { ChordDetector } from "@/components/studio/ChordDetector";
import { PianoRollMinimap } from "@/components/studio/PianoRollMinimap";
import { StepSequencer } from "@/components/studio/StepSequencer";
import { extractMidiNotesFromData } from "@/domain/studio/studioMidiCommandProtocol";

// Refactored sub-components
import {
  SCALES, ROOT_NOTES, SNAP_OPTIONS, NOTE_LENGTH_OPTIONS, CC_LANE_OPTIONS,
  MIN_PITCH, MAX_PITCH, PIANO_WIDTH, RULER_HEIGHT, CC_LANE_HEIGHT,
  CLIP_EXTEND_HANDLE_W,
  MIN_PX_PER_BEAT, MAX_PX_PER_BEAT, MIN_KEY_HEIGHT, MAX_KEY_HEIGHT,
  noteName, isBlackKey, isInScale,
  type Tool,
} from "@/components/studio/pianoroll/constants";
import { PianoRollKeyboard } from "@/components/studio/pianoroll/PianoRollKeyboard";
import { PianoRollGrid } from "@/components/studio/pianoroll/PianoRollGrid";
import { PianoRollNotes } from "@/components/studio/pianoroll/PianoRollNotes";
import { PianoRollVelocityLane } from "@/components/studio/pianoroll/PianoRollVelocityLane";
import { usePianoRollToolbar } from "@/components/studio/pianoroll/usePianoRollToolbar";
import { usePianoRollInteractions } from "@/components/studio/pianoroll/usePianoRollInteractions";

export type { MidiNote } from "@/components/studio/PianoRollTransforms";

interface PianoRollProps {
  clip: SessionClip;
  onNotesChange: (clipId: string, notes: MidiNote[]) => void;
  onClipResize?: (clipId: string, newEndBeats: number) => void;
  onClose?: () => void;
  ghostNotes?: MidiNote[];
  beatsPerBar?: number;
  snapBeats?: number;
  currentBeat?: number;
  allClips?: SessionClip[];
  activeClipId?: string;
  onSelectClip?: (clipId: string) => void;
  onMidiDataChange?: (clipId: string, midiData: unknown) => void;
  /** Connected mode: route note audition through native MIDI */
  onNativeNote?: (pitch: number, velocity: number) => void;
  captureVariant?: "figma" | null;
}

export function PianoRoll({
  clip,
  onNotesChange,
  onClipResize,
  onClose,
  ghostNotes = [],
  beatsPerBar = 4,
  snapBeats: externalSnap = 0.25,
  currentBeat: globalBeat,
  allClips,
  activeClipId,
  onSelectClip,
  onMidiDataChange,
  onNativeNote,
  captureVariant = null,
}: PianoRollProps) {
  const toolbar = usePianoRollToolbar(externalSnap);

  const ix = usePianoRollInteractions({
    clip,
    onNotesChange,
    onClipResize,
    onMidiDataChange,
    beatsPerBar,
    globalBeat,
    onNativeNote,
    tool: toolbar.tool,
    snapBeats: toolbar.snapBeats,
    scaleName: toolbar.scaleName,
    rootNote: toolbar.rootNote,
    splitMode: toolbar.splitMode,
    setSplitMode: toolbar.setSplitMode,
    scaleLock: toolbar.scaleLock,
    foldKeyboard: toolbar.foldKeyboard,
    drawDuration: toolbar.drawDuration,
    quantizeStrength: toolbar.quantizeStrength,
    activeChord: toolbar.activeChord,
    pxPerBeat: toolbar.pxPerBeat,
    keyHeight: toolbar.keyHeight,
    ccLaneType: toolbar.ccLaneType,
    setShowTranspose: toolbar.setShowTranspose,
    setTool: toolbar.setTool,
  });

  const { notes, visiblePitches, scaleIntervals, clipDuration, displayClipDuration, pitchToRow } = ix;
  const { pxPerBeat, keyHeight, tool, splitMode, noteColorMode } = toolbar;
  const compactCapture = captureVariant === "figma";

  const gridHeight = visiblePitches.length * keyHeight;
  const displayTotalWidth = displayClipDuration * pxPerBeat;
  const isTripletSnap = toolbar.snapBeats === 2/3 || toolbar.snapBeats === 1/3 || toolbar.snapBeats === 1/6;

  /* ── Zoom via wheel ── */
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.metaKey || e.ctrlKey) {
      e.preventDefault();
      if (e.altKey) {
        toolbar.setKeyHeight(Math.max(MIN_KEY_HEIGHT, Math.min(MAX_KEY_HEIGHT, keyHeight - Math.sign(e.deltaY) * 2)));
      } else {
        toolbar.setPxPerBeat(Math.max(MIN_PX_PER_BEAT, Math.min(MAX_PX_PER_BEAT, pxPerBeat * (e.deltaY > 0 ? 0.85 : 1.18))));
      }
    }
  }, [keyHeight, pxPerBeat, toolbar]);

  const multiClipGhosts = useMemo(() => {
    if (!allClips || !activeClipId) return ghostNotes;
    const otherClipNotes = allClips
      .filter(c => c.id !== activeClipId && c.is_midi && c.midi_data)
      .flatMap(c =>
        extractMidiNotesFromData(c.midi_data).map(n => ({
          ...n,
          start: n.start + (c.start_beats - clip.start_beats),
        })),
      );
    return [...ghostNotes, ...otherClipNotes];
  }, [allClips, activeClipId, ghostNotes, clip.start_beats]);

  // Step sequencer view
  if (toolbar.viewMode === "stepseq") {
    return (
      <div ref={ix.containerRef} className="h-full flex flex-col focus:outline-none" tabIndex={0}>
        <div className="flex items-center gap-1 px-3 py-1 border-b shrink-0" style={{ borderColor: "hsl(var(--border))" }}>
          <span className="text-[10px] font-mono font-semibold text-foreground/80 mr-1 truncate max-w-[120px]">{clip.name}</span>
          <div className="w-px h-3 bg-border mx-1" />
          <button onClick={() => toolbar.setViewMode("pianoroll")} className="h-5 px-1.5 rounded-[3px] text-[8px] font-mono text-foreground/55 hover:text-foreground/80 hover:bg-foreground/[0.08] transition-colors">Piano Roll</button>
          <button className="h-5 px-1.5 rounded-[3px] text-[8px] font-mono bg-primary/20 text-primary">
            <Grip className="h-2.5 w-2.5 inline mr-0.5" /> Step Seq
          </button>
          {onClose && <button onClick={onClose} className="ml-auto text-foreground/40 hover:text-foreground/70 transition-colors"><X className="h-3.5 w-3.5" /></button>}
        </div>
        <StepSequencer notes={notes} onChange={(newNotes) => onNotesChange(clip.id, newNotes)} clipDuration={clipDuration} snapBeats={toolbar.snapBeats} beatsPerBar={beatsPerBar} pxPerBeat={pxPerBeat} currentBeat={globalBeat !== undefined ? globalBeat - clip.start_beats : undefined} />
      </div>
    );
  }

  return (
    <div ref={ix.containerRef} className="h-full flex flex-col focus:outline-none bg-card" tabIndex={0} onWheel={handleWheel}>
      {/* Multi-clip tabs */}
      {allClips && allClips.length > 1 && (
        <div className="flex items-center gap-0.5 px-3 py-0.5 border-b shrink-0" style={{ borderColor: "hsl(var(--foreground) / 0.06)", backgroundColor: "hsl(var(--muted) / 0.55)" }}>
          <Layers className="h-2.5 w-2.5 text-foreground/40 mr-1" />
          {allClips.filter(c => c.is_midi).map((c) => (
            <button key={c.id} onClick={() => onSelectClip?.(c.id)} className={`h-4 px-2 rounded text-[7px] font-mono transition-colors ${c.id === activeClipId ? "bg-primary/20 text-primary" : "text-foreground/50 hover:text-foreground/70 hover:bg-foreground/[0.08]"}`}>{c.name}</button>
          ))}
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-1 px-3 py-1 border-b shrink-0 flex-wrap" style={{ borderColor: "hsl(var(--border))" }}>
        {compactCapture ? (
          <>
            <span className="text-[12px] font-semibold text-white/92">Piano Roll</span>
            <span className="text-[12px] text-white/42">•</span>
            <span className="text-[12px] text-white/52">{clip.name}</span>
            <div className="ml-auto flex items-center gap-3 text-white/58">
              <ZoomOut className="h-4 w-4" />
              <ZoomIn className="h-4 w-4" />
              <span className="text-[12px] font-medium text-[#4f8df5]">Snap</span>
              <span className="text-[12px] text-white/72">1/4</span>
              <ArrowUpDown className="h-4 w-4" />
              {onClose && <X className="h-4 w-4 cursor-pointer" onClick={onClose} />}
            </div>
          </>
        ) : (
          <>
        <span className="text-[10px] font-mono font-semibold text-foreground/80 mr-1 truncate max-w-[120px]">{clip.name}</span>
        <span className="text-[8px] font-mono text-foreground/45 mr-2">{Math.ceil(clipDuration / beatsPerBar)} bars</span>

        {([
          { t: "select" as Tool, icon: MousePointer, label: "1", tip: "Select" },
          { t: "draw" as Tool, icon: Pencil, label: "2", tip: "Draw" },
          { t: "paint" as Tool, icon: Paintbrush, label: "3/B", tip: "Paint" },
          { t: "erase" as Tool, icon: Eraser, label: "4", tip: "Erase" },
        ]).map(({ t, icon: Icon, label, tip }) => (
          <button key={t} onClick={() => toolbar.setTool(t)} className={`h-5 px-1.5 flex items-center gap-0.5 rounded-[3px] text-[8px] font-mono transition-colors ${tool === t ? "bg-primary/20 text-primary" : "text-foreground/55 hover:text-foreground/80 hover:bg-foreground/[0.08]"}`} title={`${tip} (${label})`}>
            <Icon className="h-2.5 w-2.5" />
          </button>
        ))}

        {splitMode && <span className="h-5 px-1.5 flex items-center gap-0.5 rounded-[3px] text-[8px] font-mono bg-orange-500/20 text-orange-400"><Scissors className="h-2.5 w-2.5" /> Split</span>}

        <div className="w-px h-3 bg-border mx-1" />

        <span className="text-[7px] font-mono text-foreground/50 mr-0.5">SNAP</span>
        <select value={toolbar.snapBeats} onChange={(e) => toolbar.setSnapBeats(parseFloat(e.target.value))} className="h-5 text-[8px] font-mono bg-foreground/[0.08] text-foreground/70 border border-foreground/15 rounded px-1 outline-none">
          {SNAP_OPTIONS.map((o) => <option key={o.label} value={o.value}>{o.label}</option>)}
        </select>

        <span className="text-[7px] font-mono text-foreground/50 mr-0.5 ml-1">LEN</span>
        <select value={toolbar.noteLengthPreset} onChange={(e) => toolbar.setNoteLengthPreset(parseFloat(e.target.value))} className="h-5 text-[8px] font-mono bg-foreground/[0.08] text-foreground/70 border border-foreground/15 rounded px-1 outline-none">
          {NOTE_LENGTH_OPTIONS.map((o) => <option key={o.label} value={o.value}>{o.label}</option>)}
        </select>

        <Popover>
          <PopoverTrigger asChild>
            <button className={`h-5 px-1.5 rounded-[3px] text-[8px] font-mono transition-colors ${toolbar.swingAmount > 0 ? "bg-primary/20 text-primary" : "text-foreground/55 hover:text-foreground/80 hover:bg-foreground/[0.08]"}`} title="Swing">SW {toolbar.swingAmount}%</button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-3" side="bottom" align="start">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-foreground/60"><span>Swing</span><span>{toolbar.swingAmount}%</span></div>
              <Slider value={[toolbar.swingAmount]} onValueChange={([v]) => toolbar.setSwingAmount(v)} min={0} max={100} step={5} className="w-full" />
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-3 bg-border mx-1" />

        <Music className="h-2.5 w-2.5 text-foreground/45" />
        <select value={toolbar.rootNote} onChange={(e) => toolbar.setRootNote(parseInt(e.target.value))} className="h-5 text-[8px] font-mono bg-foreground/[0.08] text-foreground/70 border border-foreground/15 rounded px-1 outline-none w-9">
          {ROOT_NOTES.map((n, i) => <option key={i} value={i}>{n}</option>)}
        </select>
        <select value={toolbar.scaleName} onChange={(e) => toolbar.setScaleName(e.target.value)} className="h-5 text-[8px] font-mono bg-foreground/[0.08] text-foreground/70 border border-foreground/15 rounded px-1 outline-none">
          {Object.keys(SCALES).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <button onClick={() => toolbar.setScaleLock(!toolbar.scaleLock)} className={`h-5 px-1 rounded-[3px] text-[8px] font-mono transition-colors ${toolbar.scaleLock ? "bg-primary/20 text-primary" : "text-foreground/55 hover:text-foreground/80 hover:bg-foreground/[0.08]"}`} title="Scale Lock">
          <Lock className="h-2.5 w-2.5" />
        </button>

        <button
          onClick={() => { if (toolbar.scaleName !== "Chromatic") toolbar.setFoldKeyboard(!toolbar.foldKeyboard); }}
          disabled={toolbar.scaleName === "Chromatic"}
          className={`h-5 px-1 rounded-[3px] text-[8px] font-mono transition-colors ${toolbar.scaleName === "Chromatic" ? "text-foreground/30 cursor-not-allowed" : toolbar.foldKeyboard ? "bg-primary/20 text-primary" : "text-foreground/55 hover:text-foreground/80 hover:bg-foreground/[0.08]"}`}
          title={toolbar.scaleName === "Chromatic" ? "Select a scale first to fold keyboard" : "Fold Keyboard"}
        >
          <FoldVertical className="h-2.5 w-2.5" />
        </button>

        <div className="w-px h-3 bg-border mx-1" />

        <ChordPalette activeChord={toolbar.activeChord} onSelectChord={toolbar.setActiveChord}>
          <button className={`h-5 px-1.5 rounded-[3px] text-[8px] font-mono transition-colors ${toolbar.activeChord ? "bg-primary/20 text-primary" : "text-foreground/55 hover:text-foreground/80 hover:bg-foreground/[0.08]"}`} title="Chord Stamp">
            {toolbar.activeChord ? `♫ ${toolbar.activeChord.name}` : "♫ Chord"}
          </button>
        </ChordPalette>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="h-5 px-1.5 flex items-center gap-0.5 rounded-[3px] text-[8px] font-mono text-foreground/55 hover:text-foreground/80 hover:bg-foreground/[0.08] transition-colors">Transform <ChevronDown className="h-2 w-2" /></button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[160px]">
            <DropdownMenuItem disabled={ix.selectedIds.size === 0} onClick={() => toolbar.setShowTranspose(true)}>
              <ArrowUpDown className="h-3 w-3 mr-2" /> Transpose… <span className="ml-auto text-foreground/50 text-[9px]">T</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={ix.selectedIds.size === 0} onClick={() => ix.applyTransform((n, ids) => quantizeNotes(n, ids, toolbar.snapBeats, toolbar.quantizeStrength / 100))}>
              Quantize <span className="ml-auto text-foreground/50 text-[9px]">⌘U</span>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-xs">Quantize Strength</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="p-3 w-40">
                <div className="flex items-center justify-between text-[10px] font-mono text-foreground/60 mb-2"><span>Strength</span><span>{toolbar.quantizeStrength}%</span></div>
                <Slider value={[toolbar.quantizeStrength]} onValueChange={([v]) => toolbar.setQuantizeStrength(v)} min={10} max={100} step={5} />
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            {toolbar.swingAmount > 0 && <DropdownMenuItem disabled={ix.selectedIds.size === 0} onClick={() => ix.applyTransform((n, ids) => swingQuantize(n, ids, toolbar.snapBeats, toolbar.swingAmount))}>Swing Quantize</DropdownMenuItem>}
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={ix.selectedIds.size < 2} onClick={() => ix.applyTransform(legatoNotes)}>Legato</DropdownMenuItem>
            <DropdownMenuItem disabled={ix.selectedIds.size < 2} onClick={() => ix.applyTransform(strumNotes)}>Strum</DropdownMenuItem>
            <DropdownMenuItem disabled={ix.selectedIds.size === 0} onClick={() => ix.applyTransform(flamNotes)}>Flam</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={ix.selectedIds.size < 2} onClick={() => ix.applyTransform(reverseNotes)}>Reverse</DropdownMenuItem>
            <DropdownMenuItem disabled={ix.selectedIds.size < 2} onClick={() => ix.applyTransform(invertNotes)}>Invert</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled={ix.selectedIds.size === 0} onClick={() => ix.applyTransform(humanizeNotes)}>Humanize <span className="ml-auto text-foreground/50 text-[9px]">H</span></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={`h-5 px-1 rounded-[3px] text-[8px] font-mono transition-colors ${noteColorMode !== "default" ? "bg-primary/20 text-primary" : "text-foreground/55 hover:text-foreground/80 hover:bg-foreground/[0.08]"}`} title="Note Color Mode">
              <Palette className="h-2.5 w-2.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-[120px]">
            {(["default", "velocity", "pitch"] as NoteColorMode[]).map((mode) => (
              <DropdownMenuItem key={mode} onClick={() => toolbar.setNoteColorMode(mode)} className={noteColorMode === mode ? "bg-accent" : ""}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <select value={toolbar.ccLaneType} onChange={(e) => toolbar.setCcLaneType(e.target.value as typeof toolbar.ccLaneType)} className="h-5 text-[8px] font-mono bg-foreground/[0.08] text-foreground/70 border border-foreground/15 rounded px-1 outline-none ml-1">
          {CC_LANE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <button onClick={() => toolbar.setViewMode("stepseq")} className="h-5 px-1.5 rounded-[3px] text-[8px] font-mono text-foreground/55 hover:text-foreground/80 hover:bg-foreground/[0.08] transition-colors ml-1" title="Step Sequencer">
          <Grip className="h-2.5 w-2.5" />
        </button>

        <div className="flex items-center gap-0.5 ml-1">
          <button onClick={() => toolbar.setPxPerBeat(Math.min(MAX_PX_PER_BEAT, pxPerBeat * 1.25))} className="h-5 px-0.5 text-foreground/55 hover:text-foreground/80 transition-colors" title="Zoom in horizontal"><ZoomIn className="h-2.5 w-2.5" /></button>
          <button onClick={() => toolbar.setPxPerBeat(Math.max(MIN_PX_PER_BEAT, pxPerBeat * 0.8))} className="h-5 px-0.5 text-foreground/55 hover:text-foreground/80 transition-colors" title="Zoom out horizontal"><ZoomOut className="h-2.5 w-2.5" /></button>
          <span className="text-[7px] font-mono text-foreground/40 mx-0.5">V</span>
          <button onClick={() => toolbar.setKeyHeight(Math.min(MAX_KEY_HEIGHT, keyHeight + 2))} className="h-5 px-0.5 text-foreground/55 hover:text-foreground/80 transition-colors" title="Zoom in vertical"><ZoomIn className="h-2.5 w-2.5" /></button>
          <button onClick={() => toolbar.setKeyHeight(Math.max(MIN_KEY_HEIGHT, keyHeight - 2))} className="h-5 px-0.5 text-foreground/55 hover:text-foreground/80 transition-colors" title="Zoom out vertical"><ZoomOut className="h-2.5 w-2.5" /></button>
        </div>

        {ix.selectedIds.size > 0 && <div className="ml-auto flex items-center gap-2"><span className="text-[8px] font-mono text-foreground/50">{ix.selectedIds.size} selected</span></div>}
        {onClose && <button onClick={onClose} className="ml-auto text-foreground/40 hover:text-foreground/70 transition-colors"><X className="h-3.5 w-3.5" /></button>}
          </>
        )}
      </div>

      {/* Minimap */}
      {compactCapture ? null : (
        <PianoRollMinimap notes={notes} clipDuration={clipDuration} minPitch={MIN_PITCH} maxPitch={MAX_PITCH} width={displayTotalWidth + PIANO_WIDTH} scrollLeft={ix.scrollRef.current?.scrollLeft ?? 0} viewportWidth={ix.scrollRef.current?.clientWidth ?? 400} totalContentWidth={displayTotalWidth + PIANO_WIDTH} onScrollTo={ix.handleMinimapScroll} />
      )}

      {/* ── Main grid area ── */}
      <div ref={ix.scrollRef} className="flex-1 overflow-auto min-h-0 relative">
        <div className="flex flex-col">
          <div className="flex">
            {/* Piano keys */}
            <PianoRollKeyboard visiblePitches={visiblePitches} keyHeight={keyHeight} rootNote={toolbar.rootNote} scaleIntervals={scaleIntervals} scaleName={toolbar.scaleName} chordLaneVisible={notes.length >= 3} />

            {/* Grid column */}
            <ContextMenu>
              <ContextMenuTrigger asChild>
            <div className="flex flex-col relative" style={{ width: displayTotalWidth }}>
              {/* Chord detector */}
              {notes.length >= 3 && <ChordDetector notes={notes} clipDuration={clipDuration} pxPerBeat={pxPerBeat} snapBeats={toolbar.snapBeats} beatsPerBar={beatsPerBar} width={displayTotalWidth} />}

              {/* Bar ruler */}
              <div className="sticky top-0 z-10 shrink-0 relative" style={{ height: RULER_HEIGHT, backgroundColor: "hsl(var(--muted) / 0.55)", borderBottom: "1px solid hsl(var(--foreground) / 0.1)" }}>
                {Array.from({ length: Math.ceil(displayClipDuration / beatsPerBar) + 1 }, (_, i) => {
                  const x = i * beatsPerBar * pxPerBeat;
                  return (
                    <div key={i} className="absolute top-0 bottom-0 pointer-events-none" style={{ left: x }}>
                      <div className="h-full border-l border-foreground/15" />
                      <span className="absolute top-[2px] left-1 text-[8px] font-mono text-foreground/60 select-none font-semibold">{i + 1}</span>
                    </div>
                  );
                })}
                {Array.from({ length: Math.ceil(displayClipDuration) + 1 }, (_, i) => {
                  if (i % beatsPerBar === 0) return null;
                  const x = i * pxPerBeat;
                  const beatInBar = (i % beatsPerBar) + 1;
                  return (
                    <div key={`bt${i}`} className="absolute top-0 bottom-0 pointer-events-none" style={{ left: x }}>
                      <div className="absolute bottom-0" style={{ height: "50%", borderLeft: "1px solid hsl(var(--foreground) / 0.08)" }} />
                      <span className="absolute bottom-[3px] left-0.5 text-[6px] font-mono text-foreground/35 select-none">.{beatInBar}</span>
                    </div>
                  );
                })}
                {pxPerBeat >= 32 && !isTripletSnap && Array.from({ length: Math.ceil(displayClipDuration * 4) + 1 }, (_, i) => {
                  const beat = i * 0.25;
                  if (Math.abs(beat % 1) < 0.001 || beat > displayClipDuration) return null;
                  return <div key={`sub${i}`} className="absolute bottom-0 pointer-events-none" style={{ left: beat * pxPerBeat, height: "25%", borderLeft: "1px solid hsl(var(--foreground) / 0.04)" }} />;
                })}
                {pxPerBeat >= 32 && isTripletSnap && Array.from({ length: Math.ceil(displayClipDuration * 3) + 1 }, (_, i) => {
                  const beat = i / 3;
                  if (Math.abs(beat % 1) < 0.001 || beat > displayClipDuration) return null;
                  return <div key={`tri${i}`} className="absolute bottom-0 pointer-events-none" style={{ left: beat * pxPerBeat, height: "25%", borderLeft: "1px solid hsl(var(--primary) / 0.16)" }} />;
                })}
                {ix.clipExtendDelta !== 0 && <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: clipDuration * pxPerBeat, borderLeft: "1px dashed hsl(var(--primary) / 0.4)" }} />}
              </div>

              {/* Note canvas */}
              <div ref={ix.canvasRef} className="relative" style={{ width: displayTotalWidth, height: gridHeight, cursor: splitMode ? "crosshair" : tool === "draw" ? "crosshair" : tool === "paint" ? "cell" : tool === "erase" ? "pointer" : "default", touchAction: "none" }}
                onPointerDown={ix.handleCanvasPointerDown} onPointerMove={ix.handleCanvasPointerMove} onPointerUp={ix.handleCanvasPointerUp}>

                <PianoRollGrid visiblePitches={visiblePitches} keyHeight={keyHeight} rootNote={toolbar.rootNote} scaleIntervals={scaleIntervals} scaleName={toolbar.scaleName} displayClipDuration={displayClipDuration} pxPerBeat={pxPerBeat} snapBeats={toolbar.snapBeats} beatsPerBar={beatsPerBar} isTripletSnap={isTripletSnap} clipDuration={clipDuration} clipExtendDelta={ix.clipExtendDelta} />

                <PianoRollNotes notes={notes} ghostNotes={multiClipGhosts} selectedIds={ix.selectedIds} pitchToRow={pitchToRow} keyHeight={keyHeight} pxPerBeat={pxPerBeat} snapBeats={toolbar.snapBeats} snap={ix.snap} noteColorMode={noteColorMode} dragDelta={ix.dragDelta} splitMode={splitMode} tool={tool} />

                {/* Marquee */}
                {ix.marquee && (
                  <div className="absolute pointer-events-none z-20" style={{
                    left: Math.min(ix.marquee.x0, ix.marquee.x1), top: Math.min(ix.marquee.y0, ix.marquee.y1),
                    width: Math.abs(ix.marquee.x1 - ix.marquee.x0), height: Math.abs(ix.marquee.y1 - ix.marquee.y0),
                    backgroundColor: "hsl(var(--primary) / 0.1)", border: "1px solid hsl(var(--primary) / 0.4)", borderRadius: 2,
                  }} />
                )}

                {/* Playhead */}
                {globalBeat !== undefined && (() => {
                  const localBeat = globalBeat - clip.start_beats;
                  if (localBeat < 0 || localBeat > displayClipDuration) return null;
                  return <div className="absolute top-0 bottom-0 w-px bg-primary z-30 pointer-events-none" style={{ left: localBeat * pxPerBeat }} />;
                })()}
              </div>

              {/* Velocity lane */}
              <PianoRollVelocityLane notes={notes} selectedIds={ix.selectedIds} pxPerBeat={pxPerBeat} noteColorMode={noteColorMode} onNotesChange={ix.handleVelNotesChange} onSelectNote={ix.handleVelSelectNote} />

              {/* CC lane */}
              {toolbar.ccLaneType !== "none" && ix.ccLaneConfig && (
                <CCLane points={ix.currentCCPoints} onChange={(points) => ix.handleCCChange(toolbar.ccLaneType, points)} label={ix.ccLaneConfig.label} min={ix.ccLaneConfig.min} max={ix.ccLaneConfig.max} defaultValue={ix.ccLaneConfig.defaultValue} width={displayTotalWidth} height={CC_LANE_HEIGHT} pxPerBeat={pxPerBeat} clipDuration={clipDuration} />
              )}

              {/* Clip extend handle */}
              {onClipResize && (
                <div className="absolute top-0 bottom-0 z-30 cursor-col-resize group" style={{ right: -CLIP_EXTEND_HANDLE_W / 2, width: CLIP_EXTEND_HANDLE_W }} onPointerDown={ix.handleClipExtendDown} onPointerMove={ix.handleClipExtendMove} onPointerUp={ix.handleClipExtendUp}>
                  <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 bg-foreground/10 group-hover:bg-primary/50 transition-colors" />
                </div>
              )}
            </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="min-w-[160px]">
                <ContextMenuItem onClick={ix.selectAll} className="text-xs font-mono">
                  Select All <span className="ml-auto text-foreground/40 text-[9px]">⌘A</span>
                </ContextMenuItem>
                <ContextMenuItem onClick={ix.deselectAll} disabled={ix.selectedIds.size === 0} className="text-xs font-mono">
                  Deselect
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem onClick={ix.cutSelected} disabled={ix.selectedIds.size === 0} className="text-xs font-mono">
                  Cut <span className="ml-auto text-foreground/40 text-[9px]">⌘X</span>
                </ContextMenuItem>
                <ContextMenuItem onClick={ix.copySelected} disabled={ix.selectedIds.size === 0} className="text-xs font-mono">
                  Copy <span className="ml-auto text-foreground/40 text-[9px]">⌘C</span>
                </ContextMenuItem>
                <ContextMenuItem onClick={ix.pasteNotes} disabled={!ix.hasClipboard} className="text-xs font-mono">
                  Paste <span className="ml-auto text-foreground/40 text-[9px]">⌘V</span>
                </ContextMenuItem>
                <ContextMenuItem onClick={ix.deleteSelected} disabled={ix.selectedIds.size === 0} className="text-xs font-mono text-destructive">
                  Delete <span className="ml-auto text-foreground/40 text-[9px]">⌫</span>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem disabled={ix.selectedIds.size === 0} onClick={() => ix.applyTransform((n, ids) => quantizeNotes(n, ids, toolbar.snapBeats, toolbar.quantizeStrength / 100))} className="text-xs font-mono">
                  Quantize <span className="ml-auto text-foreground/40 text-[9px]">⌘U</span>
                </ContextMenuItem>
                <ContextMenuItem disabled={ix.selectedIds.size === 0} onClick={() => ix.applyTransform(humanizeNotes)} className="text-xs font-mono">
                  Humanize <span className="ml-auto text-foreground/40 text-[9px]">H</span>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem disabled={ix.selectedIds.size < 2} onClick={() => ix.applyTransform(legatoNotes)} className="text-xs font-mono">
                  Legato
                </ContextMenuItem>
                <ContextMenuItem disabled={ix.selectedIds.size < 2} onClick={() => ix.applyTransform(reverseNotes)} className="text-xs font-mono">
                  Reverse
                </ContextMenuItem>
                <ContextMenuItem disabled={ix.selectedIds.size < 2} onClick={() => ix.applyTransform(invertNotes)} className="text-xs font-mono">
                  Invert
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-3 px-3 py-0.5 border-t shrink-0 text-[7px] font-mono text-foreground/45" style={{ borderColor: "hsl(var(--border))" }}>
        {compactCapture ? (
          <>
            <span className="text-white/58">Hide Velocity Lane</span>
            <span className="text-white/36">|</span>
            <span className="text-white/36">Right-click for operations</span>
            <span className="ml-auto text-white/34">{notes.length} total</span>
          </>
        ) : (
          <>
        <span>{notes.length} notes</span>
        <span>Snap: {SNAP_OPTIONS.find(o => Math.abs(o.value - toolbar.snapBeats) < 0.001)?.label ?? toolbar.snapBeats.toFixed(3)}</span>
        <span>Scale: {ROOT_NOTES[toolbar.rootNote]} {toolbar.scaleName}</span>
        {toolbar.scaleLock && <span className="text-primary/70">🔒 Locked</span>}
        {toolbar.foldKeyboard && <span className="text-primary/70">Folded</span>}
        {toolbar.swingAmount > 0 && <span>Swing: {toolbar.swingAmount}%</span>}
        {toolbar.activeChord && <span className="text-primary/70">♫ {toolbar.activeChord.name}</span>}
        <span>Zoom: {Math.round(pxPerBeat)}px/beat</span>
        <span className="ml-auto text-foreground/30">1 select · 2 draw · 3 paint · 4 erase · ←→↑↓ move · ⌫ delete · ⌘C/V copy/paste · ⌘D dup · ⌘U quantize · ⌘E chop · ⌘scroll zoom</span>
          </>
        )}
      </div>

      {/* Transpose dialog */}
      <Dialog open={toolbar.showTranspose} onOpenChange={toolbar.setShowTranspose}>
        <DialogContent className="max-w-[280px]">
          <DialogHeader><DialogTitle className="text-sm">Transpose</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-foreground/60"><span>Semitones</span><span className="font-mono">{toolbar.transposeSemitones > 0 ? "+" : ""}{toolbar.transposeSemitones}</span></div>
              <Slider value={[toolbar.transposeSemitones]} onValueChange={([v]) => toolbar.setTransposeSemitones(v)} min={-12} max={12} step={1} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-foreground/60"><span>Octaves</span><span className="font-mono">{toolbar.transposeOctaves > 0 ? "+" : ""}{toolbar.transposeOctaves}</span></div>
              <Slider value={[toolbar.transposeOctaves]} onValueChange={([v]) => toolbar.setTransposeOctaves(v)} min={-3} max={3} step={1} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => toolbar.setShowTranspose(false)}>Cancel</Button>
            <Button size="sm" onClick={() => { ix.handleTranspose(toolbar.transposeSemitones, toolbar.transposeOctaves); toolbar.setTransposeSemitones(0); toolbar.setTransposeOctaves(0); toolbar.setShowTranspose(false); }}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
