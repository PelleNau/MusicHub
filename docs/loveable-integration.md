# Loveable Integration Notes

This document is the practical handoff for the current local integration build of `plugin_host`.

## Integration build

- Version: `0.2.0-integration-alpha`
- HTTP base URL: `http://127.0.0.1:8080`
- WebSocket URL: `ws://127.0.0.1:8080/ws`

This build is intended to unblock Connected Mode integration in the web app. It is not a final public release.

## Stable enough to integrate now

Loveable can connect to these surfaces now:

- `GET /health`
- `GET /plugins`
- `POST /scan`
- `POST /chains/load`
- `GET /chains/:chainId/params`
- `POST /render/preview`
- `POST /session/audio-graph`
- `ws://127.0.0.1:8080/ws`

WebSocket commands available now:

- `transport.play`
- `transport.pause`
- `transport.stop`
- `transport.seek`
- `transport.loop`
- `transport.tempo`
- `plugin.setParam`
- `plugin.bypass`
- `chain.reorder`
- `chain.remove`
- `chain.add`
- `midi.sendNote`
- `midi.sendCC`

WebSocket events available now:

- `transport.state`
- `meter.update`
- `plugin.paramChanged`
- `chain.state`
- `session.state`
- `audio.engine.state`
- `audio.record.state`
- `render.progress`
- `render.complete`
- `render.error`
- `midi.input`
- `midi.deviceChange`
- `midi.learn.assigned`
- `session.trackMidi`
- `error`

## Provisional behavior

These parts are real, but should still be treated as integration-alpha behavior:

- meter payloads are structurally correct, but some values are still lightweight host/session telemetry rather than the final engine metering model
- session playback supports simple clips, file-backed audio clips, block-based automation, trims, offsets, and fades, but it is not yet a full arranger/timeline engine
- chain mutations rebuild the affected chain safely rather than doing true hot-swaps
- plugin hosting remains subject to third-party plugin instability despite helper isolation and quarantine support

## Frontend assumptions to use

- Native is authoritative for transport state, actual plugin parameter values, and meter state.
- The browser may use optimistic UI, but native-confirmed state should win.
- `chainId` is stable for the lifetime of a loaded chain in the current host process.
- `paramId` is stable for the lifetime of that loaded chain.
- If the host restarts, the browser should assume loaded chains are gone and reload state.

## Recommended frontend startup flow

1. Connect to `GET /health`
2. Open `ws://127.0.0.1:8080/ws`
3. Show Connected Mode if both are available
4. Post `POST /session/audio-graph`
5. Load chains as needed with `POST /chains/load`
6. Fetch params with `GET /chains/:chainId/params`

## Failure handling

- If `/health` fails, show "Host unavailable"
- If the WebSocket drops, keep retrying every 3 seconds
- If `/chains/load` fails, surface the returned `error.code`, `error.stage`, and plugin metadata
- If a plugin is quarantined, expect a structured refusal rather than a crash

## Current release recommendation

Use this build as the first shared dev build for browser/native integration.

Suggested label:

- `plugin_host 0.2.0-integration-alpha`

## Not ready to depend on as final product behavior

- final public packaging and installer UX
- code signing/notarization
- final meter semantics
- full DAW arrangement playback
- final automation model
