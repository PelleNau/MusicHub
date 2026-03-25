# MH-070 R1 Validation Mapping Register

## Purpose

This register ties the normalized canonical spec to the active validation set.

Every `R1` requirement must map to:

- a canonical requirement ID
- one or more test IDs
- an evidence type
- a current validation state

## Validation State Values

- `Pass`
- `Fail`
- `Deferred`
- `Blocked`
- `Not run`

## Validation Mapping

| Requirement ID | Test ID(s) | Evidence Type | Validation State | Defect ID(s) / Notes |
| --- | --- | --- | --- | --- |
| `SHL-001` | `ST-001` | screenshot | Pass | source and route validation confirm `/studio` resolves through the normalized Studio shell |
| `SHL-002` | `ST-002` | screenshot | Pass | source and route validation confirm `/studio/workspace` resolves through the normalized Studio shell |
| `SHL-003` | `ST-003` | screenshot + short video | Pass | guided/standard/focused remain modes of one Studio shell rather than separate route families |
| `TRN-001` | `ST-010` | screenshot | Pass | transport bar is present on the product routes and was reconfirmed during exit validation |
| `TRN-002` | `ST-021` | screenshot | Pass | ruler/playhead rendering remains present on the product route |
| `TRN-003` | `ST-012` | short video | Pass | validated on the product route during Wave 2 repair acceptance |
| `TRN-004` | `ST-011` | short video or before/after screenshots | Pass | validated on the product route during Wave 2 repair acceptance |
| `ARR-001` | `ST-020` | short video | Pass | validated on the normalized Studio product route during Wave 1 acceptance |
| `ARR-002` | `ST-021` | screenshot | Pass | compact arrangement header/ruler geometry restored during Wave 3 acceptance |
| `ARR-003` | `ST-020`, `ST-021` | screenshot + short video | Pass | arrangement grid and lane boundary parity restored during Wave 3 acceptance |
| `ARR-004` | `ST-022` | short video | Pass | validated on the product route during Wave 2 repair acceptance |
| `ARR-005` | `ST-023` | screenshot | Pass | validated on the product route during Wave 2 repair acceptance |
| `ARR-006` | `ST-024` | short video + console check | Pass | code inspection and product-route validation confirmed live runtime-backed clip actions on `/studio/workspace`. |
| `PRL-001` | `ST-030` | screenshot | Pass | exit validation confirms `/studio/workspace` now mounts the piano-roll/editor surface on the product route |
| `PRL-002` | `ST-034` | screenshot | Pass | once the product route composition was corrected, the existing piano-roll surface and grid/playhead continuity became valid on `/studio/workspace` again |
| `PRL-003` | `ST-031` | short video | Pass | validated at the product-route model layer during Wave 1 acceptance |
| `PRL-004` | `ST-032` | short video | Pass | validated at the product-route model layer during Wave 1 acceptance |
| `PRL-005` | `ST-033` | short video | Pass | exit validation confirms note-editing is reachable again because `/studio/workspace` mounts the piano-roll/editor surface |
| `PRL-006` | `ST-035` | code inspection + route screenshot | Pass | code inspection confirmed the product route mounts live `PianoRoll` wiring rather than preview-only imported affordances. |
| `MIX-001` | `ST-040` | screenshot | Pass | validated during Wave 5 UI acceptance by restoring mixer-first baseline routing on the product Studio routes |
| `MIX-002` | `ST-041` | screenshot + short video | Pass | validated during Wave 5 UI acceptance by restoring coherent mixer baseline controls on the product Studio routes |
| `MIX-003` | N/A | N/A | Deferred | Out of `R1`. |
| `BRW-001` | `ST-050` | screenshot | Pass | validated during Wave 5 UI acceptance by exposing the browser panel on `/studio/workspace` through the real arrangement workspace surface |
| `BRW-002` | N/A | N/A | Deferred | Out of `R1`. |
| `AUT-001` | `ST-060` | screenshot + short video | Pass | validated during Wave 5c runtime acceptance by proving visible automation lane presence on `/studio/workspace` |
| `AUT-002` | N/A | N/A | Deferred | Out of `R1`. |
| `EDT-001` | `ST-070` | short video | Pass | exit validation confirms the product route mounts the required editor surface on `/studio/workspace` |
| `EDT-002` | `ST-071` | short video or key-event recording | Pass | validated during Wave 5 runtime acceptance for duplicate and escape shortcut handling on the product routes |
| `VIS-001` | `ST-080` | screenshot set | Pass | exit validation confirms the workspace remains a coherent dark Studio shell despite the reopened piano-roll/editor issue |
| `VIS-002` | `ST-021`, `ST-081` | screenshot set | Pass | arrangement visual parity accepted on the product route during Wave 3 repair review |
| `VIS-003` | `ST-030`, `ST-082` | screenshot set | Pass | exit validation confirms the piano-roll surface is present again on the product route and the baseline piano-roll visual treatment is available for `R1` acceptance |

## Immediate Validation Batch

This batch remains the first execution target after normalization is approved:

- `ST-001`, `ST-002`
- `ST-010`, `ST-011`, `ST-012`
- `ST-020`, `ST-021`, `ST-022`, `ST-023`
- `ST-030`, `ST-031`, `ST-032`, `ST-033`

## Approval Condition

This register is approved when:

1. every canonical requirement has a validation mapping or explicit deferral
2. missing tests are identified before repair work resumes
