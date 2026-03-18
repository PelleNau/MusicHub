# MH-005 Runtime To Domain Mapping

## Purpose

This document maps the current `studio-ledger` runtime model to the target MusicHub Studio domain model defined in:

- `docs/MusicHub_Studio_Domain_Model_v2.md`
- `src/types/musicHubStudioDomain.ts`

The goal is to make the migration explicit before runtime code is changed. This is a mapping document, not a redesign of current behavior.

## Current Runtime Reality

The current app state is split across four different layers:

1. session/project data from `useSession`
2. native host runtime data from `useHostConnector`
3. local Studio UI state in `useStudioSelection` and `Studio.tsx`
4. host synchronization state in `useNativeHostSync`

This means the current runtime does not have a single canonical Studio store. The target architecture requires one.

## Canonical Mapping Rule

When the target store is introduced, precedence should be:

1. native host runtime for connected-mode transport, playback, meters, recording, and plugin runtime summaries
2. persisted session/project entities for tracks, clips, notes, automation, and arrangement structure
3. local UI state for selection, panel layout, and browser context

No target-domain entity should be populated from two live sources at once.

## Source Systems

### `useSession`

Primary current responsibility:

- persisted session metadata
- persisted track rows
- persisted clips
- persisted automation lane data
- dev fixture fallback

Key current types:

- `Session`
- `SessionTrack`
- `SessionClip`
- `AutomationLaneData`

Target-domain destination:

- `MusicHubProject`
- `StudioSessionRoot.metadata`
- `StudioTrack`
- `ClipLane`
- `ClipRegistry`
- `MidiClip`
- `AudioClip`
- `PatternClip` when introduced
- `AutomationLane`

### `useHostConnector`

Primary current responsibility:

- connected-mode runtime state
- transport and playback state
- native chain summaries
- host-side session/playback summaries
- meters
- recording state
- audio engine state

Key current state fields:

- `transport`
- `playback`
- `masterMeter`
- `trackMeters`
- `nativeChains`
- `sessionState`
- `audioEngineState`
- `recording`
- `recordLevels`
- `midiDevices`
- `analysisData`

Target-domain destination:

- `TransportSummary`
- `MixerStripSummary`
- `DeviceChain`
- `PluginInstanceSummary`
- `RoutingSummary`
- runtime overlays for `StudioTrack.state`

### `useStudioSelection`

Primary current responsibility:

- track selection
- clip selection
- note-editor state
- bottom workspace visibility and tab
- ghost note visibility

Target-domain destination:

- `SelectionState`
- `PanelState`

### `useNativeHostSync`

Primary current responsibility:

- normalizing session tracks into host graph payloads
- loading native chains
- tracking host plugin identity per track
- bridging track arm/monitor state to host

Target-domain destination:

- not a domain entity itself
- should be replaced by an adapter + command layer that consumes canonical target-domain state

## Entity Mapping

### Project And Session Root

Current sources:

- `Session` from `useSession`
- local transport/timeline state in `Studio.tsx`
- local selection/panel state in `useStudioSelection`

Target mapping:

- `Session.id` -> `MusicHubProject.sessionId`
- `Session.name` -> `SessionMetadata.title`
- `Session.tempo` -> initial `TransportSummary.bpm` and `SessionMetadata.bpm`
- `Session.time_signature` -> `SessionMetadata.timeSignature`
- current visible timeline range in `Studio.tsx` -> `TimelineModel`
- local selection state -> `SelectionState`
- local bottom panel/browser state -> `PanelState` and `BrowserContext`

Important constraint:

- `StudioSessionRoot` must remain a root descriptor only
- tracks, clips, notes, chains, mixer summaries, and routing summaries must live in registries and summary maps, not be duplicated inside `StudioSessionRoot`

### Track Graph

Current sources:

- `SessionTrack[]` from `useSession`
- sort order and type fields
- implicit grouping through `type === "group"` and track relationships

Current gap:

- track graph is not modeled as a first-class summary
- return/master structure is partially implicit

Target mapping:

- each `SessionTrack` -> `StudioTrack`
- `sort_order` -> `orderIndex`
- `type` -> `TrackType`
- `device_chain` presence + product meaning -> `TrackRole` when needed
- current `input_from` and send data -> `RoutingSummary`
- derived ordered track ids -> `TrackGraphSummary.trackIds`
- return/master track ids -> `TrackGraphSummary.returnTrackIds` / `masterTrackId`

Migration note:

- current group/return/master handling should be normalized into one explicit graph summary instead of being rediscovered inside render code

### Clip Lanes And Clips

Current sources:

- `SessionTrack.clips`
- `SessionClip`

Current gap:

- clips are nested under tracks
- lanes are implicit
- MIDI note data is embedded inside clip payloads

Target mapping:

- each track gets a primary `ClipLane`
- each `SessionClip` becomes a clip entity in `ClipRegistry`
- lane membership becomes explicit through `laneId`
- `is_midi === true` -> `MidiClip`
- `is_midi === false` -> `AudioClip`
- current clip `color` -> `colorToken` through UI token mapping
- `start_beats` / `end_beats` -> `startBeat` / `lengthBeats`

Migration note:

- current nested clip arrays should be flattened into a clip registry plus lane summaries

### MIDI Note Registry

Current source:

- `SessionClip.midi_data`

Current gap:

- MIDI notes are stored inline on the clip
- some legacy paths still tolerate multiple payload shapes

Target mapping:

- `midi_data.notes[]` -> `MidiNote` registry entries
- `MidiClip.midiNoteIds` becomes the stable link
- clip summary (`noteCount`, pitch range, density) should be derived once, not recalculated in multiple components

Migration note:

- the note registry is required if Guide/runtime annotations are meant to attach to notes without mutating clip payload blobs

### Automation

Current source:

- `SessionTrack.automation_lanes`

Target mapping:

- track automation lanes -> `AutomationLane`
- lane ids collected on `StudioTrack.automationLaneIds`

Current constraint:

- current automation is still track-scoped and browser-side
- connected-mode authority rules do not require host automation mirroring yet

### Device Chains And Plugins

Current sources:

- `SessionTrack.device_chain`
- `hostState.nativeChains`
- `useNativeHostSync` host plugin tracking

Current gap:

- chain state exists simultaneously as persisted session data, host runtime summaries, and local sync bookkeeping

Target mapping:

- persisted `device_chain` -> initial `DeviceChain` / plugin summaries
- host `nativeChains` -> runtime overlay on chain and plugin summary fields
- `nativePluginId`, editor state, enabled/bypassed, and parameter preview state should come from host adapter summaries in connected mode

Constraint:

- do not mirror full plugin parameter trees in always-live Studio state
- keep `PluginInstanceSummary` lightweight and fetch full detail on demand

### Mixer Summaries

Current sources:

- `SessionTrack.volume`
- `SessionTrack.pan`
- `SessionTrack.is_muted`
- `SessionTrack.is_soloed`
- `hostState.trackMeters`
- `hostState.masterMeter`
- arm/monitor overlays from host session/playback state

Target mapping:

- one `MixerStripSummary` per track
- one summary for master
- persistent values from session rows
- live meters and runtime arm/monitor overlays from host in connected mode

Constraint:

- meter state must not stay embedded in page-local derivations inside `Studio.tsx`

### Routing Summaries

Current sources:

- `SessionTrack.sends`
- `SessionTrack.input_from`
- host graph payload normalization in `useNativeHostSync`

Target mapping:

- `RoutingSummary` stays narrow:
  - source input selection
  - send targets and levels
  - output target summary

Constraint:

- do not expand this into a full mirrored native routing graph unless a concrete workflow requires it

### Selection And Panels

Current sources:

- `useStudioSelection`
- page-local panel and browser UI state in `Studio.tsx`

Target mapping:

- selection ids -> `SelectionState`
- current bottom workspace tab, browser open state, mixer visibility, lesson panel visibility -> `PanelState`
- browser search/category/preview context -> `BrowserContext`

Constraint:

- local UI state remains local-authoritative until explicitly promoted to shared session UI state

## File-Level Mapping

### `src/pages/Studio.tsx`

Current role:

- integration shell
- state composition point
- derived display state
- transport routing
- panel layout

Target role:

- composition root only
- should consume selectors from canonical Studio domain state
- should not derive transport/meter/track graph shape itself

### `src/hooks/useHostConnector.ts`

Current role:

- raw host runtime state container

Target role:

- host transport/event source
- should feed a host adapter, not the page directly

### `src/hooks/useNativeHostSync.ts`

Current role:

- session-to-host normalization and side effects

Target role:

- split into:
  - host graph command submission
  - chain lifecycle adapter
  - runtime reconciliation helpers

### `src/hooks/useStudioTransport.ts`

Current role:

- transport fallback and command routing

Target role:

- command bus transport facade over canonical transport summary

## Current Duplication And Risk

The main duplicated areas are:

- mute/solo/armed/monitoring state
- transport/playback summaries
- device chain identity and plugin runtime state
- meter derivation inside page code
- track graph shape derived ad hoc from track arrays

These are the highest-risk migration points because they currently span persisted data, host runtime, and page-local derivation.

## Migration Sequence

1. Introduce selector-oriented target state mappers without changing UI behavior
2. Build host adapter summaries for transport, meters, chains, and runtime track state
3. Flatten track/clip/note/session state into a canonical Studio-domain store
4. Make `Studio.tsx` consume selectors only
5. Replace ad hoc sync code with command bus + adapter calls

## Completion Criteria

`MH-005` is complete when:

- every major current runtime source has a documented target-domain destination
- canonical precedence rules are explicit
- duplicated ownership zones are identified
- the next implementation step (`MH-006`) can be designed against this mapping without reopening state-model questions
