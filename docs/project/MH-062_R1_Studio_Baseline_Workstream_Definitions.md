# MH-062 R1 Studio Baseline Workstream Definitions

## Purpose

This document defines exact release responsibilities for `R1 Studio Baseline`.

## Chief / Program

Owns:

- release scope
- defect triage
- repair sequencing
- merge order
- release gate decisions
- maintenance of `MH-057`, `MH-063`, and `MH-064`

## Platform

Owns:

- governance
- release documentation
- route authority
- process integrity
- control-plane policy

Does not own:

- Studio feature repairs unless they are route/platform problems

## UI Integration

Owns:

- assembled Studio baseline on `codex/studio-integration-baseline`
- cross-stream integration on real product routes
- final release-validation branch
- structural integrity of the integrated Studio surface

## Runtime

Owns:

- editing/runtime behavior in Studio
- clip interactions
- ruler and playhead interactions
- runtime-backed context menus
- transport behavior inside the Studio surface

## Figmafunktioner

Owns:

- imported Figma-derived piano-roll/tool affordances that are part of the Studio baseline
- piano-roll presentation parity where it maps to the real runtime/editor seams

## UI Alignment

Owns:

- visual parity on approved Studio surfaces
- header/ruler geometry
- arrangement/piano-roll/mixer visual convergence

Does not own:

- runtime behavior fixes
- route authority

## Persistence

Owns only release-gating work when:

- a Studio defect depends on persistence behavior
- a Studio requirement is blocked on persistence correctness

Otherwise remains out of the active release path.

## Plugins

Status for R1:

- explicitly out of release scope unless a proven Studio blocker requires plugin work

Plugin progress may continue, but it is not part of `R1 Studio Baseline` acceptance by default.
