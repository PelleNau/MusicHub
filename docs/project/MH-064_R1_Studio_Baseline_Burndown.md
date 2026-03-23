# MH-064 R1 Studio Baseline Burndown

## Release Status

- Release: `R1 Studio Baseline`
- Current phase: `Exit Validation`
- Validation branch: `codex/studio-integration-baseline`
- Integration trunk: `codex/figma-capture-mode`

## Gate Status

| Gate | Status | Notes |
| --- | --- | --- |
| Scope gate (`MH-055`, `MH-056`) | Complete | R1 scope and QC charter are in place and now govern execution. |
| Normalization gate (`MH-065`-`MH-070`) | Complete | Canonical spec, contradiction ledger, and mapping matrices are established and active. |
| Validation gate (`MH-057`, `MH-058`) | Active | Validation is now running against the normalized R1 contract. |
| Repair gate (`MH-063`) | Complete | Waves 1 through 5 are accepted and all mapped R1 repair defects are now closed. |
| Exit gate (`MH-060`) | Active | Defect repair is complete; final exit validation and approval remain. |

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
| Mixer | Repair Accepted | Wave 5 restored the mixer baseline routing on `/studio` and `/studio/workspace`. |
| Browser | Repair Accepted | Wave 5 restored the browser baseline on the product workspace route. |
| Automation | Repair Accepted | Wave 5c validated automation baseline presence on `/studio/workspace`. |
| Editing and shortcuts | Repair Accepted | Wave 5 restored editor presence and baseline editing shortcuts on the product routes. |
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
4. Wave 4 breadth-validation failures:
   - `DEF-R1-010`
   - `DEF-R1-011`
   - `DEF-R1-012`
   - `DEF-R1-013`
   - `DEF-R1-014`
5. Wave 5 accepted repairs:
   - `DEF-R1-010`
   - `DEF-R1-011`
   - `DEF-R1-012`
   - `DEF-R1-013`
   - `DEF-R1-014`
6. Next phase:
   - final exit validation
   - approval against `MH-060`
