# MusicHub Lovable UI Info Package v1

This document is the consolidated UI and UX package for Lovable.

It combines:

- product journey
- navigation model
- current architecture constraints
- safe UI implementation zones
- current integration boundaries
- priority component targets

Read this together with:

- `docs/public/lovable-codex-handoff.md`
- `docs/lovable-codex-coordination.md`
- `docs/MusicHub_Studio_Domain_Model_v2.md`
- `docs/MusicHub_Interaction_Flows_v1.md`
- `docs/MusicHub_Lesson_DSL_Spec_v2.md`
- `docs/project/STATUS.md`
- `docs/project/TASKS.md`

## 1. Product Intent

MusicHub should feel like one environment with three user intents:

- `Learn`
- `Create`
- `Explore`

Mapping:

- `Learn` -> Theory + guided Studio lessons
- `Create` -> Studio production workflow
- `Explore` -> Lab experimentation + Flight Case discovery

Top-level destinations:

- `Home`
- `Studio`
- `Lab`
- `Theory`
- `Flight Case`

`Bridge` remains infrastructure, status, settings, and diagnostics. It should not become a primary destination in normal UX.

## 2. First User Journey To Optimize

Build toward this flow first:

1. login
2. `Home`
3. `Continue learning`
4. `Studio` opens in guided mode
5. lesson panel is visible
6. user completes a short lesson
7. completion surface offers:
   - next lesson
   - open theory
   - continue in Studio

This journey expresses the core product promise:

- discover
- try
- understand
- continue creating

## 3. Screen-Level UX Guidance

### Login

Purpose:

- quick entry
- clear product framing

Suggested copy:

- `MusicHub`
- `Learn, experiment, and produce in one environment.`
- `Start with a lesson or jump straight into Studio.`

### Home

Purpose:

- route user intent
- restore momentum
- avoid dashboard overload

Recommended section order:

1. `Continue where you left off`
2. `Choose your path`
3. `Recent sessions`
4. `Current lessons`
5. `System status`

Main intent cards:

- `Learn`
- `Create`
- `Explore`

### Studio

Studio should support three modes of emphasis:

- `Guided`
- `Standard`
- `Focused`

Guided mode is the first implementation priority.

### Theory

Theory should explain the user’s current material, not feel detached from production.

### Lab

Lab should support experimentation that can feed back into Studio.

### Flight Case

Flight Case should support action, not just browsing:

- preview
- favorite
- insert into Studio or Lab

## 4. Architecture Constraints

These constraints are active and should not be violated by UI work.

### Runtime authority

In connected mode, native/backend authority remains the source of truth for:

- transport
- playback
- meters
- plugin state
- record and monitor state

UI must not create a second authority model there.

### Studio migration reality

`src/pages/Studio.tsx` is an active migration surface. It should keep shrinking toward composition-root behavior.

Do not add new page-local state ownership or mutation paths there unless there is no alternative.

### Integration seam

UI should build against:

- typed command inputs
- selector or view-model outputs
- lesson runtime state
- anchor resolution state

Prefer existing runtime surfaces such as:

- `src/hooks/useStudioLessonPanelModel.ts`
- `src/hooks/useStudioGuideBridge.ts`
- `src/hooks/useGuideRuntime.ts`
- `src/domain/studio/studioViewContracts.ts`
- `src/types/musicHubGuideRuntime.ts`
- `src/types/musicHubLessonDsl.ts`
- `src/types/musicHubCommands.ts`

## 5. Safe UI Implementation Zones

These are the best areas for Lovable to work now.

### High-confidence targets

- `src/components/studio/StudioLessonPanel.tsx`
- lesson header
- lesson progress rail
- lesson step cards
- lesson completion surface
- lesson launcher
- guided layout chrome
- guided empty states
- Home
- Login
- navigation and entry surfaces

### Safe with care

- transport lesson presentation
- guide callouts and anchor highlight presentation
- Studio guided-mode layout behavior
- Theory/Lab cross-link affordances

### Avoid in this pass

- deep piano-roll behavior rewrites
- transport authority changes
- page-local mutation logic inside `src/pages/Studio.tsx`
- browser/runtime mutation logic redesign
- changing connected-mode ownership rules

## 6. Suggested Component Targets

Implement or refine these first:

1. `GuideShell`
2. `LessonHeader`
3. `LessonProgressRail`
4. `LessonStepCard`
5. `LessonCompletionSurface`
6. `GuideAnchorHighlight`
7. `Home` intent router
8. `Login` screen
9. guided Studio empty and transition states

## 7. Files Lovable Should Read Before Implementing

Architecture and product docs:

- `docs/public/lovable-codex-handoff.md`
- `docs/lovable-codex-coordination.md`
- `docs/MusicHub_Studio_Domain_Model_v2.md`
- `docs/MusicHub_Interaction_Flows_v1.md`
- `docs/MusicHub_Lesson_DSL_Spec_v2.md`
- `docs/project/STATUS.md`
- `docs/project/TASKS.md`

Current runtime and UI seam:

- `src/pages/Studio.tsx`
- `src/components/studio/StudioLessonPanel.tsx`
- `src/components/studio/LessonLauncher.tsx`
- `src/hooks/useStudioLessonPanelModel.ts`
- `src/hooks/useStudioGuideBridge.ts`
- `src/hooks/useGuideRuntime.ts`
- `src/types/musicHubGuideRuntime.ts`
- `src/types/musicHubLessonDsl.ts`
- `src/types/musicHubCommands.ts`
- `src/domain/studio/studioViewContracts.ts`

## 8. Working Instruction For Lovable

Implement the new lesson-first MusicHub UI against the current runtime baseline.

Do:

- build presentation and layout surfaces
- use existing lesson/runtime/view-model contracts
- keep guidance and production in one session flow

Do not:

- invent a second state authority
- put new business logic into `Studio.tsx`
- rewrite deep editor behavior during this pass

If a required state contract is missing, surface the gap explicitly instead of patching around it with local component state.

## 9. Summary

The first meaningful Lovable deliverable is not a full DAW redesign.

It is:

1. a strong login
2. a strong Home intent router
3. a strong lesson-first guided Studio shell
4. a coherent lesson completion flow

That is the shortest route to a product that communicates the MusicHub concept clearly while staying aligned with the current architecture migration.
