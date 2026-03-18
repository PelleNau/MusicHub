# MH-037 — Guide Observation Retention

## Decision

Guide step evaluation runs against bounded recent observations plus the latest selector snapshot.

## Observation Model

Each evaluation receives:

- selector snapshot
- recent commands
- recent acknowledgments
- recent runtime events

Selectors represent current canonical state. Commands, acknowledgments, and events provide recent intent and outcome context.

## Retention Policy

- retain recent commands by count
- retain recent acknowledgments by count
- retain recent events by count
- selector snapshot is always current and not windowed

Current implementation:

- `src/domain/guide/guideObservationBuffer.ts`
- `src/domain/guide/guideRuntimePolicy.ts`
- `src/hooks/useStudioGuideBridge.ts`

## Reasoning

- lesson validation should not depend on stale historical noise
- count-based windows are deterministic and cheap
- selector snapshots already capture current state, so older observations lose value quickly

## Next Questions

- whether time-based expiry should supplement count windows
- whether failed steps should snapshot a narrower view for debugging
- whether assistant tooling should consume the same bounded observation stream
