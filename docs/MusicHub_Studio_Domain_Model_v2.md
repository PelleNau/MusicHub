# MusicHub Studio Domain Model v2

## Purpose

This document defines the **Studio Domain Model** for MusicHub.

It should be read together with the architecture brief. The brief establishes that MusicHub is a commandable Studio application built on top of a native DAW core, with native authority for transport, playback, plugin truth, routing, meters, recording, and render behavior. This document defines the **product-facing model of the Studio world** that the web application, Guide runtime, AI layer, and content system can safely build against.

This model is intentionally **not** a mirror of JUCE or host payloads. It is a stable abstraction for:

- timeline structure
- tracks and lanes
- clips and notes
- device chains
- mixer and routing summaries
- browser assets
- selection and panel state
- lesson attach points
- session and project descriptors

The goal is to create one model that is:

- readable by humans
- usable by UI
- usable by lessons
- usable by AI orchestration
- compatible with native authority
- implementable without duplicating engine truth

---

## Core modeling principles

### 1. Native truth is not duplicated

The native host remains authoritative for:

- transport state
- timing / playhead
- plugin parameter truth
- meter truth
- routing truth
- recording / monitoring truth
- audio engine state
- render state

The Studio model is therefore **product-facing shared state**, not a replacement for the engine.

### 2. One canonical store, not two competing models

The Studio domain must have one canonical normalized state model.

`StudioSession` may exist as the root descriptor for the active session, but it must not become a second source of truth that duplicates track, clip, note, chain, or routing data already stored elsewhere.

Rule:

- normalized registries are canonical
- `StudioSession` references and summarizes
- selectors derive product views from the canonical store

### 3. Product-readable naming

The model must support:

- UI rendering
- tutorial logic
- AI assistance
- content insertion
- save/load metadata
- analytics and validation later

Names should therefore be product-readable, not host-internal.

### 4. Stable IDs everywhere

Every domain object must have a stable ID.

No feature should rely on array position as identity.

### 5. Summaries in shared state, detail on demand

The always-live observable model should expose summaries.

Heavy detail should be loaded only when needed:

- full note arrays for inactive clips
- full plugin parameter trees
- deep routing graphs
- dense waveform data
- automation point arrays for inactive lanes

### 6. Attachability is first-class

Anything that lessons, hints, overlays, or AI explanations may target must expose stable anchors:

- tracks
- lanes
- clips
- notes
- plugin slots
- mixer strips
- sends
- timeline regions
- panels

### 7. Product modes do not fork the model

Beginner, Guided, and Pro mode change:

- visibility
- affordances
- layout
- teaching intensity

They do **not** change object identity or storage shape.

### 8. UI can stage intent, but native confirmation wins

The web app may stage local intent or optimistic interaction state where useful.

But if native confirms a conflicting value, native wins.

---

## Top-level model

```text
MusicHubProject
  └── StudioSessionRoot
        ├── TransportSummary
        ├── TimelineModel
        ├── TrackGraphSummary
        ├── BrowserContext
        ├── SelectionState
        ├── PanelState
        ├── LessonBindings
        └── SessionMetadata

StudioDomainStore
  ├── tracks
  ├── clipLanes
  ├── clips
  ├── midiNotes
  ├── automationLanes
  ├── automationPoints
  ├── deviceChains
  ├── pluginInstances
  ├── mixerStrips
  ├── routing
  └── browserAssets (optional loaded subset)
```

Key rule:

- `StudioSessionRoot` describes the active session and top-level UX state
- `StudioDomainStore` holds the canonical normalized entities

---

## Root entities

### MusicHubProject

This is the user-facing saved artifact.

```ts
interface MusicHubProject {
  id: string
  name: string
  ownerUserId: string
  sessionId: string
  templateId?: string
  createdAt: string
  updatedAt: string
  version: number
  tags?: string[]
  lessonContext?: ProjectLessonContext
  metadata: {
    bpm?: number
    key?: string
    genre?: string
    difficulty?: "beginner" | "guided" | "pro"
    durationBeats?: number
  }
}
```

### StudioSessionRoot

This is the active production world descriptor in memory.

It is intentionally a **root summary**, not a full nested state blob.

```ts
interface StudioSessionRoot {
  id: string
  projectId: string
  transport: TransportSummary
  timeline: TimelineModel
  trackGraph: TrackGraphSummary
  selection: SelectionState
  panels: PanelState
  browserContext: BrowserContext
  lessonBindings: LessonBindings
  metadata: SessionMetadata
}
```

---

## Timeline model

The timeline is the structural backbone for arrangement, looping, lesson targeting, clip placement, and validation.

```ts
interface TimelineModel {
  startBeat: number
  endBeat: number
  visibleStartBeat: number
  visibleEndBeat: number
  ruler: {
    timeSignatureMap: TimeSignaturePoint[]
    tempoMapSummary?: TempoPoint[]
    arrangementMarkers: ArrangementMarker[]
    loopRange?: BeatRange
    punchRange?: BeatRange
  }
  grid: {
    baseDivision: "1/1" | "1/2" | "1/4" | "1/8" | "1/16" | "1/32"
    triplet: boolean
    snapEnabled: boolean
  }
}

interface BeatRange {
  startBeat: number
  endBeat: number
}

interface TimeSignaturePoint {
  atBeat: number
  numerator: number
  denominator: number
}

interface TempoPoint {
  atBeat: number
  bpm: number
}

interface ArrangementMarker {
  id: string
  name: string
  startBeat: number
  colorToken?: string
}
```

Notes:

- native host remains authoritative for actual timing
- tempo automation detail can stay host-side initially
- the web model only needs enough structure to reason about musical layout and guidance

---

## Track graph model

The track graph is the main compositional model.

It must support beginner clarity, pro extensibility, and lesson targeting without leaking host internals.

### Track type vs capability

Product-facing `TrackType` should remain simple:

```ts
type TrackType =
  | "midi"
  | "audio"
  | "group"
  | "return"
  | "master"
```

Instead of introducing `instrument` as a separate hard storage category, represent it as a **capability / classification**:

```ts
type TrackRole =
  | "standard"
  | "instrument"
  | "vocal"
  | "drum"
  | "bus"
```

Reason:

- users can still see “instrument track”
- implementation stays compatible with the likely reality: MIDI track + instrument chain
- fewer conversion rules later

### Track entity

```ts
interface StudioTrack {
  id: string
  type: TrackType
  role?: TrackRole
  name: string
  colorToken?: string
  orderIndex: number
  parentGroupTrackId?: string
  state: {
    armed: boolean
    muted: boolean
    solo: boolean
    monitoring: "off" | "auto" | "in"
    frozen?: boolean
    disabled?: boolean
  }
  channelFormat: "mono" | "stereo" | "multi"
  primaryLaneId: string
  clipLaneIds: string[]
  automationLaneIds: string[]
  deviceChainId?: string
  mixerStripId: string
  routingId: string
  anchors: StudioAnchor[]
}
```

### Track graph summary

```ts
interface TrackGraphSummary {
  trackIds: string[]
  groupChildren: Record<string, string[]>
  returnTrackIds: string[]
  masterTrackId: string
}
```

Important:

- keep canonical track entities in the normalized store
- keep graph relationship summary in the root/session summary

---

## Lane and clip model

Tracks own lanes. Clips live in a central registry.

This avoids duplication and makes movement, duplication, selection, lesson binding, and validation easier to reason about.

### Clip lanes

```ts
interface ClipLane {
  id: string
  trackId: string
  kind: "main" | "take" | "comp" | "variation"
  clipIds: string[]
}
```

For v1, one main lane per track is enough.

### Base clip

```ts
type ClipType = "midi" | "audio" | "pattern"

interface BaseClip {
  id: string
  type: ClipType
  trackId: string
  laneId: string
  name?: string
  startBeat: number
  lengthBeats: number
  offsetBeats?: number
  looped: boolean
  muted?: boolean
  colorToken?: string
  sourceAssetId?: string
  anchors: StudioAnchor[]
}
```

### MIDI clip

```ts
interface MidiClip extends BaseClip {
  type: "midi"
  midiNoteIds: string[]
  summary?: MidiClipSummary
  scaleHint?: {
    tonic: string
    scaleType: string
  }
  chordHintIds?: string[]
}
```

### Audio clip

```ts
interface AudioClip extends BaseClip {
  type: "audio"
  waveformRef?: string
  gainDb?: number
  transposeSemitones?: number
  warpMode?: "off" | "beats" | "tones" | "texture" | "repitch"
  sourceRegion?: {
    startSeconds: number
    endSeconds: number
  }
}
```

### Pattern clip

```ts
interface PatternClip extends BaseClip {
  type: "pattern"
  patternId: string
}
```

### Clip registry

```ts
interface ClipRegistry {
  allIds: string[]
  byId: Record<string, BaseClip | MidiClip | AudioClip | PatternClip>
}
```

---

## MIDI note model

Notes should remain individually addressable because lessons and AI generation often need note-level reasoning.

```ts
interface MidiNote {
  id: string
  clipId: string
  pitch: number
  startBeat: number
  lengthBeats: number
  velocity: number
  probability?: number
  muted?: boolean
  channel?: number
  anchors: StudioAnchor[]
}

interface MidiNoteRegistry {
  allIds: string[]
  byId: Record<string, MidiNote>
}

interface MidiClipSummary {
  clipId: string
  noteCount: number
  minPitch?: number
  maxPitch?: number
  density?: number
  barsCovered?: number
}
```

Important rule:

- full note arrays should not always be loaded into always-live shared state for inactive clips
- clip summaries should be broadly accessible

---

## Automation model

Automation should be modeled now even if implementation is phased.

```ts
interface AutomationLane {
  id: string
  trackId: string
  target: AutomationTarget
  visible: boolean
  pointIds: string[]
}

type AutomationTarget =
  | { kind: "trackVolume" }
  | { kind: "trackPan" }
  | { kind: "sendLevel"; sendId: string }
  | { kind: "pluginParam"; chainId: string; pluginId: string; paramId: string }

interface AutomationPoint {
  id: string
  laneId: string
  beat: number
  value: number
  curve?: "linear" | "fast" | "slow"
}
```

---

## Device chain model

This is one of the most important abstractions in MusicHub.

Users think in terms of:

- instrument
- effects
- chain
- preset
- vocal chain
- mastering chain

That means chains must be first-class objects in the product model.

### Device chain

```ts
interface DeviceChain {
  id: string
  trackId: string
  slots: DeviceSlot[]
  bypassed?: boolean
  anchors: StudioAnchor[]
}

interface DeviceSlot {
  id: string
  slotIndex: number
  pluginInstanceId?: string
  role?: "instrument" | "audioEffect" | "midiEffect" | "utility"
  bypassed?: boolean
}
```

### Plugin instance summary

Keep this intentionally lean in the shared store.

```ts
interface PluginInstanceSummary {
  id: string
  pluginId: string
  pluginName: string
  manufacturer?: string
  format?: "VST3" | "AU" | "internal" | "other"
  kind: "instrument" | "effect" | "utility"
  hasCustomUI: boolean
  uiOpen: boolean
  presetName?: string
  featuredParams?: PluginParameterSummary[]
}

interface PluginParameterSummary {
  id: string
  name: string
  normalizedValue: number
  displayValue?: string
  automatable: boolean
}
```

Important rule:

- native host owns full plugin truth
- shared Studio state should expose **featured params or summary params only**
- full parameter trees load on demand

### Preset chain abstraction

```ts
interface PresetChain {
  id: string
  name: string
  category: "synth" | "drums" | "mix" | "vocal" | "master" | "creative"
  deviceBlueprints: DeviceBlueprint[]
  tags?: string[]
}

interface DeviceBlueprint {
  pluginId: string
  presetRef?: string
  targetSlot?: number
  initialParams?: Record<string, number>
}
```

---

## Mixer and routing summaries

The mixer needs a simpler abstraction than full routing internals.

### Mixer strip summary

```ts
interface MixerStripSummary {
  id: string
  trackId: string
  volumeDb: number
  pan: number
  mute: boolean
  solo: boolean
  meter?: {
    left?: number
    right?: number
    peakLeft?: number
    peakRight?: number
  }
  sends: SendSummary[]
  outputLabel?: string
}

interface SendSummary {
  id: string
  destinationTrackId: string
  levelDb: number
  enabled: boolean
}
```

### Routing summary

Keep v1 intentionally narrow.

```ts
interface RoutingSummary {
  id: string
  trackId: string
  input?: {
    sourceType: "none" | "audioDevice" | "midiDevice" | "bus" | "resample"
    sourceLabel?: string
  }
  output: {
    destinationType: "master" | "group" | "return" | "direct"
    destinationTrackId?: string
    destinationLabel?: string
  }
  sendIds: string[]
}
```

Do not mirror full routing graphs into browser state unless there is a proven need.

---

## Browser and asset insertion model

The browser is part of the workflow and learning system, not just storage.

```ts
type AssetType =
  | "sample"
  | "loop"
  | "oneShot"
  | "midiPattern"
  | "preset"
  | "presetChain"
  | "template"
  | "lesson"
  | "projectStarter"
  | "tutorialSnippet"

interface BrowserAsset {
  id: string
  type: AssetType
  name: string
  tags: string[]
  category?: string
  subcategory?: string
  bpm?: number
  key?: string
  durationSeconds?: number
  difficulty?: "beginner" | "guided" | "pro"
  previewRef?: string
  insertBehavior: AssetInsertBehavior
}

type AssetInsertBehavior =
  | { mode: "toTrack"; supportedTrackTypes: TrackType[] }
  | { mode: "newTrack"; defaultTrackType: TrackType; defaultRole?: TrackRole }
  | { mode: "loadChain" }
  | { mode: "loadTemplate" }
  | { mode: "startLesson" }
```

The browser should be able to answer:

- can this drop onto the selected track?
- should this create a new track?
- does this load a chain or a lesson?
- should this be shown in beginner mode?

---

## Selection and panel model

Selection is load-bearing because it connects Studio, Guide, hints, and AI explanations.

### Selection

```ts
interface SelectionState {
  selectedTrackId?: string
  selectedClipId?: string
  selectedNoteIds: string[]
  selectedPluginInstanceId?: string
  selectedPanel?: PanelType
  focusTarget?: FocusTarget
}

type PanelType =
  | "browser"
  | "mixer"
  | "pianoRoll"
  | "timeline"
  | "detail"
  | "inspector"
  | "lesson"

type FocusTarget =
  | { kind: "track"; id: string }
  | { kind: "clip"; id: string }
  | { kind: "note"; id: string }
  | { kind: "plugin"; id: string }
  | { kind: "panel"; id: PanelType }
  | { kind: "timeline-region"; startBeat: number; endBeat: number }
```

Selection must remain:

- lightweight
- predictable
- not an undo mechanism
- not a history mechanism

### Panel state

```ts
interface PanelState {
  layoutMode: "beginner" | "guided" | "pro"
  openPanels: PanelDescriptor[]
  activePanelId?: string
}

interface PanelDescriptor {
  id: string
  type: PanelType
  visible: boolean
  dock: "left" | "right" | "bottom" | "center" | "floating"
  size?: {
    width?: number
    height?: number
  }
}
```

Panel state is web-authoritative.

---

## Lesson binding model

Lessons must attach to Studio objects without polluting core entities with lesson-specific logic.

```ts
interface LessonBindings {
  bindingsByObjectId: Record<string, LessonBinding[]>
}

interface LessonBinding {
  lessonId: string
  stepId: string
  bindingType: "highlight" | "expectation" | "hint" | "lock" | "suggestion"
  anchorId?: string
}
```

Rule:

- lesson systems attach through bindings and commands
- lessons do not directly mutate core domain entities

### Validation-friendly context

```ts
interface LessonValidationContext {
  selectedTrackId?: string
  selectedClipId?: string
  recentCommands: StudioCommandSummary[]
  clipSummaries: Record<string, MidiClipSummary>
  transport: {
    playing: boolean
    beat: number
  }
}
```

---

## Anchor model

Anchors are required for overlays, hints, assistant explanations, and stable lesson targeting.

```ts
interface StudioAnchor {
  id: string
  targetType:
    | "track-header"
    | "track-lane"
    | "clip"
    | "note"
    | "plugin-slot"
    | "mixer-strip"
    | "send-knob"
    | "timeline-region"
    | "panel"
  targetId: string
}
```

Avoid selector-based attachment logic where possible.

---

## Session metadata

```ts
interface SessionMetadata {
  title: string
  description?: string
  bpm?: number
  key?: string
  timeSignature?: string
  sampleRate?: number
  createdAt: string
  updatedAt: string
  mode: "beginner" | "guided" | "pro"
  tags?: string[]
}
```

This is the product-facing metadata subset, not the engine’s full metadata.

---

## Observable summaries vs loaded detail

### Safe to expose broadly

- track summaries
- clip summaries
- panel state
- selection state
- transport summary
- browser context
- plugin instance summaries
- mixer strip summaries
- lesson bindings and lesson state

### Load on demand

- full note arrays for inactive clips
- full waveform detail
- complete plugin parameter trees
- deep routing graphs
- automation point arrays for inactive lanes
- audio analysis blobs

---

## Canonical normalized store

This is the recommended canonical model to build toward.

```ts
interface StudioDomainStore {
  sessionRoot: StudioSessionRoot

  tracks: {
    byId: Record<string, StudioTrack>
    allIds: string[]
  }

  clipLanes: {
    byId: Record<string, ClipLane>
    allIds: string[]
  }

  clips: ClipRegistry
  midiNotes: MidiNoteRegistry

  automationLanes: {
    byId: Record<string, AutomationLane>
    allIds: string[]
  }

  automationPoints: {
    byId: Record<string, AutomationPoint>
    allIds: string[]
  }

  deviceChains: {
    byId: Record<string, DeviceChain>
    allIds: string[]
  }

  pluginInstances: {
    byId: Record<string, PluginInstanceSummary>
    allIds: string[]
  }

  mixerStrips: {
    byId: Record<string, MixerStripSummary>
    allIds: string[]
  }

  routing: {
    byId: Record<string, RoutingSummary>
    allIds: string[]
  }

  browserAssets?: {
    byId: Record<string, BrowserAsset>
    allIds: string[]
  }
}
```

Important:

- this store is canonical
- `sessionRoot` references and summarizes
- selectors produce product-level observable state from here

---

## Domain rules

### Rule 1

A clip belongs to exactly one lane and one track at a time.

### Rule 2

A note belongs to exactly one MIDI clip.

### Rule 3

A track has at most one primary device chain in v1.

### Rule 4

Every track has a mixer strip summary and routing summary, even if minimal.

### Rule 5

Master, return, and group tracks are still tracks, but with constrained behaviors.

### Rule 6

UI mode does not alter identity or storage shape.

### Rule 7

Plugin parameter truth resolves from native confirmation, never from local UI assumption alone.

### Rule 8

Lessons do not mutate Studio objects directly. They operate through commands and evaluate against state.

### Rule 9

If root/session summary and normalized entity state disagree, normalized canonical state wins.

---

## Implementation priority

Start with the smallest complete set:

- `StudioTrack`
- `ClipLane`
- `MidiClip`
- `AudioClip`
- `MidiNote`
- `DeviceChain`
- `PluginInstanceSummary`
- `MixerStripSummary`
- `RoutingSummary`
- `SelectionState`
- `PanelState`
- `TimelineModel`

Then build:

- normalized store
- host adapter mappers
- selectors
- command handlers
- lesson-facing validation views

Resist the temptation to model every host nuance immediately.

---

## Guidance for Lovable

Lovable should design against this model for:

- track list and lane rendering
- browser insertion behavior
- mixer strip UI
- piano roll note targeting
- panel visibility and docking
- lesson overlays tied to anchors
- outcome-based plugin and preset surfaces

Lovable should not depend on raw host payloads.

---

## Guidance for Codex

Codex should implement:

- normalized store types
- host adapter mappers into this model
- command handlers against this model
- selectors and reconciliation rules
- lesson/runtime attach points

Codex should avoid:

- collapsing the architecture into one page-level state blob
- passing raw host payloads through the UI untouched
- exposing heavyweight host detail in always-live state

---

## Recommended next document

The next useful document after this is:

**MusicHub Interaction Flows v1**

That should define:

- onboarding into beginner mode
- creating a first beat
- loading an instrument and playing it
- completing a guided lesson
- inserting loops and preset chains
- transitioning from guided mode to pro mode
- AI suggestion to command execution flow

---

## Final statement

**The MusicHub Studio Domain Model should represent the production workspace as a stable, product-readable graph of timeline, tracks, lanes, clips, notes, chains, mixer summaries, routing summaries, browser assets, selection, panels, and lesson bindings—without duplicating native engine authority.**

That gives MusicHub a model that is:

- expressive enough for serious creation
- safe for UI design
- usable by lessons and AI
- compatible with native host authority
- extensible without collapsing into host-specific chaos
