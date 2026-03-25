# MH-049 — Plugin Integration Handover

## Objective

Own plugin-host and device/plugin integration as a separate stream, isolated from UI alignment and general runtime parity.

## Current State

- Worktree:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/plugin-integration`
- Branch:
  - `codex/plugin-integration`
- Base commit:
  - `36b7bb5`
- Current head:
  - `d3e8875`
- Branch status:
  - worktree clean
- Validation status:
  - `tsc --noEmit -p tsconfig.json` passed
  - `npm test` passed
  - `npm run build` passed
  - `cargo check` in `src-tauri` passed
- Review note:
  - Chief ownership review completed
  - branch is narrowed to plugin-owned scope
  - current `main` is merged into this branch
  - branch is ready for further plugin work but still requires normal review before integration
- Authority:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/docs/project/MusicHub_Platform_Directive.md`
- Execution protocol:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/docs/project/MH-053_Execution_Protocol.md`

## Protocol Commands

- Acknowledge latest Chief assignment:
  - `cd /Users/pellenaucler/Documents/CodexProjekt/MusicHub && npm run coord:ack:plugins -- --summary "Read latest Chief assignment and starting Plugin work."`
- Report progress:
  - `cd /Users/pellenaucler/Documents/CodexProjekt/MusicHub && npm run coord:report:plugins -- --status in_progress --summary "Plugin work in progress."`
- Report completion:
  - `cd /Users/pellenaucler/Documents/CodexProjekt/MusicHub && npm run coord:report:plugins -- --status completed --summary "Plugin task completed."`
- Chief verification:
  - `cd /Users/pellenaucler/Documents/CodexProjekt/MusicHub && npm run coord:check-in:plugins`
  - `cd /Users/pellenaucler/Documents/CodexProjekt/MusicHub && npm run coord:check-out:plugins`

## Scope

- plugin host startup/ownership
- host plugin enumeration
- plugin insertion and mapping into track/device chains
- native/host plugin boundary

## Ownership Boundary

- `Plugins` owns:
  - plugin-host process startup/shutdown
  - port ownership and sidecar behavior
  - host plugin discovery/enumeration
  - host plugin metadata transport
  - plugin insertion into device chains
  - host/plugin communication clients and sockets
- `Runtime` does **not** own:
  - plugin-host lifecycle
  - plugin enumeration protocols
  - plugin socket/client implementation
- `Database` does **not** own:
  - plugin-host process behavior
  - plugin runtime transport
  - device-chain insertion UX

## Priority Areas

1. Plugin-host startup ownership and port behavior
2. Host plugin discovery and connection stability
3. Track/device-chain plugin insertion path
4. Validation in Tauri, not just browser mode

## Files To Start With

- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/plugin-integration/src/hooks/useHostConnector.ts`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/plugin-integration/src/services/pluginHostClient.ts`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/plugin-integration/src/services/pluginHostSocket.ts`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/plugin-integration/src/services/tauriShell.ts`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/plugin-integration/src/hooks/useStudioTrackActions.ts`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/plugin-integration/src-tauri/src/lib.rs`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/plugin-integration/src-tauri/src/tray.rs`

## Next Exact Steps

1. Continue in this worktree with:
   - plugin-host startup ownership and port behavior
   - plugin discovery and connection stability
   - device-chain insertion path
2. Keep validating against `main...HEAD` ownership scope as new plugin work lands.
3. Do not reopen unrelated Studio visual/runtime work on this branch without a new Chief assignment.

## Validation

- `cd /Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/plugin-integration && ./node_modules/.bin/tsc --noEmit -p tsconfig.json`
- `cd /Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/plugin-integration && npm test`
- `cd /Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/plugin-integration && npm run build`
- `cd /Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/plugin-integration/src-tauri && cargo check`

## Do Not Touch

- do not mix this stream with arrangement/piano-roll visual work
- do not create a second plugin host authority
- do not change design-app routing or shell behavior here
- do not take ownership of general Studio runtime behavior outside plugin/device-chain concerns
- do not take ownership of Supabase schema, functions, or persistence contracts
