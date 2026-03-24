# MH-074 R2 Studio Replacement Program Charter

## Release Definition

- Release name: `R2 Studio Replacement`
- Objective: replace the remaining old Studio shell on `/studio` and `/studio/workspace` with the newer integrated Studio interface while preserving `R1`-validated runtime behavior
- Planning horizon: next release only
- Governance mode: strict gated

## Program Structure

The program uses the same two layers:

1. Product program layer
   - release target, workstreams, gates, approval model
2. Execution layer
   - stream branches, ownership rules, `.coordination` control plane, CI gates

## Required Preservation Rule

`R1 Studio Baseline` is the behavioral contract for `R2`.

That means:

- `R2` may replace shell and route composition
- `R2` may replace visual presentation on the product routes
- `R2` must preserve accepted `R1` runtime/editor behavior unless an explicit product decision changes it

## In Scope For R2

- product-route shell replacement on `/studio` and `/studio/workspace`
- integrated arrangement, piano-roll, and mixer surface as the primary product interface
- route authority cleanup where legacy shell logic still controls the product routes
- real product-route adoption of newer Studio interface work
- validation against both:
  - `R1` behavioral baseline
  - `R2` replacement goals

## Out Of Scope For R2

- plugin-host expansion by default
- broad learning-surface redesign
- speculative backend/native refactors not needed for the replacement pass
- preview-only work that never lands on product routes

## Branch Model

- integration trunk:
  - `codex/figma-capture-mode`
- product replacement branch:
  - `codex/studio-integration-baseline`

## Immediate Program Phase

Current phase:

- `R2 route contract locked; route-unification, shell-chrome, center-composition, surface-chrome, component-chrome, overlay-chrome, and navigation-shell refinement waves accepted`

Objectives:

- complete the next deeper product-route behavior and composition replacement wave
- keep `/studio` as the primary product route
- keep `/studio` and `/studio/workspace` on one product behavior contract
- preserve the `R1` runtime contract during replacement
- replace the remaining legacy product behavior and composition on `/studio` and `/studio/workspace`

Route contract:

- `docs/project/MH-077_R2_Studio_Route_Replacement_Contract.md`

## Approval Authority

- Product approval owner: user / product approver
- Program execution authority: `MusicHub Chief`
- Release gate authority: `MusicHub Chief`
