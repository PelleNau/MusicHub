# Tauri Shell Scaffold

This repo now includes a Tauri v2 desktop shell scaffold in
[/Users/pellenaucler/Documents/CodexProjekt/studio-ledger/src-tauri](/Users/pellenaucler/Documents/CodexProjekt/studio-ledger/src-tauri).

## What the shell is responsible for

- wrapping the existing Vite/React frontend
- launching the `plugin_host` sidecar process
- monitoring sidecar health via `http://127.0.0.1:8080/health`
- exposing basic shell IPC:
  - `get_sidecar_status`
  - `restart_sidecar`
  - `get_shell_info`
- providing desktop UX basics:
  - tray icon
  - window restore/show
  - updater/plugin registration

## Current state

This is now a working desktop shell scaffold with a successful macOS `.app` build.
It is not a fully ship-ready packaged desktop app yet.

Implemented:
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`
- `src-tauri/capabilities/default.json`
- sidecar lifecycle manager
- tray setup
- placeholder icons
- frontend Tauri detection and shell bridge via:
  - [/Users/pellenaucler/Documents/CodexProjekt/studio-ledger/src/services/tauriShell.ts](/Users/pellenaucler/Documents/CodexProjekt/studio-ledger/src/services/tauriShell.ts)
  - [/Users/pellenaucler/Documents/CodexProjekt/studio-ledger/src/services/hostConnector.ts](/Users/pellenaucler/Documents/CodexProjekt/studio-ledger/src/services/hostConnector.ts)
- sidecar shell events surfaced into the Studio connection UI:
  - `sidecar:status`
  - `get_sidecar_status`
  - `restart_sidecar`

Still required before shipping:
- replace placeholder icons with real branded assets
- place target-specific `plugin_host` sidecar binaries under `src-tauri/binaries/`
- verify Tauri v2 capability permissions against the exact CLI/plugin versions used
- test `tauri dev` and `tauri build` on each target platform
- replace the updater public key and endpoint with real release infrastructure
- harden sidecar restart/kill semantics if the host begins to manage long-lived child state
- re-enable DMG packaging once the macOS bundle step is configured cleanly for distribution

## Current macOS build output

The current default `tauri:build` path produces a macOS app bundle:

- `/Users/pellenaucler/Documents/CodexProjekt/studio-ledger/src-tauri/target/debug/bundle/macos/The Flightcase.app`

The default bundle target is temporarily set to `app` rather than `all` so local
desktop builds succeed cleanly without blocking on DMG packaging.

## Sidecar binary naming

The Tauri bundle config expects an external sidecar named `plugin_host`.
At bundle time Tauri will resolve target-specific files from the `externalBin`
declaration. Keep local binary drops under:

- `/Users/pellenaucler/Documents/CodexProjekt/studio-ledger/src-tauri/binaries/`

The repo ignores built sidecar payloads by default.
