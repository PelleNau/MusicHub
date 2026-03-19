# Project Status

## Current Phase

Phase 2 architecture consolidation

## Current Baseline

- `docs/MusicHub_Studio_Domain_Model_v2.md` exists
- `docs/MusicHub_Interaction_Flows_v1.md` exists
- `src/types/musicHubStudioDomain.ts` exists as target-domain types
- `docs/project/MH-005_Runtime_To_Domain_Mapping.md` exists
- `docs/project/MH-006_Host_Adapter_Design.md` exists
- `docs/project/MH-007_Command_Bus_v1.md` exists
- `src/types/musicHubCommands.ts` exists
- coordination docs are in place
- public Lovable handoff docs are in place
- current codebase baseline has a working packaged Tauri app

## Latest Important Completed Work

- packaged app startup/runtime failure fixed
- production chunk split issue removed
- canvas meter color crash fixed
- coordination and public handoff docs established
- project control docs established
- current Studio runtime mapped to the target domain model
- host adapter layer designed at the architecture level
- command bus v1 contract defined with target types
- first runtime selector hook introduced for Studio domain-facing reads
- first command dispatch surface introduced for transport commands
- selector/dispatch insertion expanded to panel and basic selection flows in `Studio.tsx`
- selection-derived Studio view state moved behind the domain view hook
- first persisted mutation path moved onto the command layer for discrete track and clip actions
- clip rename/color/mute/delete/duplicate now also enter through the command layer
- keyboard shortcuts now route transport, panel switching, loop edits, and discrete clip actions through the command surface instead of page-local handlers
- `useStudioSelection` now only owns local selection state and multi-select input behavior; selected clip/track, ghost notes, and panel booleans are no longer duplicated there
- track rename/color/delete now also enter through the command layer
- first host/session adapter modules now exist in code under `src/domain/studio/`
- project task queue expanded into a fuller migration backlog so execution can continue without ad hoc replanning
- connection-facing, piano-roll-facing, and detail-panel-facing selector summaries now exist in `useStudioDomainView`
- track creation now enters through the command layer instead of page-local action wiring
- loop-to-selection behavior now enters through the command layer via `transport.setLoop`
- a first bounded local command/ack sink now exists in `src/hooks/useMusicHubCommandLog.ts`
- status-bar engine diagnostics now read from selector-provided connection summaries rather than raw page-local host state
- per-track control state is now exposed through selector-backed `trackViewStateById`
- raw clip MIDI-data writes now enter through the command layer instead of bypassing it
- piano-roll clip tab reselection now routes through command-backed selection instead of directly mutating page-local state
- selector-facing Studio view contracts now exist in `src/domain/studio/studioViewContracts.ts`
- mixer-facing state now also has a selector-backed summary object
- Guide runtime target and anchor-resolution architecture are now documented
- first typed Guide runtime contracts now exist in `src/types/musicHubGuideRuntime.ts`
- first executable Guide runtime modules now exist for anchor resolution, validation, and lesson progression
- Studio-to-Guide bridge helpers now exist for selector snapshots, anchor registry creation, and bounded observation windows
- command-history retention, anchor-population, and Guide-observation policies are now documented
- a Studio-facing Guide bridge hook now composes lesson lookup, selector snapshots, anchor registry, and bounded observations
- the first executable Studio lesson definition now exists for transport-basics flow validation
- `Studio.tsx` now exposes lesson runtime state at the composition root and no longer depends on not-yet-initialized native-sync selectors
- mixer, piano-roll, and detail-panel prop shaping now each have a dedicated view-model hook
- MIDI note replacement now has a first explicit command path via `studio.replaceMidiNotes`
- lesson panel state/layout contract is now documented
- Guide runtime is now mounted into a visible Studio lesson panel surface
- lesson panel actions now enter through explicit lesson commands instead of directly invoking runtime methods
- timeline selection modifiers now route through command-backed `studio.select` modes
- loop-to-selection and track-creation timeline actions now sit behind `src/hooks/useStudioTimelineViewModel.ts`
- track, clip, mixer, and timeline header callbacks now share a centralized action surface via `src/hooks/useStudioTrackActionsModel.ts`
- lesson start and lesson step advance now also become observable command traffic through Guide runtime command sync
- browser panel action wiring is now isolated behind `src/hooks/useStudioBrowserActionsModel.ts`
- granular MIDI note insert/update/delete commands are now executable through the Studio dispatch layer
- a dedicated MIDI edit protocol surface now exists in `src/hooks/useStudioMidiEditProtocol.ts`
- lesson completion and failure transitions now also become observable command traffic through `src/hooks/useGuideRuntimeCommandSync.ts`
- Studio header action wiring now sits behind `src/hooks/useStudioHeaderModel.ts`
- connection-facing TransportBar actions now sit behind `src/hooks/useStudioConnectionActionsModel.ts`
- session picker actions now sit behind `src/hooks/useStudioSessionPickerModel.ts`
- native detail-panel host action shaping now sits behind `src/hooks/useStudioNativeDetailActionsModel.ts`
- browser device/plugin insertion now enters through explicit `browser.addDevice` and `browser.addHostPlugin` command traffic
- audio-upload plumbing now sits behind `src/hooks/useStudioAssetImportModel.ts`
- native note audition now sits behind `src/hooks/useStudioNoteAuditionModel.ts`
- bottom-pane panel switching now sits behind `src/hooks/useStudioBottomPaneModel.ts`
- loop focus, timeline click blur, and loop-region shell behavior now sit behind `src/hooks/useStudioTimelineShellModel.ts`
- continuous edits are now explicitly typed in `src/types/musicHubContinuousEdits.ts`
- bounded continuous-edit history now exists in `src/hooks/useMusicHubContinuousEditLog.ts`
- track, clip, and automation continuous edit callbacks now sit behind `src/hooks/useStudioContinuousEditModel.ts`
- Guide observation buffers now include continuous edits alongside commands, acknowledgments, events, and selector snapshots
- bottom tab chrome now lives in `src/components/studio/StudioBottomTabButtons.tsx`
- status bar chrome now lives in `src/components/studio/StudioStatusBar.tsx`
- arrangement workspace composition now lives in `src/components/studio/StudioArrangementWorkspace.tsx`
- bottom workspace composition now lives in `src/components/studio/StudioBottomWorkspace.tsx`
- header chrome now lives in `src/components/studio/StudioHeaderBar.tsx`
- guide sidebar composition now lives in `src/components/studio/StudioGuideSidebar.tsx`
- browser search/filter/collapse/selection/resize ownership now lives in `src/hooks/useStudioBrowserPanelState.ts`
- transport prop shaping now lives in `src/hooks/useStudioTransportBarModel.ts`
- connection alert prop shaping now lives in `src/hooks/useStudioConnectionAlertModel.ts`
- repeated guided empty states now live in `src/components/studio/StudioLessonEmptyState.tsx`
- arrangement workspace prop shaping now lives in `src/hooks/useStudioArrangementWorkspaceModel.ts`
- bottom workspace prop shaping now lives in `src/hooks/useStudioBottomWorkspaceModel.ts`
- guide sidebar prop shaping now lives in `src/hooks/useStudioGuideSidebarModel.ts`
- timeline wheel binding and mock-mode graph rebuild now live in `src/hooks/useStudioRuntimeCoordination.ts`
- lesson query-param handling and session-picker route state now live in `src/hooks/useStudioRouteModel.ts`
- master-volume panel state now lives in `src/hooks/useStudioMixerPanelState.ts`
- connection-summary adapter casts now live in shell hooks instead of `Studio.tsx`
- host-facing selected clip/track derivation now lives in the canonical session/runtime path instead of a standalone page-local hook
- session tempo/time-signature/total-beat derivation now lives in `src/hooks/useStudioSessionMetrics.ts`
- browser-audio/host-availability booleans now live in `src/hooks/useStudioHostModeModel.ts`
- query-param parsing now lives inside `src/hooks/useStudioRouteModel.ts`
- shell-facing model assembly now lives in `src/hooks/useStudioShellModels.ts`
- behavior-facing model assembly now lives in `src/hooks/useStudioBehaviorModels.ts`
- derived runtime models now live in `src/hooks/useStudioDerivedRuntimeModels.ts`
- presentation-level model assembly now lives in `src/hooks/useStudioPresentationModels.ts`
- `Studio.tsx` is now down to roughly 589 lines and is operating much closer to a true composition root
- `Studio.tsx` is now down to roughly 412 lines and is operating as a genuine top-level composition/orchestration surface rather than a page-local integration hub
- Studio mutation contracts are now typed through `src/hooks/studioMutationTypes.ts` instead of being passed around as `any`
- optimistic session-track cache updates are starting to consolidate in `src/domain/studio/studioSessionCache.ts`
- session query keys and invalidation helpers now live in `src/domain/studio/studioSessionQueries.ts`
- Studio session/query + selection state now groups under `src/hooks/useStudioSessionState.ts`
- core Studio runtime orchestration now groups under `src/hooks/useStudioRuntimeCore.ts`
- interaction-level Studio orchestration now groups under `src/hooks/useStudioInteractionRuntime.ts`
- session track/clip lookup now centralizes through `src/domain/studio/studioSessionAdapter.ts` instead of repeated `tracks.flatMap(...).find(...)` scans
- session-track cache writes now consume centralized Studio query keys instead of open-coded `session-tracks` arrays
- session-derived Studio state now groups under `src/hooks/useStudioSessionDomainModel.ts`, including track index, session metrics, selected clip/track, and ghost notes
- `useStudioSessionState.ts` now owns the session-domain model instead of leaving it as a downstream derived-runtime concern
- `useStudioActions.ts` now consumes the canonical session track index from session state instead of rebuilding it inside the action layer
- timeline loop-to-selection behavior now consumes the canonical clip list from session-domain state instead of rebuilding clip aggregation locally
- the Studio runtime/session seam now has an explicit typed contract in `src/types/musicHubStudioRuntime.ts`
- `useStudioSessionDomainModel.ts` now owns session metrics directly instead of delegating them to a second hook layer
- Studio runtime-facing types now use explicit contracts from `src/types/musicHubStudioRuntime.ts` and exported hook result aliases instead of stale/deleted hook imports and long `ReturnType<...>` chains
- `Studio.tsx` now binds `sessionDomainModel` explicitly from runtime state instead of relying on an implicit loose reference
- Browser hover/info descriptions are now explicitly treated as local browser assistance state in `src/hooks/useStudioBrowserPanelState.ts` rather than as an undecided part of canonical Studio runtime
- Studio action hooks now consume the canonical session-domain model directly instead of threading `trackIndex` and tempo fragments through separate parameters
- targeted lint on the current Studio migration surface now passes again after runtime-type and action-boundary cleanup
- `useSession.ts` now has stronger row and insert typing on the active Studio path instead of relying on `any`-based session/clip payload handling
- targeted lint now passes on the session boundary plus active Studio runtime stack (`useSession`, session state, runtime core, action hooks, and `Studio.tsx`)
- MusicHub is now explicitly documented as a desktop-primary product in `docs/project/PROJECT_BASELINE.md`
- the host/core audio-graph sync path now uses explicit `HostGraphTrack` contracts from `src/services/pluginHostContracts.ts` instead of `unknown[]`
- playback clip activity is now typed at the host connector boundary instead of remaining anonymous host payload state
- plugin-host HTTP, plugin-host WebSocket, mock host, connector API, connector state, and native host sync now share the same typed audio-graph contract
- `useSession()` now returns an explicit `StudioSessionPersistenceState` contract instead of an anonymous hook shape
- chain-state events now carry typed `ChainNode[]` payloads through the connector path instead of being cast at the binding layer
- active top-level Studio orchestration hooks now expose named result aliases instead of relying on broad `ReturnType<...>` coupling
- top-level Studio page/runtime orchestration now lives in `src/hooks/useStudioPageRuntime.ts` instead of being assembled inline in `src/pages/Studio.tsx`

## Current Architectural Reality

- current runtime still centers too much logic in `src/pages/Studio.tsx`
- current app still uses existing runtime/store patterns, not the target domain model
- target architecture now exists in docs, types, runtime mapping, adapter design, command contract, Guide runtime contracts, and an expanding runtime insertion point, but not yet as the dominant runtime path
- `Studio.tsx` is materially thinner than before, but grid/timeline composition and some continuous controls still partially live there
- `Studio.tsx` is no longer a useful target for broad extraction work; remaining migration value now sits below the page in runtime/store seams
- `Studio.tsx` is increasingly a composition root; upload plumbing, native note audition, bottom-pane switching, and loop/timeline shell behavior are no longer page-local
- continuous edits are now observable without pretending to be discrete commands
- arrangement and bottom workspace JSX are no longer assembled inline in `Studio.tsx`
- header and guide-sidebar presentation are no longer assembled inline in `Studio.tsx`
- BrowserPanel state ownership is now bounded in a dedicated hook instead of being open-coded inside the component
- transport and connection alert prop shaping are no longer assembled inline in `Studio.tsx`
- arrangement, bottom workspace, and guide sidebar prop assembly are no longer open-coded in `Studio.tsx`
- timeline wheel binding and mock-mode graph rebuild are no longer open-coded in `Studio.tsx`
- lesson start/dismiss routing and session-picker route state are no longer open-coded in `Studio.tsx`
- master-volume UI state is no longer open-coded in `Studio.tsx`
- connection-summary adapter glue is no longer open-coded in `Studio.tsx`
- host-facing selected clip/track derivation is no longer open-coded in `Studio.tsx`
- session metrics and host-mode booleans are no longer open-coded in `Studio.tsx`
- query-param parsing is no longer open-coded in `Studio.tsx`
- most shell and panel model assembly is no longer open-coded in `Studio.tsx`
- presentation-level model composition is no longer split across multiple hook clusters inside `Studio.tsx`
- the remaining page complexity is now mostly real subsystem orchestration rather than JSX and callback glue
- the Studio mutation layer is now more explicit and less dependent on untyped session-hook boundaries
- the next runtime/store seam is the optimistic query-cache path, which is now partially centralized instead of being fully open-coded across action hooks
- session query-key and invalidation policy is no longer duplicated across action hooks and `useSession`
- session/query and local selection wiring no longer need to be assembled directly in `Studio.tsx`
- session state, host state, derived runtime state, audio engine state, action hooks, and transport setup no longer need to be assembled directly in `Studio.tsx`
- interaction runtime, Guide bridge, command dispatch, and continuous-edit observation no longer need to be assembled directly in `Studio.tsx`
- repeated clip lookups no longer need to scan raw session tracks inside the action hooks
- session-derived selection and note-context state no longer needs to be rebuilt independently across runtime hooks
- the action layer no longer rebuilds its own session track index separate from the session-state boundary
- timeline behavior no longer rebuilds its own clip aggregation for selection loops separate from the session-domain boundary
- the session/runtime boundary no longer relies on an implicit `useSession` return shape alone
- the session/runtime boundary no longer relies on stale `ReturnType` coupling to deleted hooks for core Studio model typing
- browser hover/info state is now explicitly local assistance state, not part of the Guide-observable Studio runtime contract
- the Studio mutation layer no longer needs to manually thread separate session-domain fragments once the canonical session-domain model is available
- the canonical Studio session-domain model now reaches through the session boundary, runtime core, and action layer instead of stopping at selectors only
- the host/core seam no longer relies on anonymous track arrays for audio-graph sync
- the Studio-facing persistence layer no longer relies on an implicit `useSession` return shape
- the connector event path no longer relies on anonymous chain-state payloads in the active Studio runtime
- `Studio.tsx` no longer assembles the runtime, interaction, presentation, coordination, and keyboard layers inline
- clip models now include `is_muted`, matching the active database/runtime path instead of forcing local casts
- Studio clip and track mutations now use concrete create/update payload contracts instead of generic record blobs
- duplicate MIDI note parsing in the active Studio path now routes through shared helpers in `src/domain/studio/studioMidiCommandProtocol.ts`
- the live `useSession.ts` path now delegates non-dev persistence to `src/domain/studio/studioSessionPersistence.ts`
- session fetch, track fetch, session list fetch, session create/update/rename/delete, track create/update/delete, clip create/update/delete, and import batching now have explicit persistence helpers
- the dev fixture path now delegates fixture storage behavior to `src/domain/studio/studioSessionDevFixture.ts` instead of keeping fixture mutation embedded inside `useSession.ts`
- full-session deletion and Ableton session import now delegate to adapter-level helpers in `src/domain/studio/studioSessionPersistence.ts`
- `useSession.ts` no longer owns either side of the storage policy directly; live persistence and dev fixture storage are both delegated below the hook
- `useSession.ts` now talks to an explicit top-level session source contract in `src/domain/studio/studioSessionSource.ts` instead of branching directly across dev/live storage internals
- Studio session list/query composition now lives in `src/hooks/useStudioSessionQueries.ts`
- Studio runtime core and interaction runtime now compose behind a single `src/hooks/useStudioRuntime.ts` adapter before page-level presentation wiring
- timeline/grid coordination now lives in `src/hooks/useStudioPageCoordination.ts` instead of being wired directly inside `useStudioPageRuntime.ts`
- Studio now has an explicit mode contract in `src/types/musicHubStudioModes.ts` and `src/hooks/useStudioModeModel.ts`
- Studio route state now understands a `mode` override in `src/hooks/useStudioRouteModel.ts`
- Studio settings now persist a `studioModePreference` instead of assuming one implicit shell layout forever
- Studio shell behavior now consumes mode-driven visibility and density policy before rendering the page shell
- browser and lesson panel collapse defaults are now controlled through the mode contract instead of hardcoded component state
- `Studio.tsx` now renders arrangement, bottom workspace, and guide sidebar through explicit mode-aware shell policy
- Studio timeline markers now exist as session-scoped local assist state in `src/hooks/useStudioMarkerModel.ts` instead of being blocked on backend/session schema work
- marker rendering and marker actions now live in the real timeline shell (`src/components/studio/TimelineCanvas.tsx` and `src/components/studio/TimelineMarkerOverlay.tsx`) instead of only in the standalone Figma export
- the `M` shortcut now adds a marker at the playhead when no clips are selected, while preserving clip mute behavior when a clip selection exists
- lesson view policy is now defined as an explicit DSL/runtime contract in `src/types/musicHubLessonDsl.ts` and `docs/project/MH-044_Lesson_View_Policy.md`
- the curriculum can now target different Guided sub-views without requiring one rigid Guided shell or many bespoke lesson screens
- the first guided-shell UI pass now presents Studio as a lesson-first workspace instead of a flat stack of panels
- `src/components/studio/StudioHeaderBar.tsx` now makes the active lesson state explicit and reduces header chrome noise
- `src/components/studio/StudioArrangementWorkspace.tsx` now frames the arrangement area as the primary task surface and fixes the stale `emptyState`/`emptyStateInstruction` mismatch
- `src/components/studio/StudioGuideSidebar.tsx`, `src/components/studio/StudioLessonPanel.tsx`, `src/components/studio/lesson/LessonHeader.tsx`, and `src/components/studio/lesson/LessonStepCard.tsx` now present the guide rail as the dominant guided-work support surface
- the first standard-shell UI pass now derives a broader production workspace from the same mode contract instead of treating Standard as a separate Studio surface
- the first focused-shell UI pass now derives a denser production shell from the same runtime and lesson-policy base instead of building an expert-only fork
- `src/components/studio/StudioHeaderBar.tsx`, `src/components/studio/StudioBottomWorkspace.tsx`, `src/components/studio/StudioLessonPanel.tsx`, `src/components/studio/StudioGuideSidebar.tsx`, `src/components/studio/lesson/LessonHeader.tsx`, and `src/components/studio/lesson/LessonStepCard.tsx` now distinguish Guided, Standard, and Focused through shell density and lesson-support emphasis instead of diverging runtime behavior
- the first non-Studio product shell foundation now exists in `src/components/app/ProductShell.tsx`
- Home, Lab, Theory, Bridge, Deep Dive, and Flight Case now share one persistent sidebar/top-bar shell instead of each behaving like standalone mini-apps
- shared page-header and surface-card primitives now exist for the non-Studio product surfaces so Figma work can land against one product-shell vocabulary instead of many ad hoc layouts
- the `/learn` route no longer depends on the mock curriculum surface
- real shell-based learning pages now exist in `src/pages/Learn.tsx`, `src/pages/CourseDetail.tsx`, and `src/pages/LessonDetail.tsx`
- the learning catalog now lives in `src/data/learningCatalog.ts` and ties curriculum intent, lesson-shell policy, and real Studio entry points together
- the first real Studio lesson-entry surface now exists in `src/pages/StudioLessonEntry.tsx`
- learning pages now hand off through an explicit preflight step instead of jumping straight into Studio query params
- lesson entry now tracks local continue/resume state per lesson and exposes unavailable reasons for curriculum-only modules
- Course 1 now has full module coverage in the real learning catalog instead of stopping at Module 3
- the real catalog now covers all six Course 1 modules and all six Course 2 modules with explicit shell policy and availability state
- catalog expansion still keeps live Studio entry limited to the lessons that actually exist in the current runtime

## Next Milestone

Refine the lesson-entry flow against the incoming Figma layouts and continue expanding catalog coverage into Courses 3–6 without inventing fake runtime availability.

## Primary Risk

Letting catalog expansion overstate runtime availability, which would make the learning surfaces look more complete than the actual lesson inventory.

## Default Working Mode

- shell-first on top of the stabilized runtime seam
- preserve runtime authority while reshaping Studio presentation
- treat Figma output as design reference, not repo structure
