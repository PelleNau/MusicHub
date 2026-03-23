# MH-064 R1 Studio Baseline Burndown

## Release Status

- Release: `R1 Studio Baseline`
- Current phase: `Structural Baseline Repair`
- Validation branch: `codex/studio-integration-baseline`
- Integration trunk: `codex/figma-capture-mode`

## Gate Status

| Gate | Status | Notes |
| --- | --- | --- |
| Scope gate (`MH-055`, `MH-056`) | Complete | R1 scope and QC charter are in place and now govern execution. |
| Normalization gate (`MH-065`-`MH-070`) | Complete | Canonical spec, contradiction ledger, and mapping matrices are established and active. |
| Validation gate (`MH-057`, `MH-058`) | Active | Validation is now running against the normalized R1 contract. |
| Repair gate (`MH-063`) | Active | Wave 1 and Wave 2 accepted; remaining work is limited to open mapped defects. |
| Exit gate (`MH-060`) | Not Started | Cannot start until blocker and major repairs are completed and revalidated. |

## Defect Counts

| Severity | Count |
| --- | --- |
| Blocker | 0 |
| Critical | 0 |
| Major | 2 |
| Minor | 0 |
| Polish | 0 |

## Domain Status

| Domain | Status | Notes |
| --- | --- | --- |
| Shell and navigation | Stable | `/studio` and `/studio/workspace` are now routed through the normalized Studio baseline. |
| Transport and playhead | Repair Accepted | Wave 2 restored ruler seek and playhead drag on the product route. |
| Arrangement | Repair In Progress | Structural viewport defect and core resize/context interactions are fixed; visual parity defects remain. |
| Piano roll | Repair Accepted | Viewport range and extend/editing range defects are fixed at the product route level. |
| Mixer | Not Reviewed | Validation not executed yet. |
| Browser | Not Reviewed | Validation not executed yet. |
| Editing and shortcuts | Repair In Progress | Core Wave 2 interactions are accepted; deeper editing/shortcut breadth validation remains. |
| Visual parity | Open | Remaining active defects are limited to arrangement header/ruler geometry and grid/lane parity. |

## Current Execution Batch

1. Wave 1 accepted:
   - `DEF-R1-001`
   - `DEF-R1-006`
   - `DEF-R1-007`
2. Wave 2 accepted:
   - `DEF-R1-002`
   - `DEF-R1-003`
   - `DEF-R1-004`
   - `DEF-R1-005`
3. Next wave:
   - `DEF-R1-008`
   - `DEF-R1-009`
4. Follow-on breadth validation:
   - mixer
   - browser/devices
   - automation
   - shortcuts/editing
