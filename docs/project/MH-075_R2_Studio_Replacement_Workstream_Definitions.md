# MH-075 R2 Studio Replacement Workstream Definitions

## Purpose

This document defines exact execution responsibilities for `R2 Studio Replacement`.

## Assignment Standard

Every `R2` task must reference:

- release ID
- `R2` work item ID
- preservation rule if `R1` behavior is affected
- validation target
- one owning stream only

## Chief / Program

Owns:

- replacement scope
- sequencing
- acceptance criteria
- preservation rules
- merge order
- release decisions

## Platform

Owns:

- route authority
- release documentation
- control-plane policy
- packaging/publishing implications of shell replacement

## UI Integration

Owns:

- product-route composition on `/studio` and `/studio/workspace`
- shell replacement integration
- cross-stream convergence on the real product routes

## Runtime

Owns:

- preservation of transport, arrangement, editor, playhead, ruler, and context-menu behavior
- any runtime changes required to support the replaced product shell

## Figmafunktioner

Owns:

- harvesting relevant newer piano-roll/tool affordances into the actual product routes
- closing the gap between imported/reference surfaces and the real product interface

## UI Alignment

Owns:

- product-route visual convergence in the replacement shell
- arrangement/piano-roll/mixer parity in the actual replaced interface

## Persistence

Only active if:

- the replacement pass uncovers a persistence dependency or regression

## Plugins

Status for R2 by default:

- out of release scope unless explicitly promoted
