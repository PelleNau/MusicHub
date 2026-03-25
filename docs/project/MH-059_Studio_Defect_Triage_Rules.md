# MH-059 Studio Defect Triage Rules

## Purpose

This document standardizes how `R1 Studio Baseline` defects are classified, prioritized, and moved through repair.

## Severity Definitions

### Blocker

- baseline cannot be meaningfully validated or demonstrated

Examples:

- route does not load
- arrangement or piano-roll viewport is unusable
- destructive editing corruption

### Critical

- baseline loads, but a core workflow is broken enough to invalidate the product surface

Examples:

- Studio route resolves to the wrong surface
- transport is unusable

### Major

- significant workflow or parity defect that does not fully block the domain

Examples:

- track-head context menu missing
- ruler seek missing
- major geometry or parity defect in a primary surface

### Minor

- real defect with limited user impact and no core workflow breakage

### Polish

- desirable refinement, not baseline acceptance material

## Defect Types

Each defect gets one primary type:

- `structural/layout`
- `interaction`
- `visual parity`
- `state/data`
- `performance`
- `routing/navigation`
- `accessibility`
- `integration gap`

## Required Defect Fields

Every defect record must include:

- defect ID
- requirement ID(s)
- severity
- type
- route
- branch
- expected behavior
- observed behavior
- reproduction steps
- evidence
- owner
- current status

## Status Values

Use only:

- `Open`
- `Triaged`
- `In Repair`
- `Ready For Revalidation`
- `Validated`
- `Deferred`
- `Rejected`

## Triage Rules

### Structural First

If a defect suggests overlapping surfaces, detached viewports, or broken scroll ownership:

- classify it as `structural/layout`
- do not patch visual symptoms in isolation

### Product Route Over Preview Route

If preview/design routes behave correctly but `/studio` or `/studio/workspace` does not:

- defect belongs to the product baseline
- preview correctness does not reduce severity

### Feature Docs Are Not Product Completion

If a capability is documented as complete but fails on the real baseline route:

- classify it as an active defect

### Deferral Rules

A defect may be deferred only if:

- it is outside approved `R1` scope
- or it is `Minor` / `Polish` and explicitly accepted

`Blocker` and `Critical` defects may not be deferred.

## Repair Sequence

Fix in this order:

1. structural/layout
2. routing/navigation
3. interaction
4. state/data
5. visual parity
6. polish

## Closure Rules

A defect is not closed unless:

- the mapped requirement is revalidated
- updated evidence exists
- no same-domain regression is introduced

For `Blocker` and `Critical` defects:

- before and after evidence is mandatory
