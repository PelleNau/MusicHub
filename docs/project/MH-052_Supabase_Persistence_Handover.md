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
- Working tree: one untracked planning file in this path

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

- This branch currently contains only this planning file.

## Open Problems

- This branch is now rebased to current `origin/main`, but it still does not own any implementation changes.
- Persistence logic is still split between the domain adapter layer and direct hook-level Supabase writes.
- The active Studio persistence path is partly centralized in `src/domain/studio/studioSessionPersistence.ts`, but not yet fully enforced as the only write boundary.
- Supabase ownership is still broader than Studio sessions and needs an explicit inventory before schema/function work begins.

## Current Persistence Map

- Studio session reads/writes are centered in:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/src/domain/studio/studioSessionPersistence.ts`
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/src/domain/studio/studioSessionSource.ts`
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/src/hooks/useSession.ts`
- There are still direct clip insert paths outside the persistence adapter in:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/src/hooks/useStudioClipActions.ts`
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/src/hooks/useStudioTrackActions.ts`
- Existing Studio session schema currently includes:
  - `session_clips` in `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/supabase/migrations/20260311191407_54806401-2410-4601-97d1-b6363b762f8d.sql`
  - `alias_of` migration in `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/supabase/migrations/20260311224836_8d82b3b4-b904-498e-806d-dad1bfd9bcdf.sql`
  - `is_muted` migration in `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/supabase/migrations/20260312101009_c186634d-2a27-41da-a0a3-39894b4ba123.sql`
- Supabase client surface and generated row types currently live in:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/src/integrations/supabase/client.ts`
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/src/integrations/supabase/types.ts`

## Execution Plan

1. Finish the inventory doc for all active Supabase tables, edge functions, buckets, and app call sites.
2. Audit every Studio session mutation path and remove direct hook-level writes that bypass `studioSessionPersistence.ts`.
3. Define the persistence contract by category:
   - persisted cross-device state
   - persisted project/session state
   - local-only assistive/runtime state
   - auth-scoped data access rules
4. Decide whether any current Studio-local state should move into Supabase only after the contract is written down.
5. Make schema or edge-function changes only after steps 1-4 are reviewed against the current runtime and plugin streams.

## First Implementation Targets

1. Create a persistence inventory document under `docs/project/` covering:
   - tables and migrations
   - buckets and storage paths
   - edge functions
   - frontend call sites
2. Refactor direct `session_clips` inserts in:
   - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/src/hooks/useStudioClipActions.ts`
   - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/src/hooks/useStudioTrackActions.ts`
   so those writes route through the adapter layer instead of duplicating Supabase payload assembly.
3. Review row-level security and ownership assumptions for session-linked tables before adding new write paths.
4. Add or update tests around the adapter boundary before changing any schema.

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
