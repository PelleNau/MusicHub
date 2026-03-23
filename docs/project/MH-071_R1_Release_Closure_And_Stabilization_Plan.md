# MH-071 R1 Release Closure And Stabilization Plan

## Purpose

This document governs the post-approval handling of `R1 Studio Baseline`.

It replaces repair-wave execution as the active operational plan.

## Current Release State

- release ID: `R1-STUDIO-BASELINE`
- release status: `Approved`
- integration trunk: `codex/figma-capture-mode`
- stabilization branch: `codex/studio-integration-baseline`
- release decision source:
  - `docs/project/MH-060_Studio_Exit_Criteria.md`

## Immediate Operational Objectives

1. synchronize local and remote release branches
2. create release tag `r1-studio-baseline`
3. freeze the stabilization branch against feature drift
4. run a bounded stabilization window for post-approval regressions
5. keep all post-approval defects out of `MH-063`

## Branch Topology

- `main`
  - program docs
  - release authority
- `codex/figma-capture-mode`
  - accepted integration trunk for the approved baseline
- `codex/studio-integration-baseline`
  - approved release-validation branch
  - sole stabilization branch

## Stabilization Rules

Only these changes may land on `codex/studio-integration-baseline` during stabilization:

- regression fixes
- release documentation updates
- validation evidence
- packaging or publishing fixes

Explicitly disallowed:

- new feature work
- new Studio redesign
- speculative cleanup
- plugin-host expansion unless a shipped baseline defect proves dependency

## Stabilization Window

- duration: 5 working days
- owner: `MusicHub Chief`
- streams available:
  - `platform`
  - `ui-integration`
  - `runtime`
  - `ui-alignment`
  - `persistence` only if a reproduced defect depends on persistence

## Stabilization Regression Pack

Run this pack repeatedly during the stabilization window:

- route load
  - `/studio`
  - `/studio/workspace`
- transport
  - play
  - stop
  - loop
  - playhead move
- arrangement
  - clip select
  - clip resize
  - ruler seek
  - playhead drag
  - track-head context menu
- piano roll
  - editor visible on product route
  - scroll beyond initial viewport
  - extend beyond initial width
  - basic note-edit reachability
- baseline surfaces
  - mixer present
  - browser present
  - automation lane present
- build checks
  - `tsc --noEmit`
  - production build

## Defect and Validation Logging

- `MH-063` remains the approved `R1` repair ledger
- `MH-072` is the only ledger for post-approval stabilization defects
- `MH-073` is the active stabilization validation log

Every stabilization defect must include:

- stabilization defect ID
- affected route
- regression pack reference or added validation case
- severity
- owner stream
- resolution status

## Exit From Stabilization

Stabilization ends only when:

- remote branches are synchronized
- release tag exists
- no open blocker or critical stabilization defect remains
- the stabilization regression pack passes
- `MH-071`, `MH-072`, and `MH-073` are current
- the next release target is documented
