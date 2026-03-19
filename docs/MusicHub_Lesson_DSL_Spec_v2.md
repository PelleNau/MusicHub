# MusicHub Lesson DSL Specification v2

## Purpose

This document defines the **Lesson Definition Language (DSL)** for MusicHub.

It replaces the looser v0.1 concept with a runtime-aligned specification that can be used by:

- lesson authors
- AI lesson generation
- frontend rendering
- backend/runtime validation
- Guide orchestration

This spec is designed to work with:

- `docs/MusicHub_Studio_Domain_Model_v2.md`
- `docs/MusicHub_Interaction_Flows_v1.md`
- `src/types/musicHubCommands.ts`
- `docs/project/MH-044_Lesson_View_Policy.md`

The core rule is:

- lessons describe **intent**
- lessons target **stable anchors**
- lessons observe **commands, acknowledgments, and canonical Studio state**
- lessons do **not** encode UI implementation details

---

## Design goals

The DSL must be:

- declarative
- portable
- AI-generatable
- human-readable
- runtime-executable
- stable across UI refactors

The DSL must not depend on:

- component names
- DOM structure
- route-specific implementation details
- raw plugin-host payloads

The DSL may describe lesson-time view policy, but only in product terms such as panel visibility, focus target, or zoom intent. It must not encode component structure.

---

## Runtime model

Every lesson step operates against four concepts:

1. **anchor**
   - where the lesson points
2. **expected action**
   - what command/event/ack/state transition the runtime is watching for
3. **validation**
   - what must become true before the step completes
4. **assist/reset behavior**
   - what the runtime may do to help the user recover or continue

Lessons may also define a fifth overlay concept:

5. **view policy**
   - how the Studio shell should focus, collapse, hide, or emphasize surfaces for the current lesson or step

Step completion should prefer, in order:

1. canonical selector state
2. command acknowledgment / host confirmation
3. observed command dispatch
4. UI-local events only when no stronger signal exists

---

## Lesson hierarchy

The hierarchy remains:

```text
Course
  └ Module
      └ Lesson
          └ Step
```

Each lesson file contains exactly one lesson definition.

---

## Supported formats

Recommended authoring formats:

- YAML
- JSON

YAML examples are used in this document.

---

## Top-level lesson schema

```yaml
lessonId: foundations.sound.pitch.intro
title: Understanding Pitch
moduleId: foundations.sound
version: 1
difficulty: beginner
estimatedMinutes: 6
layoutMode: guided
viewPolicy:
  panels:
    browser: hide
    guide: show

objectives:
  - Recognize higher vs lower pitch
  - Understand pitch control

prerequisites: []
tags:
  - pitch
  - synthesis

entry:
  commands:
    - type: studio.setLayoutMode
      payload:
        mode: guided
    - type: studio.openPanel
      payload:
        panel: detail

steps: []
```

---

## Top-level fields

### Required

- `lessonId`
- `title`
- `moduleId`
- `version`
- `steps`

### Recommended

- `difficulty`
- `estimatedMinutes`
- `layoutMode`
- `objectives`
- `entry`
- `viewPolicy`
- `tags`

---

## Step schema

Each step is declarative and self-contained.

```yaml
- stepId: adjustPitch
  instruction: Raise the pitch of the sound.
  anchor:
    targetType: panel
    targetId: detail
    highlight: pitchControl
  expected:
    kind: command
    type: studio.setPluginParam
  validation:
    all:
      - kind: selector
        path: selection.selectedTrack.role
        equals: instrument
      - kind: selector
        path: plugin.featuredParams.pitch.delta
        gt: 0
  hints:
    - id: hint-1
      text: Try dragging the pitch control upward.
  reset:
    commands:
      - type: studio.openPanel
        payload:
          panel: detail
```

---

## Required step fields

- `stepId`
- `instruction`
- `anchor`
- `validation`

## Optional step fields

- `title`
- `expected`
- `viewPolicy`
- `hints`
- `reset`
- `onSuccess`
- `onFailure`
- `timeoutSeconds`
- `next`
- `skippable`

---

## Anchor schema

Anchors are **product anchors**, not DOM selectors.

They must resolve against stable product-facing anchor IDs or target IDs from the canonical domain model.

```yaml
anchor:
  targetType: panel
  targetId: detail
  highlight: pitchControl
```

### Anchor fields

- `targetType`
- `targetId`
- `highlight` optional
- `placement` optional
- `fallbackText` optional

### Allowed `targetType`

- `panel`
- `track`
- `track-header`
- `track-lane`
- `clip`
- `note`
- `plugin-slot`
- `plugin-param`
- `mixer-strip`
- `send`
- `timeline-region`
- `browser-asset`
- `lesson-panel`

### Anchor resolution rule

The runtime must resolve anchors through stable product IDs or anchor registries exposed by the app. It must not rely on ad hoc component structure.

---

## View policy schema

Lessons may define optional shell/view overrides at:

- top-level lesson
- `entry`
- per-step

These overrides are declarative and must not name React components or DOM nodes.

```yaml
viewPolicy:
  panels:
    browser: hide
    guide: show
    bottomWorkspace: contextual
  viewport:
    focus: arrangement
    anchorTargetId: rhythm-grid
    zoomToAnchor: true
  interaction:
    emphasizeAnchor: true
    dimNonEssentialPanels: true
```

### Supported panel states

- `inherit`
- `show`
- `hide`
- `collapse`
- `contextual`

### Supported focus targets

- `arrangement`
- `browser`
- `guide`
- `mixer`
- `pianoRoll`
- `detail`
- `transport`
- `statusBar`

View policy changes shell presentation only. It does not redefine runtime authority.

---

## Expected action schema

`expected` describes what the runtime is listening for.

It does not complete the step by itself. Validation still decides completion.

```yaml
expected:
  kind: command
  type: transport.play
```

### Allowed `expected.kind`

- `command`
- `ack`
- `selector`
- `event`

### Rules

- `command` means a typed MusicHub command was dispatched
- `ack` means a typed command acknowledgment or host confirmation was observed
- `selector` means the runtime is watching for a selector path to change
- `event` is allowed only for UI/runtime events that have no stable command representation yet

### Examples

```yaml
expected:
  kind: command
  type: studio.createClip
```

```yaml
expected:
  kind: ack
  type: studio.loadPlugin
  status: confirmed
```

```yaml
expected:
  kind: selector
  path: transport.playing
```

---

## Validation schema

Validation is the actual completion contract.

It must be explicit and machine-checkable.

### Simple validation

```yaml
validation:
  kind: selector
  path: transport.playing
  equals: true
```

### Composite validation

```yaml
validation:
  all:
    - kind: selector
      path: selection.selectedTrack.id
      exists: true
    - kind: selector
      path: selection.selectedClip.type
      equals: midi
```

### Supported validation operators

- `equals`
- `notEquals`
- `exists`
- `in`
- `gt`
- `gte`
- `lt`
- `lte`
- `changed`
- `matches`
- `countGte`
- `countLte`

### Validation source kinds

- `selector`
- `ack`
- `command`
- `event`

### Examples

#### Confirm transport started

```yaml
validation:
  kind: selector
  path: transport.playing
  equals: true
```

#### Confirm a clip exists

```yaml
validation:
  kind: selector
  path: selection.selectedClip.id
  exists: true
```

#### Confirm a track was created

```yaml
validation:
  kind: command
  type: studio.createTrack
  countGte: 1
```

#### Confirm host-backed plugin load completed

```yaml
validation:
  kind: ack
  type: studio.loadPlugin
  status: confirmed
```

#### Confirm a parameter moved upward

```yaml
validation:
  kind: selector
  path: plugin.featuredParams.pitch.delta
  gt: 0
```

---

## Selector paths

Validation and observation should refer to canonical selector paths, not arbitrary object traversal.

Examples:

- `transport.playing`
- `transport.beat`
- `selection.selectedTrack.id`
- `selection.selectedTrack.role`
- `selection.selectedClip.id`
- `selection.selectedClip.type`
- `panels.activeBottomPanel`
- `browser.selectedAssetId`
- `track.<trackId>.state.muted`
- `track.<trackId>.mixer.peak`
- `plugin.<pluginId>.editorOpen`
- `lesson.currentStepId`

Rule:

- selector paths must resolve through the Guide/runtime selector layer
- if a path is not stable enough to publish, it should not be used in lessons yet

---

## Hint schema

Hints are progressive and optional.

```yaml
hints:
  - id: hint-1
    text: Try opening the detail panel.
  - id: hint-2
    text: Look for the pitch control in the selected instrument.
```

Hint fields:

- `id`
- `text`
- `anchorId` optional
- `showAfterSeconds` optional

---

## Reset schema

Reset behavior must use safe product commands. It must not depend on view internals.

```yaml
reset:
  commands:
    - type: studio.select
      payload:
        trackId: track.keys
        panel: detail
    - type: studio.openPanel
      payload:
        panel: detail
```

Supported reset patterns:

- select track/clip/panel
- reopen panel
- restore layout mode
- re-highlight target
- optionally reload lightweight lesson context

Reset should avoid destructive edits unless the lesson explicitly marks them safe.

---

## Step progression

Runtime progression:

1. load lesson
2. run lesson `entry` commands
3. activate current step
4. resolve anchor
5. display instruction
6. observe expected command/event/ack/state
7. evaluate validation
8. if valid, mark step complete
9. apply `onSuccess` commands if any
10. advance to next step

---

## Success/failure hooks

Optional step hooks can use safe commands.

```yaml
onSuccess:
  commands:
    - type: lesson.showHint
      payload:
        lessonId: foundations.sound.pitch.intro
        hintId: success-note
        text: Good. You changed the pitch upward.
```

```yaml
onFailure:
  commands:
    - type: lesson.showHint
      payload:
        lessonId: foundations.sound.pitch.intro
        hintId: recovery
        text: Try selecting the instrument track first.
```

---

## Conditional progression

Conditional branching is allowed, but only against stable lesson/runtime context.

```yaml
next:
  when:
    kind: selector
    path: user.mode
    equals: beginner
  then: beginnerWrapUp
  else: advancedWrapUp
```

This is optional and should be used sparingly in early versions.

---

## Execution constraints

The DSL must obey these rules:

1. lessons cannot depend on component names
2. lessons cannot require direct DOM selectors
3. lessons should validate against selector state or acknowledgments whenever possible
4. lessons should use command names from the shared MusicHub command contract
5. lessons must assume native host authority for engine-owned truth in connected mode
6. lessons should target summaries, not raw engine payloads

---

## Example lesson

```yaml
lessonId: foundations.beat.first_clip
title: Create Your First MIDI Clip
moduleId: foundations.beat
version: 1
difficulty: beginner
estimatedMinutes: 5
layoutMode: guided

objectives:
  - Create a MIDI clip
  - Start playback

entry:
  commands:
    - type: studio.setLayoutMode
      payload:
        mode: guided
    - type: studio.openPanel
      payload:
        panel: pianoRoll

steps:
  - stepId: createTrack
    instruction: Create a MIDI track.
    anchor:
      targetType: timeline-region
      targetId: arrangement.addTrack
      highlight: midiAddButton
    expected:
      kind: command
      type: studio.createTrack
    validation:
      kind: command
      type: studio.createTrack
      countGte: 1

  - stepId: createClip
    instruction: Create a MIDI clip in the arrangement.
    anchor:
      targetType: track-lane
      targetId: selectedTrack.primaryLane
    expected:
      kind: command
      type: studio.createClip
    validation:
      all:
        - kind: command
          type: studio.createClip
          countGte: 1
        - kind: selector
          path: selection.selectedClip.type
          equals: midi

  - stepId: pressPlay
    instruction: Start playback.
    anchor:
      targetType: panel
      targetId: transport
      highlight: playButton
    expected:
      kind: command
      type: transport.play
    validation:
      kind: selector
      path: transport.playing
      equals: true
```

---

## Implementation note

This DSL is a **product contract**, not a frontend-only format.

Frontend, Guide runtime, and backend/native-aware validation should all interpret the same lesson definition against:

- stable anchors
- typed commands
- typed acknowledgments
- canonical selector state

That is the only way lessons remain durable as the UI evolves.
