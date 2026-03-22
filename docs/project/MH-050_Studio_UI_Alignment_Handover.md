# MH-050 — Studio UI Alignment Handover

## Objective

Drive visual parity of the real Studio surfaces against the approved reference direction, starting with Arrangement, then Piano Roll, then Mixer.

## Current State

- Worktree:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-ui-alignment`
- Branch:
  - `codex/studio-ui-alignment`
- Base commit:
  - `7d0bc08`
- Current branch head:
  - `f303605`
- Rebasing target:
  - `origin/codex/figma-capture-mode`
- Authority:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/docs/project/MusicHub_Platform_Directive.md`
- Execution protocol:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/docs/project/MH-053_Execution_Protocol.md`
- This is the rebased replacement for the stale `ui-alignment` worktree on `e08d239`.

## Scope

- visual parity only
- no runtime wiring
- no plugin-host work
- no design-app shell changes unless required strictly for review

## Ownership Boundary

- This stream owns:
  - visual treatment only
  - layout, spacing, proportions, and surface styling
- This stream does **not** own:
  - runtime behavior wiring
  - plugin-host integration
  - Supabase schema or persistence behavior
- `Runtime` owns live behavior.
- `Plugins` owns plugin-host/device-chain infrastructure.
- `Database` owns persisted data contracts.

## Source Of Truth

- real `Studio` surface components
- approved screenshot direction already discussed in-thread
- primary immediate target: arrangement clips and lane presentation

## Primary Files

- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-ui-alignment/src/components/studio/track/ClipBlock.tsx`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-ui-alignment/src/components/studio/track/ClipWaveform.tsx`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-ui-alignment/src/components/studio/track/ClipMidiPreview.tsx`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-ui-alignment/src/components/studio/TrackLane.tsx`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-ui-alignment/src/components/studio/StudioArrangementToolbar.tsx`

## Remaining Gaps

- `ClipBlock.tsx` still needs final visual comparison against the approved reference for border weight, selection ring, and resize handle subtlety.
- `ClipMidiPreview.tsx` and `ClipWaveform.tsx` still need one more density check so the previews stay technical without becoming visually busy.
- `TrackLane.tsx` still needs a final spacing pass for the header, control cluster, and meter density at normal and compact heights.
- `StudioArrangementToolbar.tsx` should remain visually subordinate to the clip and lane language until the arrangement surface is fully locked.

## Immediate Focus

1. Keep arrangement clips flatter, denser, and more technical
2. Tighten lane/header proportions against the rebased trunk
3. Hold toolbar styling conservative until clip language is finalized

## Validation

- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/node_modules/.bin/tsc --noEmit -p /Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-ui-alignment/tsconfig.json`
- `cd /Users/pellenaucler/Documents/CodexProjekt/MusicHub && npm run build`

## Do Not Touch

- do not add new runtime seams here
- do not mix in function-mapping work
- do not mix in plugin-host work
- do not mix in Supabase or persistence work
