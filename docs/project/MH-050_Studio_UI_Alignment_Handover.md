# MH-050 — Studio UI Alignment Handover

## Objective

Drive visual parity of the real Studio surfaces against the approved reference direction, starting with Arrangement, then Piano Roll, then Mixer.

## Current State

- Worktree:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-ui-alignment`
- Branch:
  - `codex/studio-ui-alignment`
- Base commit:
  - `36b7bb5`
- This is the fresh replacement for the stale `ui-alignment` worktree on `e08d239`.

## Scope

- visual parity only
- no runtime wiring
- no plugin-host work
- no design-app shell changes unless required strictly for review

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

## Immediate Focus

1. Remove remaining childish/cartoonish clip treatment
2. Tighten lane/header proportions
3. Keep arrangement clip visuals flatter, denser, and more technical

## Next Exact Steps

- `todo` audit clip chrome in `ClipBlock.tsx`
- `todo` audit MIDI preview styling in `ClipMidiPreview.tsx`
- `todo` audit waveform treatment in `ClipWaveform.tsx`
- `todo` tighten lane/header spacing in `TrackLane.tsx`
- `todo` keep toolbar changes subordinate to clip/lane work until clip language is locked

## Validation

- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/node_modules/.bin/tsc --noEmit -p /Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-ui-alignment/tsconfig.json`
- `cd /Users/pellenaucler/Documents/CodexProjekt/MusicHub && npm run build`

## Do Not Touch

- do not add new runtime seams here
- do not mix in function-mapping work
- do not mix in plugin-host work
