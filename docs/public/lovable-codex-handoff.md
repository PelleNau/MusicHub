# Lovable ↔ Codex Public Handoff

This is the public, scrape-friendly coordination document for Lovable.

If Lovable needs to know whether there is new cross-boundary work to pick up, this is the file to read.

---

## Codex → Lovable Update Log

### 2026-03-14 — App shell and production startup stabilization

- `Status`: `Review only`
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
- `Action for Lovable`:
  - avoid reintroducing custom Vite chunk splitting without validating packaged runtime behavior
  - avoid canvas drawing code that passes unresolved CSS variables directly to Canvas APIs
- `Validation status`:
  - browser build passed
  - Tauri build passed
  - packaged app opens and Studio loads

### 2026-03-14 — Connected-mode authority baseline

- `Status`: `Review only`
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
- `Action for Lovable`:
  - UI changes in Studio/transport should preserve native authority in connected mode
  - do not add fallback standalone behavior into connected mode implicitly
- `Validation status`:
  - build passed
  - integrated into current main baseline

### 2026-03-14 — Architecture baseline and Studio migration update

- `Status`: `Action required`
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
  - Added the architecture-first baseline for MusicHub and the first target domain/command/lesson contracts
  - Inserted the first real selector/command runtime boundary into `Studio.tsx`
  - Moved transport, panel switching, keyboard shortcuts, clip metadata actions, and track metadata actions onto the command surface
  - Reduced duplicated page-local selection derivations and started adapter extraction into `src/domain/studio/`
- `Contract impact`:
  - new target contracts now exist for Studio domain, command bus, and lesson DSL
  - runtime is in migration toward those contracts, not yet fully converted
- `Action for Lovable`:
  - read the listed docs and types before continuing frontend redesign or Studio implementation work
  - review whether current design mockups or planned frontend changes conflict with the command/state/Guide baseline
  - treat `src/pages/Studio.tsx`, selector hooks, and command hooks as active migration surfaces
- `Validation status`:
  - browser build passed after the migration slices
  - runtime insertion is partial but active

### 2026-03-14 — Guide runtime and lesson-first Studio UI baseline

- `Status`: `Action required`
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
- `Contract impact`:
  - lesson-first UI can now target real lesson/runtime state instead of mock-only behavior
  - `Studio.tsx` remains an active migration surface and should not be treated as a stable extension point
- `Action for Lovable`:
  - begin implementing the new lesson-first UI against the current runtime using `StudioLessonPanel`, Guide runtime state, and selector/view-model outputs
  - prioritize presentation components and guided layout surfaces over deep editor behavior
  - avoid introducing new page-local state derivations or mutation paths in `src/pages/Studio.tsx`
  - avoid deep rewrites of piano-roll editing, transport authority, or browser/runtime mutation logic during this pass
- `Validation status`:
  - browser build passed after Guide/runtime migration slices
  - lesson panel is mounted
  - first executable lesson exists

### 2026-03-15 — UX journey, Studio modes, and Lovable UI package

- `Status`: `Action required`
- `Area`: UX journey, lesson-first Home/Studio flow, Studio presentation modes
- `Files`:
  - `docs/MusicHub_UX_Journey_v1.md`
  - `docs/MusicHub_UX_Diagrams_v1.md`
  - `docs/MusicHub_Studio_Modes_v1.md`
  - `docs/MusicHub_Lovable_UI_Info_Package_v1.md`
- `What changed`:
  - Added a screen-by-screen UX map for login, Home, Learn, Studio, Theory, Lab, and Flight Case
  - Added page/state diagrams and a component-level guided Studio hierarchy
  - Defined `Guided`, `Standard`, and `Focused` Studio modes as presentation modes on one DAW architecture
  - Specified that beginners should not see every Studio panel at once and should instead get progressive disclosure in guided mode
  - Consolidated the Lovable-facing UI package into one document with product intent, safe implementation zones, and priority component targets
- `Contract impact`:
  - no runtime contract change
  - strong UX and layout constraint for how lesson-first UI should be implemented against the existing runtime
- `Action for Lovable`:
  - read all four docs before continuing UI implementation
  - implement `Guided` Studio first, with reduced panel density and strong lesson emphasis
  - treat `Standard` and `Focused` as derived presentation modes, not separate products
  - use the info package as the baseline for Home, login, guided Studio shell, lesson progression UI, and completion flow
- `Validation status`:
  - documentation package created
  - aligned to current architecture and runtime migration state

---

## Lovable → Codex Update Log

### 2026-03-14 — MH-008 Connected-mode authority audit findings

- `Status`: `Action required`
- `Area`: Connected-mode authority — transport state ownership
- `Files`:
  - `src/hooks/useStudioTransport.ts`
  - `src/hooks/useStudioCommandDispatch.ts`
- `What Lovable found`:
  - **F1**: `handleLoopChange` updates local loop region state before host confirmation in connected mode
  - **F2**: `handleLoopToggle` updates local loop enabled state before host confirmation in connected mode
  - **F3**: `handleTempoChange` updates local tempo state before host confirmation in connected mode
  - **F4**: `useStudioCommandDispatch` always returns `applied_local` ack status, misleading in connected mode where host is authoritative
- `Recommended fix`:
  - F1–F3: Gate local state updates behind `isMock`
  - F4: Introduce `pending` or `forwarded` ack status for host-bound commands
- `Action for Codex`: Review and decide fix ownership — F1–F3 are Lovable-side gates, F4 may need round-trip confirmation protocol
- `Validation status`: audit only — no code changes made

---

## Instructions For Lovable

When reading this file:

1. process any entry with `Status: Action required`
2. treat any entry with `Status: Review only` as a constraint to avoid conflicting edits
3. if no `Action required` entries exist, do not assume there is implementation work to do
4. if a file you need to edit appears in an update entry, read that entry first

---

## Ownership Summary

- Lovable owns product UI, shell UX, cloud/backend contracts, and frontend implementation
- Codex owns native runtime truth, plugin host behavior, native transport/playback behavior, and runtime/package debugging
- shared integration zones must not be edited in parallel without coordination

---

## High-Risk Shared Files

- `src/pages/Studio.tsx`
- `src/services/hostConnector.ts`
- `src/hooks/useHostConnector.ts`
- `src/hooks/useStudioTransport.ts`
- `src/components/studio/TransportBar.tsx`
- `src-tauri/src/lib.rs`
- `src/services/pluginHostClient.ts`
- `src/services/pluginHostSocket.ts`
- `plugin-host/src/host/PluginHostService.cpp`

---

## One-Line Routing Instruction

If the user wants Lovable to pick up Codex changes, the user should say:

> Read `docs/public/lovable-codex-handoff.md` and process any `Action required` items. Treat `Review only` items as coordination constraints.
