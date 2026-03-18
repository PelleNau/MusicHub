# MH-024 — Guide Anchor Resolution and Validation Context

## Purpose

Define how lesson anchors resolve against the running application and how Guide validation reads canonical state.

This is the boundary that prevents lessons from depending on incidental component structure.

---

## Core rule

Guide anchors must resolve through a stable product registry, not through DOM selectors or component names.

The anchor system should survive:

- page refactors
- component replacement
- layout changes
- shell changes

---

## Anchor classes

Anchors fall into three classes:

### 1. Structural anchors

Stable product areas:

- `panel:detail`
- `panel:mixer`
- `panel:pianoRoll`
- `panel:browser`
- `panel:lesson`

### 2. Entity anchors

Anchors that refer to canonical entities:

- `track:<trackId>`
- `clip:<clipId>`
- `plugin-slot:<slotId>`
- `mixer-strip:<trackId>`

### 3. Highlight anchors

Stable sub-targets inside a structural or entity anchor:

- `pitchControl`
- `transportPlay`
- `loopRegion`
- `clipHeader`

Highlight IDs are product vocabulary, not component prop names.

---

## Registry shape

The anchor registry should expose:

1. anchor id
2. target type
3. target id
4. availability
5. optional runtime metadata

Recommended output:

- resolved anchor id
- owning panel
- target bounds provider or runtime target reference
- availability state

---

## Resolution flow

For each lesson step:

1. read `LessonAnchorRef`
2. resolve structural/entity target against the registry
3. resolve optional highlight id against the target’s supported highlights
4. if not available, surface `fallbackText` and mark as unresolved
5. continue evaluating the step only if the validation model still allows it

---

## Validation context

Guide validation should read from one canonical context object.

That context should include:

1. `selectors`
2. `recentCommands`
3. `recentAcks`
4. `recentEvents`
5. `resolvedAnchors`

Validation rules should never query page-local React state directly.

---

## Selector path policy

Selector paths referenced by lessons must point to stable Guide-facing selector names, not arbitrary object internals.

Good:

- `selection.selectedTrack.id`
- `panel.showPianoRoll`
- `transport.playbackState`

Bad:

- `studioPage.localState.foo`
- `component.props.track.id`

This implies that selector-facing Guide state should be intentionally exposed and versioned.

---

## Recommended initial anchor namespace

The first namespace should include:

- `panel:browser`
- `panel:detail`
- `panel:mixer`
- `panel:pianoRoll`
- `panel:timeline`
- `transport:play`
- `transport:stop`
- `transport:tempo`
- `timeline:loopRegion`
- `track:<id>`
- `clip:<id>`
- `mixer-strip:<id>`

Only add anchors that can be kept stable.

---

## Failure policy

When an anchor cannot resolve:

1. do not crash the lesson runtime
2. mark the anchor unresolved
3. surface `fallbackText` if present
4. allow selector/command validation to continue when logically possible
5. record a structured resolution failure for debugging

---

## Migration rule

During the current Studio migration:

- anchors should bind to selector-backed product concepts first
- avoid registering anchors directly from page-local transient derivations
- if a target still depends on transitional page-local state, treat it as provisional and do not expose it as a stable public lesson anchor
