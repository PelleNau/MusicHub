# MH-034 — Command History Retention

## Decision

The first command-history implementation remains local to the Studio route, but it is now treated as Guide-facing runtime infrastructure rather than ad hoc debug state.

## Retention Rules

- Commands and acknowledgments are stored together as paired entries.
- Retention is bounded by count, not by unbounded session duration.
- History is ordered most-recent-first.
- The log is authoritative only for recent interaction context, not for persistence or replay.

## Initial Policy

- default command window: `120`
- default acknowledgment window: `120`
- default event window: `60`
- beginner lessons may request smaller windows
- pro layouts may request larger windows

These windows are resolved through:

- `src/domain/guide/guideRuntimePolicy.ts`
- `src/domain/guide/guideObservationBuffer.ts`
- `src/hooks/useMusicHubCommandLog.ts`

## Exposure Rules

- Studio components should not read the log directly except through dedicated runtime helpers.
- Guide runtime may consume the log through bounded observations only.
- The log is not treated as canonical persisted application state.
- Assistant and analytics systems may read from the same sink later, but only through explicitly bounded selectors.

## Follow-up

- promote the local sink into a reusable runtime service once Guide runtime is mounted as a first-class surface
- add timestamps and optional age trimming if count-only retention proves insufficient
