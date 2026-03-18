/**
 * Bridge — core data model for plugin chain analysis & companion control.
 *
 * Nine entities: Plugin, PluginInstance, Track, ProjectManifest,
 * PluginLibrary, PluginMatch, RenderJob, AnalysisResult, SuggestedReplacement.
 */

/* ── Enums & shared types ────────────────────────────────── */

export type PluginFormat = "VST3" | "AU" | "VST" | "AAX" | "CLAP";
export type PluginCategory = "Instrument" | "Effect" | "MIDI Effect" | "Analyzer";
export type TrackType = "Audio" | "MIDI" | "Instrument" | "Bus" | "Return" | "Master";
export type DawType = "Ableton" | "Logic" | "FL Studio" | "Reaper" | "Bitwig" | "Cubase" | "Studio One";
export type RenderStatus = "queued" | "rendering" | "done" | "error";
export type AnalysisStatus = "pending" | "running" | "complete" | "error";
export type ReplacementStatus = "pending" | "accepted" | "dismissed";
export type MatchMethod = "name" | "vendor" | "tag" | "category" | "ai";

export type SuggestionType =
  | "chain_order"
  | "redundant_plugin"
  | "missing_treatment"
  | "cpu_optimization"
  | "gain_staging"
  | "alternative";

export type BridgeConnectionStatus = "connected" | "connecting" | "disconnected" | "error";

/* ── 1. Plugin — represents a plugin installed on the user's system. Includes metadata returned by the native plugin scanner. ── */

export interface Plugin {
  id: string;
  name: string;
  vendor: string;
  version: string;
  format: PluginFormat;
  category: PluginCategory;
  path: string;
  tags: string[];
  installed: boolean;
  latencySamples: number;
  supportsStateRestore: boolean;
  lastScanned: string; // ISO
}

/* ── 2. PluginInstance — represents a plugin used in a track chain. Includes the plugin reference, slot order, bypass state, and serialized plugin state. ── */

export interface InstanceParam {
  id: string;
  label: string;
  value: number;          // normalized 0-1
  displayValue: string;   // e.g. "3.2 kHz"
  automatable: boolean;
}

export interface PluginInstance {
  id: string;
  pluginId: string | null; // FK → Plugin, null = native DAW device
  trackId: string;         // FK → Track
  chainIndex: number;
  name: string;
  bypass: boolean;
  preset: string | null;
  params: InstanceParam[];
  stateBlob: string | null; // Base64
  wet: number;              // 0-1
  missing: boolean;
}

/* ── 3. Track — represents an audio or MIDI track within a project. Contains the source audio reference and the ordered plugin chain. ── */

export interface TrackSend {
  targetTrackId: string;
  targetTrackName: string;
  level: number;       // 0-100
  preFader: boolean;
}

export interface Track {
  id: string;
  projectId: string;   // FK → ProjectManifest
  name: string;
  type: TrackType;
  color: string;       // HSL
  index: number;
  volume: number;      // 0-100
  pan: number;         // -100 to 100
  isMuted: boolean;
  isSoloed: boolean;
  inputSource: string | null;
  sourceAudioUrl: string | null; // path/URL to backing audio file; null for MIDI-only or bus tracks
  sends: TrackSend[];
  chain: PluginInstance[]; // denormalized, ordered by chainIndex
}

/* ── 4. ProjectManifest — represents the imported project description. Contains tracks, routing, tempo information, and plugin chain definitions. ── */

export interface ProjectManifest {
  id: string;
  name: string;
  daw: DawType;
  filePath: string;
  importedAt: string;  // ISO
  tempo: number;
  timeSignature: string;
  key: string | null;
  duration: string;    // e.g. "4:32"
  sampleRate: number;
  tracks: Track[];     // denormalized
  trackCount: number;
  pluginCount: number;
  missingCount: number;
}

/* ── 5. PluginLibrary — represents the user's full collection of scanned plugins, grouped by scan session. Acts as the catalog that PluginMatch resolves against. ── */

export interface PluginLibrary {
  id: string;
  userId: string;
  name: string;                // e.g. "Studio Mac Pro", "Laptop Rig"
  os: "macOS" | "Windows" | "Linux";
  scanPaths: string[];         // directories the scanner searched
  plugins: Plugin[];           // all discovered plugins
  lastScannedAt: string;       // ISO — when the full scan completed
  pluginCount: number;         // total plugins found
  installedCount: number;      // plugins present on disk
  missingCount: number;        // plugins referenced but not found
  createdAt: string;           // ISO
  updatedAt: string;           // ISO
}

/* ── 6. PluginMatch — represents a match between a plugin needed by a project and a plugin available in the user's library. Used to resolve missing plugins and find compatible alternatives. ── */

export interface PluginMatch {
  id: string;
  sourcePluginId: string;      // FK → Plugin (the plugin being looked up — may be missing)
  sourceName: string;          // display name of the source plugin
  sourceVendor: string;
  matchedPluginId: string;     // FK → Plugin (the matched plugin from the user's library)
  matchedName: string;
  matchedVendor: string;
  matchMethod: MatchMethod;    // how the match was determined
  matchScore: number;          // 0-100 confidence score
  formatCompatible: boolean;   // true if formats are compatible (e.g. both VST3)
  versionCompatible: boolean;  // true if version is same or newer
  tagOverlap: string[];        // shared tags between source and matched plugin
  libraryId: string;           // FK → PluginLibrary
  verified: boolean;           // true if user has confirmed the match works
  createdAt: string;           // ISO
}

/* ── 7. RenderJob — represents a request to render audio through a plugin chain for preview or analysis. ── */

export interface RenderJob {
  id: string;
  projectId: string;
  trackId: string | null;
  chainRange: [number, number] | null;
  status: RenderStatus;
  progress: number;    // 0-100
  startBeat: number;
  endBeat: number;
  outputFormat: "wav" | "mp3";
  outputUrl: string | null;
  error: string | null;
  createdAt: string;   // ISO
  completedAt: string | null;
}

/* ── 8. AnalysisResult — represents audio analysis of the rendered signal and the inferred role of each plugin in the chain. ── */

export interface PluginRole {
  instanceId: string;  // FK → PluginInstance
  role: string;        // e.g. "tonal shaping", "dynamics control", "spatial processing"
  confidence: number;  // 0-1
}

export interface AnalysisSuggestion {
  id: string;
  type: SuggestionType;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  trackId?: string;
  trackName?: string;
  instanceId?: string | null;
  deviceName?: string;
  action?: string;
  dismissed: boolean;
}

export interface AnalysisResult {
  id: string;
  projectId: string;
  createdAt: string;
  status: AnalysisStatus;
  summary: string | null;
  suggestions: AnalysisSuggestion[];
  healthScore: number | null;  // 0-100
  cpuEstimate: number | null;  // 0-100
  pluginRoles: PluginRole[];   // inferred role of each plugin in the chain
}

/* ── 9. SuggestedReplacement — represents an AI-generated suggestion to replace a plugin with a better match from the user's installed library. ── */

export interface SuggestedReplacement {
  id: string;
  instanceId: string;           // FK → PluginInstance
  replacementPluginId: string | null; // FK → Plugin (null if not in catalog)
  replacementName: string;
  replacementVendor: string;
  reason: string;
  matchScore: number;  // 0-100
  free: boolean;
  url: string | null;
  status: ReplacementStatus;
}

/* ── Companion bridge status ─────────────────────────────── */

export interface CompanionState {
  status: BridgeConnectionStatus;
  version: string | null;
  os: "macOS" | "Windows" | "Linux" | null;
  cpuUsage: number;
  sampleRate: number;
  bufferSize: number;
  pluginCount: number;
}

/* ── Aggregated missing-plugin view model ────────────────── */

export interface MissingPluginInfo {
  name: string;
  vendor: string;
  format: PluginFormat;
  usedOnTracks: { trackId: string; trackName: string }[];
  replacements: SuggestedReplacement[];
}
