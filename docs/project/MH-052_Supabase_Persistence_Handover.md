## Objective

Own the data platform and persistence layer for MusicHub.

This stream is responsible for:
- Supabase schema and migrations
- Supabase functions
- persistence contracts between frontend and backend
- auth/data access boundaries
- Studio session save/load persistence semantics

## Current State

- Branch: `codex/supabase-persistence`
- Worktree: `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence`
- Base commit: `6d2c6d1` (`origin/main` as of 2026-03-22)
- Current branch head: `ffb8000` (`Add Supabase persistence handover`)
- Working tree: active local implementation edits in progress
- Authority:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/docs/project/MusicHub_Platform_Directive.md`

Existing backend/data surface:
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/supabase`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/src/integrations/supabase`
- persistence-adjacent domain/runtime files in:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/src/domain/studio`
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/src/hooks`

## Ownership Boundary

- `Database` owns:
  - Supabase schema and migrations
  - Supabase edge/server functions
  - persistence contracts between app and backend
  - auth/data access boundaries
  - what Studio/session state is persisted versus local-only
- `Database` does **not** own:
  - Studio runtime interaction behavior
  - plugin-host process lifecycle
  - plugin discovery or device-chain insertion UX
- `Runtime` owns:
  - live Studio behavior and UI wiring against the approved contracts
- `Plugins` owns:
  - plugin-host process and plugin transport concerns

## Files Changed

- This stream now includes:
  - this handover/planning file
  - a Supabase inventory doc in `docs/project/MH-053_Supabase_Persistence_Inventory.md`
  - Studio hook changes that route clip creation back through the session persistence seam
  - a theory persistence adapter in `src/domain/theory/theoryPersistence.ts`
  - focused tests for Studio clip creation flows in `src/hooks/__tests__/useStudioClipActions.test.tsx`
  - focused theory persistence safety tests in:
    - `src/hooks/__tests__/useChallengeProgress.test.ts`
    - `src/hooks/__tests__/useTheoryStats.test.ts`

## Open Problems

- The branch has begun implementation work, but it still needs commit-level consolidation and validation before it is a stable checkpoint.
- Persistence logic is more centralized than before, but the broader non-Studio Supabase surface still lacks dedicated adapters for inventory, chat, and enrichment flows.
- The active Studio persistence path is now enforced for clip creation flows, but the broader app still has many feature-level Supabase call sites.
- Supabase ownership is broader than Studio sessions, and the branch still needs explicit ownership decisions beyond the current inventory pass.

## Chief Correction Required Before Merge

Completed on 2026-03-22 in this branch:

1. Theory hook error handling is corrected.
   - `useChallengeProgress.ts` and `useTheoryStats.ts` now resolve loading in all read paths.
   - Read failures degrade to empty/default local state.
   - Fire-and-forget theory writes route rejections through handled logging instead of leaking unhandled promise rejections.

2. Platform/startup ownership language is removed from this handover.
   - Desktop startup guard behavior and packaged-app setup-screen behavior are not Database responsibilities.
   - This stream remains scoped to schema, functions, contracts, and persistence boundaries.

3. `App.tsx` startup work remains out of scope for this stream.
   - Do not commit startup guard or setup-screen logic in this branch.
   - Escalate any such work back to `MusicHub Chief`.

## Current Persistence Map

- Studio session reads/writes are centered in:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/src/domain/studio/studioSessionPersistence.ts`
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/src/domain/studio/studioSessionSource.ts`
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/src/hooks/useSession.ts`
- Theory progress/state persistence is now centered in:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/src/domain/theory/theoryPersistence.ts`
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/src/hooks/useChallengeProgress.ts`
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/src/hooks/useTheoryStats.ts`
- Existing Studio session schema currently includes:
  - `session_clips` in `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/supabase/migrations/20260311191407_54806401-2410-4601-97d1-b6363b762f8d.sql`
  - `alias_of` migration in `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/supabase/migrations/20260311224836_8d82b3b4-b904-498e-806d-dad1bfd9bcdf.sql`
  - `is_muted` migration in `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/supabase/migrations/20260312101009_c186634d-2a27-41da-a0a3-39894b4ba123.sql`
- Supabase client surface and generated row types currently live in:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/src/integrations/supabase/client.ts`
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/src/integrations/supabase/types.ts`

## Execution Plan

1. Finish the inventory doc for all active Supabase tables, edge functions, buckets, and app call sites.
2. Continue moving non-Studio direct Supabase reads/writes behind feature-level adapters where the surface is stable enough.
3. Define the persistence contract by category:
   - persisted cross-device state
   - persisted project/session state
   - local-only assistive/runtime state
   - auth-scoped data access rules
4. Decide whether any current Studio-local state should move into Supabase only after the contract is written down.
5. Make schema or edge-function changes only after steps 1-4 are reviewed against the current runtime and plugin streams.

## First Implementation Targets

1. Commit the current inventory and adapter work as the new persistence baseline for this stream.
2. Review row-level security and ownership assumptions for session-linked and theory-linked tables before adding new write paths.
3. Decide the next non-Studio adapter target:
   - inventory
   - chat
   - image enrichment

Immediate pre-merge correction order completed on 2026-03-22:

1. Fix the theory hook error handling regression.
2. Remove startup/platform ownership from this handover.
3. Re-run validation.
4. Only then continue the broader persistence inventory/adapter work.

## Validation

Run from this worktree with the shared toolchain as needed:

```bash
/Users/pellenaucler/Documents/CodexProjekt/MusicHub/node_modules/.bin/tsc --noEmit -p /Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/tsconfig.json
```

Then validate any schema/function changes with the repo’s Supabase workflow.

Minimum checks for this stream:

```bash
/Users/pellenaucler/Documents/CodexProjekt/MusicHub/node_modules/.bin/vitest run src/audio/__tests__/AudioEngine.test.ts src/hooks/__tests__/useProjectHistory.test.ts
```

## Do Not Touch

- Do not do Studio UI alignment work in this stream.
- Do not do plugin-host/device-chain integration work in this stream.
- Do not use this branch for design-app-specific routing or shell work.
- Do not take ownership of live Studio transport/clip/device UI behavior except where persistence contracts require an explicit change.
