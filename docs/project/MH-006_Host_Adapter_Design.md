# MH-006 Host Adapter Design

## Purpose

Define the adapter layer that translates native host runtime payloads and current session entities into the stable MusicHub Studio domain model.

This layer exists so the rest of the frontend can target domain selectors and commands instead of raw host connector payloads.

## Problem Statement

Today the frontend uses host runtime data directly through:

- `useHostConnector`
- `useStudioTransport`
- `useNativeHostSync`
- local derivations inside `Studio.tsx`

This causes three problems:

1. raw host payloads leak into page/UI logic
2. host/runtime state and persisted session state are reconciled in multiple places
3. connected-mode authority is easy to accidentally violate

The adapter layer should fix this.

## Design Rule

The adapter does not own audio truth. The native host remains authoritative in connected mode.

The adapter only does three things:

1. normalize host runtime payloads
2. merge them with persisted project/session entities according to canonical precedence rules
3. expose stable domain summaries and selectors

## Proposed Layer

### Inputs

Persisted/project inputs:

- `Session`
- `SessionTrack[]`
- `SessionClip[]`
- automation lane data
- browser/local selection state

Native/runtime inputs:

- `hostState.transport`
- `hostState.playback`
- `hostState.trackMeters`
- `hostState.masterMeter`
- `hostState.sessionState`
- `hostState.audioEngineState`
- `hostState.nativeChains`
- `hostState.recording`
- `hostState.recordLevels`

### Outputs

The adapter produces domain-facing outputs:

- `StudioSessionRoot`
- `StudioDomainStore`
- `StudioDomainSelectors`
- runtime overlay maps for connected mode

## Proposed Modules

### `studioDomainSessionMapper`

Responsibility:

- map persisted session/project data into base domain entities

Output:

- tracks
- clip lanes
- clip registry
- midi note registry
- automation lanes
- base mixer summaries
- base routing summaries

### `studioHostRuntimeAdapter`

Responsibility:

- normalize host runtime payloads into domain-level summaries

Output:

- `TransportSummary`
- runtime track-state overlays
- runtime mixer meter overlays
- runtime device chain/plugin summaries
- recording/runtime status overlays

### `studioDomainAssembler`

Responsibility:

- merge base session state with runtime overlays
- apply connected-mode authority rules
- output canonical domain store shape

### `studioDomainSelectors`

Responsibility:

- provide stable read APIs to the UI

Examples:

- visible tracks in graph order
- current transport summary
- mixer strips with live meters
- active device chain summary for selected track
- selected clip with expanded notes
- current lesson anchor targets

## Authority Rules

### Connected Mode

Authoritative from native host:

- `playing`
- `recording`
- current beat
- meters
- plugin runtime/editor state
- arm/monitor runtime state

Authoritative from persisted/project state:

- project/session metadata
- track naming, ordering, color, role
- clips, notes, automation
- panel and browser state

### Mock / Standalone Mode

Authoritative from browser/runtime:

- transport
- meters
- plugin-ish preview/runtime state

The adapter interface should not change between modes. Only the source of overlays changes.

## Store Shape

The adapter should target a normalized store with:

- `sessionRoot`
- `tracksById`
- `trackIds`
- `clipLanesById`
- `clipsById`
- `midiNotesById`
- `automationLanesById`
- `deviceChainsById`
- `mixerStripsById`
- `routingById`
- `anchorsById`

Runtime overlays should remain separate internally while being exposed through selectors as a resolved final view.

## Proposed API

```ts
export interface StudioDomainAdapterInput {
  mode: "mock" | "connected" | "unavailable";
  session: Session | null;
  tracks: SessionTrack[];
  selectionState: CurrentSelectionState;
  panelState: CurrentPanelState;
  browserContext: CurrentBrowserContext;
  hostState: CurrentHostConnectorState;
}

export interface StudioDomainAdapterResult {
  sessionRoot: StudioSessionRoot;
  store: StudioDomainStore;
  selectors: StudioDomainSelectors;
}

export function buildStudioDomain(input: StudioDomainAdapterInput): StudioDomainAdapterResult;
```

The UI should eventually depend on `StudioDomainAdapterResult`, not on raw host connector shape plus local derivations.

## Initial Selectors

The first selector set should be small and sufficient:

- `getTransportSummary()`
- `getTimelineModel()`
- `getOrderedTracks()`
- `getReturnTracks()`
- `getMasterTrack()`
- `getMixerStrips()`
- `getTrackById(trackId)`
- `getClipById(clipId)`
- `getMidiNotesForClip(clipId)`
- `getDeviceChainForTrack(trackId)`
- `getSelectionState()`
- `getPanelState()`

## Non-Goals

The adapter should not:

- mirror every host payload field into shared UI state
- own command dispatch
- fetch heavy plugin parameter trees by default
- become a second page-level orchestration layer

## Migration Plan

### Phase A

- add adapter module alongside current runtime
- write mappers with no UI behavior changes
- log parity mismatches during development if needed

### Phase B

- make `Studio.tsx` consume adapter selectors instead of raw derivations
- reduce direct `hostState.*` reads in page code

### Phase C

- move `useStudioTransport` and `useNativeHostSync` behind adapter/command bus boundaries

## Immediate Follow-On

The next task after this design is `MH-007`:

- define the command bus contract that operates against the same domain model and adapter outputs

That command bus should sit beside the adapter, not inside it.
