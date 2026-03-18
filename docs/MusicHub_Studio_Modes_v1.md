# MusicHub Studio Modes v1

## Purpose

Studio should not split into separate products for beginners and advanced users.

It should remain one Studio with one session model, one command/state system, and one runtime authority model.

What changes is the presentation mode:

- `Guided`
- `Standard`
- `Focused`

These are UX modes, not different DAWs.

## Core Rule

Change:

- visual density
- default visible panels
- lesson visibility
- guidance strength
- emphasis and layout

Do not change:

- transport authority
- session model
- host connection model
- editing semantics
- command/state contracts

## Mode Overview

### Guided

Use for:

- first-time users
- active lessons
- onboarding flows
- concept learning

Goal:

- reduce intimidation
- reduce visual noise
- keep attention on the current task

### Standard

Use for:

- normal everyday production
- intermediate users
- resumed sessions without active onboarding

Goal:

- balanced production environment
- full workflow access
- guidance available but not dominant

### Focused

Use for:

- advanced production
- experienced users
- sessions where speed and canvas space matter most

Goal:

- minimize chrome
- maximize workspace area
- keep guidance optional and lightweight

## Appearance Strategy

Beginners should not see the whole DAW at once.

That means `Guided` mode should not present all panels as fully available by default.

### Guided Appearance

Visual characteristics:

- cleaner, calmer layout
- fewer simultaneously visible panels
- stronger hierarchy
- softer information density
- high contrast only where attention is needed

Default visible surfaces:

- header
- lesson panel or guide rail
- transport
- timeline or target workspace
- one main content area

Default hidden or collapsed surfaces:

- mixer
- detailed inspector controls
- advanced browser views
- dense plugin/device management
- secondary bottom panels unless needed for the lesson

Layout guidance:

- only one or two main work zones at a time
- large step instruction area
- current target visibly emphasized
- non-relevant controls dimmed, collapsed, or moved behind `More`

Beginner emphasis:

- bigger spacing
- clearer labels
- fewer icon-only actions
- stronger section titles
- lower control density per surface

What this should feel like:

- a guided creative workstation
- not a full control room dumped on screen at once

### Standard Appearance

Visual characteristics:

- balanced layout
- full workspace available
- lesson support present but secondary

Default visible surfaces:

- transport
- browser
- timeline
- bottom workspace
- detail or inspector depending on context

Default behavior:

- lesson panel collapsible
- mixer available when needed
- standard panel density

What this should feel like:

- a modern production workspace with optional guidance

### Focused Appearance

Visual characteristics:

- minimal chrome
- dense information
- highest workspace efficiency

Default visible surfaces:

- core production canvas
- transport
- context-critical panels only

Default hidden or minimized:

- lesson rail
- explanatory copy
- large onboarding prompts
- secondary helpers

What this should feel like:

- a production-first workspace for experienced users

## Panel Visibility By Mode

### Guided

Show by default:

- `TransportBar`
- `StudioLessonPanel`
- main arrangement or lesson target area
- only the panel needed for the current task

Collapse or hide by default:

- `Mixer`
- `DetailPanel` unless required
- full `BrowserPanel` complexity
- bottom workspace tabs not needed for the lesson

### Standard

Show by default:

- `TransportBar`
- arrangement workspace
- browser
- bottom workspace

Optional but accessible:

- lesson panel
- mixer
- detail panel

### Focused

Show by default:

- arrangement workspace
- transport
- current critical editor

Minimize:

- lesson panel
- extra copy
- passive status chrome
- non-critical utilities

## Progressive Disclosure Rules

In `Guided`, features should appear when they are relevant.

Examples:

- do not show Mixer until a lesson or workflow needs level balancing
- do not show dense plugin/device controls before the user is interacting with sound sources
- do not open bottom editors unless the current task requires them

This avoids the beginner problem of seeing everything before understanding anything.

## Guidance Behavior By Mode

### Guided

- lesson panel open by default
- anchor highlights visible
- clear next action
- completion flow visible
- Theory links surfaced when relevant

### Standard

- lesson panel available but collapsed by default
- hints lighter
- progress visible only when a lesson is active

### Focused

- no persistent lesson surface unless requested
- guidance should be lightweight and dismissible

## Visual Recommendations For Lovable

### Guided

Use:

- larger spacing
- fewer simultaneous columns
- stronger card and section separation
- softer background structure
- one dominant action area

Avoid:

- ultra-dense control strips
- too many micro-panels
- too many icon-only clusters
- visually equal weighting of all DAW regions

### Standard

Use:

- familiar DAW balance
- moderate density
- clear navigation between work zones

### Focused

Use:

- compressed chrome
- high workspace ratio
- keyboard-first affordances

## Entry Rules

- `Continue lesson` -> `Guided`
- `Start guided session` -> `Guided`
- `Resume session` -> `Standard`
- user preference or advanced setting -> `Focused`

## Implementation Model

Represent this as one Studio with:

```ts
type StudioMode = "guided" | "standard" | "focused";
```

Mode should control:

- default panel visibility
- layout density
- lesson surface visibility
- emphasis level

Mode should not control:

- transport truth
- data ownership
- session identity
- host authority

## Recommendation

Lovable should design `Guided` first.

That is the mode where visual simplification matters most, and it best expresses the product distinction.

Then derive:

- `Standard` as the balanced production mode
- `Focused` as the expert compression mode

This sequence will produce a clearer UX than starting from the densest DAW view.
