# MH-077 R2 Studio Route Replacement Contract

## Purpose

This document makes `R2-001` decision-complete.

It defines the product-route contract for Studio replacement so implementation can proceed without re-deciding route authority, shell ownership, or baseline-preservation rules.

## Decision Summary

`R2` replaces the remaining legacy Studio shell on the real product routes.

The product contract is:

- `/studio`
  - primary Studio route
  - must render the replacement Studio shell
- `/studio/workspace`
  - canonical deep-link route for the active Studio workspace
  - must render the same replacement Studio shell and the same runtime/editor contract as `/studio`

The replacement shell is the only product-target shell for Studio in `R2`.

Legacy review and lab routes do not count as product implementation.

## Product Route Authority

### Canonical product routes

The only product-valid Studio routes are:

- `/studio`
- `/studio/workspace`

These two routes must be treated as one product surface with shared shell authority.

Allowed difference:

- `/studio`
  - entry path and default landing
- `/studio/workspace`
  - deep-link path into active workspace state

Not allowed:

- separate shell ownership
- separate visual language
- separate route-only feature sets
- separate behavior contracts

### Non-canonical routes

These routes are no longer product authority for Studio:

- `/lab/studio`
- `/design-studio`
- `/design/arrangement`
- `/design/piano-roll`
- `/design/mixer`

Route policy:

- `/lab/studio`
  - redirect to `/studio`
- `/design-studio`
  - may remain as an internal review/reference surface during transition
  - must not be the user-facing product entry for Studio
- `/design/*`
  - remain reference/review-only until explicitly retired
  - do not count toward `R2` acceptance

## Shell Replacement Contract

### Legacy shell elements to remove from product authority

The following legacy assumptions are not the target shell for `R2`:

- fixture-session-first framing
- lab-route framing
- old Studio header/status framing as the primary product identity
- route-level dependence on preview/capture modes to expose the newer interface

The product routes must not rely on:

- `/design-studio`
- `/design/*`
- `/lab/studio`

to surface the newer Studio experience.

### Replacement shell target

The replacement shell must present Studio as one integrated interface composed of:

- top-level Studio shell/navigation
- transport and timeline control layer
- arrangement surface
- piano-roll/editor surface
- mixer/browser/automation baseline surfaces

The newer design direction is harvested into the real product routes, not left behind in separate review surfaces.

## R1 Preservation Contract

`R1` remains the behavioral baseline.

`R2` may replace shell and composition, but it must preserve accepted `R1` product behavior unless an explicit product decision supersedes it.

Required preserved behaviors include:

- route load on `/studio` and `/studio/workspace`
- transport controls
- playhead move and drag
- ruler seek
- clip selection and resize
- track-head context menu
- piano-roll/editor visibility on the product route
- piano-roll scroll beyond initial viewport
- piano-roll extend beyond initial width
- browser baseline presence
- mixer baseline presence
- automation baseline presence

## Reference Surface Rule

The following do not count as implemented product behavior by themselves:

- preview-only routes
- capture-only routes
- imported/reference components
- design-review hubs

Reference surfaces may inform implementation, but `R2` acceptance depends only on behavior and presentation on:

- `/studio`
- `/studio/workspace`

## Navigation Contract

### Required navigation updates

During `R2`, product navigation must converge on the canonical Studio routes.

Required outcomes:

- app-level Studio navigation points to `/studio`
- no primary navigation points to `/lab/studio`
- no product navigation requires `/design-studio`

### Transitional allowance

Temporary redirects are allowed during implementation if they do not create a second product contract.

Allowed:

- `/lab/studio` redirecting to `/studio`
- legacy entry links forwarding into `/studio`

Not allowed:

- maintaining two independent product-valid Studio shells

## Composition Rules

### Required composition outcome

`/studio` and `/studio/workspace` must mount:

- one replacement shell
- one coherent arrangement/editor composition
- one runtime behavior contract

### Explicit anti-patterns

`R2` implementation must not:

- overlay a new shell on top of an old product shell
- keep duplicated viewport/canvas authority
- preserve old shell sections merely because they are already wired
- use design-review routes as production substitutes

## Workstream Mapping

- `R2-001`
  - owner: `platform`
  - output: this route replacement contract
- `R2-002`
  - owner: `ui-integration`
  - output: replacement shell on `/studio` and `/studio/workspace`
- `R2-003`
  - owner: `runtime`
  - output: preservation of `R1` behavior during replacement
- `R2-004`
  - owner: `figmafunktioner`
  - output: relevant piano-roll/tool affordances harvested into product routes
- `R2-005`
  - owner: `ui-alignment`
  - output: visual convergence on the replaced shell

## Acceptance Criteria For R2-001

`R2-001` is complete when:

1. canonical product Studio routes are explicitly defined
2. non-canonical routes are explicitly classified
3. the shell replacement target is explicit
4. the `R1` preservation contract is explicit
5. reference surfaces are explicitly excluded from product acceptance
6. navigation and transition rules are explicit
7. there is no unresolved ambiguity about which Studio shell is the product target

## Immediate Consequence

With this contract approved:

- `R2-001` is complete
- `R2-002` becomes the next executable work item
- no further route-authority debate is needed during implementation
