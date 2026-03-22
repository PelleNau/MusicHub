# MusicHub Platform Directive

Effective immediately, `MusicHub Chief` owns architecture, integration, and delivery decisions for MusicHub.

Execution protocol:
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/docs/project/MH-053_Execution_Protocol.md`

## Decision Rule

All technical decisions that affect system structure, ownership, integration boundaries, or merge order must route through `MusicHub Chief`.

This includes:
- branch ownership
- runtime boundaries
- plugin integration boundaries
- Supabase/data ownership
- design system extraction
- merge sequencing
- cross-branch coordination
- contract changes between frontend, runtime, plugins, and database

No parallel stream may invent its own architecture.
No stream may self-prioritize work against the global queue.

## Ownership Model

### 1. Runtime

Owner:
- `codex/studio-runtime-parity`

Owns:
- live Studio behavior wiring
- transport behavior
- clip action behavior
- device/send UI behavior once plugin and data contracts already exist
- integration of approved UI into the real app

Does not own:
- plugin-host lifecycle
- plugin discovery protocol
- Supabase schema/functions
- visual-only redesign work

### 2. Plugins

Owner:
- `codex/plugin-integration`

Owns:
- plugin-host startup/shutdown
- sidecar/process ownership
- port ownership
- host plugin discovery/enumeration
- plugin transport/client/socket behavior
- plugin insertion plumbing into device chains

Does not own:
- general Studio runtime behavior
- Supabase schema/functions
- visual UI redesign

### 3. Database / Persistence

Owner:
- `codex/supabase-persistence`

Owns:
- Supabase schema
- migrations
- edge/server functions
- persistence contracts
- auth/data access boundaries
- what is persisted vs local-only
- Studio session save/load contract

Does not own:
- plugin-host lifecycle
- live Studio interaction behavior
- visual UI work

### 4. Figma Frontend Mapping

Owner:
- `codex/figma-function-mapping`

Owns:
- mapping imported Figma frontend affordances into existing runtime seams
- piano-roll imported dialog/menu/tool wiring

Does not own:
- runtime architecture
- plugin infrastructure
- persistence contracts

### 5. UI Alignment

Owner:
- `codex/studio-ui-alignment`

Owns:
- visual parity
- spacing
- proportions
- surface styling
- component presentation

Does not own:
- runtime behavior
- plugin infrastructure
- persistence logic

### 6. Integration Baseline

Owner:
- `codex/studio-integration-baseline`

Owns:
- assembling approved work from the other streams into one coherent Studio baseline
- validating the combined product-facing shell

Does not own:
- source architecture for runtime/plugins/database
- design-only shell work

## Execution Rules

1. No branch may cross into another branch’s ownership without explicit approval.
2. If a task requires cross-boundary work, stop and escalate to `MusicHub Chief`.
3. Handover docs are mandatory and must stay accurate.
4. All new work enters through the execution protocol and the Chief-owned queue.
4. Draft PRs should target:
   - `codex/figma-capture-mode`
   unless explicitly restacked.
5. No branch targets `main` directly until approved.
6. No new command bus, duplicate architecture, or export-style app structure may be introduced.
7. `MusicHub Design` is not the runtime source of truth.
8. The real app remains the product source of truth.
9. Streams execute assigned tasks in queue order unless `MusicHub Chief` explicitly reorders them.

## Required Escalations

Escalate immediately if a change would:
- alter runtime ownership
- alter persistence ownership
- introduce new plugin-host assumptions
- require schema changes
- require changing merge order
- duplicate existing architecture
- change the source of truth for a surface

## Current Priorities

1. Lock ownership boundaries.
2. Complete clean Studio baseline assembly.
3. Finish arrangement and piano-roll quality.
4. Finalize runtime parity.
5. Finalize plugin and persistence contracts.
6. Then extract the reusable design system from locked surfaces.

## Operating Standard

We are building shippable software.

- no speculative architecture
- no overlapping ownership
- no hidden decisions
- no merge without clear boundary compliance

If a stream is unclear, blocked, or overlapping:
- pause
- document
- escalate to `MusicHub Chief`
