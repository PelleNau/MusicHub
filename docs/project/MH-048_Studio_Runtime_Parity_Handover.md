# MH-048 — Studio Runtime Parity Handover

## Objective

Bring the real `MusicHub` Studio shell to parity with the approved frontend baseline by wiring live runtime behavior into the already-improved UI surfaces.

## Current State

- Worktree:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-runtime-parity`
- Branch:
  - `codex/studio-runtime-parity`
- Base commit:
  - `36b7bb5`
- Authority:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/docs/project/MusicHub_Platform_Directive.md`
- This stream starts from the cleaned checkpoint branch, not the older stale worktrees.
- Source of truth:
  - real `MusicHub` Studio runtime
  - not `MusicHub Design`
  - not the imported-components showcase

## Scope

- live `Studio` runtime only
- no design-app shell work
- no new Figma imports unless they directly unblock runtime parity

## Ownership Boundary

- `Runtime` owns:
  - Studio behavior and state wiring in the real app
  - transport ownership in frontend runtime seams
  - clip action ownership in frontend runtime seams
  - device/send UI ownership once plugin and data contracts already exist
  - integration of approved UI into the live Studio shell
- `Runtime` does **not** own:
  - plugin-host lifecycle, sidecars, sockets, or plugin discovery
  - Supabase schema, migrations, functions, or persistence contracts
- `Plugins` owns:
  - host process startup
  - plugin discovery and plugin transport
- `Database` owns:
  - persisted session/data contracts
  - Supabase-backed save/load behavior

## Priority Areas

1. Clip context-menu parity
2. Transport parity
3. Device/send ownership
4. Track-context and template wiring after that

## Runtime Readout

### Clip context menu

- UI entry:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-runtime-parity/src/components/studio/track/ClipContextMenu.tsx`
- Runtime seam:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-runtime-parity/src/hooks/useStudioClipActions.ts`
- Current gap:
  - menu has richer presentation, but parity still depends on confirming each action maps cleanly to:
    - duplicate
    - linked duplicate
    - split
    - rename
    - recolor
    - mute
    - automation visibility/add
    - fade add

### Transport

- UI entry:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-runtime-parity/src/components/studio/TransportBar.tsx`
- Runtime seam:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-runtime-parity/src/hooks/useStudioTransport.ts`
- Current gap:
  - visuals are already integrated
  - parity work is about ensuring play/pause/stop/loop/tempo/seek state and disabled logic come only from transport state, not local display assumptions
  - `KeySelector` and `ZoomControl` are still local UI state in `TransportBar.tsx`; that needs an ownership decision

### Device/send flow

- UI entries:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-runtime-parity/src/components/studio/DeviceView.tsx`
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-runtime-parity/src/components/studio/DeviceSlot.tsx`
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-runtime-parity/src/components/studio/SendRoutingMenu.tsx`
- Runtime seam:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-runtime-parity/src/hooks/useStudioTrackActions.ts`
- Existing owned actions already present:
  - `handleSendChange`
  - `handleDeviceChainChange`
  - `handleBrowserAddDevice`
  - `handleBrowserAddHostPlugin`
- Current gap:
  - the UI components are present, but the exact ownership boundary for selection, insertion, focus, and routing still needs to be formalized before wiring them through the live shell

## Files To Start With

- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-runtime-parity/src/components/studio/track/ClipContextMenu.tsx`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-runtime-parity/src/hooks/useStudioClipActions.ts`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-runtime-parity/src/components/studio/TransportBar.tsx`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-runtime-parity/src/hooks/useStudioTransport.ts`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-runtime-parity/src/components/studio/DeviceView.tsx`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-runtime-parity/src/components/studio/DeviceSlot.tsx`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-runtime-parity/src/components/studio/SendRoutingMenu.tsx`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-runtime-parity/src/hooks/useStudioTrackActions.ts`

## Next Exact Steps

- `todo` audit live clip-menu actions against `useStudioClipActions`
  - inspect `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-runtime-parity/src/components/studio/track/ClipContextMenu.tsx`
  - inspect `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-runtime-parity/src/hooks/useStudioClipActions.ts`
  - remove any remaining presentational-only actions or dead submenu paths
- `todo` verify transport parity through `useStudioTransport`
  - inspect `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-runtime-parity/src/components/studio/TransportBar.tsx`
  - inspect `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-runtime-parity/src/hooks/useStudioTransport.ts`
  - decide whether `KeySelector` and `ZoomControl` remain local display controls or must move into a Studio model seam
- `todo` define one owned path for device insertion and send routing
  - inspect `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-runtime-parity/src/components/studio/DeviceView.tsx`
  - inspect `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-runtime-parity/src/components/studio/DeviceSlot.tsx`
  - inspect `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-runtime-parity/src/components/studio/SendRoutingMenu.tsx`
  - inspect `/Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-runtime-parity/src/hooks/useStudioTrackActions.ts`
- `todo` only after the above, pick the first concrete implementation target
  - recommended first target: clip-context-menu parity

## Validation

- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/node_modules/.bin/tsc --noEmit -p /Users/pellenaucler/Documents/CodexProjekt/MusicHub-worktrees/studio-runtime-parity/tsconfig.json`
- `cd /Users/pellenaucler/Documents/CodexProjekt/MusicHub && npm run test`
- `cd /Users/pellenaucler/Documents/CodexProjekt/MusicHub && npm run build`

## Do Not Touch

- do not recreate export-style `src/app/...` services
- do not add a second command bus
- do not use the design app as the runtime source of truth
- do not take ownership of plugin-host startup, port management, or plugin discovery
- do not take ownership of Supabase schema, functions, or migration logic
