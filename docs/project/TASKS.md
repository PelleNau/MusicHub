# Project Tasks

## Status Legend

- `todo`
- `in_progress`
- `blocked`
- `done`

---

## Tasks

### MH-001 — Establish project control surface

- Owner: `Codex`
- Status: `done`
- Depends on: none
- Notes:
  - create project baseline, roadmap, status, tasks, and decisions docs

### MH-002 — Finalize Studio domain model v2

- Owner: `Codex`
- Status: `done`
- Depends on: `MH-001`
- Notes:
  - create improved v2 with canonical store rules and safer boundaries

### MH-003 — Define interaction flows v1

- Owner: `Codex`
- Status: `done`
- Depends on: `MH-002`
- Notes:
  - define major product flows against command/state/native authority model

### MH-004 — Add target TypeScript domain types

- Owner: `Codex`
- Status: `done`
- Depends on: `MH-002`
- Notes:
  - create target-domain type layer without disturbing current runtime types

### MH-005 — Map current Studio runtime to target domain model

- Owner: `Codex`
- Status: `done`
- Depends on: `MH-004`
- Notes:
  - identify how current `Studio.tsx`, host connector state, and native sync map into target store concepts
  - completed in `docs/project/MH-005_Runtime_To_Domain_Mapping.md`

### MH-006 — Design host adapter layer

- Owner: `Codex`
- Status: `done`
- Depends on: `MH-005`
- Notes:
  - define boundary that translates native payloads into stable domain entities/selectors
  - completed in `docs/project/MH-006_Host_Adapter_Design.md`

### MH-007 — Define command bus v1 contract

- Owner: `Codex`
- Status: `done`
- Depends on: `MH-005`
- Notes:
  - define Studio, transport, lesson, browser, and assistant commands
  - completed in `docs/project/MH-007_Command_Bus_v1.md`
  - target types added in `src/types/musicHubCommands.ts`

### MH-008 — Review frontend against backend-authoritative connected mode

- Owner: `Lovable`
- Status: `todo`
- Depends on: coordination docs available on `main`
- Notes:
  - review current frontend assumptions and identify if any UI changes are needed

### MH-011 — Insert first selector/dispatch runtime boundary

- Owner: `Codex`
- Status: `in_progress`
- Depends on: `MH-006`, `MH-007`
- Notes:
  - introduce the first selector-oriented Studio read surface
  - introduce the first typed command dispatch surface
  - move transport, panel, and basic selection flows onto that boundary
  - transport, panel, basic selection, track create, loop-to-selection, and several discrete clip/track mutations now run through the boundary

### MH-012 — Shrink `useStudioSelection` to local selection state only

- Owner: `Codex`
- Status: `done`
- Depends on: `MH-011`
- Notes:
  - remove duplicated derivations already covered by the domain view hook
  - keep multi-select input handling local until a richer selection command model exists

### MH-013 — Move keyboard shortcuts onto command dispatch

- Owner: `Codex`
- Status: `done`
- Depends on: `MH-011`
- Notes:
  - route transport, panel switching, loop edits, and discrete clip actions through commands
  - stop keyboard shortcuts from bypassing the command surface

### MH-014 — Move Detail/Mixer/Piano Roll inputs onto domain selectors

- Owner: `Codex`
- Status: `in_progress`
- Depends on: `MH-011`
- Notes:
  - reduce raw page-local derivations inside `Studio.tsx`
  - use selector summaries rather than ad hoc recomputation
  - initial connection, detail-panel, and piano-roll summaries now exist in `useStudioDomainView`
  - per-track control summaries now exist in `trackViewStateById`

### MH-015 — Route track metadata mutations through command dispatch

- Owner: `Codex`
- Status: `done`
- Depends on: `MH-011`
- Notes:
  - cover rename, color, delete, and other safe discrete track mutations
  - do not move continuous controls until command semantics are settled

### MH-016 — Route clip metadata mutations through command dispatch

- Owner: `Codex`
- Status: `done`
- Depends on: `MH-011`
- Notes:
  - clip rename, color, mute, delete, and duplicate now enter through commands

### MH-017 — Define Studio host runtime adapter implementation

- Owner: `Codex`
- Status: `in_progress`
- Depends on: `MH-006`
- Notes:
  - create runtime adapter module for native/connector state normalization
  - keep connected-mode authority rules explicit

### MH-018 — Define Studio session/project adapter implementation

- Owner: `Codex`
- Status: `in_progress`
- Depends on: `MH-005`, `MH-006`
- Notes:
  - normalize session/project entities into the target domain shape
  - keep persisted state distinct from host runtime summaries

### MH-019 — Assemble canonical Studio domain view model

- Owner: `Codex`
- Status: `todo`
- Depends on: `MH-017`, `MH-018`
- Notes:
  - assemble host summaries, session entities, and UI state into one canonical domain surface

### MH-020 — Replace direct `hostState.*` page reads with selectors

- Owner: `Codex`
- Status: `in_progress`
- Depends on: `MH-019`
- Notes:
  - `Studio.tsx` should stop reaching into raw connector state for common presentation decisions
  - transport bar, connection alert, meters, and status-bar engine diagnostics have started moving

### MH-021 — Define MIDI edit command surface

- Owner: `Codex`
- Status: `in_progress`
- Depends on: `MH-007`, `MH-019`
- Notes:
  - decide whether note editing is first-class command traffic or a specialized editor mutation surface
  - raw MIDI-data clip updates now route through `studio.updateClip` as an interim bridge
  - full note replacement now also routes through `studio.replaceMidiNotes` as the first explicit editor command

### MH-022 — Introduce command acknowledgments/history sink

- Owner: `Codex`
- Status: `in_progress`
- Depends on: `MH-007`, `MH-011`
- Notes:
  - start recording command outcomes so Guide/runtime/assistant systems can reason about actions
  - first bounded local sink exists in `src/hooks/useMusicHubCommandLog.ts`

### MH-023 — Define Guide runtime target

- Owner: `Codex`
- Status: `done`
- Depends on: `MH-007`
- Notes:
  - specify lesson runtime, validation context, and anchor-driven behavior
  - documented in `docs/project/MH-023_Guide_Runtime_Target.md`

### MH-024 — Define Guide anchor resolution and validation context

- Owner: `Codex`
- Status: `done`
- Depends on: `MH-023`
- Notes:
  - anchors must resolve against canonical Studio state, not page-local incidental data
  - documented in `docs/project/MH-024_Guide_Anchor_Resolution.md`

### MH-025 — Define browser/content command surface

- Owner: `Codex`
- Status: `todo`
- Depends on: `MH-007`
- Notes:
  - formalize asset insertion, browser selection, and content-side interactions against the command bus

### MH-026 — Define assistant command integration rules

- Owner: `Codex`
- Status: `todo`
- Depends on: `MH-007`, `MH-022`
- Notes:
  - assistant actions should dispatch commands, not call page-local mutation helpers

### MH-027 — Define template insertion flow against command bus

- Owner: `Codex`
- Status: `todo`
- Depends on: `MH-007`, `MH-025`
- Notes:
  - template insertion must behave like any other product-side action and return structured acknowledgments

### MH-028 — Refactor `Studio.tsx` into composition root only

- Owner: `Codex`
- Status: `todo`
- Depends on: `MH-019`, `MH-020`, `MH-021`
- Notes:
  - page should compose domain selectors, command dispatch, and view components
  - page should not remain the main derivation hub

### MH-029 — Review frontend after selector/command migration

- Owner: `Lovable`
- Status: `todo`
- Depends on: `MH-019`, `MH-028`
- Notes:
  - validate whether any UI assumptions or design artifacts need updating after the architecture shift

### MH-030 — Redesign Studio/Guide surfaces on stable architecture

- Owner: `Lovable`
- Status: `todo`
- Depends on: `MH-023`, `MH-028`, `MH-029`
- Notes:
  - design should target the stabilized command/state/Guide architecture rather than the transitional page wiring

### MH-031 — Define canonical connection summary contract

- Owner: `Codex`
- Status: `in_progress`
- Depends on: `MH-017`, `MH-020`
- Notes:
  - formalize the selector-facing connection/runtime summary shape so UI components stop accepting raw connector state
  - initial selector-facing view contracts now exist in `src/domain/studio/studioViewContracts.ts`

### MH-032 — Move clip loop and timeline selection flows onto commands

- Owner: `Codex`
- Status: `in_progress`
- Depends on: `MH-011`
- Notes:
  - loop-to-selection now routes through `transport.setLoop`
  - remaining timeline/selection mutations should stop calling page-local handlers directly

### MH-033 — Introduce selector-backed detail panel model

- Owner: `Codex`
- Status: `in_progress`
- Depends on: `MH-014`, `MH-019`
- Notes:
  - detail panel should consume a stable selector model rather than direct track/native chain plumbing from `Studio.tsx`
  - initial detail, piano-roll, and mixer summaries already exist; continue shrinking page-level prop shaping

### MH-034 — Define command history retention and exposure rules

- Owner: `Codex`
- Status: `done`
- Depends on: `MH-022`
- Notes:
  - decide whether command history remains local, becomes dev-only, or is promoted into Guide/runtime infrastructure
  - documented in `docs/project/MH-034_Command_History_Retention.md`

### MH-035 — Introduce first Guide runtime interfaces

- Owner: `Codex`
- Status: `in_progress`
- Depends on: `MH-022`, `MH-023`, `MH-024`
- Notes:
  - define the first runtime-facing lesson player interfaces against command/selector/ack surfaces
  - initial typed contracts now exist in `src/types/musicHubGuideRuntime.ts`
  - first executable runtime modules now exist in `src/domain/guide/` and `src/hooks/useGuideRuntime.ts`

### MH-036 — Define anchor registry population strategy

- Owner: `Codex`
- Status: `done`
- Depends on: `MH-024`, `MH-035`
- Notes:
  - decide how stable product anchors are registered from Studio surfaces without binding Guide to DOM structure
  - first registry-creation helper now exists in `src/domain/studio/studioGuideBridge.ts`
  - documented in `docs/project/MH-036_Anchor_Registry_Population.md`

### MH-037 — Define Guide observation retention windows

- Owner: `Codex`
- Status: `done`
- Depends on: `MH-022`, `MH-035`
- Notes:
  - decide how many commands/acks/events Guide should observe and how stale observations expire
  - first bounded observation-window helper now exists in `src/domain/guide/guideObservationBuffer.ts`
  - documented in `docs/project/MH-037_Guide_Observation_Retention.md`

### MH-038 — Wire Guide bridge into the Studio composition root

- Owner: `Codex`
- Status: `in_progress`
- Depends on: `MH-035`, `MH-036`, `MH-037`
- Notes:
  - compose lesson lookup, selector snapshots, anchor registry, and bounded observations inside a stable Studio-facing hook
  - initial runtime insertion now exists in `src/hooks/useStudioGuideBridge.ts`

### MH-039 — Introduce first executable Studio lesson definitions

- Owner: `Codex`
- Status: `in_progress`
- Depends on: `MH-035`, `MH-038`
- Notes:
  - add lesson definitions that exercise the Guide runtime against real command and selector contracts
  - first lesson now exists in `src/content/lessons/studio/transportBasicsLesson.ts`

### MH-040 — Define detail panel selector/action view model

- Owner: `Codex`
- Status: `in_progress`
- Depends on: `MH-014`, `MH-033`
- Notes:
  - move detail panel prop shaping out of `Studio.tsx`
  - separate selector-backed detail state from action bindings
  - first detail-panel model hook now exists in `src/hooks/useStudioDetailPanelModel.ts`

### MH-041 — Define piano roll selector/action view model

- Owner: `Codex`
- Status: `in_progress`
- Depends on: `MH-014`, `MH-021`
- Notes:
  - move piano roll state and command/action shaping out of `Studio.tsx`
  - first piano-roll model hook now exists in `src/hooks/useStudioPianoRollViewModel.ts`
  - decide where MIDI note editing boundary belongs before finalizing bindings

### MH-042 — Define mixer selector/action view model

- Owner: `Codex`
- Status: `in_progress`
- Depends on: `MH-014`, `MH-019`
- Notes:
  - finish moving mixer-related state and action shaping out of `Studio.tsx`
  - first mixer model hook now exists in `src/hooks/useStudioMixerViewModel.ts`

### MH-043 — Define lesson panel state and layout contract

- Owner: `Codex`
- Status: `done`
- Depends on: `MH-038`, `MH-039`
- Notes:
  - specify how an active lesson is represented in panel/layout state without coupling it to a temporary UI shell
  - documented in `docs/project/MH-043_Lesson_Panel_Contract.md`
  - first lesson panel state/model now exists in `src/domain/studio/studioViewContracts.ts` and `src/hooks/useStudioLessonPanelModel.ts`

### MH-044 — Define note-editing command protocol

- Owner: `Codex`
- Status: `in_progress`
- Depends on: `MH-021`, `MH-041`
- Notes:
  - choose between full note-replacement commands, granular note mutation commands, or a bounded editor protocol
  - granular insert/update/delete note commands are now executable through the dispatch layer
  - piano roll still primarily emits replacement edits, so the final editor protocol is not settled yet

### MH-045 — Mount Guide runtime into a visible Studio surface

- Owner: `Codex`
- Status: `in_progress`
- Depends on: `MH-038`, `MH-039`, `MH-043`
- Notes:
  - expose lesson progress in a real Studio surface once panel/layout and anchor contracts are stable
  - first visible panel now exists in `src/components/studio/StudioLessonPanel.tsx`

### MH-046 — Add lesson panel command hooks and actions

- Owner: `Codex`
- Status: `done`
- Depends on: `MH-045`
- Notes:
  - formalize lesson start/abort/advance/reset interactions through the command layer where appropriate
  - lesson panel actions now dispatch explicit lesson commands through `src/hooks/useGuideCommandDispatch.ts`

### MH-047 — Reduce remaining timeline and selection page-local mutations

- Owner: `Codex`
- Status: `in_progress`
- Depends on: `MH-032`, `MH-028`
- Notes:
  - continue removing direct page-local handlers for timeline and selection flows
  - clip-click modifier selection now routes through `studio.select` modes
  - loop-to-selection and track creation now route through `src/hooks/useStudioTimelineViewModel.ts`
  - track, clip, mixer, and timeline-header callbacks are now centralized in `src/hooks/useStudioTrackActionsModel.ts`

### MH-048 — Decide granular MIDI note command strategy

- Owner: `Codex`
- Status: `in_progress`
- Depends on: `MH-044`
- Notes:
  - decide whether insert/update/delete note commands should become primary or remain secondary to replacement commands
  - the runtime now supports both replacement and granular command execution
