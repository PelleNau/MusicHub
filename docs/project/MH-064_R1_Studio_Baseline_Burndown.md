# MH-064 R1 Studio Baseline Burndown

## Release Status

- Release: `R1 Studio Baseline`
- Current phase: `Approved`
- Validation branch: `codex/studio-integration-baseline`
- Integration trunk: `codex/figma-capture-mode`

## Gate Status

| Gate | Status | Notes |
| --- | --- | --- |
| Scope gate (`MH-055`, `MH-056`) | Complete | R1 scope and QC charter are in place and now govern execution. |
| Normalization gate (`MH-065`-`MH-070`) | Complete | Canonical spec, contradiction ledger, and mapping matrices are established and active. |
| Validation gate (`MH-057`, `MH-058`) | Complete | Exit validation is complete and all in-scope requirements are now `Pass` or `Deferred` under the normalized R1 contract. |
| Repair gate (`MH-063`) | Complete | The reopened product-route composition blocker `DEF-R1-013` is resolved and all mapped R1 repair defects are closed. |
| Exit gate (`MH-060`) | Approved | `R1 Studio Baseline` satisfies the documented exit criteria. |

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
| Piano roll | Approved | Exit validation confirms `/studio/workspace` mounts the piano-roll/editor surface and the baseline piano-roll contract is present on the product route. |
| Mixer | Repair Accepted | Wave 5 restored the mixer baseline routing on `/studio` and `/studio/workspace`. |
| Browser | Repair Accepted | Wave 5 restored the browser baseline on the product workspace route. |
| Automation | Repair Accepted | Wave 5c validated automation baseline presence on `/studio/workspace`. |
| Editing and shortcuts | Approved | Exit validation confirms the editor-presence contract and baseline editing affordances are present on the product route. |
| Visual parity | Approved | Arrangement and piano-roll baseline parity are accepted for `R1` on the product routes. |

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
6. Final exit validation closure:
   - `DEF-R1-013`
7. Next phase:
   - release handoff
   - post-R1 planning against approved deviations and deferred scope
