# Project Status

## Current Phase

`R1 Approved / Release Publishing`

## Program Baseline

The project is now operating under a release-program structure:

- product program layer
  - release target, workstreams, gates, approval model
- execution layer
  - stream branches, ownership rules, `.coordination` control plane, CI gates

Active release:

- `R1 Studio Baseline`

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

- `R1 Studio Baseline` is approved under `MH-060`
- the integration trunk and validation branch are aligned at the approved baseline head
- the next operational phase is release publishing plus a bounded stabilization window
- no new feature work is accepted on the baseline during stabilization

## Current Release State

- approved release decision:
  - `docs/project/MH-060_Studio_Exit_Criteria.md`
- approved defect and validation state:
  - `docs/project/MH-063_R1_Studio_Baseline_Defect_Ledger.md`
  - `docs/project/MH-064_R1_Studio_Baseline_Burndown.md`
  - `docs/project/MH-070_R1_Validation_Mapping_Register.md`
- release/stabilization operating plan:
  - `docs/project/MH-071_R1_Release_Closure_And_Stabilization_Plan.md`
  - `docs/project/MH-072_R1_Stabilization_Defect_Ledger.md`
  - `docs/project/MH-073_R1_Stabilization_Validation_Log.md`

## Current Execution Rule

No stabilization or release-quality work is accepted unless:

1. the requirement exists in `MH-066` and `MH-057`
2. the mapped validation exists in `MH-058` and `MH-070`
3. any active contradiction is decisioned in `MH-067`
4. the defect exists in `MH-072` for post-approval issues, or in `MH-063` if it reopens an approved `R1` defect
5. the work is assigned to one owning stream only
6. the repaired requirement is revalidated before closure

## Next Milestone

The next milestone is reached when:

- remote `main`, `codex/figma-capture-mode`, and `codex/studio-integration-baseline` are synchronized
- release tag `r1-studio-baseline` exists
- the stabilization regression pack passes
- `MH-071`, `MH-072`, and `MH-073` are current
- the next release target is chosen and documented
