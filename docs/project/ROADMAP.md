# MusicHub Roadmap

## Purpose

This roadmap defines the delivery sequence for the current product release, not just the architecture program.

Current release target:

- `R1 Studio Baseline`

## Release Strategy

The roadmap is now release-driven:

1. approve the Studio baseline under the normalized `R1` contract
2. publish and synchronize the approved baseline branches
3. run a bounded stabilization window against the shipped baseline
4. only then open the next release train

## R1 — Studio Baseline

### Goal

Ship the new Studio interface as the primary baseline on `/studio`.

### In Scope

- Studio shell and route authority
- transport and playhead
- arrangement baseline
- piano-roll baseline
- mixer baseline
- browser baseline
- core editing interactions
- visual parity sufficient for baseline approval

### Out Of Scope

- plugin-host completeness unless required by a proven Studio blocker
- advanced routing and device-chain completeness
- full backend/native completeness beyond baseline validation needs
- broader learning/product-surface work not needed for the Studio baseline

## Phase A — Program Lock

### Goal

Turn the Studio baseline into a formal release program.

### Outcomes

- approve `MH-055` through `MH-060`
- create `MH-061` through `MH-064`
- freeze feature drift on the baseline branch
- snapshot current known defects into `MH-063`

Status:

- complete

## Phase B — Spec Normalization And Validation Audit

### Goal

Turn the mixed Figma/export corpus into one contradiction-resolved `R1` release contract.

### Outcomes

- classify the full export corpus
- approve the canonical `R1` requirement set
- resolve contradictions and deferrals
- map runtime/backend feasibility
- map product-route UI/component/CSS surfaces
- bind validation to the normalized spec

Status:

- complete

## Phase C — Structural Baseline Repair

### Goal

Repair the baseline in the order that minimizes rework.

### Repair Order

1. arrangement structural integrity
2. piano-roll structural integrity
3. core interactions
4. visual parity
5. secondary baseline gaps

Status:

- complete

## Phase D — Full Revalidation

### Goal

Re-run the Studio baseline against the approved requirement and test set.

### Validation Order

1. shell and navigation
2. transport and playhead
3. arrangement
4. piano roll
5. mixer
6. browser/devices
7. shortcuts/editing
8. visual parity sweep

Status:

- complete

## Phase E — Release Gate

### Goal

Decide whether `R1 Studio Baseline` is approved, conditionally approved, or blocked.

### Gate Rules

Use:

- `docs/project/MH-060_Studio_Exit_Criteria.md`

R1 is accepted only when:

- `Blocker = 0`
- `Critical = 0`
- `Major = 0` in core Studio flows
- the approved deviation list contains only accepted `Minor` and `Polish` items

Status:

- complete

## Phase F — Release Publishing And Stabilization

### Goal

Publish the approved baseline and keep it stable while it is synchronized, tagged, and regression-checked.

### Outcomes

- synchronize `main`, `codex/figma-capture-mode`, and `codex/studio-integration-baseline`
- create release tag `r1-studio-baseline`
- freeze the validation branch against feature drift
- run the reduced stabilization regression pack
- log post-approval issues only in `MH-072` and `MH-073`

### Stabilization Scope

- regression fixes only
- release documentation updates
- validation evidence
- packaging/publishing fixes

### Exclusions During Stabilization

- no new Studio redesign
- no speculative cleanup
- no plugin-host expansion unless a shipped baseline defect proves dependency

## Post-R1 Candidates

These are not in the current release path by default:

- plugin-host completeness
- deeper routing/device-chain completeness
- backend/native maturity work beyond Studio baseline validation
- broader product-surface expansion outside the Studio release path

Default next release candidate after stabilization:

- `R2 Studio Expansion`
