# MH-036 — Anchor Registry Population

## Decision

Guide anchors are populated from product-facing Studio view models, not from DOM nodes or component implementation details.

## Source of Truth

The anchor registry is built from selector-backed state:

- transport summary
- connection summary
- panel state
- selection summary
- piano roll state
- detail panel state
- track view state
- display track lists

Current bridge location:

- `src/domain/studio/studioGuideBridge.ts`

## Population Rules

- expose only stable product concepts as anchors
- use product-scoped ids such as `panel:timeline`, `track:<id>`, `clip:<id>`
- attach `highlights` as semantic affordances, not component names
- allow anchors to become temporarily unavailable when their owning panel is closed
- do not expose transient internal controls until command and selector semantics are stable

## Stable Anchor Classes

- panels
- transport controls
- tracks and track headers
- clips
- mixer strips
- sends
- detail-track and pianoroll-clip targets

## Deferred Anchor Classes

- individual note anchors
- plugin parameter anchors
- browser asset anchors beyond curated entry points
- transient popovers, context menus, and inline editors

These remain deferred until the related surfaces have stable selector-backed identities.
