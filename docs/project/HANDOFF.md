# Handoff

## Default Instruction For Codex

Unless explicitly overridden by the user:

1. follow `docs/project/ROADMAP.md`
2. use `docs/project/TASKS.md` as the execution queue
3. update `docs/project/STATUS.md` and `docs/project/DECISIONS.md` when meaningful architectural progress is made
4. update coordination docs when cross-boundary changes affect Lovable

## Immediate Next Work

1. continue replacing direct `hostState.*` and page-local derived state with selector outputs
2. move the remaining Detail/Mixer/Piano Roll inputs behind stable selector models
3. decide how command acknowledgments/history graduate from bounded local sink to runtime infrastructure
4. move the next safe timeline/selection mutation family onto commands without touching continuous controls yet
5. keep moving Guide runtime from contracts/helpers toward a mounted Studio subsystem

## Newly Completed Architecture Work

1. `MH-005` — runtime-to-domain mapping documented in `docs/project/MH-005_Runtime_To_Domain_Mapping.md`
2. `MH-006` — host adapter design documented in `docs/project/MH-006_Host_Adapter_Design.md`
3. `MH-007` — command bus v1 documented in `docs/project/MH-007_Command_Bus_v1.md` with types in `src/types/musicHubCommands.ts`
4. first runtime insertion completed through `src/hooks/useStudioDomainView.ts`
5. first command dispatch surface added in `src/hooks/useStudioCommandDispatch.ts`
6. `src/pages/Studio.tsx` now uses selector-oriented transport/meter reads plus command-dispatched transport, panel, and basic selection actions
7. selected clip, selected track, ghost notes, and panel booleans are now read through the domain view hook
8. discrete mute/solo and MIDI clip creation now enter through the command layer
9. clip rename/color/mute/delete/duplicate now enter through the command layer
10. keyboard shortcuts now route transport, panel switching, loop edits, and discrete clip actions through the command layer
11. `useStudioSelection` now owns only local selection state and multi-select input behavior; duplicated selection derivations were removed
12. track rename/color/delete now enter through the command layer
13. first host/session adapter modules now exist in `src/domain/studio/`
14. connection-facing, detail-panel-facing, and piano-roll-facing selector summaries now exist in `useStudioDomainView`
15. track creation now enters through the command layer
16. loop-to-selection behavior now enters through the command layer via `transport.setLoop`
17. the first bounded local command/ack sink now exists in `src/hooks/useMusicHubCommandLog.ts`
18. per-track control state now flows through selector-backed `trackViewStateById`
19. raw clip MIDI-data writes now enter through the command layer as an interim bridge
20. piano-roll clip tab reselection now routes through command-backed selection only
21. selector-facing Studio view contracts now exist in `src/domain/studio/studioViewContracts.ts`
22. mixer-facing state now also has a selector-backed summary object
23. Guide runtime target is documented in `docs/project/MH-023_Guide_Runtime_Target.md`
24. Guide anchor resolution is documented in `docs/project/MH-024_Guide_Anchor_Resolution.md`
25. first typed Guide runtime contracts now exist in `src/types/musicHubGuideRuntime.ts`
26. first executable Guide runtime modules now exist in `src/domain/guide/` and `src/hooks/useGuideRuntime.ts`
27. Studio-to-Guide bridge helpers now exist in `src/domain/studio/studioGuideBridge.ts`
28. bounded Guide observation-window helpers now exist in `src/domain/guide/guideObservationBuffer.ts`
29. command-history retention is now documented in `docs/project/MH-034_Command_History_Retention.md`
30. anchor-population strategy is now documented in `docs/project/MH-036_Anchor_Registry_Population.md`
31. Guide observation-retention policy is now documented in `docs/project/MH-037_Guide_Observation_Retention.md`
32. a Studio-facing Guide bridge hook now exists in `src/hooks/useStudioGuideBridge.ts`
33. the first executable Studio lesson definition now exists in `src/content/lessons/studio/transportBasicsLesson.ts`
34. `Studio.tsx` now mounts the Guide bridge at the composition root and exposes lesson runtime state through stable root metadata
35. dedicated view-model hooks now exist for detail panel, piano roll, and mixer state/action shaping
36. MIDI note replacement now enters through the explicit `studio.replaceMidiNotes` command path
37. lesson panel contract is now documented in `docs/project/MH-043_Lesson_Panel_Contract.md`
38. a visible Studio lesson panel now exists in `src/components/studio/StudioLessonPanel.tsx`
39. lesson panel state/model now exists in `src/hooks/useStudioLessonPanelModel.ts`
40. lesson panel skip/reset/abort actions now route through `src/hooks/useGuideCommandDispatch.ts`
41. timeline selection modifiers now route through command-backed `studio.select` modes
42. timeline loop-to-selection, clip-click selection, and track-creation actions now sit behind `src/hooks/useStudioTimelineViewModel.ts`
43. track, clip, mixer, and timeline-header callbacks now share a centralized action surface in `src/hooks/useStudioTrackActionsModel.ts`
44. lesson start and lesson step advance now become observable command traffic through `src/hooks/useGuideRuntimeCommandSync.ts`
45. browser panel action wiring now sits behind `src/hooks/useStudioBrowserActionsModel.ts`
46. granular MIDI note insert/update/delete commands now execute through `src/hooks/useStudioCommandDispatch.ts`
47. a dedicated MIDI protocol surface now exists in `src/hooks/useStudioMidiEditProtocol.ts`
48. lesson completion and failure transitions now become observable command traffic through `src/hooks/useGuideRuntimeCommandSync.ts`
49. header button wiring now sits behind `src/hooks/useStudioHeaderModel.ts`
50. connection-facing transport/header actions now sit behind `src/hooks/useStudioConnectionActionsModel.ts`
51. session picker callbacks now sit behind `src/hooks/useStudioSessionPickerModel.ts`
52. native detail-panel host action shaping now sits behind `src/hooks/useStudioNativeDetailActionsModel.ts`
53. browser device/plugin insertion now enters through `browser.addDevice` and `browser.addHostPlugin` command traffic
54. audio-upload plumbing now sits behind `src/hooks/useStudioAssetImportModel.ts`
55. native note audition now sits behind `src/hooks/useStudioNoteAuditionModel.ts`
56. bottom-pane switching now sits behind `src/hooks/useStudioBottomPaneModel.ts`
57. loop focus, timeline click blur, and loop-region shell behavior now sit behind `src/hooks/useStudioTimelineShellModel.ts`
58. continuous edits are now explicitly typed in `src/types/musicHubContinuousEdits.ts`
59. bounded continuous-edit history now exists in `src/hooks/useMusicHubContinuousEditLog.ts`
60. track, clip, and automation continuous edit callbacks now sit behind `src/hooks/useStudioContinuousEditModel.ts`
61. Guide observation buffers now include continuous edits alongside commands, acknowledgments, events, and selector snapshots
62. bottom tab chrome now lives in `src/components/studio/StudioBottomTabButtons.tsx`
63. status bar chrome now lives in `src/components/studio/StudioStatusBar.tsx`
64. arrangement workspace composition now lives in `src/components/studio/StudioArrangementWorkspace.tsx`
65. bottom workspace composition now lives in `src/components/studio/StudioBottomWorkspace.tsx`
66. header chrome now lives in `src/components/studio/StudioHeaderBar.tsx`
67. guide sidebar composition now lives in `src/components/studio/StudioGuideSidebar.tsx`
68. browser search/filter/collapse/selection/resize ownership now lives in `src/hooks/useStudioBrowserPanelState.ts`
69. transport prop shaping now lives in `src/hooks/useStudioTransportBarModel.ts`
70. connection alert prop shaping now lives in `src/hooks/useStudioConnectionAlertModel.ts`
71. repeated guided empty states now live in `src/components/studio/StudioLessonEmptyState.tsx`
72. arrangement workspace prop shaping now lives in `src/hooks/useStudioArrangementWorkspaceModel.ts`
73. bottom workspace prop shaping now lives in `src/hooks/useStudioBottomWorkspaceModel.ts`
74. guide sidebar prop shaping now lives in `src/hooks/useStudioGuideSidebarModel.ts`
75. timeline wheel binding and mock-mode graph rebuild now live in `src/hooks/useStudioRuntimeCoordination.ts`
76. lesson query-param handling and session-picker route state now live in `src/hooks/useStudioRouteModel.ts`
77. master-volume panel state now lives in `src/hooks/useStudioMixerPanelState.ts`
78. connection-summary adapter casts now live in shell hooks instead of `Studio.tsx`
79. host-facing selected clip/track derivation now lives in the canonical session/runtime path instead of a standalone hook
80. session tempo/time-signature/total-beat derivation now lives in `src/hooks/useStudioSessionMetrics.ts`
81. browser-audio/host-availability booleans now live in `src/hooks/useStudioHostModeModel.ts`
82. query-param parsing now lives inside `src/hooks/useStudioRouteModel.ts`
83. shell-facing model assembly now lives in `src/hooks/useStudioShellModels.ts`
84. behavior-facing model assembly now lives in `src/hooks/useStudioBehaviorModels.ts`
85. derived runtime models now live in `src/hooks/useStudioDerivedRuntimeModels.ts`
86. presentation-level model assembly now lives in `src/hooks/useStudioPresentationModels.ts`
87. `Studio.tsx` is now down to roughly 589 lines and is materially closer to a composition root than a page-local integration hub
88. Studio mutation contracts now live in `src/hooks/studioMutationTypes.ts` instead of being threaded through `any`-typed action boundaries
89. optimistic session-track cache updates are beginning to consolidate in `src/domain/studio/studioSessionCache.ts`
90. session query keys and invalidation helpers now live in `src/domain/studio/studioSessionQueries.ts`
91. Studio session/query and local selection state now group under `src/hooks/useStudioSessionState.ts`
92. core Studio runtime orchestration now groups under `src/hooks/useStudioRuntimeCore.ts`
93. interaction-level Studio orchestration now groups under `src/hooks/useStudioInteractionRuntime.ts`
94. raw session track/clip lookups now centralize through `src/domain/studio/studioSessionAdapter.ts` instead of repeated `tracks.flatMap(...).find(...)` scans
95. session-track cache helpers now consume centralized Studio query keys instead of open-coded `session-tracks` arrays
96. session-derived Studio state now groups under `src/hooks/useStudioSessionDomainModel.ts`
97. session-derived selection and note-context state no longer needs to be rebuilt independently across runtime hooks
98. `useStudioSessionState.ts` now owns the session-domain model instead of leaving it as a downstream derived-runtime concern
99. `useStudioActions.ts` now consumes the canonical session track index from session state instead of rebuilding it inside the action layer
100. timeline loop-to-selection now consumes the canonical clip list from session-domain state instead of rebuilding clip aggregation locally
101. the Studio runtime/session seam now has an explicit typed contract in `src/types/musicHubStudioRuntime.ts`
102. `useStudioSessionDomainModel.ts` now owns session metrics directly instead of delegating them to a second hook layer
103. Studio runtime-facing hooks now consume explicit runtime types and exported hook result aliases instead of stale/deleted hook imports and broad `ReturnType<...>` coupling
104. `Studio.tsx` now binds `sessionDomainModel` explicitly from runtime state instead of relying on an implicit loose reference
105. browser hover/info text is now explicitly treated as local browser assistance state in `src/hooks/useStudioBrowserPanelState.ts` instead of an undecided canonical runtime concern
106. Studio action hooks now consume the canonical session-domain model directly instead of threading `trackIndex` and tempo fragments through separate parameters
107. targeted lint on the active Studio migration surface passes again after runtime-type and action-boundary cleanup
108. `useSession.ts` now has stronger row and insert typing on the active Studio path instead of relying on `any`-based session and clip payload handling
109. targeted lint now passes on the session boundary plus the active Studio runtime stack (`useSession`, session state, runtime core, action hooks, and `Studio.tsx`)
110. MusicHub is now explicitly documented as a desktop-primary product in `docs/project/PROJECT_BASELINE.md`
111. the host/core audio-graph sync path now uses explicit `HostGraphTrack` contracts in `src/services/pluginHostContracts.ts` instead of `unknown[]`
112. playback clip activity is now typed at the host connector boundary instead of remaining anonymous host payload state
113. plugin-host HTTP, plugin-host WebSocket, mock host, connector API, connector state, and native host sync now share the same typed audio-graph contract
114. `useSession()` now returns an explicit `StudioSessionPersistenceState` contract instead of an anonymous hook shape
115. chain-state events now carry typed `ChainNode[]` payloads through the connector path instead of being cast at the binding layer
116. active top-level Studio orchestration hooks now expose named result aliases instead of broad `ReturnType<...>` coupling across the active runtime surface
117. top-level Studio page/runtime orchestration now lives in `src/hooks/useStudioPageRuntime.ts` instead of being assembled inline in `src/pages/Studio.tsx`
118. `SessionClip` now includes `is_muted` in `src/types/studio.ts`, matching the active Studio database/runtime path
119. Studio clip and track mutations now use concrete create/update payload contracts in `src/hooks/studioMutationTypes.ts`
120. duplicate MIDI note parsing across the active Studio path now routes through shared helpers in `src/domain/studio/studioMidiCommandProtocol.ts`
121. the non-dev `useSession.ts` path now delegates live persistence to `src/domain/studio/studioSessionPersistence.ts`
122. session fetch, session-track fetch, session list fetch, session create/update/rename/delete, track create/update/delete, clip create/update/delete, and import batching now have explicit persistence helpers in `src/domain/studio/studioSessionPersistence.ts`
123. the dev fixture path now delegates fixture storage behavior to `src/domain/studio/studioSessionDevFixture.ts` instead of embedding fixture mutation in `useSession.ts`
124. full-session deletion now delegates to `deleteSessionGraph(...)` in `src/domain/studio/studioSessionPersistence.ts`
125. Ableton session import now delegates to `importAbletonSession(...)` in `src/domain/studio/studioSessionPersistence.ts`
126. `useSession.ts` now consumes a top-level source contract from `src/domain/studio/studioSessionSource.ts` instead of branching directly across dev and live storage internals
127. Studio session list/query composition now lives in `src/hooks/useStudioSessionQueries.ts`
128. Studio runtime core and interaction runtime now compose behind a single `src/hooks/useStudioRuntime.ts` adapter before page-level presentation wiring
129. timeline/grid coordination now lives in `src/hooks/useStudioPageCoordination.ts` instead of being wired directly inside `src/hooks/useStudioPageRuntime.ts`
130. Studio mode contracts now live in `src/types/musicHubStudioModes.ts`
131. Studio shell mode resolution now lives in `src/hooks/useStudioModeModel.ts`
132. Studio route state now supports an explicit `mode` override in `src/hooks/useStudioRouteModel.ts`
133. Studio settings now persist `studioModePreference` for shell-level mode defaults
134. lesson panel collapse defaults now come from the Studio mode contract instead of only local component state
135. browser panel collapse defaults now come from the Studio mode contract instead of only local component state
136. arrangement workspace, bottom workspace, and guide sidebar now consume explicit Studio mode props before shell rendering
137. `Studio.tsx` now renders the page shell through mode-aware visibility policy instead of one fixed shell layout
138. Studio markers now live in `src/hooks/useStudioMarkerModel.ts` as session-scoped local UI state persisted in localStorage instead of waiting on canonical backend schema work
139. Studio timeline markers now render through `src/components/studio/TimelineMarkerOverlay.tsx` and `src/components/studio/TimelineCanvas.tsx`
140. the arrangement workspace now exposes an explicit marker action in its header controls instead of relying on standalone export-only UI
141. the `M` shortcut now adds a marker at the playhead when no clips are selected, while preserving selected-clip mute behavior
142. the active local Studio shell now includes a working marker import from the Figma export without importing the export’s standalone app architecture
143. lesson view policy now has an explicit DSL/runtime contract in `src/types/musicHubLessonDsl.ts`
144. lesson shell/view policy is documented in `docs/project/MH-044_Lesson_View_Policy.md`
145. the lesson DSL spec now supports declarative panel visibility, viewport focus, and interaction-emphasis overlays without depending on component structure
146. the first guided-shell UI pass now presents Studio as a lesson-first workspace instead of a flat panel stack
147. `src/components/studio/StudioHeaderBar.tsx` now exposes active guided-session context instead of acting as a generic toolbar row
148. `src/components/studio/StudioArrangementWorkspace.tsx` now frames the arrangement region as the primary task surface and fixes the stale `emptyState` prop mismatch
149. `src/components/studio/StudioGuideSidebar.tsx`, `src/components/studio/StudioLessonPanel.tsx`, `src/components/studio/lesson/LessonHeader.tsx`, and `src/components/studio/lesson/LessonStepCard.tsx` now treat the lesson rail as the dominant support surface for guided work

## Current Next Work

1. implement the new Figma-driven Guided/Standard/Focused shell against the explicit Studio mode contract
2. review the guided-shell pass against the Figma direction and refine the remaining shell density choices
3. derive `Standard` and `Focused` from the same shell structure instead of building new surfaces
4. implement runtime resolution of lesson view policy into shell visibility, bottom-tab targeting, and viewport focus
5. decide whether markers should stay local assist state or graduate into canonical session persistence later
6. keep browser preview/info as local assistance state unless a concrete lesson requirement proves otherwise

## Default Instruction For Lovable

Before touching high-risk shared files or connected-mode behavior:

1. read `docs/public/lovable-codex-handoff.md`
2. read `docs/lovable-codex-coordination.md`
3. treat `Review only` items as constraints
4. avoid reintroducing frontend authority over native-owned state in connected mode

## Notes

This file is not a log. It is the current working handoff.
