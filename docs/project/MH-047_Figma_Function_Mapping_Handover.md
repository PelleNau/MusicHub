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
- Validation on the rebased branch currently passes:
  - `node_modules/.bin/tsc --noEmit -p tsconfig.json`
  - `npm run build`
  - `npm run test`

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

## Code Blockers

- None currently known.

## Remaining Feel-Level Gaps

- `ChordToolsDialog` still behaves as a pragmatic direct note replacement utility. The live semantics are usable, but the generated/inverted selection outcome could still be tuned if product wants a stricter editor model.
- `ArpeggiatorDialog` is wired and sequencing is stable, but the pattern feel, preset naming, and phrase-length behavior still need product review.
- `NoteOperationsMenu` is functional, but the menu labels and density are still based on the imported Figma structure rather than a final editorial pass.
- `ClipContextMenu` is intentionally limited to runtime-owned clip actions only. Pointer, automation, and fade affordances remain out of scope unless a separate runtime owner appears.

## Next Exact Steps

- `todo` Tidy the remaining piano-roll feel pass:
  - inspect `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/src/components/studio/pianoroll/usePianoRollOperationCoordinator.ts`
  - validate `ChordToolsDialog` selection behavior against the desired editor feel
  - refine arpeggiator output length/rhythm only if product wants a stricter musical spec
  - review `NoteOperationsMenu` wording and density for final polish
- `todo` Preserve the explicit clip-menu boundary:
  - keep `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/figma-function-mapping/src/components/studio/track/ClipContextMenu.tsx` limited to runtime-owned clip actions
  - do not reintroduce pointer/automation/fade options there without a real runtime owner
- `todo` Add a focused manual validation pass in the real Studio flow:
  - open piano roll
  - trigger `Quantize`, `Humanize`, `Transpose`, `Strum`, `Arpeggiator`
  - confirm resulting note data persists correctly

## Validation

- Typecheck, build, and test all passed in the current worktree.

## Do Not Touch

- Do not create a new command bus or export-style `src/app/...` integration layer.
- Do not move persistent note mutations out of the existing piano-roll/runtime seams.
- Merge-ready after the feel-level follow-ups above, with no known code blockers.
