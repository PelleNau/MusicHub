# Figma Component Generation Guide

This guide defines what Figma is allowed to generate for `MusicHub`, what it must avoid, and how to scope output so the generated code is actually usable in the real app.

## Core Rule

Figma should generate bounded UI components, not application architecture.

Allowed:
- presentational React components
- callback-driven component shells
- visual layouts for bounded surfaces
- dark DAW/product styling that matches the attached references

Not allowed:
- app shell ownership
- routing
- global state
- stores
- reducers
- context
- backend logic
- repo setup
- Git instructions
- release/version instructions

## Output Rules

For every generated component:
- create a standalone `.tsx` file
- keep the component presentational or callback-driven
- accept behavior through props
- do not import business logic from the app unless explicitly instructed
- do not modify large parent files unless explicitly told
- do not generate page code unless explicitly requested

If asked to extract a component from an existing file:
- create a parallel standalone file
- leave the parent file unchanged unless explicitly instructed otherwise

## What Figma Should Ignore

Do not regenerate these categories:

### Base UI primitives
- `/src/components/ui/*`

### Tests, helpers, and draw utilities
- `/src/components/studio/__tests__/*`
- `/src/components/studio/canvas/*`
- `/src/components/studio/gridAlignment.ts`
- `/src/components/studio/timelineMath.ts`
- `/src/components/studio/track/trackHelpers.ts`
- `/src/components/studio/track/trackColors.ts`
- `/src/components/theory/challengeData.ts`
- `/src/components/theory/theoryContent.ts`

### Hooks and state logic
- `/src/components/studio/pianoroll/usePianoRollInteractions.ts`
- `/src/components/studio/pianoroll/usePianoRollToolbar.ts`

## Component Categories

Use these categories to decide whether a component is a good generation target.

### 1. Presentational-only

Safe to generate as standalone components.

Rules:
- no hooks
- no business logic
- props only

### 2. Presentational with callbacks

Safe to generate if all interactions are callback props.

Rules:
- no app state ownership
- no domain logic
- interaction only through props

### 3. Composite surface

Can generate visual shell only.

Rules:
- no behavior ownership
- no runtime decisions
- good for layout skeletons and section composition

### 4. Do not generate directly

Too coupled to app logic, interaction runtime, canvas math, or state ownership.

Rules:
- use only as visual reference
- do not attempt full replacement

## Instructions By Folder

### `/src/components/app`

Generate:
- `ProductShell.tsx`
  - Category: `Composite surface`
  - Allowed: sidebar, top bar, page chrome, section layout
  - Not allowed: routing decisions, app state, auth handling
- `CaptureBar.tsx`
  - Category: `Presentational with callbacks`
- `AppSetupScreen.tsx`
  - Category: `Composite surface`
- `FloatingDock.tsx`
  - Category: `Presentational with callbacks`

Do not generate:
- `AppErrorBoundary.tsx`

### `/src/components/studio`

Generate confidently:
- `TransportBar.tsx`
  - `Presentational with callbacks`
- `StudioArrangementToolbar.tsx`
  - `Presentational with callbacks`
- `TrackTemplateMenu.tsx`
  - `Presentational with callbacks`
- `StudioHeaderBar.tsx`
  - `Composite surface`
- `StudioStatusBar.tsx`
  - `Presentational`
- `StudioLessonPanel.tsx`
  - `Composite surface`
- `StudioGuideSidebar.tsx`
  - `Composite surface`
- `StudioLessonEmptyState.tsx`
  - `Presentational`
- `BrowserPanel.tsx`
  - `Composite surface`, visual only
- `DetailPanel.tsx`
  - `Composite surface`, visual only
- `MixerPanel.tsx`
  - `Composite surface`, visual only
- `SessionPicker.tsx`
  - `Presentational with callbacks`
- `VerticalZoomSlider.tsx`
  - `Presentational with callbacks`
- `ConnectionAlert.tsx`
  - `Presentational`
- `LessonLauncher.tsx`
  - `Presentational with callbacks`

Generate only as bounded subcomponents:
- `PianoRollToolbar.tsx`
  - `Presentational with callbacks`
- `PianoRollMinimap.tsx`
  - `Presentational with callbacks`
- `ChordPalette.tsx`
  - `Presentational with callbacks`
- `ChordDetector.tsx`
  - `Presentational shell only`
- `CCLane.tsx`
  - `Presentational with callbacks`
- `DeviceChain.tsx`
  - `Composite surface`, visual only
- `AutomationLane.tsx`
  - `Presentational with callbacks`
- `TimelineMarkerOverlay.tsx`
  - `Presentational with callbacks`
- `StudioBottomTabButtons.tsx`
  - `Presentational with callbacks`

Do not generate directly:
- `StudioArrangementWorkspace.tsx`
- `StudioBottomWorkspace.tsx`
- `PianoRoll.tsx`
- `TimelineCanvas.tsx`
- `TimelineRuler.tsx`
- `Playhead.tsx`
- `LoopRegion.tsx`
- `NativeMeterBridge.tsx`
- `NativeParamPanel.tsx`
- `GridOverlay.tsx`
- `GridDebugOverlay.tsx`
- `StepSequencer.tsx`
- `StudioCaptureOverlays.tsx`
- `StudioInfoContext.tsx`
- `StudioAssistantRail.tsx`

Important:
- `StudioAssistantRail.tsx` must remain separate from the three Studio modes unless explicitly requested.

### `/src/components/studio/track`

Generate:
- `TrackControls.tsx`
  - `Presentational with callbacks`
- `ClipContextMenu.tsx`
  - `Presentational with callbacks`
- `ClipMidiPreview.tsx`
  - `Presentational`
- `ClipWaveform.tsx`
  - `Presentational`
- `ClipBlock.tsx`
  - `Presentational with callbacks` if kept dumb

Do not generate:
- anything that decides clip behavior or timing semantics

### `/src/components/studio/pianoroll`

Generate:
- `PianoRollKeyboard.tsx`
  - `Presentational with callbacks`
- `PianoRollVelocityLane.tsx`
  - `Presentational with callbacks`
- `PianoRollGrid.tsx`
  - only if treated as a visual background grid, not interaction owner

Do not generate directly:
- `PianoRollNotes.tsx`
- `usePianoRollInteractions.ts`
- `usePianoRollToolbar.ts`

Reason:
- `PianoRollNotes.tsx` is too coupled to editing interaction.

### `/src/components/studio/lesson`

Generate:
- `LessonHeader.tsx`
- `LessonProgressRail.tsx`
- `LessonStepCard.tsx`
- `GuideAnchorHighlight.tsx`

All are good `Presentational` or `Presentational with callbacks` targets.

### `/src/components/theory`

Most of this folder is good for Figma generation if kept bounded.

Generate:
- `TheoryHeader.tsx`
- `TheoryInfoSection.tsx`
- `XPDisplay.tsx`
- `CircleOfFifths.tsx`
- `IntervalPanel.tsx`
- `ScalePanel.tsx`
- `ModePanel.tsx`
- `ProgressionPanel.tsx`
- `ChordConstructionPanel.tsx`
- `HarmonicFunctionPanel.tsx`
- `EarTrainingPanel.tsx`
- `TheoryChallenge.tsx`
- tools:
  - `ChordFinderTool.tsx`
  - `ScaleFinderTool.tsx`
  - `KeyFinderTool.tsx`
  - `IntervalCalcTool.tsx`
  - `TransposeTool.tsx`
- `PianoKeyboard.tsx`

Rule:
- keep all of these presentational or callback-driven
- do not create theory data models or scoring logic

### `/src/components/bridge`

Generate only as visual report surfaces:
- `AiSuggestionsView.tsx`
- `ChainLoadView.tsx`
- `DiagnosticsView.tsx`
- `ManifestImportView.tsx`
- `MatchReportView.tsx`
- `MissingPluginsView.tsx`
- `PluginChainView.tsx`
- `PluginDetailView.tsx`
- `PluginLibraryView.tsx`
- `PreviewRenderView.tsx`
- `ProjectImportView.tsx`
- `SystemStatusView.tsx`
- `TrackDetailView.tsx`
- `WorkflowView.tsx`

Rule:
- visual/report UI only
- no import logic
- no parsing logic
- no system calls

### `/src/components/analysis`

Generate as presentational dashboards only:
- `AnalysisDashboard.tsx`
- `ArrangementTimeline.tsx`
- `OwnershipChart.tsx`
- `ProjectStats.tsx`
- `SignalChainIssues.tsx`
- `TrackDeviceMap.tsx`

Rule:
- charts and layout only
- no analytics logic

### `/src/components/playground`

Generate as internal-tool surfaces only:
- `ChatPanel.tsx`
- `GearPalette.tsx`
- `PatchCanvas.tsx`

Rule:
- internal tool UI only
- no canvas architecture replacement

### Root-level inventory / settings components

Generate:
- `InventoryDetail.tsx`
- `InventoryFilters.tsx`
- `InventoryList.tsx`
- `InventoryFormDialog.tsx`
- `BulkImportDialog.tsx`
- `DeleteConfirmDialog.tsx`
- `SettingsButton.tsx`
- `SettingsSheet.tsx`
- `ThemeToggle.tsx`
- `ProjectParserPanel.tsx`
- `GearChat.tsx`
- `AiDropZone.tsx`

Rule:
- bounded product components only
- no inventory/store logic
- dialogs and panels should be callback-driven

### `/src/components/mockups`

These are already mock/prototype surfaces.

Use Figma for:
- visual replacement or refinement only
- do not treat these as architecture sources

Generate if explicitly asked:
- `LessonRenderer.tsx`
- `LessonContentViewer.tsx`
- `LessonPreviewCoach.tsx`
- `StudioTourOverlay.tsx`
- `ModuleCompletionCelebration.tsx`
- `PhaseTransitionOverlay.tsx`
- `PracticeScoreSummary.tsx`
- widgets like:
  - `WaveformSelectorWidget.tsx`
  - `SoundExplorerWidget.tsx`
  - `PitchScrubWidget.tsx`
  - `TimbrePresetPlayer.tsx`

Rule:
- presentational only
- no new lesson runtime

## What To Extract Next

Recommended next Figma targets:
1. `PianoRollKeyboard.tsx`
2. `LessonHeader.tsx`
3. `LessonStepCard.tsx`
4. `TransportBar.tsx`
5. `TrackControls.tsx`
6. `MixerPanel` subcomponents:
   - strip header
   - strip shell
   - send block
   - meter block

## What To Never Ask Figma To Generate

Do not ask Figma to generate:
- the entire Studio page
- `PianoRoll.tsx` as a whole
- `StudioArrangementWorkspace.tsx` as a whole
- routing
- auth flow
- lesson runtime
- command dispatch
- host/native integration
- parsing / import logic
- inventory state management
- bridge/system logic

## Prompt Template For Any Component

Use this template:

```text
Create a new standalone React + TypeScript component file named `ComponentName.tsx`.

Hard constraints:
- Do not modify parent files
- Do not generate routing
- Do not generate app shell code
- Do not generate global state, stores, reducers, hooks, context, or backend logic
- Do not import business logic from the app
- Output only this component and minimal helper types if needed
- Keep the component presentational or callback-driven only

Component target:
- [describe exact component]
- Match the attached current design closely
- Use dark MusicHub / DAW styling already present in the app
- Accept all behavior via props

Do not add:
- extra sections
- extra product features
- persistence
- fake data fetching
- user template systems
- repo/Git instructions
```

## Decision Rule

If a component:
- mostly renders visuals and delegates actions, Figma can generate it
- owns drag/select/edit/viewport/runtime behavior, Figma should not generate it directly

