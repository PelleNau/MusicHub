import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface StudioInfoItem {
  title: string;
  desc: string;
}

interface StudioInfoContextValue {
  hoveredInfo: StudioInfoItem | null;
  setHoveredInfo: (info: StudioInfoItem | null) => void;
}

const StudioInfoContext = createContext<StudioInfoContextValue>({
  hoveredInfo: null,
  setHoveredInfo: () => {},
});

export function StudioInfoProvider({ children }: { children: ReactNode }) {
  const [hoveredInfo, setHoveredInfo] = useState<StudioInfoItem | null>(null);
  return (
    <StudioInfoContext.Provider value={{ hoveredInfo, setHoveredInfo }}>
      {children}
    </StudioInfoContext.Provider>
  );
}

export function useStudioInfo() {
  return useContext(StudioInfoContext);
}

/** Convenience: returns onMouseEnter/onMouseLeave props for a given info item */
export function useInfoHover(info: StudioInfoItem) {
  const { setHoveredInfo } = useStudioInfo();
  return {
    onMouseEnter: () => setHoveredInfo(info),
    onMouseLeave: () => setHoveredInfo(null),
  };
}

/** Static info descriptions for Studio UI elements */
export const STUDIO_INFO: Record<string, StudioInfoItem> = {
  // Transport
  play: { title: "Play", desc: "Start playback from the current position. Shortcut: Space" },
  pause: { title: "Pause", desc: "Pause playback, keeping the current position." },
  stop: { title: "Return to Start", desc: "Stop playback and return the playhead to the beginning." },
  record: { title: "Record", desc: "Arm recording. In Connected mode, records audio/MIDI from the host." },
  loop: { title: "Loop", desc: "Toggle loop playback within the loop region. Shortcut: ⌘L" },
  tempo: { title: "Tempo", desc: "Set the project tempo in beats per minute (BPM). Click to type a value." },
  timeSig: { title: "Time Signature", desc: "The meter of the project — how many beats per bar." },
  position: { title: "Position", desc: "Current playhead position displayed as Bar.Beat.Sub." },
  undo: { title: "Undo", desc: "Undo the last action. Shortcut: ⌘Z" },
  redo: { title: "Redo", desc: "Redo the last undone action. Shortcut: ⌘⇧Z" },
  // Tracks
  mute: { title: "Mute (M)", desc: "Silence this track's output. Other tracks continue playing." },
  solo: { title: "Solo (S)", desc: "Listen to this track in isolation. All non-soloed tracks are muted." },
  arm: { title: "Record Arm (R)", desc: "Arm this track for recording incoming audio or MIDI." },
  volume: { title: "Volume Fader", desc: "Adjust the track's output level. Double-click to type an exact dB value." },
  pan: { title: "Pan", desc: "Position the track in the stereo field. Double-click to center." },
  trackName: { title: "Track Name", desc: "Double-click to rename this track." },
  // Mixer
  masterFader: { title: "Master Fader", desc: "Controls the final output level of the mix. Unity gain is 0 dB." },
  masterMeter: { title: "Master Meter", desc: "Shows peak and RMS levels of the master output." },
  sends: { title: "Send Levels", desc: "Route a portion of this track's signal to a return track for parallel processing." },
  inserts: { title: "Insert Effects", desc: "Audio effects inserted directly in this track's signal chain." },
  eqThumb: { title: "EQ Display", desc: "Thumbnail preview of this track's EQ curve." },
  io: { title: "Input / Output", desc: "Configure the track's audio input source and output routing." },
  // Bottom tabs
  tabEditorDetail: { title: "Detail Panel", desc: "View the device chain for the selected track. Shortcut: click a track header." },
  tabEditorPiano: { title: "Piano Roll", desc: "Edit MIDI notes for the selected clip. Click a MIDI clip to open." },
  tabMixer: { title: "Mixer", desc: "Open the console-style mixer view with faders, pan, sends, and metering. Shortcut: ⌘M" },
  // General
  arrangement: { title: "Arrangement", desc: "The main timeline where you arrange clips across tracks. Scroll to navigate, pinch/⌘+scroll to zoom." },
  // Status bar items
  trackCount: { title: "Track Count", desc: "Total number of tracks in this session." },
  barCount: { title: "Bar Count", desc: "Total number of bars in the arrangement." },
  bpmDisplay: { title: "Tempo (BPM)", desc: "The current project tempo in beats per minute." },
  gridDisplay: { title: "Grid Division", desc: "Current grid quantize resolution. Use ⌘1/⌘2 to narrow/widen, ⌘3 for triplet mode." },
  snap: { title: "Snap", desc: "When enabled, clips and notes snap to the grid division. Shortcut: ⌘4" },
  zoomH: { title: "Horizontal Zoom", desc: "Adjust the timeline zoom level (pixels per beat). Use Z to toggle zoom-to-fit." },
  addTrack: { title: "Add Track", desc: "Create a new audio, MIDI, or return track in the session." },
};
