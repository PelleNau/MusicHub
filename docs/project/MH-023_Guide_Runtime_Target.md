# MH-023 — Guide Runtime Target

## Purpose

Define the first runtime target for the MusicHub Guide system so lessons stop existing only as authoring documents and become executable against the Studio command/selector model.

This document builds on:

- `docs/MusicHub_Lesson_DSL_Spec_v2.md`
- `docs/MusicHub_Studio_Domain_Model_v2.md`
- `docs/MusicHub_Interaction_Flows_v1.md`
- `src/types/musicHubCommands.ts`
- `src/types/musicHubLessonDsl.ts`

---

## Core rule

Guide runtime is not a page-specific tour system.

It is a product subsystem that:

1. loads a lesson definition
2. resolves lesson anchors against stable product anchors
3. observes commands, acknowledgments, selector state, and runtime events
4. evaluates step completion
5. exposes hints, resets, and progression state to the UI

Guide does not own Studio truth. It observes and orchestrates around canonical Studio state.

---

## Runtime responsibilities

The first Guide runtime should own:

1. lesson loading
2. active lesson/session state
3. current step resolution
4. anchor resolution
5. command/ack/selector/event observation
6. validation evaluation
7. reset/hint invocation
8. lesson progression transitions

The first Guide runtime should not yet own:

1. persistence of lesson progress across devices
2. authoring tools
3. analytics-heavy instrumentation
4. content recommendation or personalization logic
5. AI generation of lessons

---

## Runtime inputs

Guide runtime consumes four input families:

### 1. Lesson definition

The lesson definition is the static program.

Source:

- `LessonDefinition`

### 2. Command stream

Guide must observe dispatched commands and acknowledgments.

Sources:

- `MusicHubCommand`
- `MusicHubCommandAck`

### 3. Selector snapshot

Guide validates against canonical selector state, not component-local state.

Examples:

- selection summary
- panel summary
- connection summary
- track/mixer summaries
- plugin/parameter summaries

### 4. Anchor registry

Guide needs a stable product anchor registry that maps abstract lesson anchors to concrete runtime targets.

---

## Runtime outputs

Guide runtime should expose:

1. active lesson id
2. current step id
3. resolved anchors for the current step
4. visible instruction content
5. available hints
6. reset availability
7. step status
8. lesson status
9. completion/failure reason

---

## Suggested runtime modules

### `GuideLessonStore`

Owns:

- active lesson
- current step
- progression status
- user-visible lesson state

### `GuideAnchorResolver`

Owns:

- anchor registry lookup
- fallback behavior
- target existence checks

### `GuideObservationBuffer`

Owns:

- recent command history
- recent acknowledgments
- recent runtime events
- current selector snapshot

### `GuideStepEvaluator`

Owns:

- expected-action matching
- validation execution
- completion decision

### `GuideRuntimeController`

Owns:

- start lesson
- reset step
- apply entry commands
- apply success/failure hooks
- advance to next step

---

## Step lifecycle

Each step should move through:

1. `idle`
2. `arming`
3. `awaiting_expected`
4. `awaiting_validation`
5. `completed`
6. `failed`
7. `skipped`

### Notes

- `expected` does not complete the step by itself
- `validation` determines completion
- runtime may skip `awaiting_expected` when the step has only selector-based validation

---

## Completion precedence

Step completion should prefer:

1. canonical selector validation
2. command acknowledgment / confirmed runtime state
3. command observation
4. event observation

UI-local signals should remain last-resort only.

---

## Reset model

Reset commands should be treated as normal command traffic:

- they are dispatched through the same command path
- they produce acknowledgments
- they must not mutate hidden page-local state directly

This keeps Guide aligned with the command architecture instead of creating a second control plane.

---

## Recommended first selector surface for Guide

Guide does not need full Studio state initially.

The first Guide-capable selector snapshot should include:

1. `transportSummary`
2. `connectionSummary`
3. `panelState`
4. `selectionSummary`
5. `trackViewStateById`
6. `detailPanelState`
7. `pianoRollState`

Later phases can add:

- plugin featured param summaries
- routing summaries
- lesson-specific derived selectors

---

## Recommended first command/ack surface for Guide

Guide should initially understand:

1. `transport.play`
2. `transport.pause`
3. `transport.stop`
4. `transport.seek`
5. `transport.setLoop`
6. `studio.select`
7. `studio.openPanel`
8. `studio.closePanel`
9. `studio.createTrack`
10. `studio.createClip`
11. `studio.updateTrack`
12. `studio.updateClip`

This is enough to support early guided Studio flows without overcommitting to complex edit streams.

---

## First runtime milestone

The first Guide runtime milestone should be:

1. load one lesson definition
2. apply lesson entry commands
3. resolve one active anchor
4. observe command/ack traffic from the bounded command sink
5. validate one selector-based step
6. advance to the next step

That is sufficient to prove the architecture without building the full lesson system.
