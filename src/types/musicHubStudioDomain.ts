export type LayoutMode = "beginner" | "guided" | "pro";

export type TrackType = "midi" | "audio" | "group" | "return" | "master";

export type TrackRole = "standard" | "instrument" | "vocal" | "drum" | "bus";

export type ClipType = "midi" | "audio" | "pattern";

export type PanelType =
  | "browser"
  | "mixer"
  | "pianoRoll"
  | "timeline"
  | "detail"
  | "inspector"
  | "lesson";

export type AssetType =
  | "sample"
  | "loop"
  | "oneShot"
  | "midiPattern"
  | "preset"
  | "presetChain"
  | "template"
  | "lesson"
  | "projectStarter"
  | "tutorialSnippet";

export interface BeatRange {
  startBeat: number;
  endBeat: number;
}

export interface TimeSignaturePoint {
  atBeat: number;
  numerator: number;
  denominator: number;
}

export interface TempoPoint {
  atBeat: number;
  bpm: number;
}

export interface ArrangementMarker {
  id: string;
  name: string;
  startBeat: number;
  colorToken?: string;
}

export interface TransportSummary {
  playing: boolean;
  recording: boolean;
  bpm: number;
  beat: number;
  loopEnabled: boolean;
  loopStartBeat?: number;
  loopEndBeat?: number;
}

export interface TimelineModel {
  startBeat: number;
  endBeat: number;
  visibleStartBeat: number;
  visibleEndBeat: number;
  ruler: {
    timeSignatureMap: TimeSignaturePoint[];
    tempoMapSummary?: TempoPoint[];
    arrangementMarkers: ArrangementMarker[];
    loopRange?: BeatRange;
    punchRange?: BeatRange;
  };
  grid: {
    baseDivision: "1/1" | "1/2" | "1/4" | "1/8" | "1/16" | "1/32";
    triplet: boolean;
    snapEnabled: boolean;
  };
}

export interface StudioAnchor {
  id: string;
  targetType:
    | "track-header"
    | "track-lane"
    | "clip"
    | "note"
    | "plugin-slot"
    | "mixer-strip"
    | "send-knob"
    | "timeline-region"
    | "panel";
  targetId: string;
}

export interface ProjectLessonContext {
  activeLessonId?: string;
  currentStepId?: string;
}

export interface MusicHubProject {
  id: string;
  name: string;
  ownerUserId: string;
  sessionId: string;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  tags?: string[];
  lessonContext?: ProjectLessonContext;
  metadata: {
    bpm?: number;
    key?: string;
    genre?: string;
    difficulty?: LayoutMode;
    durationBeats?: number;
  };
}

export interface SessionMetadata {
  title: string;
  description?: string;
  bpm?: number;
  key?: string;
  timeSignature?: string;
  sampleRate?: number;
  createdAt: string;
  updatedAt: string;
  mode: LayoutMode;
  tags?: string[];
}

export interface TrackGraphSummary {
  trackIds: string[];
  groupChildren: Record<string, string[]>;
  returnTrackIds: string[];
  masterTrackId: string;
}

export interface BrowserContext {
  query: string;
  category?: string;
  selectedAssetId?: string;
  previewingAssetId?: string;
}

export interface LessonBinding {
  lessonId: string;
  stepId: string;
  bindingType: "highlight" | "expectation" | "hint" | "lock" | "suggestion";
  anchorId?: string;
}

export interface LessonBindings {
  bindingsByObjectId: Record<string, LessonBinding[]>;
}

export interface StudioSessionRoot {
  id: string;
  projectId: string;
  transport: TransportSummary;
  timeline: TimelineModel;
  trackGraph: TrackGraphSummary;
  selection: SelectionState;
  panels: PanelState;
  browserContext: BrowserContext;
  lessonBindings: LessonBindings;
  metadata: SessionMetadata;
}

export interface StudioTrack {
  id: string;
  type: TrackType;
  role?: TrackRole;
  name: string;
  colorToken?: string;
  orderIndex: number;
  parentGroupTrackId?: string;
  state: {
    armed: boolean;
    muted: boolean;
    solo: boolean;
    monitoring: "off" | "auto" | "in";
    frozen?: boolean;
    disabled?: boolean;
  };
  channelFormat: "mono" | "stereo" | "multi";
  primaryLaneId: string;
  clipLaneIds: string[];
  automationLaneIds: string[];
  deviceChainId?: string;
  mixerStripId: string;
  routingId: string;
  anchors: StudioAnchor[];
}

export interface ClipLane {
  id: string;
  trackId: string;
  kind: "main" | "take" | "comp" | "variation";
  clipIds: string[];
}

export interface BaseClip {
  id: string;
  type: ClipType;
  trackId: string;
  laneId: string;
  name?: string;
  startBeat: number;
  lengthBeats: number;
  offsetBeats?: number;
  looped: boolean;
  muted?: boolean;
  colorToken?: string;
  sourceAssetId?: string;
  anchors: StudioAnchor[];
}

export interface MidiClipSummary {
  clipId: string;
  noteCount: number;
  minPitch?: number;
  maxPitch?: number;
  density?: number;
  barsCovered?: number;
}

export interface MidiClip extends BaseClip {
  type: "midi";
  midiNoteIds: string[];
  summary?: MidiClipSummary;
  scaleHint?: {
    tonic: string;
    scaleType: string;
  };
  chordHintIds?: string[];
}

export interface AudioClip extends BaseClip {
  type: "audio";
  waveformRef?: string;
  gainDb?: number;
  transposeSemitones?: number;
  warpMode?: "off" | "beats" | "tones" | "texture" | "repitch";
  sourceRegion?: {
    startSeconds: number;
    endSeconds: number;
  };
}

export interface PatternClip extends BaseClip {
  type: "pattern";
  patternId: string;
}

export interface ClipRegistry {
  allIds: string[];
  byId: Record<string, BaseClip | MidiClip | AudioClip | PatternClip>;
}

export interface MidiNote {
  id: string;
  clipId: string;
  pitch: number;
  startBeat: number;
  lengthBeats: number;
  velocity: number;
  probability?: number;
  muted?: boolean;
  channel?: number;
  anchors: StudioAnchor[];
}

export interface MidiNoteRegistry {
  allIds: string[];
  byId: Record<string, MidiNote>;
}

export interface AutomationLane {
  id: string;
  trackId: string;
  target: AutomationTarget;
  visible: boolean;
  pointIds: string[];
}

export type AutomationTarget =
  | { kind: "trackVolume" }
  | { kind: "trackPan" }
  | { kind: "sendLevel"; sendId: string }
  | { kind: "pluginParam"; chainId: string; pluginId: string; paramId: string };

export interface AutomationPoint {
  id: string;
  laneId: string;
  beat: number;
  value: number;
  curve?: "linear" | "fast" | "slow";
}

export interface DeviceChain {
  id: string;
  trackId: string;
  slots: DeviceSlot[];
  bypassed?: boolean;
  anchors: StudioAnchor[];
}

export interface DeviceSlot {
  id: string;
  slotIndex: number;
  pluginInstanceId?: string;
  role?: "instrument" | "audioEffect" | "midiEffect" | "utility";
  bypassed?: boolean;
}

export interface PluginParameterSummary {
  id: string;
  name: string;
  normalizedValue: number;
  displayValue?: string;
  automatable: boolean;
}

export interface PluginInstanceSummary {
  id: string;
  pluginId: string;
  pluginName: string;
  manufacturer?: string;
  format?: "VST3" | "AU" | "internal" | "other";
  kind: "instrument" | "effect" | "utility";
  hasCustomUI: boolean;
  uiOpen: boolean;
  presetName?: string;
  featuredParams?: PluginParameterSummary[];
}

export interface DeviceBlueprint {
  pluginId: string;
  presetRef?: string;
  targetSlot?: number;
  initialParams?: Record<string, number>;
}

export interface PresetChain {
  id: string;
  name: string;
  category: "synth" | "drums" | "mix" | "vocal" | "master" | "creative";
  deviceBlueprints: DeviceBlueprint[];
  tags?: string[];
}

export interface SendSummary {
  id: string;
  destinationTrackId: string;
  levelDb: number;
  enabled: boolean;
}

export interface MixerStripSummary {
  id: string;
  trackId: string;
  volumeDb: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  meter?: {
    left?: number;
    right?: number;
    peakLeft?: number;
    peakRight?: number;
  };
  sends: SendSummary[];
  outputLabel?: string;
}

export interface RoutingSummary {
  id: string;
  trackId: string;
  input?: {
    sourceType: "none" | "audioDevice" | "midiDevice" | "bus" | "resample";
    sourceLabel?: string;
  };
  output: {
    destinationType: "master" | "group" | "return" | "direct";
    destinationTrackId?: string;
    destinationLabel?: string;
  };
  sendIds: string[];
}

export type AssetInsertBehavior =
  | { mode: "toTrack"; supportedTrackTypes: TrackType[] }
  | { mode: "newTrack"; defaultTrackType: TrackType; defaultRole?: TrackRole }
  | { mode: "loadChain" }
  | { mode: "loadTemplate" }
  | { mode: "startLesson" };

export interface BrowserAsset {
  id: string;
  type: AssetType;
  name: string;
  tags: string[];
  category?: string;
  subcategory?: string;
  bpm?: number;
  key?: string;
  durationSeconds?: number;
  difficulty?: LayoutMode;
  previewRef?: string;
  insertBehavior: AssetInsertBehavior;
}

export type FocusTarget =
  | { kind: "track"; id: string }
  | { kind: "clip"; id: string }
  | { kind: "note"; id: string }
  | { kind: "plugin"; id: string }
  | { kind: "panel"; id: PanelType }
  | { kind: "timeline-region"; startBeat: number; endBeat: number };

export interface SelectionState {
  selectedTrackId?: string;
  selectedClipId?: string;
  selectedNoteIds: string[];
  selectedPluginInstanceId?: string;
  selectedPanel?: PanelType;
  focusTarget?: FocusTarget;
}

export interface PanelDescriptor {
  id: string;
  type: PanelType;
  visible: boolean;
  dock: "left" | "right" | "bottom" | "center" | "floating";
  size?: {
    width?: number;
    height?: number;
  };
}

export interface PanelState {
  layoutMode: LayoutMode;
  openPanels: PanelDescriptor[];
  activePanelId?: string;
}

export interface StudioCommandSummary {
  id: string;
  name: string;
  status: "pending" | "succeeded" | "failed";
  at: string;
  targetIds?: string[];
}

export interface LessonValidationContext {
  selectedTrackId?: string;
  selectedClipId?: string;
  recentCommands: StudioCommandSummary[];
  clipSummaries: Record<string, MidiClipSummary>;
  transport: {
    playing: boolean;
    beat: number;
  };
}

export interface StudioDomainStore {
  sessionRoot: StudioSessionRoot;
  tracks: {
    byId: Record<string, StudioTrack>;
    allIds: string[];
  };
  clipLanes: {
    byId: Record<string, ClipLane>;
    allIds: string[];
  };
  clips: ClipRegistry;
  midiNotes: MidiNoteRegistry;
  automationLanes: {
    byId: Record<string, AutomationLane>;
    allIds: string[];
  };
  automationPoints: {
    byId: Record<string, AutomationPoint>;
    allIds: string[];
  };
  deviceChains: {
    byId: Record<string, DeviceChain>;
    allIds: string[];
  };
  pluginInstances: {
    byId: Record<string, PluginInstanceSummary>;
    allIds: string[];
  };
  mixerStrips: {
    byId: Record<string, MixerStripSummary>;
    allIds: string[];
  };
  routing: {
    byId: Record<string, RoutingSummary>;
    allIds: string[];
  };
  browserAssets?: {
    byId: Record<string, BrowserAsset>;
    allIds: string[];
  };
}
