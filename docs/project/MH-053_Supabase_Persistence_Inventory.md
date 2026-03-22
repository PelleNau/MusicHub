## Objective

Inventory the active Supabase persistence surface for MusicHub so schema/function work can proceed from an explicit map instead of scattered call sites.

## Scope

- Supabase tables and migrations
- row-level security and storage policies
- storage buckets
- edge functions
- frontend/backend call sites that read or mutate Supabase
- Studio-specific persistence boundaries

## Current Database Surface

### Tables

- `public.inventory_items`
  - created in `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/supabase/migrations/20260310154845_f911632e-8954-4575-b855-7109c838a71c.sql`
  - `image_url` added in `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/supabase/migrations/20260310160342_1b510421-365f-48e1-a8d9-8ad7a8cb9403.sql`
  - auth-only policies set in `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/supabase/migrations/20260310161703_1291c415-4ccd-4053-a6ca-e36b84b03ee2.sql`
  - used for inventory catalog, research enrichment, and item updates
- `public.manual_texts`
  - created in `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/supabase/migrations/20260311004635_36297e63-749c-4729-be68-fe06fd14f5bc.sql`
  - one row per inventory item manual digest
  - used by manual download and digest flows
- `public.chat_messages`
  - created in `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/supabase/migrations/20260311004635_36297e63-749c-4729-be68-fe06fd14f5bc.sql`
  - persists per-user Gear Chat history
- `public.sessions`
  - created in `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/supabase/migrations/20260311191407_54806401-2410-4601-97d1-b6363b762f8d.sql`
  - canonical Studio session header row
- `public.session_tracks`
  - created in `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/supabase/migrations/20260311191407_54806401-2410-4601-97d1-b6363b762f8d.sql`
  - `sends` and `input_from` added in `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/supabase/migrations/20260311192803_c52c1fb1-d087-442a-b934-0fbd12771756.sql`
  - `automation_lanes` added in `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/supabase/migrations/20260312095324_9ffe984d-9209-48d7-ad24-ec62edaf9277.sql`
  - canonical Studio track rows
- `public.session_clips`
  - created in `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/supabase/migrations/20260311191407_54806401-2410-4601-97d1-b6363b762f8d.sql`
  - `alias_of` added in `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/supabase/migrations/20260311224836_8d82b3b4-b904-498e-806d-dad1bfd9bcdf.sql`
  - `is_muted` added in `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/supabase/migrations/20260312101009_c186634d-2a27-41da-a0a3-39894b4ba123.sql`
  - canonical Studio clip rows
- `public.challenge_progress`
  - created in `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/supabase/migrations/20260313144625_be2c19d9-558f-4443-aca1-994f105757b8.sql`
  - per-user theory progress
- `public.user_theory_stats`
  - created in `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/supabase/migrations/20260313145043_b7d66cd9-36fa-49c4-adf8-3890de55a021.sql`
  - per-user theory aggregate stats

### Shared Database Function

- `public.update_updated_at_column()`
  - created in `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/supabase/migrations/20260310154845_f911632e-8954-4575-b855-7109c838a71c.sql`
  - reused by `inventory_items`, `manual_texts`, and `sessions`

## Current Storage Surface

### Buckets

- `manuals`
  - created in `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/supabase/migrations/20260311003726_45690283-9cfd-4b42-bb5e-d8d1abb4e553.sql`
  - public read, authenticated upload/delete
  - used by `download-manual` and `digest-manual`
- `audio-clips`
  - created in `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/supabase/migrations/20260311191407_54806401-2410-4601-97d1-b6363b762f8d.sql`
  - private bucket scoped by user-id folder prefix
  - used by Studio audio upload and playback URL resolution
- `amp-illustrations`
  - created in `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/supabase/migrations/20260315141646_efac746e-0b34-41cb-adce-1b632eaf69bd.sql`
  - public read, service-role insert
  - used by generated amp art flow

## Current Edge Function Surface

- `analyze-project`
  - called from `src/components/bridge/WorkflowView.tsx` and `src/hooks/useStreamingAnalysis.ts`
- `batch-research`
  - no active frontend call site found in this pass
- `digest-manual`
  - called from `src/components/InventoryDetail.tsx`
- `distill-product`
  - called from `src/components/InventoryDetail.tsx`
- `download-manual`
  - called from `src/components/InventoryDetail.tsx`
- `find-product-image`
  - called from `src/hooks/useBatchImages.ts`
- `gear-chat`
  - called from `src/components/GearChat.tsx`
- `generate-amp-art`
  - no active frontend call site found in this pass
- `identify-gear`
  - called from `src/components/AiDropZone.tsx`
- `identify-gear-bulk`
  - called from `src/components/BulkImportDialog.tsx`
- `parse-ableton-project`
  - called from `src/components/ProjectParserPanel.tsx` and `src/components/bridge/WorkflowView.tsx`
- `playground-chat`
  - called from `src/components/playground/ChatPanel.tsx`
- `research-product`
  - called from `src/components/InventoryDetail.tsx`

## Current Frontend Supabase Call Sites

### Auth

- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/src/hooks/useAuth.tsx`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/src/pages/Auth.tsx`

### Inventory and Manual Intelligence

- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/src/components/InventoryDetail.tsx`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/src/hooks/useBatchImages.ts`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/src/components/AiDropZone.tsx`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/src/components/BulkImportDialog.tsx`

### Chat and Analysis

- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/src/components/GearChat.tsx`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/src/components/playground/ChatPanel.tsx`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/src/components/ProjectParserPanel.tsx`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/src/components/bridge/WorkflowView.tsx`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/src/hooks/useStreamingAnalysis.ts`

### Theory Progress

- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/src/hooks/useChallengeProgress.ts`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/src/hooks/useTheoryStats.ts`
- domain adapter:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/src/domain/theory/theoryPersistence.ts`

### Studio Persistence

- canonical live adapter:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/src/domain/studio/studioSessionPersistence.ts`
- source contract:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/src/domain/studio/studioSessionSource.ts`
- query/mutation orchestration:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/src/hooks/useSession.ts`
- UI clip creation flows now route back through the session-source mutation path in:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/src/hooks/useStudioClipActions.ts`
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/src/hooks/useStudioTrackActions.ts`
- supporting audio clip URL resolution:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/src/audio/AudioEngine.ts`

## Studio Persistence Boundary

### Canonically Persisted Now

- session header rows in `sessions`
- track rows in `session_tracks`
- clip rows in `session_clips`
- uploaded audio clip binaries in `audio-clips`
- imported Ableton session structure through the Studio persistence adapter

### Explicitly Local or Session-Local For Now

- marker state remains local assist state in `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/supabase-persistence/src/hooks/useStudioMarkerModel.ts`
- browser assistance and some shell state remain runtime-local according to current architecture docs
- theme, settings, project history, and similar convenience state are local-storage concerns rather than Supabase session schema

### Current Boundary Leak

- non-Studio features still rely on hook-level or component-level `supabase.from(...)` usage in places such as inventory, chat, and image enrichment
- that broader surface still lacks the same adapter discipline now applied to Studio sessions and theory progress

## Immediate Follow-Up

1. Review whether inventory, chat, and image enrichment should move behind narrower domain adapters.
2. Decide whether future session-local assistive state should remain local or graduate into canonical Studio persistence.
3. Define the desktop Supabase config contract for packaged builds and first-run setup.
