# MH-064 R1 Studio Baseline Burndown

## Release Status

- Release: `R1 Studio Baseline`
- Current phase: `Repair Reopened`
- Validation branch: `codex/studio-integration-baseline`
- Integration trunk: `codex/figma-capture-mode`

## Gate Status

| Gate | Status | Notes |
| --- | --- | --- |
| Scope gate (`MH-055`, `MH-056`) | Complete | R1 scope and QC charter are in place and now govern execution. |
| Normalization gate (`MH-065`-`MH-070`) | Complete | Canonical spec, contradiction ledger, and mapping matrices are established and active. |
| Validation gate (`MH-057`, `MH-058`) | Active | Exit validation is now running against the normalized R1 contract and has reopened one blocker on the product route. |
| Repair gate (`MH-063`) | Reopened | Exit validation reopened `DEF-R1-013` because the piano-roll/editor surface is still not mounted on `/studio/workspace`. |
| Exit gate (`MH-060`) | Blocked | R1 cannot exit until the reopened product-route composition blocker is resolved and revalidated. |

## Defect Counts

| Severity | Count |
| --- | --- |
| Blocker | 1 |
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
| Piano roll | Blocked | Exit validation shows `/studio/workspace` is not mounting the piano-roll/editor surface, so core piano-roll presence and note-edit reachability are still failing on the product route. |
| Mixer | Repair Accepted | Wave 5 restored the mixer baseline routing on `/studio` and `/studio/workspace`. |
| Browser | Repair Accepted | Wave 5 restored the browser baseline on the product workspace route. |
| Automation | Repair Accepted | Wave 5c validated automation baseline presence on `/studio/workspace`. |
| Editing and shortcuts | Reopened | Shortcut handling remains accepted, but the editor-presence contract is reopened because the product route still forces the mixer baseline instead of the piano-roll/editor surface. |
| Visual parity | Reopened | Arrangement parity remains accepted, but piano-roll visual parity is blocked until the editor surface is mounted on `/studio/workspace`. |

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
6. Exit validation reopen:
   - `DEF-R1-013`
7. Next phase:
   - runtime correction for product-route piano-roll/editor mounting
   - targeted revalidation of `ST-030`, `ST-033`, `ST-034`, `ST-070`, and `ST-082`
