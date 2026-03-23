# Project Status

## Current Phase

`R2 Studio Replacement - Route Unification And Shell Replacement`

## Program Baseline

The project is now operating under a release-program structure:

- product program layer
  - release target, workstreams, gates, approval model
- execution layer
  - stream branches, ownership rules, `.coordination` control plane, CI gates

Published release:

- `R1 Studio Baseline`

Active next release:

- `R2 Studio Replacement`

Authoritative validation branch:

- `codex/studio-integration-baseline`

Integration trunk:

- `codex/figma-capture-mode`

## Release Backbone

The current release is governed by:

- `docs/project/MH-055_Figma_Export_Baseline_Approval_Matrix.md`
- `docs/project/MH-056_Studio_Baseline_Validation_Charter.md`
- `docs/project/MH-057_Studio_Requirements_Traceability_Matrix.md`
- `docs/project/MH-058_Studio_Test_Catalog.md`
- `docs/project/MH-059_Studio_Defect_Triage_Rules.md`
- `docs/project/MH-060_Studio_Exit_Criteria.md`
- `docs/project/MH-061_R1_Studio_Baseline_Program_Charter.md`
- `docs/project/MH-062_R1_Studio_Baseline_Workstream_Definitions.md`
- `docs/project/MH-063_R1_Studio_Baseline_Defect_Ledger.md`
- `docs/project/MH-064_R1_Studio_Baseline_Burndown.md`
- `docs/project/MH-065_R1_Figma_Corpus_Triage_Register.md`
- `docs/project/MH-066_R1_Canonical_Studio_Baseline_Spec.md`
- `docs/project/MH-067_R1_Contradiction_And_Deferral_Ledger.md`
- `docs/project/MH-068_R1_Runtime_Backend_Mapping_Matrix.md`
- `docs/project/MH-069_R1_UI_Component_CSS_Mapping_Matrix.md`
- `docs/project/MH-070_R1_Validation_Mapping_Register.md`

Machine-readable release registry:

- `.coordination/releases/r1-studio-baseline.json`

## Current Reality

- `R1 Studio Baseline` is approved and treated as the published baseline
- the integration trunk and validation branch are aligned at the approved `R1` head
- the next active program is `R2 Studio Replacement`
- `R2` exists to replace the remaining old-shell assumptions on `/studio` and `/studio/workspace` with the newer integrated Studio interface while preserving `R1`-validated runtime behavior
- `R2-001` is complete and locked in `MH-077`
- the first implementation wave is complete:
  - `/studio` is the primary Studio route
  - `/studio` and `/studio/workspace` now share one product behavior contract
- the second implementation wave is complete:
  - replacement shell chrome is applied on the product routes
- the third implementation wave is complete:
  - product-route center workspace composition is tightened
  - the browser reads as an integrated left rail on the product routes
  - legacy center-frame cues are reduced on `/studio` and `/studio/workspace`
- the next active work is deeper product-route surface replacement beyond center-shell cleanup

## Current Release State

- approved release decision:
  - `docs/project/MH-060_Studio_Exit_Criteria.md`
- approved defect and validation state:
  - `docs/project/MH-063_R1_Studio_Baseline_Defect_Ledger.md`
  - `docs/project/MH-064_R1_Studio_Baseline_Burndown.md`
  - `docs/project/MH-070_R1_Validation_Mapping_Register.md`
- published release closeout:
  - `docs/project/MH-071_R1_Release_Closure_And_Stabilization_Plan.md`
  - `docs/project/MH-072_R1_Stabilization_Defect_Ledger.md`
  - `docs/project/MH-073_R1_Stabilization_Validation_Log.md`

## Active Program Backbone

The active next-release program is governed by:

- `docs/project/MH-074_R2_Studio_Replacement_Program_Charter.md`
- `docs/project/MH-075_R2_Studio_Replacement_Workstream_Definitions.md`
- `docs/project/MH-076_R2_Studio_Replacement_Backlog.md`
- `docs/project/MH-077_R2_Studio_Route_Replacement_Contract.md`
- `.coordination/releases/r2-studio-replacement.json`

## Current Execution Rule

No `R2` implementation work is accepted unless:

1. the requirement exists in `MH-066` and `MH-057`
2. the mapped validation exists in `MH-058` and `MH-070`
3. any active contradiction is decisioned in `MH-067`
4. the work item exists in the active `R2` backlog
5. the work is assigned to one owning stream only
6. `R1`-validated runtime behavior is preserved or an explicit migration decision is recorded

## Next Milestone

`R2 Studio Replacement` reaches the next milestone when:

- the visible shell replacement waves remain accepted
- the center-workspace replacement wave remains accepted
- `R1` runtime-preservation tests continue to pass under the replacement shell
- the real Studio routes continue converging toward the integrated interface beyond chrome-only changes
