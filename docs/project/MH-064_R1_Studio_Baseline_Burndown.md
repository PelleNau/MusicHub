# MH-064 R1 Studio Baseline Burndown

## Release Status

- Release: `R1 Studio Baseline`
- Current phase: `Baseline Breadth Validation`
- Validation branch: `codex/studio-integration-baseline`
- Integration trunk: `codex/figma-capture-mode`

## Gate Status

| Gate | Status | Notes |
| --- | --- | --- |
| Scope gate (`MH-055`, `MH-056`) | Complete | R1 scope and QC charter are in place and now govern execution. |
| Normalization gate (`MH-065`-`MH-070`) | Complete | Canonical spec, contradiction ledger, and mapping matrices are established and active. |
| Validation gate (`MH-057`, `MH-058`) | Active | Validation is now running against the normalized R1 contract. |
| Repair gate (`MH-063`) | Complete | Waves 1, 2, and 3 are accepted; there are no open mapped R1 defects. |
| Exit gate (`MH-060`) | Active | Core repair waves are complete; breadth validation and final exit evidence remain. |

## Defect Counts

| Severity | Count |
| --- | --- |
| Blocker | 0 |
| Critical | 0 |
| Major | 0 |
| Minor | 0 |
| Polish | 0 |

## Domain Status

| Domain | Status | Notes |
| --- | --- | --- |
| Shell and navigation | Stable | `/studio` and `/studio/workspace` are now routed through the normalized Studio baseline. |
| Transport and playhead | Repair Accepted | Wave 2 restored ruler seek and playhead drag on the product route. |
| Arrangement | Repair Accepted | Structural, interaction, and arrangement visual parity slices are accepted on the product route. |
| Piano roll | Repair Accepted | Viewport range and extend/editing range defects are fixed at the product route level. |
| Mixer | Not Reviewed | Validation not executed yet. |
| Browser | Not Reviewed | Validation not executed yet. |
| Editing and shortcuts | Repair Accepted | Core Wave 2 interactions are accepted; deeper editing/shortcut breadth validation remains. |
| Visual parity | Repair Accepted | Arrangement visual parity defects are accepted; full cross-domain visual audit remains. |

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
3. Wave 3 accepted:
   - `DEF-R1-008`
   - `DEF-R1-009`
4. Current wave:
   - mixer
   - browser/devices
   - automation
   - shortcuts/editing
