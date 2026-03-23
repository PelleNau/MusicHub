# MH-060 Studio Exit Criteria

## Purpose

This document defines the release gate for `R1 Studio Baseline`.

## Decision Outcomes

Allowed outcomes:

- `Approved`
- `Conditionally Approved`
- `Blocked`

## Approval Requirements

The baseline may be marked `Approved` only if all of the following are true:

- `Blocker = 0`
- `Critical = 0`
- `Major = 0` in core Studio flows
- build and typecheck are passing on the baseline branch
- core Studio routes load and are testable
- approved deviation list exists
- in-scope requirements are marked `Pass` or `Deferred`

Core Studio flows means at minimum:

- `/studio`
- `/studio/workspace`
- arrangement viewport integrity
- clip editing basics
- ruler and playhead interactions
- piano-roll viewport integrity
- piano-roll basic editing
- transport visibility and coherence

## Conditional Approval

The baseline may be `Conditionally Approved` only if:

- `Blocker = 0`
- `Critical = 0`
- remaining issues are only `Minor` or `Polish`
- those issues are explicitly listed and accepted

## Automatic Block Conditions

The baseline is automatically `Blocked` if any of these are true:

- any `Blocker` exists
- any `Critical` exists
- arrangement or piano-roll viewport is structurally unsound
- primary Studio route is not the approved baseline surface
- core editing interactions cause destructive corruption
- build or typecheck fails

## Evidence Required For Signoff

Before approval, the record must include:

- approved `MH-055`
- approved `MH-056`
- current `MH-057` statuses
- executed tests from `MH-058`
- defect list classified per `MH-059`
- evidence for blocker, critical, and major closures

## Approved Deviations

An approved deviation list must include:

- requirement ID
- deviation summary
- rationale
- severity
- approval owner

Only `Minor` and `Polish` deviations may remain in an approved baseline.
