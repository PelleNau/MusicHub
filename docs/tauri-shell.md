# Tauri Shell Scaffold

This repo includes a Tauri v2 desktop shell scaffold in `src-tauri/`.

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
- `src-tauri/build.rs` sidecar provisioning
- sidecar lifecycle manager
- tray setup
- placeholder icons
- frontend Tauri detection and shell bridge via:
  - `src/services/tauriShell.ts`
  - `src/services/hostConnector.ts`
- sidecar shell events surfaced into the Studio connection UI:
  - `sidecar:status`
  - `get_sidecar_status`
  - `restart_sidecar`

Still required before shipping:
- replace placeholder icons with real branded assets
- verify Tauri v2 capability permissions against the exact CLI/plugin versions used
- test `tauri dev` and `tauri build` on each target platform
- replace the updater public key and endpoint with real release infrastructure
- harden sidecar restart/kill semantics if the host begins to manage long-lived child state
- re-enable DMG packaging once the macOS bundle step is configured cleanly for distribution
- make sidecar provisioning reproducible for CI and release builders, not just local developer machines

## Current macOS build output

The current default `tauri:build` path produces a macOS app bundle:

- `src-tauri/target/debug/bundle/macos/The Flightcase.app`

The default bundle target is temporarily set to `app` rather than `all` so local
desktop builds succeed cleanly without blocking on DMG packaging.

## Sidecar binary naming

The Tauri bundle config expects an external sidecar named `plugin_host`.
At bundle time Tauri will resolve target-specific files from the `externalBin`
declaration. Keep local binary drops under:

- `src-tauri/binaries/`

The repo ignores built sidecar payloads by default.

## Automatic sidecar provisioning

When `src-tauri/binaries/` does not already contain the target-specific sidecar,
`src-tauri/build.rs` now provisions it before `tauri_build::build()` runs.

Provisioning order:
- `PLUGIN_HOST_BINARY=/absolute/path/to/plugin_host`
- `PLUGIN_HOST_DOWNLOAD_URL=https://.../plugin_host`
- `PLUGIN_HOST_PROJECT_DIR=/absolute/path/to/plugin-host`
- a discovered ancestor sibling project at `plugin-host/`
- `src-tauri/target/debug/plugin_host` as a final local fallback

If a `plugin-host` project is found but the built artifact is missing,
the build script runs:

```sh
cmake -S <plugin-host> -B <plugin-host>/build
cmake --build <plugin-host>/build
```

The expected artifact is:
- `build/plugin_host_artefacts/plugin_host`

Set `MUSICHUB_BUILD_PLUGIN_HOST=0` to disable the auto-build path and require a
prebuilt binary source.

If `PLUGIN_HOST_DOWNLOAD_URL` is set, the build script downloads the sidecar into
`src-tauri/target/plugin_host_download/` before Tauri packaging runs. Provide
`PLUGIN_HOST_DOWNLOAD_SHA256` to verify the binary content in CI or release jobs.

## CI and release builders

The repo now includes:
- `.github/workflows/desktop-shell-check.yml`

That workflow runs on macOS and uses the same build-time contract as local builds.
To enable it:
- set repository variable `PLUGIN_HOST_DOWNLOAD_URL`
- optionally set repository variable `PLUGIN_HOST_DOWNLOAD_SHA256`

Once those are configured, the workflow performs:
- `npm ci`
- `npm run build`
- `cargo check` in `src-tauri`
- `npm run tauri:build`
