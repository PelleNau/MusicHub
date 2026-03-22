## Objective

Own the data platform and persistence layer for MusicHub.

This stream is responsible for:
- Supabase schema and migrations
- Supabase functions
- persistence contracts between frontend and backend
- auth/data access boundaries
- Studio session save/load persistence semantics
- desktop/runtime config requirements for Supabase-backed builds

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
  - the contract for how Supabase config is supplied to desktop builds
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

## Open Problems

- The branch has begun implementation work, but it still needs commit-level consolidation and validation before it is a stable checkpoint.
- Persistence logic is more centralized than before, but the broader non-Studio Supabase surface still lacks dedicated adapters for inventory, chat, and enrichment flows.
- The active Studio persistence path is now enforced for clip creation flows, but the broader app still has many feature-level Supabase call sites.
- Supabase ownership is broader than Studio sessions, and the branch still needs explicit ownership decisions beyond the current inventory pass.
- Desktop builds currently depend on Vite-time Supabase env injection, but that provisioning path is not yet documented or automated in this stream.
- Missing Supabase env should never hard-crash packaged startup; the app should degrade to an explicit setup-required screen until config is supplied.

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
4. Define the desktop build config contract:
   - where `.env` is expected during local platform builds
   - whether platform tooling copies, templates, or injects `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`
   - how packaged builds should behave when config is absent

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

For desktop/platform changes, also verify:

```bash
/Users/pellenaucler/Documents/CodexProjekt/MusicHub/node_modules/.bin/tsc --noEmit -p /Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/tsconfig.json
```

Then confirm one of:

- packaged app starts with configured Supabase env embedded, or
- packaged app renders the setup-required screen without crashing when env is absent

## Do Not Touch

- Do not do Studio UI alignment work in this stream.
- Do not do plugin-host/device-chain integration work in this stream.
- Do not use this branch for design-app-specific routing or shell work.
- Do not take ownership of live Studio transport/clip/device UI behavior except where persistence contracts require an explicit change.
