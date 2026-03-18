# MusicHub Interaction Flows v1

## Purpose

This document defines the primary end-to-end product flows that MusicHub should support on top of the architecture brief and Studio Domain Model v2.

It connects:

- product intent
- Studio domain objects
- command bus behavior
- Guide/lesson runtime behavior
- native host authority

This is not a screen spec. It is an operating map for how the product should behave.

---

## Core operating rule

Every flow should respect the same principle:

1. the user acts in Studio
2. the action becomes a command
3. the command updates Studio/UI state optimistically where safe
4. the native host confirms or rejects engine-owned state
5. Guide/lesson systems observe the resulting product state

This keeps MusicHub coherent across production, learning, and assistance.

---

## Flow 1 — Onboarding Into Beginner Mode

### Goal

A new user enters MusicHub and starts from a guided, simplified Studio experience instead of an empty professional DAW.

### Preconditions

- user is authenticated or in a valid starter flow
- no active project is loaded, or a starter template is requested

### Primary domain objects

- `MusicHubProject`
- `StudioSessionRoot`
- `PanelState`
- `BrowserContext`
- `LessonBindings`

### Intended command sequence

```ts
studio.setLayoutMode({ mode: "beginner" })
studio.openPanel({ panel: "browser" })
content.loadTemplate({ templateId })
lesson.start({ lessonId })
lesson.highlight({ target })
lesson.showHint({ id, text, placement })
```

### UX expectations

- simplified layout
- fewer visible panels
- browser and content suggestions immediately visible
- first lesson or first task already contextualized
- no requirement to understand routing/plugin concepts up front

### Validation

- layout mode is `beginner`
- expected panels are open
- starter template loaded
- first lesson step active

---

## Flow 2 — Create a First Beat

### Goal

A user creates a simple beat quickly using a starter workflow rather than constructing everything manually.

### Primary domain objects

- `StudioTrack`
- `ClipLane`
- `MidiClip`
- `MidiNote`
- `BrowserAsset`
- `LessonValidationContext`

### Flow

1. user selects a starter pattern, drum asset, or guided beat lesson
2. MusicHub creates or targets an appropriate track
3. MusicHub inserts a MIDI clip or audio loop
4. user edits notes or arrangement
5. Guide validates progress through summaries, not raw engine data

### Intended command sequence

```ts
studio.createTrack({ type: "midi", name: "Drums" })
studio.loadPlugin({ trackId, pluginId, slot: 0 })
studio.createClip({ trackId, startBeat: 0, lengthBeats: 4, clipType: "midi" })
studio.insertMidiNotes({ clipId, notes })
transport.play()
lesson.expect({ event, condition })
```

### UX expectations

- the user does not need to understand chains or routing to get sound
- visual guidance can point at track lane, clip, and piano roll anchors
- validation should use `MidiClipSummary` and `SelectionState`

### Validation

- track exists
- clip exists
- minimum note count or pattern rule satisfied
- playback works through native transport

---

## Flow 3 — Load an Instrument and Play It

### Goal

A user creates an instrument-oriented track and gets immediate audible feedback.

### Primary domain objects

- `StudioTrack`
- `DeviceChain`
- `PluginInstanceSummary`
- `MixerStripSummary`
- `RoutingSummary`

### Flow

1. user adds an instrument from browser or template
2. Studio creates a track with role `instrument`
3. native host creates and confirms the chain/plugin instance
4. Studio reflects confirmed plugin and meter state
5. user can audition notes or enter MIDI

### Intended command sequence

```ts
studio.createTrack({ type: "midi", name: "Keys" })
studio.loadPlugin({ trackId, pluginId, slot: 0 })
studio.focusTrack({ trackId })
transport.play()
```

### UX expectations

- “instrument track” is a product concept even if implemented as MIDI + instrument chain
- plugin browser should present outcome-based choices
- Detail panel should open without exposing raw host internals by default

### Validation

- chain confirmed by native host
- plugin summary present
- track can receive notes
- meter activity visible when sound is produced

---

## Flow 4 — Drag a Sample to the Arrangement

### Goal

A user drags a loop or sample from the browser into the arrangement and MusicHub applies the correct insertion behavior.

### Primary domain objects

- `BrowserAsset`
- `AudioClip`
- `ClipLane`
- `StudioTrack`

### Flow

1. user browses or searches assets
2. user drags an asset to a track or empty arrangement space
3. MusicHub resolves `insertBehavior`
4. a target track is chosen or created
5. an audio clip is created and attached to a lane

### Intended command sequence

```ts
browser.search({ query })
browser.filter({ category, tags, difficulty })
studio.previewAsset({ assetId })
studio.addSampleToTrack({ trackId, assetId, startBeat })
```

### UX expectations

- browser should make insertion expectations obvious
- dropping an asset should not require understanding track types beforehand
- if a new track is needed, that should be handled automatically

### Validation

- clip created
- clip attached to exactly one lane and one track
- waveform/preview metadata available if needed

---

## Flow 5 — Insert a Preset Chain

### Goal

A user applies an outcome-based preset chain such as a synth chain, vocal chain, or starter mix chain.

### Primary domain objects

- `PresetChain`
- `DeviceChain`
- `DeviceSlot`
- `PluginInstanceSummary`

### Flow

1. user selects a preset chain from browser/content
2. command resolves chain blueprint
3. native host creates plugin instances
4. Studio updates chain summary as native confirmations arrive
5. Guide may explain the chain in product language

### Intended command sequence

```ts
content.insertPresetChain({ trackId, presetId })
studio.loadPlugin({ trackId, pluginId, slot })
studio.setPluginParam({ chainId, pluginId, paramId, value })
```

### UX expectations

- chain is presented as a meaningful musical outcome, not a raw plugin list
- if native host has not yet confirmed all instances, Studio can stage a loading summary
- full parameter trees are still on-demand

### Validation

- slot population matches blueprint
- plugin summaries confirmed
- any critical featured parameters available

---

## Flow 6 — Complete a Guided Lesson

### Goal

A user completes a structured lesson that observes Studio state and uses the same command system as the rest of the product.

### Primary domain objects

- `LessonBindings`
- `LessonValidationContext`
- `SelectionState`
- `MidiClipSummary`
- `StudioAnchor`

### Flow

1. lesson starts
2. relevant anchors are highlighted
3. lesson instructs user to act
4. Guide observes Studio state and recent commands
5. lesson validates completion and advances

### Intended command sequence

```ts
lesson.start({ lessonId })
lesson.highlight({ target })
lesson.showHint({ id, text, placement })
lesson.expect({ event, condition })
lesson.completeStep({ stepId })
lesson.nextStep()
```

### UX expectations

- lessons attach to real Studio surfaces, not detached modal flows
- lessons do not directly mutate Studio objects
- validation uses summaries and events, not DOM hacks or component internals

### Validation

- expected object exists
- expected command or summary condition is observed
- current step advances correctly

---

## Flow 7 — Transition From Guided Mode to Pro Mode

### Goal

A user moves from a simplified, assisted workflow to a more complete production workflow without switching to a different app model.

### Primary domain objects

- `PanelState`
- `SelectionState`
- `LessonBindings`
- `SessionMetadata`

### Flow

1. user chooses a less assisted mode or reaches a threshold
2. layout mode changes
3. more panels and controls become visible
4. Studio model remains unchanged
5. Guide becomes less intrusive, not absent

### Intended command sequence

```ts
studio.setLayoutMode({ mode: "guided" })
studio.openPanel({ panel: "mixer" })
studio.openPanel({ panel: "detail" })
lesson.clearHighlight({})
```

### UX expectations

- same project, same track graph, same clips, same chains
- no migration of underlying objects
- progressive disclosure rather than branching products

### Validation

- layout mode changes
- panel visibility updates
- object identity is preserved

---

## Flow 8 — AI Suggestion to Action

### Goal

AI behaves as a first-class assistant by using the same command bus as users and lessons.

### Primary domain objects

- `SelectionState`
- `BrowserContext`
- `LessonValidationContext`
- `PluginInstanceSummary`
- `StudioCommandSummary`

### Flow

1. AI reads observable Studio state
2. AI proposes an action in product language
3. user accepts
4. assistant issues a command through the same command bus
5. Studio/native host process it as a normal command

### Intended command sequence

```ts
assistant.suggestNextStep({ context })
assistant.applySuggestion({ suggestionId })
studio.createTrack({ type: "midi" })
studio.loadPlugin({ trackId, pluginId })
studio.createClip({ trackId, startBeat, lengthBeats, clipType: "midi" })
```

### UX expectations

- AI never bypasses the command bus
- AI suggestions are explainable
- AI does not mutate raw state directly
- AI actions should be auditable and reversible where appropriate

### Validation

- accepted suggestion maps to a real command
- command appears in recent command history
- resulting state is visible in normal Studio selectors

---

## Flow 9 — Native Host Disconnect and Recovery

### Goal

Connected mode fails safely and recovers without confusing authority or fake playback behavior.

### Primary domain objects

- `TransportSummary`
- `PanelState`
- `SelectionState`
- host connection state in the application layer

### Flow

1. host disconnects or becomes degraded
2. UI reflects disconnected/degraded state
3. engine-owned live values stop being treated as fresh
4. app does not silently become a second audio engine in connected mode
5. on reconnect, state is reconciled from native authority

### UX expectations

- clear connection status
- no stale transport pretending to be authoritative
- no hidden fallback to local playback in connected mode

### Validation

- disconnect state visible
- reconnect state visible
- transport/playhead/meters reconcile from native host when available again

---

## Cross-flow rules

These rules apply to all flows:

### Rule 1

All user, lesson, template, and AI actions should route through a shared command bus.

### Rule 2

Engine-owned state must resolve from native confirmation in connected mode.

### Rule 3

Guide/lesson systems observe product state and command history, not component internals.

### Rule 4

Modes change visibility and assistance, not the underlying domain model.

### Rule 5

Stable anchors are required anywhere overlays, hints, or explanations may attach.

---

## Implementation priority

The first implementation pass should support at least these flows:

1. onboarding into beginner mode
2. create a first beat
3. load an instrument and play it
4. drag a sample to arrangement
5. complete a guided lesson

Those five flows cover the product’s core promise:

- create
- learn
- explore
- hear results immediately
- stay within one environment

---

## Final statement

**MusicHub should be implemented as one commandable Studio environment where production actions, guided lessons, content insertion, and AI assistance all operate through the same command/state model while the native host remains authoritative for engine-driven truth.**
