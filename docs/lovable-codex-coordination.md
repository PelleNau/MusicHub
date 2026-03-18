# Lovable ↔ Codex Coordination Guide

This document defines the working division of responsibilities between the two implementation agents for The Flightcase / MusicHub codebase.

It replaces a folder-based ownership model with a system-based one, because the current product has several tightly coupled layers where naive file ownership breaks down.

The user remains the router between both agents.

---

## Purpose

This guide exists to prevent:

- duplicated authority between frontend and native systems
- contract drift between TypeScript and native implementations
- unsafe parallel edits in high-risk integration files
- merges that appear clean in Git but are broken at runtime

The goal is not to draw perfect boundaries. The goal is to reduce integration mistakes in a hybrid app.

---

## System Ownership

Ownership should be understood primarily by **system responsibility**, not by folder.

### Lovable owns

- Product UI and interaction design
- React/Tailwind/shadcn implementation
- Page composition and non-native UX flows
- Lovable Cloud data model, migrations, RLS, auth, storage, and edge functions
- TypeScript API contracts at the frontend/native boundary
- Tauri shell UX and user-facing shell behaviors
- Mock-mode development flows

### Codex owns

- Native audio runtime behavior
- DSP, transport authority, playback engine behavior
- Plugin host internals
- CoreAudio / system audio integration
- Native HTTP and WebSocket implementation behind the TS contracts
- Sidecar binary behavior and packaging/runtime debugging
- Native/Tauri runtime failures that require build, compile, or process-level diagnosis

### Shared ownership

These areas are shared because they are boundary systems:

- `src-tauri/`
- `src/services/pluginHostClient.ts`
- `src/services/pluginHostSocket.ts`
- `src/services/tauriShell.ts`
- `docs/`

Shared ownership does **not** mean simultaneous editing without coordination. It means both sides influence the behavior.

---

## Authority Rules

This is the most important section.

### Connected mode

When the native host is available, the native host is the source of truth for:

- transport state
- playback state
- current beat / playhead authority
- meters
- recording / monitoring state
- plugin state
- native chain state

The frontend may:

- display this state
- send commands that request changes
- cache or smooth presentation for UX reasons

The frontend must not:

- run an independent competing authority for the same state
- silently fall back into a second audio engine without making that explicit

### Mock mode

Mock mode may use frontend-owned simulated behavior, but it must remain clearly separated from connected/native behavior.

### Contract rule

The TypeScript contract is the source of truth for the **boundary surface**, not for the correctness of product behavior.

If the contract is wrong, both sides should change it.

It should never be treated as “frontend said so, native must blindly comply.”

---

## Current High-Risk Files

These files need stricter coordination than ordinary files because they sit on active fault lines between systems:

- `src/pages/Studio.tsx`
- `src/services/hostConnector.ts`
- `src/hooks/useHostConnector.ts`
- `src/hooks/useStudioTransport.ts`
- `src/components/studio/TransportBar.tsx`
- `src-tauri/src/lib.rs`
- `src/services/pluginHostClient.ts`
- `src/services/pluginHostSocket.ts`
- `plugin-host/src/host/PluginHostService.cpp`

Rules for these files:

1. Avoid parallel edits if at all possible
2. Prefer small, explicit changes over opportunistic cleanup
3. If both agents need changes in the same area, coordinate through `docs/` first
4. Runtime verification matters more than a clean merge diff

---

## Folder Guidance

Folder ownership is still useful, but only as a default heuristic.

| Location | Primary Owner | Notes |
|----------|---------------|-------|
| `src/` | Lovable | Except when behavior is directly tied to native authority or contract debugging |
| `src/types/` | Shared | Boundary types and shared domain models |
| `src/services/pluginHostClient.ts` | Lovable defines, Codex implements against | Source of truth for HTTP surface |
| `src/services/pluginHostSocket.ts` | Lovable defines, Codex implements against | Source of truth for WS surface |
| `src/services/tauriShell.ts` | Lovable primary | Shell-facing TS bridge |
| `src-tauri/` | Shared | Treat as integration zone, not “safe to split by folder” |
| `src-tauri/binaries/` | Codex | Native sidecar artifacts |
| `supabase/functions/` | Lovable | Cloud backend logic |
| `docs/` | Shared | Specs, contracts, and coordination rules |
| `plugin-host/` | Codex | Native host implementation |

---

## Operational Rules

### 1. User is the router

Lovable and Codex do not communicate directly. The user passes:

- requirements
- file references
- conflict context
- decisions

### 2. No simultaneous edits to the same file

If both sides need a file, one of these must happen first:

- the user sequences the work
- the change is staged in `docs/`
- one side lands the contract change before the other side implements against it

### 3. Contract-first for cross-boundary features

For a feature spanning UI and native:

1. define or update the TS contract
2. implement the native side to match
3. wire the UI to that contract

### 4. Runtime verification beats static confidence

For boundary changes, do not treat “build passes” as sufficient.

Required verification depends on the feature, but may include:

- browser build
- Tauri app build
- local runtime check
- native test run
- plugin host integration test

### 5. Native host is not “backend code outside edge functions”

That rule only applies to cloud/server logic.

The native host is a first-class local backend and is explicitly allowed to contain backend logic for:

- transport
- routing
- plugin control
- playback
- meters
- recording

### 6. Merges are not trusted by default in integration zones

A clean merge is not evidence of a correct merge.

For changes touching:

- `Studio.tsx`
- transport
- host connector
- shell startup
- plugin host API

require local build and runtime verification before calling the merge safe.

---

## Update Communication Protocol

This file is the source of truth for cross-boundary updates that need to be handed from Codex to Lovable.

### Rule

If Codex makes a change that affects:

- frontend/native contracts
- Tauri shell integration
- connected-mode authority
- Studio behavior that Lovable is likely to touch
- high-risk shared files

then Codex should add an entry to the update log below.

If there is no new entry, Lovable should assume there is no new cross-boundary action required.

### How the user should route updates

When the user wants Lovable to pick up my latest integration work, the instruction should be:

> Check `docs/lovable-codex-coordination.md`, section `Codex → Lovable Update Log`, and apply any entry marked `Action required`.

That avoids ad hoc summaries and reduces drift.

### Update entry format

Each entry should contain:

- `Date`
- `Area`
- `Files`
- `What changed`
- `Contract impact`
- `Action required from Lovable`
- `Validation status`

### Action labels

- `Action required`: Lovable needs to change code or contract
- `Review only`: Lovable should read and avoid conflicting edits
- `No action`: informational only

---

## Codex → Lovable Update Log

### 2026-03-15 — UX journey, Studio modes, and Lovable UI package

- `Status`: `Action required`
- `Area`: product UX, Studio presentation modes, lesson-first UI implementation
- `Files`:
  - `docs/MusicHub_UX_Journey_v1.md`
  - `docs/MusicHub_UX_Diagrams_v1.md`
  - `docs/MusicHub_Studio_Modes_v1.md`
  - `docs/MusicHub_Lovable_UI_Info_Package_v1.md`
- `What changed`:
  - Defined the primary MusicHub user journey from login to Home to guided Studio
  - Defined the recommended top-level navigation model and cross-links between Studio, Theory, Lab, and Flight Case
  - Defined `Guided`, `Standard`, and `Focused` Studio as presentation modes on one architecture
  - Specified that `Guided` mode should hide or collapse non-essential panels by default to avoid beginner overload
  - Consolidated the UI implementation package for Lovable into one document
- `Contract impact`:
  - no change to runtime authority or TS/native contracts
  - this does constrain UI composition, panel visibility defaults, and design priorities
- `Action required from Lovable`:
  - use these docs as the baseline for current lesson-first UI implementation work
  - design and implement `Guided` mode first
  - avoid presenting full DAW complexity to beginners by default
  - derive `Standard` and `Focused` from the same Studio architecture rather than creating separate UI products
- `Validation status`:
  - docs only
  - aligned to the current command/state/Guide migration baseline

### 2026-03-14 — App shell and production startup stabilization

- `Area`: Tauri shell, frontend startup, production bundling
- `Files`:
  - `vite.config.ts`
  - `src/App.tsx`
  - `src/components/studio/NativeMeterBridge.tsx`
  - `src/integrations/supabase/client.ts`
  - `src/components/app/AppSetupScreen.tsx`
  - `src-tauri/capabilities/default.json`
  - `src-tauri/Cargo.toml`
- `What changed`:
  - Removed broken production chunk splitting that caused packaged runtime initialization failures
  - Kept Tauri-safe routing/assets in place
  - Fixed canvas meter rendering to use resolved colors instead of raw CSS variables in canvas gradients
  - Added explicit missing-config handling for Supabase startup
  - Removed updater capability/plugin mismatch from the Tauri shell
- `Contract impact`: none on plugin-host HTTP/WS contracts
- `Action required from Lovable`: `Review only`
  - Avoid reintroducing custom Vite chunk splitting without validating packaged runtime behavior
  - Avoid canvas drawing code that passes unresolved CSS variables directly to Canvas APIs
- `Validation status`:
  - browser build passed
  - Tauri build passed
  - packaged app opens and Studio loads

### 2026-03-14 — Connected-mode authority baseline

- `Area`: Studio transport and host connection behavior
- `Files`:
  - `src/pages/Studio.tsx`
  - `src/hooks/useHostConnector.ts`
  - `src/hooks/useStudioTransport.ts`
  - `src/services/hostConnector.ts`
- `What changed`:
  - Connected/native mode was cleaned up to behave as backend-authoritative rather than dual-engine
  - Browser audio behavior should remain mock-only
- `Contract impact`: none on endpoint names, but important architectural impact on expected behavior
- `Action required from Lovable`: `Review only`
  - UI changes in Studio/transport should preserve native authority in connected mode
  - Do not add fallback standalone behavior into connected mode implicitly
- `Validation status`:
  - build passed
  - integrated into current main baseline

### 2026-03-14 — Architecture baseline and Studio migration update

- `Area`: MusicHub architecture baseline, Studio runtime migration, Guide/lesson contract
- `Files`:
  - `docs/MusicHub_Studio_Domain_Model_v2.md`
  - `docs/MusicHub_Interaction_Flows_v1.md`
  - `docs/MusicHub_Lesson_DSL_Spec_v2.md`
  - `docs/project/PROJECT_BASELINE.md`
  - `docs/project/ROADMAP.md`
  - `docs/project/TASKS.md`
  - `src/types/musicHubStudioDomain.ts`
  - `src/types/musicHubCommands.ts`
  - `src/types/musicHubLessonDsl.ts`
  - `src/hooks/useStudioDomainView.ts`
  - `src/hooks/useStudioCommandDispatch.ts`
  - `src/hooks/useStudioKeyboardShortcuts.ts`
  - `src/hooks/useStudioSelection.ts`
  - `src/domain/studio/studioSessionAdapter.ts`
  - `src/domain/studio/studioHostRuntimeAdapter.ts`
  - `src/pages/Studio.tsx`
- `What changed`:
  - Added the architecture-first baseline docs and target contracts for Studio domain, command bus, and lesson DSL
  - Inserted the first selector/command runtime boundary into `Studio.tsx`
  - Moved transport, panel switching, keyboard shortcuts, clip metadata actions, and track metadata actions onto the command surface
  - Reduced duplicated selection derivations and started extracting session/runtime adapter logic into `src/domain/studio/`
- `Contract impact`: `Action required`
  - frontend work should now assume these docs/types are the active target architecture
  - runtime migration is in progress, so avoid designing against stale page-local assumptions
- `Action required from Lovable`:
  - read the listed docs and types before continuing frontend redesign or Studio implementation work
  - review whether current mockups or planned UI changes conflict with the command/state/Guide baseline
  - avoid introducing new direct page-local state derivations in `Studio.tsx`
- `Validation status`:
  - browser build passed after the migration slices
  - runtime insertion is partial but active

### 2026-03-14 — Guide runtime and lesson-first Studio UI baseline

- `Area`: Guide runtime, lesson panel UI, Studio composition migration
- `Files`:
  - `src/components/studio/StudioLessonPanel.tsx`
  - `src/hooks/useStudioLessonPanelModel.ts`
  - `src/hooks/useStudioGuideBridge.ts`
  - `src/hooks/useGuideRuntime.ts`
  - `src/hooks/useGuideRuntimeCommandSync.ts`
  - `src/types/musicHubGuideRuntime.ts`
  - `src/types/musicHubLessonDsl.ts`
  - `src/types/musicHubCommands.ts`
  - `src/domain/studio/studioViewContracts.ts`
  - `src/content/lessons/studio/transportBasicsLesson.ts`
  - `src/pages/Studio.tsx`
- `What changed`:
  - Guide runtime is now mounted as a real Studio subsystem rather than only a design/spec layer
  - A visible `StudioLessonPanel` exists and is backed by runtime lesson state
  - Lesson lifecycle is observable through command traffic, including start, advance, completion, failure, skip, reset, and abort
  - Browser device/plugin insertions now also enter through observable command traffic
  - Header, connection, session-picker, and native detail-panel callback shaping have been moved further out of `Studio.tsx`
- `Contract impact`: `Action required`
  - lesson-first UI can now target real lesson/runtime state instead of mock-only behavior
  - `Studio.tsx` remains an active migration surface and should not be treated as a stable extension point
- `Action required from Lovable`:
  - begin implementing the new lesson-first UI against the current runtime using `StudioLessonPanel`, Guide runtime state, and selector/view-model outputs
  - prioritize presentation components and guided layout surfaces over deep editor behavior
  - avoid introducing new page-local state derivations or mutation paths in `src/pages/Studio.tsx`
  - avoid deep rewrites of piano-roll editing, transport authority, or browser/runtime mutation logic during this pass
- `Validation status`:
  - browser build passed after Guide/runtime migration slices
  - lesson panel is mounted
  - first executable lesson exists

---

## Lovable → Codex Update Log

### 2026-03-14 — MH-008 Connected-mode authority audit findings

- `Status`: `Action required`
- `Area`: Connected-mode authority — transport state ownership
- `Files`:
  - `src/hooks/useStudioTransport.ts`
  - `src/hooks/useStudioCommandDispatch.ts`
- `What Lovable found`:
  - **F1**: `handleLoopChange` calls `setLoopRegion()` (local state update) before sending to host via `hostActions.setLoop()` — connected mode should not update local state optimistically
  - **F2**: `handleLoopToggle` calls `toggleLoop()` (local state update) before sending to host — same issue
  - **F3**: `handleTempoChange` calls `onTempoChangeLocal()` before sending to host — same issue
  - **F4**: `useStudioCommandDispatch` always returns `{ status: "applied_local" }` ack for every command, which is misleading in connected mode where the host is authoritative and may reject or modify the change
- `Recommended fix`:
  - F1–F3: Gate local state updates behind `isMock` so connected mode waits for host-confirmed state pushed back via WebSocket
  - F4: Introduce a `pending` or `forwarded` ack status for commands sent to the host, so the Guide runtime and UI can distinguish between local application and host confirmation
- `Action for Codex`: Review and decide whether to fix on the hook side, the native side, or coordinate a joint fix. F1–F3 are straightforward Lovable-side gates; F4 may need a round-trip confirmation protocol.
- `Validation status`: audit only — no code changes made

---

## Practical Workflow

### Frontend-only feature

Lovable handles it entirely if it does not modify native contracts or native-owned state authority.

### Native-only feature

Codex handles it entirely and updates relevant docs/contracts if the boundary changes.

### Cross-boundary feature

1. user describes the feature to both sides
2. Lovable updates TS types/contracts
3. Codex implements native behavior to match
4. Lovable wires the UI
5. user tests in browser and/or Tauri as appropriate

### Cloud/backend feature

Lovable handles it through Lovable Cloud.

### Native runtime/debugging failure

Codex leads, even if the visible symptom appears in the frontend.

Examples:

- white/black startup window
- packaged app runtime failure
- sidecar startup failure
- plugin crash
- transport desync caused by native state

---

## Current Architecture Reality

The codebase is not a perfectly separated frontend/native system.

Current risk areas:

- `Studio` still concentrates a large amount of integration logic
- frontend connection state and transport state are tightly coupled
- Tauri shell and native host behavior can fail in ways that surface as blank UI
- file ownership alone is not enough to prevent breakage

This means coordination should optimize for:

- authority clarity
- smaller boundary changes
- explicit runtime verification

Not for abstract purity.

---

## Short Version

If there is one operating rule to remember, it is this:

> Lovable owns the user-facing contract and product surfaces. Codex owns native runtime truth. Shared files must be treated as integration zones, not as casual edit targets.
