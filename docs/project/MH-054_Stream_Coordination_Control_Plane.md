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
npm run coord:watch
npm run coord:poll:runtime
npm run coord:next:runtime
npm run coord:ack -- --stream runtime --summary "Read handover and starting work"
npm run stream:start:runtime -- --summary "Starting work"
npm run coord:report -- --stream runtime --status completed --summary "Task complete"
npm run stream:done:runtime -- --summary "Task complete"
npm run coord:check-in -- --stream runtime
npm run coord:check-out -- --stream runtime
npm run check:ownership:runtime
npm run check:streams
```

## Faster Stream Pickup

Use these in the stream threads:

1. Read latest Chief instruction:
   - `npm run coord:next:<stream>`
   - or poll for a pending one-shot assignment:
     - `npm run coord:poll:<stream>`
2. Acknowledge/start:
   - `npm run stream:start:<stream> -- --summary "..."`
   - or combine poll + immediate acknowledge:
     - `npm run coord:poll:<stream> -- --ack --summary "..."`
3. Finish:
   - `npm run stream:done:<stream> -- --summary "..." --file ... --validation "..."`

Example:

```bash
npm run coord:next:runtime
npm run coord:poll:runtime -- --ack --summary "Starting runtime task"
npm run stream:start:runtime -- --summary "Starting runtime task"
npm run stream:done:runtime -- --summary "Runtime task completed" --file src/hooks/useStudioClipActions.ts --validation "tsc passed"
```

## Chief Watch

Use this in the Chief thread:

- `npm run coord:watch`

It prints a live summary of:
- unacknowledged streams
- in-progress streams
- completed streams ready for review
- blocked streams
- idle streams

## CI

Workflow:
- `.github/workflows/stream-protocol-check.yml`

Checks:
- `stream-check-in`
- `stream-check-out`
- `check-ownership`

## Managed Streams

- `platform`
- `persistence`
- `plugins`
- `runtime`
- `ui-integration`
- `figmafunktioner`

## Release-Managed Task Metadata

Once a release program is active, Chief assignments must include:

- release ID
- requirement ID(s)
- defect ID(s), when a repair exists
- target stream
- validation reference

For `R1 Studio Baseline`, use:

- release ID:
  - `R1-STUDIO-BASELINE`
- requirement IDs from:
  - `docs/project/MH-057_Studio_Requirements_Traceability_Matrix.md`
- test IDs from:
  - `docs/project/MH-058_Studio_Test_Catalog.md`
- defect IDs from:
  - `docs/project/MH-063_R1_Studio_Baseline_Defect_Ledger.md`

Release work cannot bypass requirement, defect, and validation mapping once a release program is active.

## Enforcement Intent

This system is intended to make the following mandatory:
- Chief instructions must be mirrored into the repo
- Streams must acknowledge latest instructions before work begins
- Streams must report back before the branch is considered review-ready
- Branches cannot rely on memory or UI-only thread state
- Branches cannot silently absorb files outside their ownership boundary
- Release-managed work cannot proceed as freeform repair outside the approved release program
