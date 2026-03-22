# MH-047 — Figma Frontend Function Mapping

## Purpose

Define where Figma-derived frontend components should connect into the real `MusicHub` runtime.

This document is the execution map for turning imported or reference-only Figma UI into working product behavior without creating a parallel app architecture.

## Source Of Truth

- Figma input:
  - bounded components already ported into `src/components/studio/*`
  - reference-only Figma surfaces under the exported Make/manual review
- Runtime input:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/src/hooks/useStudioCommandDispatch.ts`
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/src/hooks/useStudioClipActions.ts`
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/src/hooks/useStudioTrackActions.ts`
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/src/hooks/useStudioTransport.ts`
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/src/hooks/useStudioPianoRollViewModel.ts`
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/src/domain/studio/studioGuideBridge.ts`
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/src/pages/Studio.tsx`

## Rules

1. Figma components may own presentation and local UI state only.
2. All persistent mutations must flow through existing `MusicHub` runtime seams.
3. No `src/app/...` export architecture is to be recreated.
4. New behavior must map to one of:
   - command dispatch
   - clip actions
   - track actions
   - transport actions
   - piano-roll view model
   - lesson/guide bridge
5. If no existing seam fits, document the gap first. Do not invent a second command bus.

## Runtime Seams

### 1. Command Dispatch

Primary file:
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/src/hooks/useStudioCommandDispatch.ts`

Use for:
- transport commands
- track create/update/delete
- clip create/update/delete/duplicate
- MIDI note insert/update/delete/replace
- panel open/close
- selection changes

### 2. Clip Actions

Primary file:
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/src/hooks/useStudioClipActions.ts`

Use for:
- create MIDI clip
- duplicate clip
- linked duplicate
- delete clip
- rename clip
- recolor clip
- split clip
- MIDI data replacement and note edits

### 3. Track Actions

Primary file:
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/src/hooks/useStudioTrackActions.ts`

Use for:
- add audio/midi/return track
- mute/solo/arm/monitor
- volume/pan/send changes
- device insertion
- host plugin insertion
- automation point persistence
- track reordering or state changes

### 4. Transport

Primary file:
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/src/hooks/useStudioTransport.ts`

Use for:
- play/pause/stop
- seek
- loop on/off
- loop region update
- tempo update
- host transport forwarding

### 5. Piano Roll

Primary files:
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/src/hooks/useStudioPianoRollViewModel.ts`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/src/components/studio/pianoroll/usePianoRollInteractions.ts`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/src/components/studio/pianoroll/usePianoRollToolbar.ts`

Use for:
- note editing
- note replacement
- clip resize from piano roll
- active clip switching
- toolbar state
- ghost notes
- audition behavior

### 6. Lesson And Guide Runtime

Primary files:
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/src/domain/studio/studioGuideBridge.ts`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/src/hooks/useStudioLessonPanelModel.ts`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/src/hooks/useStudioLessonViewPolicy.ts`

Use for:
- lesson panel state
- guide anchors
- view policy
- mode-aware visibility

## Component Mapping

| Figma UI area | Local component(s) | Runtime seam | Status | Notes |
| --- | --- | --- | --- | --- |
| Transport buttons | `TransportButton.tsx`, `TransportBar.tsx` | `useStudioTransport`, `useStudioCommandDispatch` | partial | Visual integration exists. Continue wiring exact actions and disabled states through transport model only. |
| Zoom + key controls | `ZoomControl.tsx`, `KeySelector.tsx` | `useStudioTransportBarModel`, `useStudioTimelineShellModel` | partial | Keep these as top-bar controls. Avoid standalone state in component. |
| Arrangement clip menu | `track/ClipContextMenu.tsx` | `useStudioClipActions`, `useStudioCommandDispatch` | done | The live menu is now intentionally narrowed to runtime-owned clip actions only (`duplicate`, `linked duplicate`, `rename`, `color`, `split`, `mute`, `delete`, `set loop`). Figma-only pointer/automation/fade affordances are explicitly excluded until a bounded runtime owner exists. |
| Track menu | `TrackContextMenu.tsx` | `useStudioTrackActions`, `useStudioCommandDispatch` | todo | Should own no data writes directly. |
| Track template UI | `TrackTemplateMenu.tsx`, `templates/*` | `useStudioTrackActionsModel` | partial | Template visuals are present. Backend/template persistence mapping still needs explicit seam. |
| Track controls | `track/TrackControls.tsx` | `useStudioTrackActions`, `useStudioMixerViewModel` | partial | Live controls are stronger than Figma. Figma remains visual reference only. |
| Piano-roll toolbar | `PianoRollToolbar.tsx` | `usePianoRollToolbar`, `useStudioPianoRollViewModel` | partial | Presentational port is done. Remaining work is exact command routing for each tool action. |
| Piano-roll context menu | `PianoRollContextMenu.tsx` | `useStudioPianoRollViewModel`, MIDI command protocol | partial | Menu now opens runtime-owned quantize/humanize/transpose flows and routes destructive actions through the live piano-roll interaction layer. |
| Quantize/humanize/transpose/strum/arp dialogs | `QuantizeDialog.tsx`, `HumanizeDialog.tsx`, `TransposeDialog.tsx`, `StrummingDialog.tsx`, `ArpeggiatorDialog.tsx`, `ChordToolsDialog.tsx` | `useStudioPianoRollViewModel`, `studioMidiCommandProtocol`, `useStudioCommandDispatch` | in_progress | Runtime-owned coordinator added in `src/components/studio/pianoroll/usePianoRollOperationCoordinator.ts`. Dialogs now mount in the live piano roll. Remaining work is exact behavior parity for chord/arp semantics and any preview behavior. |
| Length/note/selection/velocity menus | `LengthOperationsMenu.tsx`, `NoteOperationsMenu.tsx`, `SelectionToolsMenu.tsx`, `VelocityOperationsMenu.tsx` | `studioMidiCommandProtocol`, `useStudioCommandDispatch` | in_progress | Menus now mount in the live toolbar and route changes through the shared piano-roll note replacement seam. Remaining work is tightening semantics where the imported menu meaning differs from the current editor rules. |
| Piano-roll keyboard + velocity lane | `pianoroll/PianoRollKeyboard.tsx`, `pianoroll/PianoRollVelocityLane.tsx` | `useStudioPianoRollViewModel`, `usePianoRollInteractions` | partial | Presentation exists. Final note/velocity update parity still needed. |
| Mixer surface | `MixerPanel.tsx`, `RotaryKnob.tsx`, `DeviceSlot.tsx`, `DeviceView.tsx`, `SendRoutingMenu.tsx` | `useStudioMixerViewModel`, `useStudioTrackActions`, `useStudioNativeDetailActionsModel` | partial | Visual baseline exists. Device/send routing needs explicit runtime ownership. |
| Automation lane | `AutomationLane.tsx`, `TimelineMarkerOverlay.tsx` | `useStudioTrackActions`, `useStudioTimelineViewModel` | partial | Live automation behavior exists. Figma lane is reference-only. |
| Lesson panel + steps | `StudioLessonPanel.tsx`, `lesson/*`, `LessonPanel.tsx` | `useStudioLessonPanelModel`, `studioGuideBridge` | partial | Keep live runtime. Figma lesson pieces are styling reference only. |
| Browser/device insertion UI | `BrowserPanel.tsx`, `DeviceSlot.tsx`, `ContextualHelpBubble.tsx`, `KeyboardShortcutHint.tsx` | `useStudioBrowserActionsModel`, `useStudioTrackActions` | todo | Imported controls should be mapped into browser insertion flow, not free-floating previews. |

## Priority Order

### P1 — Immediate

1. Piano-roll toolchain
   - wire dialogs and operation menus into the actual piano-roll flow
   - use `useStudioPianoRollViewModel` + `studioMidiCommandProtocol`
2. Clip context menu
   - keep the existing core clip-action mapping through `useStudioClipActions`
   - reject pointer/automation/fade options in the live menu until a real runtime owner exists
3. Transport parity
   - keep Figma visuals
   - finish action/state/disable mapping through `useStudioTransport`

### P2 — Next

1. Mixer/device/send flow
2. Track context/template flow
3. Browser/device insertion affordances

### P3 — Later

1. Lesson styling convergence
2. analysis/theory tool wiring
3. bridge/template review surfaces

## Gaps To Resolve

### 1. Piano-roll transform orchestration

Imported transform dialogs and menus exist as separate components, but there is not yet a single orchestration layer that owns:
- opening/closing each dialog
- current selection snapshot
- preview vs apply behavior
- dispatch into note replacement or granular note commands

This should be solved in the piano-roll runtime layer, not inside each dialog.

### 2. Template persistence path

Template cards and menus are present, but template save/load behavior still needs one owned runtime path. This must map into the existing session/track action model, not a new export-style manager.

### 3. Clip-context secondary actions

The imported clip menu includes secondary affordances for:
- pointer mode
- clip automation visibility/add
- fade in/out

The current live clip path already owns the primary mutations, but these secondary controls do not yet have one bounded runtime owner at the clip-menu integration point. The live `ClipContextMenu.tsx` now explicitly excludes them instead of carrying speculative props.

Current repo evidence:
- no clip fade fields are exposed on the active session clip model
- clip-level automation ownership is not defined at the clip-menu seam; automation lives on track lanes
- pointer mode exists on imported/reference menus, but not as a canonical clip-menu runtime contract

### 4. Device/send ownership

The visual components are present, but final authority for:
- send routing
- device insertion
- device parameter focus
- host plugin mapping

must remain in the track/mixer model layer.

## Exact Next Steps

1. Tighten piano-roll operation semantics, especially chord and arpeggiator behavior.
2. Keep clip-context secondary actions out of the live menu until a real runtime owner exists.
3. Define the device/send ownership boundary before wiring `DeviceSlot` and `SendRoutingMenu`.
4. Decide whether any piano-roll menu operations need preview mode before apply.

## Validation

- `npx tsc --noEmit`
- `npm run test`
- `npm run build`
- `npm run tauri:build`
- `npm run tauri:build:design`

Manual validation targets:
- main app Studio baseline
- `MusicHub Design.app` arrangement review
- `MusicHub Design.app` piano-roll review
