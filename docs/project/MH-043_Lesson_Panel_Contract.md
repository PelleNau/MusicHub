# MH-043 — Lesson Panel Contract

## Decision

Studio lessons are exposed through a dedicated lesson panel surface that is product-visible, collapsible, and selector-driven.

## Contract

The lesson panel is:

- visible when a lesson is active
- collapsible without aborting the lesson runtime
- separate from Detail, Mixer, and Piano Roll panels
- driven by Guide runtime state, not by ad hoc component-local lesson logic

## State Surface

The panel consumes a selector-facing state contract:

- `lessonId`
- `title`
- `lessonStatus`
- `stepStatus`
- `currentStepId`
- `currentStepTitle`
- `instruction`
- `stepIndex`
- `stepCount`
- `objectives`
- `activeHints`
- `visible`
- `collapsed`

Current contract location:

- `src/domain/studio/studioViewContracts.ts`
- `src/hooks/useStudioLessonPanelModel.ts`

## Interaction Rules

- collapsing the panel hides the surface but keeps the lesson active
- closing/aborting the lesson ends the active runtime
- reset and skip act on the current lesson step
- the lesson panel does not own transport, selection, or editor state directly

## Layout Rule

The lesson panel is a peer product panel in Studio layout, not a temporary overlay.
It may be rendered as a side rail or full-width side panel, but its state contract must remain independent from transient DOM placement.
