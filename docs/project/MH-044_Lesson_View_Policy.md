# MH-044 — Lesson View Policy

## Purpose

Define a deterministic lesson-level shell policy that can temporarily reshape Studio without creating separate lesson-only screens or separate Studio architectures.

This contract exists to solve one problem:

- many lessons need different parts of the DAW visible
- a single static Guided layout will not satisfy the curriculum
- the runtime should be able to focus, hide, collapse, and zoom without changing core Studio authority

The rule is:

- base Studio mode (`guided`, `standard`, `focused`) defines default shell density
- lesson view policy overlays that default for the current lesson or step
- final shell state is resolved from both layers

---

## Core Principles

1. One Studio, not multiple lesson apps
2. Native/core authority does not change
3. Lesson policy changes visibility, emphasis, and viewport, not core editing semantics
4. Lessons should expose only the minimum useful surface for the current step
5. Step-level view policy may override lesson-level policy

---

## What Lesson View Policy Controls

### Panels

Lesson policy may override:

- browser
- guide sidebar
- bottom workspace
- mixer
- piano roll
- detail panel

Supported states:

- `inherit`
- `show`
- `hide`
- `collapse`
- `contextual`

### Viewport

Lesson policy may request:

- focus region
- anchor-target zoom
- selection zoom
- explicit beat range

This is how rhythm, clip-editing, and piano-roll lessons avoid opening the full DAW at full scale.

### Interaction emphasis

Lesson policy may request:

- emphasize current anchor
- dim non-essential panels
- lock panel switching for constrained steps
- lock bottom-tab switching for constrained steps

These are not permanent product restrictions. They are temporary lesson affordances.

---

## Resolution Order

Final shell state should resolve in this order:

1. base Studio mode policy
2. lesson-level view policy
3. current step-level view policy
4. runtime safety overrides if a required surface is unavailable

Example:

- base guided mode hides browser
- lesson-level policy keeps browser hidden
- current step says browser `show`
- final state: browser shown for that step only

---

## Recommended Usage By Lesson Type

### Rhythm / step placement lessons

- focus: arrangement
- browser: hide
- guide: show
- bottom workspace: hide
- zoom to anchor or beat range

### MIDI editing lessons

- focus: pianoRoll
- piano roll: show
- browser: collapse
- mixer: hide
- detail: contextual

### Audio trim / waveform lessons

- focus: arrangement
- browser: hide
- bottom workspace: hide
- zoom to anchor

### Instrument / preset lessons

- focus: browser or detail
- browser: show
- detail: contextual or show
- mixer: hide

### Mixing lessons

- focus: mixer
- bottom workspace: show
- mixer: show
- browser: collapse
- guide: collapse or contextual

---

## Non-Goals

Lesson view policy does not:

- redefine transport authority
- redefine session persistence
- redefine native-host ownership
- define command semantics
- replace the anchor system

It is a shell orchestration layer only.

---

## DSL Integration

This policy belongs in:

- `lesson.viewPolicy`
- `lesson.entry.viewPolicy`
- `lesson.steps[].viewPolicy`

So authors can express:

- overall lesson shell intent
- entry-time layout shaping
- step-specific focus/zoom/visibility changes

---

## Example

```yaml
lessonId: foundations.rhythm.grid-placement
title: Grid and Step Placement
layoutMode: guided
viewPolicy:
  panels:
    browser: hide
    guide: show
    bottomWorkspace: hide
  viewport:
    focus: arrangement
    beatRange:
      start: 0
      end: 4

steps:
  - stepId: placeKick
    instruction: Place a kick on beat one.
    anchor:
      targetType: timeline-region
      targetId: rhythm-grid
      highlight: beat-1
    viewPolicy:
      viewport:
        anchorTargetId: rhythm-grid
        zoomToAnchor: true
      interaction:
        emphasizeAnchor: true
        dimNonEssentialPanels: true
```

---

## Consequence

This allows the curriculum to stay broad without forcing:

- one rigid Guided layout
- many bespoke lesson screens
- runtime drift between learning and creation

The next implementation phase should resolve this policy into:

- shell visibility overrides
- panel open/collapse defaults
- bottom-tab targeting
- timeline zoom/scroll requests
- anchor emphasis behavior
