import type { ChainNode } from "@/services/pluginHostClient";
import type { MeterLevel } from "@/services/pluginHostSocket";
import type { SyncStatus } from "@/hooks/useHostConnector";
import type { SidecarStatus } from "@/services/tauriShell";
import type { SessionClip, SessionTrack } from "@/types/studio";
import type { MidiNote } from "@/components/studio/PianoRollTransforms";
import type { GuideLessonStatus, GuideStepStatus } from "@/types/musicHubGuideRuntime";

export type StudioPlaybackState = "playing" | "paused" | "stopped";

export interface StudioTransportSummary {
  mode: string;
  playbackState: StudioPlaybackState;
  currentBeat: number;
  isBackendDriven: boolean;
  hostAvailable: boolean;
}

export interface StudioConnectionSummary {
  connectionState: string;
  isMock: boolean;
  inShell: boolean;
  sidecarStatus: SidecarStatus | null;
  syncStatus: SyncStatus;
  recording: boolean;
  lastError: unknown;
  isConnected: boolean;
  canUseNativeControls: boolean;
  audioEngineState?: {
    sampleRate: number;
    bufferSize: number;
    cpuLoad: number;
  };
  openEditors: Record<string, boolean>;
}

export interface StudioTrackViewState {
  muted: boolean;
  solo: boolean;
  nativeMonitoring: boolean;
  nativeArmed: boolean;
  meter: MeterLevel | null;
  selected: boolean;
}

export interface StudioPanelState {
  selectedTrackId: string | null;
  selectedClipIds: Set<string>;
  activeClipId: string | null;
  bottomTab: "editor" | "mixer";
  showPianoRoll: boolean;
  showMixer: boolean;
  showBottomWorkspace: boolean;
}

export interface StudioSelectionSummary {
  selectedClip?: SessionClip;
  selectedTrack?: SessionTrack;
  ghostNotes: MidiNote[];
}

export interface StudioPianoRollState {
  clip?: SessionClip;
  track?: SessionTrack;
  ghostNotes: MidiNote[];
  trackClips: SessionClip[];
  canUseNativeNoteAudition: boolean;
}

export interface StudioDetailPanelState {
  track: SessionTrack | null;
  isConnected: boolean;
  nativeChainId?: string;
  nativeChainNodes?: ChainNode[];
  nativeMonitoring: boolean;
  nativeArmed: boolean;
  openEditors: Record<string, boolean>;
}

export interface StudioMixerState {
  tracks: SessionTrack[];
  selectedTrackId: string | null;
  masterMeter: MeterLevel | null;
  trackMeters: Record<string, MeterLevel>;
}

export interface StudioLessonPanelState {
  lessonId?: string;
  title?: string;
  visible: boolean;
  collapsed: boolean;
  lessonStatus: GuideLessonStatus;
  stepStatus: GuideStepStatus;
  currentStepId?: string;
  currentStepTitle?: string;
  instruction?: string;
  stepIndex: number;
  stepCount: number;
  objectives: string[];
  activeHints: Array<{
    id: string;
    text: string;
  }>;
  stepTitles: string[];
}
