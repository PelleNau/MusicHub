# Project Decisions

## 2026-03-19 — Guided, Standard, and Focused should remain one Studio shell system

### Decision

Guided, Standard, and Focused should be implemented as density and emphasis variants of one Studio shell system rather than as separate layouts with separate runtime assumptions.

### Rationale

The lesson view-policy and mode contracts already provide the correct seam for panel visibility, support-surface emphasis, and viewport focus. Splitting the product into separate Studio layouts would reintroduce architectural drift between UI presentation and the shared runtime.

### Consequence

- mode-specific UI work should derive from the existing shell contract instead of creating independent page structures
- Figma-driven refinements should change density, defaults, and emphasis rather than inventing new runtime behavior per mode
- future lesson-specific view changes should land through lesson view policy overlays on top of this shared shell system

---

## 2026-03-19 — Non-Studio surfaces should share one product shell

### Decision

Home, Lab, Theory, Bridge, Deep Dive, and Flight Case should render inside one shared product shell with a persistent sidebar, top bar, and common page-header language instead of each page behaving like a standalone mini-application.

### Rationale

The product now has enough distinct surfaces that page-local shells create fragmentation and make the application feel like a bundle of unrelated tools. A shared shell gives Figma and implementation one stable navigation and layout vocabulary outside Studio.

### Consequence

- non-Studio page work should prefer shared shell primitives over local full-page chrome
- future Figma designs for Courses, Theory, Lab, and inventory should target this shell language
- mock or legacy pages should be replaced with real shell-based surfaces rather than extended as isolated layouts

---

## 2026-03-19 — Course surfaces should bind curriculum to real Studio entry points

### Decision

The learning path should be rendered through real shell-based course/module pages that connect curriculum metadata, shell policy, and actual Studio lesson entry points instead of sending users through mock curriculum pages.

### Rationale

Once the product shell exists, continuing to route `/learn` through mock pages preserves the wrong source of truth. The course surfaces need to express which modules are implemented, which shell policy they require, and whether a real Studio lesson exists.

### Consequence

- `/learn` and its detail routes should use a real catalog/data layer instead of mock-only page content
- course/module pages should expose shell policy and implementation status directly
- Studio entry buttons should only route into real lesson/runtime paths when those paths exist

## 2026-03-18 — MusicHub should be treated as a desktop-primary product

### Decision

MusicHub should be designed and implemented as a desktop-primary product using the React frontend inside the Tauri shell, with the native host/core as the authoritative runtime for Studio behavior.

### Rationale

Desktop operation is the correct target for lower-latency audio, tighter MIDI/device integration, plugin hosting, local filesystem workflows, and automatic native lifecycle management. Continuing to treat web parity as a primary requirement would preserve unnecessary constraints from an abandoned product direction.

### Consequence

- Studio runtime work should optimize for desktop behavior first
- the native host/core relationship should be treated as a product-level contract, not a temporary development detail
- web compatibility may remain useful for support surfaces, but not as the primary Studio target

---

## 2026-03-14 — Native host remains authoritative in connected mode

### Decision

Connected mode will treat the native host as the source of truth for transport, playback, meters, plugin state, recording, monitoring, and render behavior.

### Rationale

Dual authority between browser and native runtime makes the system unstable and creates repeated sync bugs.

### Consequence

Frontend behavior must be structured around host adapters, selectors, and commands rather than local duplicated engine logic.

---

## 2026-03-17 — Runtime-only coordination effects should leave `Studio.tsx`

### Decision

Timeline wheel binding and mock-mode graph rebuild should live in a dedicated runtime coordination hook instead of remaining inline in `Studio.tsx`.

### Rationale

Those effects are pure runtime coordination. Keeping them inline makes the page look more stateful than it is and obscures the remaining real debt.

### Consequence

- `Studio.tsx` gets closer to a composition root
- remaining page debt becomes easier to isolate
- later store/runtime consolidation can target bounded coordination hooks instead of generic page effects

---

## 2026-03-17 — Route and session-picker state should leave `Studio.tsx`

### Decision

Lesson query-param handling and session-picker route state should live in a dedicated route model instead of remaining open-coded in `Studio.tsx`.

### Rationale

That state is app-shell routing, not DAW runtime logic. Leaving it in the page adds noise and hides actual Studio coordination debt.

### Consequence

- `useStudioRouteModel.ts` now owns lesson start/dismiss routing and active session selection state
- `Studio.tsx` is closer to a composition root
- remaining page debt is more clearly runtime-specific

---

## 2026-03-17 — Browser preview and info should remain local UI assistance for now

### Decision

Browser preview, hover info, search, and filter state should remain bounded local UI state for now instead of being promoted into Guide-observable or selector-backed shared runtime state.

### Rationale

Those interactions are assistive browser UX, not canonical Studio behavior. Promoting them prematurely would add coupling without improving runtime authority or lesson correctness.

### Consequence

- `useStudioBrowserPanelState.ts` remains the bounded owner of browser UI assistance state
- Guide and shared selectors should observe browser insertion outcomes, not every browser interaction
- this can be revisited later if a concrete lesson requires preview or filter awareness

---

## 2026-03-17 — Mixer master-volume UI state should leave `Studio.tsx`

### Decision

Mixer master-volume UI state should live in a dedicated mixer panel hook instead of remaining as a page-local `useState` in `Studio.tsx`.

### Rationale

It is presentation-local state for the mixer surface, not page-level orchestration. Leaving it in the page makes the composition root noisier than necessary.

### Consequence

- `useStudioMixerPanelState.ts` now owns mixer master-volume UI state
- `Studio.tsx` loses another piece of incidental local state
- remaining page debt is more tightly focused on runtime coordination

---

## 2026-03-17 — Cross-layer type casting should live in shell hooks, not the page

### Decision

Type adaptation from selector-facing summaries into component-facing shell props should happen inside the shell hooks that own those props, not inline in `Studio.tsx`.

### Rationale

Inline casting in the page is adapter glue. It increases page noise without adding meaningful runtime logic and makes cross-layer boundaries harder to audit.

### Consequence

- `useStudioConnectionAlertModel.ts` and `useStudioTransportBarModel.ts` own their connection-summary adaptation
- `Studio.tsx` loses another piece of cross-layer glue
- future shell hooks should absorb similar adapter details rather than leaking them upward

---

## 2026-03-17 — Host-facing selection derivation should leave `Studio.tsx`

### Decision

Selected clip/track derivation needed for native host sync should live in a dedicated hook instead of remaining as inline `useMemo` logic in `Studio.tsx`.

### Rationale

That derivation is host-adapter preparation, not page composition. Leaving it inline keeps adapter-specific reasoning in the page.

### Consequence

- host-facing selected clip/track derivation now lives in the canonical session/runtime path instead of `Studio.tsx`
- native sync receives a bounded model instead of page-local memo outputs
- `Studio.tsx` loses another piece of adapter-specific logic

---

## 2026-03-17 — Session metrics and host-mode booleans should leave `Studio.tsx`

### Decision

Tempo, time-signature, total-beat derivation, and host-mode booleans should live in bounded hooks instead of remaining inline in `Studio.tsx`.

### Rationale

These are derived inputs to subsystems, not page composition logic. Leaving them inline adds page noise without improving traceability.

### Consequence

- `useStudioSessionMetrics.ts` now owns session tempo/time-signature/total-beat derivation
- `useStudioHostModeModel.ts` now owns browser-audio and host-availability booleans
- `Studio.tsx` loses another slice of incidental derivation

---

## 2026-03-17 — Route hooks should own query-param parsing

### Decision

`useStudioRouteModel.ts` should parse `id` and `lesson` query params itself instead of making `Studio.tsx` read and pass them through.

### Rationale

Query parsing is route-model responsibility, not page composition. Keeping it in the page leaks routing details upward for no benefit.

### Consequence

- `useStudioRouteModel.ts` now owns query-param parsing
- `Studio.tsx` no longer depends on `useSearchParams`
- route state is a cleaner bounded subsystem

---

## 2026-03-14 — MusicHub is a Studio + Guide product, not just a DAW UI

### Decision

The target product architecture will be built around a commandable Studio environment plus a Guide runtime, not around disconnected content pages or ad hoc tutorials.

### Rationale

The differentiator is orchestration, guidance, and learning on top of a real DAW core.

### Consequence

Architecture, domain modeling, and future UX work must support Guide as a first-class system.

---

## 2026-03-14 — Architecture-first before redesign-heavy frontend work

### Decision

The next phase will prioritize domain model adoption, adapter boundaries, and command/state design ahead of deep frontend redesign.

### Rationale

Frontend redesign built on unstable architecture will harden the wrong abstractions and increase rework.

### Consequence

UI concept work may proceed, but implementation-heavy redesign should wait for clearer command/state boundaries.

---

## 2026-03-14 — Use adapter-first migration instead of direct Studio page rewrite

### Decision

Introduce a host/domain adapter layer before rewriting `Studio.tsx` or attempting a full store replacement.

### Rationale

The current runtime mixes persisted session state, host runtime state, and UI-local state across multiple hooks and the page composition layer. Rewriting the page first would entrench those boundaries instead of clarifying them.

### Consequence

- runtime mapping is documented first
- host adapter design is treated as the next stable boundary
- command bus work proceeds against the adapter/domain model, not against the current page shape

---

## 2026-03-14 — One shared command contract for UI, Guide, templates, and AI

### Decision

Define one typed MusicHub command contract and make all product-side mutations target it rather than creating separate imperative paths for UI actions, guide actions, template insertion, and assistant behavior.

### Rationale

The interaction flows and architecture brief both assume one commandable Studio environment. Separate mutation paths would reintroduce hidden authority boundaries and make Guide validation and assistant behavior inconsistent.

### Consequence

- command families are formalized before runtime bus implementation
- command history and acknowledgments become part of the architecture, not an afterthought
- future runtime work should introduce dispatch and handling around this contract instead of adding new page-local mutation helpers

---

## 2026-03-14 — Migrate safe discrete actions to commands before continuous controls

### Decision

The migration will move safe discrete actions such as transport, panel selection, clip metadata edits, track mute/solo, and keyboard-triggered actions onto the command surface before attempting continuous controls such as live automation drawing, mixer drags, or rich MIDI editing.

### Rationale

Discrete actions are easier to model, acknowledge, and validate. They reduce page-local imperative behavior quickly without forcing premature design decisions for high-frequency edit streams.

### Consequence

- the command surface grows around safe, explicit mutations first
- keyboard shortcuts should route through the command layer instead of bypassing it
- continuous editing surfaces can be designed later as either command streams or specialized editor protocols

---

## 2026-03-14 — Start command history as a bounded local sink

### Decision

Introduce command acknowledgments and history first as a bounded local sink inside the Studio runtime before deciding on any persisted, shared, or Guide-visible history model.

### Rationale

The system needs real command/ack traffic to validate the command architecture, but persisting or broadly exposing that history now would force premature decisions about retention, replay, debugging UX, and lesson/runtime coupling.

### Consequence

- command dispatch records into a bounded local sink first
- Guide/runtime integration should depend on the command/ack contract, not on a premature storage model
- later work must explicitly decide retention and exposure rules before promoting the sink into a broader runtime subsystem

---

## 2026-03-14 — Guide runtime will execute against commands, acknowledgments, and selector snapshots

### Decision

The Guide system will validate lesson progression against command traffic, command acknowledgments, and canonical selector snapshots instead of page-local UI events.

### Rationale

Guide must survive UI refactors and the ongoing Studio migration. Anchoring lesson behavior to page-local events would couple Guide to transitional implementation details and reintroduce a second authority model.

### Consequence

- Guide runtime contracts are defined against selector snapshots and command/ack observation
- anchor resolution is treated as a product registry problem, not a DOM-query problem
- future Guide implementation should reuse the selector/command migration work instead of bypassing it

---

## 2026-03-14 — Guide observation is bounded by policy and composed at the Studio bridge

### Decision

Guide runtime observations will be composed at a Studio-facing bridge using bounded command, acknowledgment, and event windows plus the current selector snapshot.

### Rationale

Guide needs recent interaction context, not unbounded historical data. Composing observations at the bridge keeps retention policy explicit and prevents lesson evaluation from depending on page-local plumbing.

### Consequence

- observation retention is defined by policy rather than ad hoc slicing
- lesson lookup, selector snapshots, anchor registry, and observations are composed in one Studio-facing hook
- future visible Guide UI can consume the bridge without re-deriving runtime state

---

## 2026-03-14 — MIDI editing enters the command layer through explicit replacement first

### Decision

The first real MIDI editor command path will use full note-replacement commands before attempting granular note insert/update/delete flows as the dominant runtime path.

### Rationale

The current piano-roll editing surface already works in full-note snapshots. Moving that behavior behind an explicit command gives the system an observable, Guide-compatible mutation path without forcing premature granular edit-stream design.

### Consequence

- note replacement now enters through `studio.replaceMidiNotes`
- granular note commands remain available in the contract for future refinement
- the next decision is whether to keep replacement as the main editor protocol or layer granular commands on top

---

## 2026-03-14 — Lesson guidance is a dedicated Studio panel, not a temporary overlay

### Decision

Guide runtime is surfaced in Studio through a dedicated lesson panel with its own state contract and collapse behavior.

### Rationale

Guide is a first-class product system. Treating it as a temporary overlay would make it fragile, hard to coordinate with layout state, and easy to regress during continued Studio refactors.

### Consequence

- lesson panel state is explicit
- visible Guide UI can evolve independently from Detail, Piano Roll, and Mixer
- future lesson interactions should target the panel contract rather than ad hoc overlay state

---

## 2026-03-14 — Selection modifiers belong to the command surface, not a separate page-local path

### Decision

Track and clip selection, including modifier-based toggle/add semantics, should route through `studio.select` commands with explicit selection modes rather than a separate page-local mutation path.

### Rationale

Selection is part of observable Studio state and Guide context. Leaving multi-select semantics outside the command surface would keep a hidden mutation path in `Studio.tsx` and make lesson/runtime evaluation less reliable.

### Consequence

- `studio.select` carries explicit selection mode semantics
- clip-click modifier behavior is now command-backed
- remaining timeline/selection cleanup should continue by removing page-local mutation helpers instead of growing them

---

## 2026-03-14 — Guide lifecycle should be observable even when progression is automatic

### Decision

Lesson start and step advancement should be recorded as command traffic even when they are driven by Guide runtime evaluation instead of direct button clicks.

### Rationale

If automatic lesson progression is invisible to the command/ack stream, Guide becomes harder to debug, harder to validate, and less aligned with the command-first architecture than the rest of Studio behavior.

### Consequence

- Guide runtime now emits observable `lesson.start` and `lesson.advance` command records
- lesson panel button actions and automatic runtime transitions share one observable interaction history
- future Guide work should decide explicitly whether completion and failure transitions also need first-class records

---

## 2026-03-14 — MIDI editing will support granular commands before the UI switches to them by default

### Decision

The runtime should support granular MIDI note insert/update/delete commands now, even if the piano roll continues to emit full note replacement as its primary mutation path during the migration.

### Rationale

Waiting to introduce granular commands until after the piano-roll rewrite would leave the command model incomplete and make future editor work more disruptive. Supporting both paths keeps the runtime architecture moving without forcing an immediate UI rewrite.

### Consequence

- the dispatch layer now executes `studio.insertMidiNotes`, `studio.updateMidiNotes`, and `studio.deleteMidiNotes`
- a dedicated MIDI edit protocol surface exists for future editor adoption
- the remaining decision is whether the piano roll keeps replacement as the main protocol or migrates to granular commands

---

## 2026-03-14 — Guide completion and failure should be observable runtime records

### Decision

Guide runtime completion and failure transitions should emit observable command records, just like lesson start and lesson step advancement.

### Rationale

If completion and failure stay implicit inside the runtime, lesson debugging and analytics become inconsistent with the command-first interaction model already used for start, advance, skip, reset, and abort flows.

### Consequence

- lesson terminal transitions stay visible in the same observation model as the rest of Guide
- future analytics and debugging work can reason about Guide completion/failure without hidden state

---

## 2026-03-15 — Continuous edits should be observable without being reclassified as commands

### Decision

High-frequency track, clip, and automation edits should be recorded as their own protocol family rather than being forced into the discrete command bus.

### Rationale

Continuous controls behave differently from discrete intent commands. Guide/runtime still needs visibility into what the user is doing, but keeping these edits separate preserves clearer authority and acknowledgment semantics.

### Consequence

- continuous edit logs can feed Guide observation without polluting command history
- future lesson validation can choose to consume continuous edits explicitly
- `Studio.tsx` no longer has to wire these callbacks directly if a bounded model owns them

---

## 2026-03-15 — Presentation-only Studio chrome should leave `Studio.tsx` before deeper store replacement

### Decision

Embedded UI chrome that does not own runtime behavior should be extracted into dedicated components during the migration.

### Rationale

This reduces pressure on the highest-risk shared file, makes the remaining runtime debt easier to see, and gives the UI layer cleaner seams without changing authority boundaries.

### Consequence

- `StudioBottomTabButtons` and `StudioStatusBar` now live outside `Studio.tsx`
- the remaining page complexity is increasingly concentrated in runtime composition rather than incidental UI rendering

- `lesson.complete` and `lesson.fail` are recorded alongside the rest of lesson lifecycle traffic
- visible lesson UI and analytics/debugging can observe terminal states without special runtime inspection

---

## 2026-03-15 — Large workspace composition blocks should leave `Studio.tsx` before store replacement

### Decision

The arrangement and bottom workspace JSX blocks should be extracted into dedicated composition components before deeper store replacement work continues.

### Rationale

Those sections hold a large share of the remaining page size and visual complexity. Extracting them now reduces merge pressure on `Studio.tsx`, gives Lovable cleaner UI seams, and keeps the remaining page debt focused on runtime coordination rather than layout assembly.

### Consequence

- arrangement workspace composition now lives in `StudioArrangementWorkspace.tsx`
- bottom workspace composition now lives in `StudioBottomWorkspace.tsx`
- remaining `Studio.tsx` debt is narrower and easier to target in later migration passes

---

## 2026-03-15 — Header and guide-sidebar chrome should leave `Studio.tsx` once lesson runtime is mounted

### Decision

Once lesson runtime and guide sidebar behavior are stable enough, the header and right-rail presentation should move into dedicated Studio composition components.

### Rationale

Those areas are high-churn UI surfaces that Lovable will continue to touch. Keeping them embedded in `Studio.tsx` increases merge pressure on the highest-risk shared file without adding runtime value.

### Consequence

- header presentation now lives in `StudioHeaderBar.tsx`
- guide completion and lesson sidebar presentation now live in `StudioGuideSidebar.tsx`
- `Studio.tsx` is more clearly a composition root and a lower-risk merge target for UI work

---

## 2026-03-15 — Browser panel UI state should move into a bounded hook before store promotion

### Decision

BrowserPanel search, category filters, collapsed state, keyboard selection, and resize state should move into a dedicated hook before any decision to promote browser state into broader selector/store infrastructure.

### Rationale

This keeps current ownership coherent without prematurely inflating shared app state. It also gives a clean seam for later decisions about which browser behaviors should remain local UI state versus become selector-observable.

### Consequence

- BrowserPanel state is now owned by `useStudioBrowserPanelState.ts`
- BrowserPanel rendering is simpler and easier to redesign without mixing state policy into the JSX
- later Guide/runtime work can decide selectively which browser behaviors need broader observability

---

## 2026-03-15 — Presentation prop shaping should leave `Studio.tsx` once behavior is already modeled elsewhere

### Decision

When a UI surface already depends on stable behavior models, the remaining prop assembly for that surface should move into small dedicated hooks or presentation helpers instead of staying inline in `Studio.tsx`.

### Rationale

This removes low-value page noise without changing authority or store boundaries. It also makes later redesign work safer by separating runtime behavior from presentation assembly.

### Consequence

- transport prop shaping now lives in `useStudioTransportBarModel.ts`
- connection alert prop shaping now lives in `useStudioConnectionAlertModel.ts`
- repeated guided empty states now live in `StudioLessonEmptyState.tsx`
- remaining `Studio.tsx` work is increasingly about true runtime coordination rather than JSX assembly

---

## 2026-03-16 — Workspace-level prop assembly should move into dedicated model hooks before store replacement

### Decision

Once major Studio layout regions have been split into dedicated components, their prop assembly should also move into dedicated model hooks instead of remaining inline in `Studio.tsx`.

### Rationale

Splitting components without moving prop assembly still leaves the composition root noisy and high-risk. Dedicated workspace model hooks make the remaining coordination debt more legible and keep later redesign work away from raw page-level wiring.

### Consequence

- arrangement workspace prop assembly now lives in `useStudioArrangementWorkspaceModel.ts`
- bottom workspace prop assembly now lives in `useStudioBottomWorkspaceModel.ts`
- guide sidebar prop assembly now lives in `useStudioGuideSidebarModel.ts`
- the remaining page debt is now more clearly focused on runtime/effect coordination rather than surface wiring

---

## 2026-03-17 — `Studio.tsx` should stop at orchestration and delegate model assembly

### Decision

Once shell-facing, behavior-facing, and derived runtime model construction becomes repetitive, it should be grouped into dedicated orchestration hooks instead of continuing to assemble those models inline in `Studio.tsx`.

### Rationale

At this stage, more one-off extractions would only trade one kind of page noise for another. Consolidating model assembly keeps `Studio.tsx` focused on runtime boundaries and major subsystem composition while avoiding a return to ad hoc prop-shaping.

### Consequence

- shell-facing model assembly now lives in `useStudioShellModels.ts`
- behavior-facing model assembly now lives in `useStudioBehaviorModels.ts`
- derived runtime models now live in `useStudioDerivedRuntimeModels.ts`
- presentation-level model assembly now lives in `useStudioPresentationModels.ts`
- Studio mutation contracts now live in `studioMutationTypes.ts` instead of passing through `any`-typed hook options
- optimistic session-track cache updates now begin consolidating in `studioSessionCache.ts` instead of being fully duplicated across action hooks
- session query keys and invalidation now consolidate in `studioSessionQueries.ts` instead of being duplicated across `useSession` and action hooks
- Studio session/query and local selection state now group under `useStudioSessionState.ts` instead of being assembled directly in the page
- core Studio runtime orchestration now groups under `useStudioRuntimeCore.ts` instead of being assembled directly in the page
- interaction-level Studio orchestration now groups under `useStudioInteractionRuntime.ts` instead of being assembled directly in the page
- session track/clip lookup now centralizes through `studioSessionAdapter.ts` instead of being repeated across action hooks
- session-track cache helpers now consume `studioSessionKeys` instead of open-coded query-key arrays
- session-derived track index, metrics, selected clip/track, and ghost notes now group under `useStudioSessionDomainModel.ts` instead of being rebuilt independently across runtime hooks
- `useStudioSessionState.ts` now owns that session-domain model directly, so the runtime boundary receives canonical session-derived state instead of reconstructing it downstream
- `useStudioActions.ts` now consumes the canonical session track index from session state instead of rebuilding it in the mutation layer
- timeline loop-to-selection now consumes the canonical clip list from session-domain state instead of rebuilding clip aggregation in the behavior layer
- the Studio runtime/session seam now has an explicit typed contract in `musicHubStudioRuntime.ts` instead of depending on unspoken hook return shapes
- `useStudioSessionDomainModel.ts` now owns session metrics directly instead of delegating them to a second hook layer
- `Studio.tsx` is now substantially smaller and the next migration phase is deeper runtime/store consolidation rather than more superficial page cleanup

---

## 2026-03-18 — Browser hover and preview descriptions should remain local assistance state

### Decision

Browser hover/info text should remain local assistance state owned by the browser panel layer instead of being promoted into the canonical Studio runtime or Guide-observable selector state.

### Rationale

The browser’s info hover text explains UI affordances and browsing choices, but it does not represent project state, transport state, selection state, or any host-authoritative behavior. Promoting it into canonical runtime state would blur the line between product assistance and Studio authority, while adding no value to command replay, Guide validation, or connected-mode correctness.

### Consequence

- browser hover/info text is now explicitly documented in code as local assistance state in `useStudioBrowserPanelState.ts`
- Guide/runtime work can ignore browser hover descriptions unless a future lesson explicitly needs browser preview semantics
- the next runtime consolidation work should focus on canonical session/runtime state, not on local browser hover UI

---

## 2026-03-18 — Studio runtime typing should use explicit contracts, not stale hook-coupled `ReturnType` chains

### Decision

The Studio runtime seam should use explicit exported runtime types and hook result aliases where needed instead of depending on deleted hook imports and deep `ReturnType<typeof ...>` chains for core model typing.

### Rationale

`ReturnType` chains are acceptable for small local composition, but they become fragile when they cross runtime boundaries or reference hooks that are being deleted as part of the migration. Explicit runtime contracts make the new session-domain path the source of truth and reduce the risk that Vite’s no-typecheck build path hides broken type dependencies or loose variable references.

### Consequence

- `musicHubStudioRuntime.ts` now exposes `StudioSessionMetrics`
- runtime-facing hooks now use explicit runtime types or exported hook result aliases instead of stale/deleted hook imports
- `Studio.tsx` now binds `sessionDomainModel` explicitly from runtime state, removing a latent bug that the build pipeline did not catch
- targeted lint on the current Studio migration surface now passes again after the type-boundary cleanup

---

## 2026-03-18 — Studio actions should take the canonical session-domain model, not separate fragments

### Decision

Once the canonical session-domain model exists, Studio action hooks should accept that model directly instead of continuing to thread `trackIndex`, tempo, and similar fragments as separate arguments.

### Rationale

Passing domain fragments separately keeps the old seam alive even after the canonical model exists. It also makes it easier for action hooks to drift from the session-domain state that selectors and runtime behavior already use. Taking the session-domain model directly makes the action layer depend on the same canonical state boundary as the rest of the Studio runtime.

### Consequence

- `useStudioActions.ts` now receives `sessionDomainModel` directly
- `useStudioTrackActions.ts` and `useStudioClipActions.ts` now derive canonical track index and metrics from that model instead of separate parameters
- targeted lint on the active Studio migration surface now passes again after the action-boundary cleanup
- the next consolidation work should continue collapsing raw `useSession`-shaped seams, not reintroduce parameter-by-parameter domain plumbing

---

## 2026-03-18 — The active Studio session boundary should be typed before publish, not after

### Decision

The active Studio-facing parts of `useSession.ts` should use explicit row and insert typing before this migration is published instead of leaving `any`-based session/clip payload handling in place and deferring that cleanup.

### Rationale

At this stage, `useSession` is no longer a distant persistence detail. It is part of the canonical Studio runtime seam. Leaving the Studio path typed only above `useSession` would preserve uncertainty exactly where action hooks, optimistic cache writes, and selector/runtime state meet. Tightening that boundary now is lower risk than carrying it into the redesign phase.

### Consequence

- `useSession.ts` now has stronger typing for Studio-facing track and clip query/insert paths
- targeted lint now passes on the session boundary plus the active Studio runtime stack
- the current migration has a cleaner checkpoint for either one more runtime pass or a publishable branch cut

---

## 2026-03-18 — Live Studio persistence should move behind a domain adapter, not stay embedded in `useSession`

### Decision

The non-dev Studio persistence path should live behind explicit domain helpers in `src/domain/studio/studioSessionPersistence.ts` instead of keeping Supabase fetch/create/update/delete logic embedded directly inside `useSession.ts`.

### Rationale

Once the Studio runtime depends on a canonical session-domain model, `useSession` is part of the runtime seam rather than a disposable UI hook. Leaving live persistence inline would keep infrastructure mixed with dev-fixture branching and query orchestration. A dedicated persistence adapter makes the Studio state path easier to reason about and easier to replace later if storage changes.

### Consequence

- live session fetch, track fetch, session list fetch, session create/update/rename/delete, track create/update/delete, clip create/update/delete, and batch import inserts now go through `src/domain/studio/studioSessionPersistence.ts`
- `useSession.ts` is now closer to a Studio-facing persistence orchestrator than a bag of raw Supabase calls
- the next consolidation step can focus on higher-level runtime adapters instead of more low-level query cleanup

---

## 2026-03-18 — Studio clip state should match the real database/runtime model

### Decision

`SessionClip` should include `is_muted`, and Studio clip/track mutation contracts should use concrete create/update payload types instead of generic record blobs.

### Rationale

The active Studio code already depends on clip mute state, and the database schema includes it. Omitting it from the core type forced local casts and weakened the mutation seam exactly where clip editing, cache updates, and note operations converge.

### Consequence

- `src/types/studio.ts` now models `SessionClip.is_muted`
- `src/hooks/studioMutationTypes.ts` now defines concrete clip/track create-update payload types
- cache helpers and active clip actions now operate on concrete Studio payloads instead of anonymous objects

---

## 2026-03-15 — Shell interaction cleanup should move into bounded page models before store replacement

### Decision

Page-shell behaviors such as upload plumbing, loop focus, timeline click blur, and bottom-pane switching should be extracted into bounded hooks before any attempt to replace the remaining runtime/store structure.

### Rationale

These interactions are low-risk to extract and materially reduce `Studio.tsx` coordination load. Leaving them page-local would keep the composition root noisy and make later store or layout work harder to reason about.

### Consequence

- shell interaction hooks now own audio upload, native note audition, bottom-pane switching, and loop/timeline shell behavior
- remaining `Studio.tsx` cleanup can focus on grid/timeline composition and continuous edit flows instead of basic shell wiring

- `lesson.complete` and `lesson.fail` are now part of the typed command contract
- Guide runtime command sync records terminal lesson states into the same observable history
- future Guide surfaces can reason about terminal state without scraping runtime-local transitions

---

## 2026-03-14 — Page-level session and native-detail callback shaping should move into bounded models

### Decision

Session picker behavior, header actions, connection actions, and native detail-panel host callbacks should be grouped into bounded model hooks instead of remaining as open-coded callback clusters inside `Studio.tsx`.

### Rationale

These flows are not part of the core domain store, but they still create page-level coupling and obscure where UI behavior is actually assembled. Moving them into bounded models keeps `Studio.tsx` on a composition-root path without forcing premature commandization of every app-shell action.

### Consequence

- session picker actions are now composed in `useStudioSessionPickerModel.ts`
- header and connection actions are composed in dedicated model hooks
- native detail-panel host callbacks are grouped in a dedicated model hook
- remaining page-local cleanup should continue by extracting bounded models before introducing new ad hoc callback clusters

---

## 2026-03-14 — Browser insertion actions belong on the observable command path

### Decision

Adding built-in devices and native host plugins from the Browser should emit explicit browser command traffic instead of calling track mutation helpers invisibly from the page.

### Rationale

Browser insertion changes the Studio graph and can be part of lessons, onboarding, and assistant guidance. Leaving it outside the observable command path would keep a blind spot in the interaction model.

### Consequence

- `browser.addDevice` and `browser.addHostPlugin` are now part of the typed command contract
- BrowserPanel insertion actions now dispatch through the Studio command surface
- future Guide/content work can observe browser-driven graph mutations without special-case wiring

---

## 2026-03-18 — Dev fixture storage should be adapterized alongside live persistence

### Decision

The development fixture path should move behind a domain adapter instead of remaining embedded in `useSession.ts`, and `useSession.ts` should treat both dev and live storage as delegated policy.

### Rationale

Keeping only the live path adapterized still leaves `useSession.ts` owning storage mechanics, just for a different backend. That weakens the runtime seam and makes the hook responsible for both policy selection and data-mutation internals.

### Consequence

- fixture fetch and mutation behavior now lives in `src/domain/studio/studioSessionDevFixture.ts`
- `useSession.ts` is closer to a runtime wrapper and less of a storage owner
- the next meaningful consolidation step sits above `useSession`, not below it

---

## 2026-03-18 — Multi-step session deletion and Ableton import belong in the persistence adapter

### Decision

Full-session deletion and Ableton-to-Studio import should live in the persistence adapter rather than as raw multi-step logic in `useSession.ts`.

### Rationale

Those flows are persistence transactions. Leaving them in the hook keeps adapter internals mixed with runtime state concerns and makes the session boundary less coherent than the single-record mutation paths.

### Consequence

- `deleteSessionGraph(...)` now owns full-session teardown in `src/domain/studio/studioSessionPersistence.ts`
- `importAbletonSession(...)` now owns session/track/clip import orchestration in `src/domain/studio/studioSessionPersistence.ts`
- `useSession.ts` is thinner and more consistent across single-step and multi-step persistence flows

---

## 2026-03-18 — `useSession` should depend on one session source contract, not branch across storage modes

### Decision

`useSession.ts` should consume a single Studio session source contract and stop branching directly across dev fixture logic and live persistence logic.

### Rationale

Adapterizing storage below the hook helps, but the hook still owns policy branching if it calls dev and live helpers separately. A top-level source contract makes the runtime seam explicit and keeps `useSession.ts` focused on query orchestration and mutation wiring.

### Consequence

- `src/domain/studio/studioSessionSource.ts` now defines the source contract used by `useSession.ts`
- dev and live storage remain separate underneath that contract
- the next decision is whether this is the stable runtime checkpoint or whether one stronger Studio runtime adapter should sit above `useSession`

---

## 2026-03-18 — Studio runtime should compose behind one adapter before page presentation wiring

### Decision

Core Studio runtime state and interaction runtime state should compose behind a single `useStudioRuntime.ts` adapter before page-level presentation wiring consumes them.

### Rationale

Once the session source and session-state seams are explicit, keeping core runtime and interaction runtime as separate top-level assemblies still forces the page-runtime layer to understand too much of the Studio stack. A single runtime adapter makes the dominant Studio runtime path clearer and gives redesign work a more stable integration target.

### Consequence

- `useStudioRuntime.ts` now composes `useStudioRuntimeCore.ts` and `useStudioInteractionRuntime.ts`
- `useStudioPageRuntime.ts` depends on one stronger Studio runtime adapter instead of manually coordinating both layers
- the next remaining question is whether a stronger normalized selector/runtime surface is still needed beyond the current adapter

---

## 2026-03-18 — Page coordination should be isolated from page-runtime assembly

### Decision

Timeline/grid coordination and keyboard binding should live in a dedicated page-coordination hook instead of remaining wired directly in `useStudioPageRuntime.ts`.

### Rationale

Even after runtime unification, page-runtime assembly should not own low-level effect wiring for viewport and keyboard behavior. Keeping coordination separate makes the page-runtime layer describe composition rather than lifecycle mechanics.

### Consequence

- `src/hooks/useStudioPageCoordination.ts` now owns timeline/grid coordination and keyboard binding
- `useStudioPageRuntime.ts` is narrower and more declarative
- the remaining work is no longer page wiring; it is either publish or move into redesign work

---

## 2026-03-18 — Studio redesign should land through an explicit mode contract

### Decision

The Studio redesign should be implemented through an explicit mode contract (`guided`, `standard`, `focused`) and a mode-driven shell policy instead of continuing to hardcode one default page layout.

### Rationale

The runtime checkpoint is now strong enough that the next source of risk is shell drift: Figma work can only land cleanly if the page shell has a stable way to express layout density, panel visibility, and guide/browser defaults without reopening runtime extraction work. A mode contract gives the redesign a durable integration surface while keeping transport, session, host, and command authority unchanged.

### Consequence

- `src/types/musicHubStudioModes.ts` now defines the canonical Studio mode and shell-policy contract
- `src/hooks/useStudioModeModel.ts` now resolves route override, persisted preference, and lesson-driven defaults into one active Studio mode
- route/query state and settings now participate in Studio mode selection without changing runtime authority
- browser collapse, lesson-panel collapse, bottom-workspace visibility, and guide-sidebar visibility now have an explicit shell policy surface for the redesign phase

---

## 2026-03-18 — Studio markers should start as local session-assist state, not canonical session data

### Decision

The first marker implementation should live as session-scoped local UI state persisted in localStorage instead of extending the canonical session/backend model immediately.

### Rationale

Markers are useful now for navigation and organization, but there is no existing backend/session contract for them in the real `MusicHub` runtime. The Figma export proved the interaction value, not the storage model. Shipping markers first as local assist state gives the Studio shell the navigation affordance without forcing premature schema, command, persistence, and native-host changes.

### Consequence

- `src/hooks/useStudioMarkerModel.ts` owns marker persistence and actions per active session
- marker rendering now sits in the real timeline shell through `src/components/studio/TimelineMarkerOverlay.tsx`
- the current marker feature is intentionally UI/session-assist state, not authoritative project state
- the later decision is whether markers should become canonical session data once the redesigned shell and project model stabilize

---

## 2026-03-19 — Guided mode should be overlaid by lesson view policy, not treated as one fixed shell

### Decision

Guided mode should remain a base shell density preset, but lesson and step definitions should be able to overlay explicit view policy for panel visibility, viewport focus, and interaction emphasis.

### Rationale

The curriculum spans rhythm, arrangement, MIDI editing, audio editing, preset browsing, and mixing. One static Guided shell will either expose too much UI or fail to surface the right workspace for many lessons. A lesson view-policy layer keeps one Studio architecture while allowing deterministic shell shaping per lesson or per step.

### Consequence

- `src/types/musicHubLessonDsl.ts` now supports declarative `viewPolicy` at lesson, entry, and step levels
- `docs/project/MH-044_Lesson_View_Policy.md` defines the resolution model and intended usage
- the next implementation step is not another new mode; it is resolving lesson view policy on top of the existing Studio mode contract

---

## 2026-03-19 — Guided Studio should behave like a lesson-first shell, not a flat DAW panel stack

### Decision

The first Studio redesign pass should make Guided mode read as a lesson-first workspace where the arrangement surface is primary and the guide rail is the dominant support surface, without changing runtime authority or introducing a second Studio architecture.

### Rationale

The runtime seam is now stable enough that the next material improvement is presentation, not more extraction. Guided mode fails if it looks like a generic pro-Daw layout with an instructional panel bolted on the side. The shell has to make task focus explicit while still using the same underlying Studio runtime.

### Consequence

- `src/pages/Studio.tsx` now frames the shell as a guided workspace when a lesson is active
- `src/components/studio/StudioHeaderBar.tsx` carries lesson context instead of acting like a generic toolbar strip
- `src/components/studio/StudioArrangementWorkspace.tsx` now presents the arrangement area as the main task region
- `src/components/studio/StudioGuideSidebar.tsx`, `src/components/studio/StudioLessonPanel.tsx`, `src/components/studio/lesson/LessonHeader.tsx`, and `src/components/studio/lesson/LessonStepCard.tsx` now treat the guide rail as the dominant guided-work support surface
