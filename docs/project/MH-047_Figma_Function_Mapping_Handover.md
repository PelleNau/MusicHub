# MH-047 — Figma Function Mapping Handover

## Objective

Wire imported Figma piano-roll and adjacent frontend functions into the real `MusicHub` runtime seams without introducing a parallel command architecture.

## Current State

- Worktree:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping`
- Branch:
  - `codex/figma-function-mapping`
- Authority:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/docs/project/MusicHub_Platform_Directive.md`
- Execution protocol:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/docs/project/MH-053_Execution_Protocol.md`
- Mapping doc exists:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/docs/project/MH-047_Figma_Frontend_Function_Mapping.md`
- Piano-roll runtime coordinator is implemented:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/src/components/studio/pianoroll/usePianoRollOperationCoordinator.ts`
- Live piano roll now mounts imported dialogs and menus:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/src/components/studio/PianoRoll.tsx`
- Coordinator semantics were tightened after the initial import wiring:
  - bar and beat split operations now use piano-roll-local beat space instead of mixing in session offsets
  - repeat operations now match their labels (`2x` adds one copy, `4x` adds three)
  - arpeggiator pitch ordering now distinguishes sorted patterns from `asPlayed`
  - arpeggiator generation now guarantees enough steps to emit the selected pitch cycle at least once
  - chord-tools apply now preserves a useful post-apply selection, prioritizing generated notes when new notes are created

## Protocol Commands

- Acknowledge latest Chief assignment:
  - `cd /Users/pellenaucler/Documents/CodexProjekt/MusicHub && npm run coord:ack:figmafunktioner -- --summary "Read latest Chief assignment and starting Figmafunktioner work."`
- Report progress:
  - `cd /Users/pellenaucler/Documents/CodexProjekt/MusicHub && npm run coord:report:figmafunktioner -- --status in_progress --summary "Figmafunktioner work in progress."`
- Report completion:
  - `cd /Users/pellenaucler/Documents/CodexProjekt/MusicHub && npm run coord:report:figmafunktioner -- --status completed --summary "Figmafunktioner task completed."`
- Chief verification:
  - `cd /Users/pellenaucler/Documents/CodexProjekt/MusicHub && npm run coord:check-in:figmafunktioner`
  - `cd /Users/pellenaucler/Documents/CodexProjekt/MusicHub && npm run coord:check-out:figmafunktioner`

## Files Changed

- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/src/components/studio/PianoRoll.tsx`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/src/components/studio/pianoroll/usePianoRollOperationCoordinator.ts`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/docs/project/MH-047_Figma_Frontend_Function_Mapping.md`

## Open Problems

- `ChordToolsDialog` is wired, but it still operates as a direct note replacement utility. It needs a semantics pass to confirm the generated/inverted result is the right live-editor behavior and selection outcome.
- `ArpeggiatorDialog` is wired, and the obvious sequencing bugs are fixed, but the generated pattern behavior is still pragmatic rather than validated against a product spec.
- `NoteOperationsMenu` actions are functional, but some menu labels from the Figma import may not exactly match current editor expectations.
- Clip-context-menu parity is no longer a broad open item. The live menu has been intentionally narrowed to runtime-owned clip actions only. Imported pointer/automation/fade affordances remain out of scope unless new schema/runtime work is introduced:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/src/components/studio/track/ClipContextMenu.tsx`

## Next Exact Steps

- `todo` Finish the remaining piano-roll semantics pass:
  - inspect `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/src/components/studio/pianoroll/usePianoRollOperationCoordinator.ts`
  - validate `ChordToolsDialog` apply semantics and post-apply selection behavior
  - validate arpeggiator output length/rhythm against the intended product behavior
  - decide whether `ChordToolsDialog` should keep direct note replacement or route through narrower command helpers
- `todo` Preserve the explicit clip-menu boundary:
  - keep `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/src/components/studio/track/ClipContextMenu.tsx` limited to runtime-owned clip actions
  - do not reintroduce pointer/automation/fade options there without a real runtime owner
- `todo` Add a focused manual validation pass in the real Studio flow:
  - open piano roll
  - trigger `Quantize`, `Humanize`, `Transpose`, `Strum`, `Arpeggiator`
  - confirm resulting note data persists correctly

## Validation

- Typecheck passed using the main checkout toolchain:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/node_modules/.bin/tsc --noEmit -p /Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/tsconfig.json`
- This worktree does not currently have its own `node_modules`, so direct local `npx tsc` and eslint resolution are not reliable here.
- `npm run build` is not reliable in this worktree as-is because local `vite` package resolution is missing without a local install.

## Do Not Touch

- Do not create a new command bus or export-style `src/app/...` integration layer.
- Do not move persistent note mutations out of the existing piano-roll/runtime seams.
- Do not merge this branch until piano-roll semantics and clip-context-menu parity are reviewed.
