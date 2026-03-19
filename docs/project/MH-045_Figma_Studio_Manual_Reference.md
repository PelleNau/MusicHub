# MH-045 — Figma Studio Manual Reference

## Purpose

Capture the useful parts of the latest Figma Make export without importing its standalone app structure into `MusicHub`.

Source reference:
- `/Users/pellenaucler/Documents/CodexProjekt/blank-canvas/Musichubfigmaexport/MUSICHUB_MANUAL.md`

## Accepted Inputs

The Figma export is useful as reference for:

- Studio shell vocabulary
- toolbar grouping
- track-height zoom affordances
- arrangement editing language
- feature documentation and user-facing terminology

The export is not accepted as:

- canonical repo structure
- authoritative runtime behavior
- a merge source for `src/app/...`

## Imported Direction

The current import pass accepts these ideas:

1. A compact arrangement editing toolbar above the main timeline.
2. A dedicated vertical track-height control instead of relying only on hidden gestures.
3. A documented reference manual for future feature parity reviews.

## Rejected Or Deferred

These parts remain deferred or rejected for now:

1. consolidated `ControlBar`/`EditingBar` architecture from the standalone export
2. standalone `StudioContext` state ownership
3. any feature claims not backed by the real `MusicHub` runtime
4. documentation that describes generated Git/release/version workflows

## Consequence

Future Figma drops should continue to be reviewed in this order:

1. documentation/spec value
2. isolated UI affordances
3. integration fit with the real Studio runtime

They should not be imported as application structure.
