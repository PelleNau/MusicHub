# MH-054 — Stream Coordination Control Plane

## Purpose

Make stream communication enforceable in code instead of relying on Codex UI threads alone.

Authority:
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/docs/project/MusicHub_Platform_Directive.md`

Execution protocol:
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/docs/project/MH-053_Execution_Protocol.md`

## Rule

The UI thread is not the source of truth.

The source of truth is:
- `.coordination/chief/queue.json`
- `.coordination/streams/<stream>/state.json`
- `.coordination/streams/<stream>/inbox.json`
- `.coordination/streams/<stream>/outbox.json`

## Required Flow

1. Chief assigns work with `coord:assign`
2. Stream acknowledges with `coord:ack`
3. Stream executes work
4. Stream reports status with `coord:report`
5. CI enforces:
   - message acknowledged before work
   - status report written back before review/merge

## Commands

```bash
npm run coord:assign -- --stream runtime --title "Clip context-menu parity"
npm run coord:ack -- --stream runtime --summary "Read handover and starting work"
npm run coord:report -- --stream runtime --status completed --summary "Task complete"
npm run coord:check-in -- --stream runtime
npm run coord:check-out -- --stream runtime
npm run check:streams
```

## CI

Workflow:
- `.github/workflows/stream-protocol-check.yml`

Checks:
- `stream-check-in`
- `stream-check-out`

## Managed Streams

- `platform`
- `persistence`
- `plugins`
- `runtime`
- `ui-integration`
- `figmafunktioner`

## Enforcement Intent

This system is intended to make the following mandatory:
- Chief instructions must be mirrored into the repo
- Streams must acknowledge latest instructions before work begins
- Streams must report back before the branch is considered review-ready
- Branches cannot rely on memory or UI-only thread state
