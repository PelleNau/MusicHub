# Project Status

## Current Phase

`R1 Studio Baseline QC and Repair`

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

Machine-readable release registry:

- `.coordination/releases/r1-studio-baseline.json`

## Current Reality

- governance and stream coordination already exist in code
- the current bottleneck is Studio baseline quality, not execution mechanics
- the Studio baseline is not release-ready
- active baseline work must now run through the QC program rather than ad hoc repair

## Current Known Release Blockers

- arrangement viewport structural instability
- clip resize corruption
- ruler double-click seek failure
- playhead dragging failure
- missing track-head context menu
- piano-roll scroll-range failure
- piano-roll extend-range failure

See:

- `docs/project/MH-063_R1_Studio_Baseline_Defect_Ledger.md`

## Current Execution Rule

No baseline repair work is accepted unless:

1. the requirement exists in `MH-057`
2. the mapped validation exists in `MH-058`
3. the defect exists in `MH-063`
4. the work is assigned to one owning stream only
5. the repaired requirement is revalidated before closure

## Next Milestone

`R1 Studio Baseline` reaches the next milestone when:

- blocker structural defects are removed
- the first validation batch from `MH-058` is executed
- `MH-064` shows the release moving from `QC and Repair` into revalidation
