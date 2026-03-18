import { useState } from "react";
import type { NoteColorMode } from "@/components/studio/PianoRollTransforms";
import {
  DEFAULT_PX_PER_BEAT, DEFAULT_KEY_HEIGHT, DEFAULT_VELOCITY,
  MIN_PX_PER_BEAT, MAX_PX_PER_BEAT, MIN_KEY_HEIGHT, MAX_KEY_HEIGHT,
  type Tool, type ViewMode, type CCLaneType,
} from "./constants";
import type { ChordType } from "@/components/studio/ChordPalette";

export function usePianoRollToolbar(externalSnap: number) {
  const [tool, setTool] = useState<Tool>("draw");
  const [snapBeats, setSnapBeats] = useState(externalSnap);
  const [scaleName, setScaleName] = useState("Chromatic");
  const [rootNote, setRootNote] = useState(0);
  const [splitMode, setSplitMode] = useState(false);
  const [swingAmount, setSwingAmount] = useState(0);
  const [scaleLock, setScaleLock] = useState(false);
  const [foldKeyboard, setFoldKeyboard] = useState(false);
  const [showTranspose, setShowTranspose] = useState(false);
  const [transposeSemitones, setTransposeSemitones] = useState(0);
  const [transposeOctaves, setTransposeOctaves] = useState(0);
  const [noteColorMode, setNoteColorMode] = useState<NoteColorMode>("default");
  const [noteLengthPreset, setNoteLengthPreset] = useState(0);
  const [quantizeStrength, setQuantizeStrength] = useState(100);
  const [pxPerBeat, setPxPerBeat] = useState(DEFAULT_PX_PER_BEAT);
  const [keyHeight, setKeyHeight] = useState(DEFAULT_KEY_HEIGHT);
  const [ccLaneType, setCcLaneType] = useState<CCLaneType>("none");
  const [activeChord, setActiveChord] = useState<ChordType | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("pianoroll");

  const drawDuration = noteLengthPreset > 0 ? noteLengthPreset : snapBeats;

  return {
    tool, setTool,
    snapBeats, setSnapBeats,
    scaleName, setScaleName,
    rootNote, setRootNote,
    splitMode, setSplitMode,
    swingAmount, setSwingAmount,
    scaleLock, setScaleLock,
    foldKeyboard, setFoldKeyboard,
    showTranspose, setShowTranspose,
    transposeSemitones, setTransposeSemitones,
    transposeOctaves, setTransposeOctaves,
    noteColorMode, setNoteColorMode,
    noteLengthPreset, setNoteLengthPreset,
    quantizeStrength, setQuantizeStrength,
    pxPerBeat, setPxPerBeat,
    keyHeight, setKeyHeight,
    ccLaneType, setCcLaneType,
    activeChord, setActiveChord,
    viewMode, setViewMode,
    drawDuration,
  };
}
