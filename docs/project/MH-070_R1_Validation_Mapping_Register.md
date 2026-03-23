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
| `SHL-001` | `ST-001` | screenshot | Not run |  |
| `SHL-002` | `ST-002` | screenshot | Not run |  |
| `SHL-003` | `ST-003` | screenshot + short video | Not run | New test required in `MH-058`. |
| `TRN-001` | `ST-010` | screenshot | Not run |  |
| `TRN-002` | `ST-021` | screenshot | Not run | also affected by `DEF-R1-001`, `DEF-R1-009` |
| `TRN-003` | `ST-012` | short video | Fail | `DEF-R1-004` |
| `TRN-004` | `ST-011` | short video or before/after screenshots | Fail | `DEF-R1-003` |
| `ARR-001` | `ST-020` | short video | Fail | `DEF-R1-001` |
| `ARR-002` | `ST-021` | screenshot | Fail | `DEF-R1-008` |
| `ARR-003` | `ST-020`, `ST-021` | screenshot + short video | Fail | `DEF-R1-009` |
| `ARR-004` | `ST-022` | short video | Fail | `DEF-R1-002` |
| `ARR-005` | `ST-023` | screenshot | Fail | `DEF-R1-005` |
| `ARR-006` | `ST-024` | short video + console check | Not run | New test required in `MH-058`. |
| `PRL-001` | `ST-030` | screenshot | Not run |  |
| `PRL-002` | `ST-034` | screenshot | Not run | New test required in `MH-058`. |
| `PRL-003` | `ST-031` | short video | Fail | `DEF-R1-006` |
| `PRL-004` | `ST-032` | short video | Fail | `DEF-R1-007` |
| `PRL-005` | `ST-033` | short video | Not run |  |
| `PRL-006` | `ST-035` | code inspection + route screenshot | Not run | New validation needed to prove imported Figma affordances are product-wired. |
| `MIX-001` | `ST-040` | screenshot | Not run | New test required in `MH-058`. |
| `MIX-002` | `ST-041` | screenshot + short video | Not run | New test required in `MH-058`. |
| `MIX-003` | N/A | N/A | Deferred | Out of `R1`. |
| `BRW-001` | `ST-050` | screenshot | Not run | New test required in `MH-058`. |
| `BRW-002` | N/A | N/A | Deferred | Out of `R1`. |
| `AUT-001` | `ST-060` | screenshot + short video | Not run | New test required in `MH-058`. |
| `AUT-002` | N/A | N/A | Deferred | Out of `R1`. |
| `EDT-001` | `ST-070` | short video | Not run | New cross-surface edit-contract test required. |
| `EDT-002` | `ST-071` | short video or key-event recording | Not run | New shortcut validation required. |
| `VIS-001` | `ST-080` | screenshot set | Not run | New visual audit test required. |
| `VIS-002` | `ST-021`, `ST-081` | screenshot set | Not run | `ST-081` must be added for arrangement parity sweep. |
| `VIS-003` | `ST-030`, `ST-082` | screenshot set | Not run | `ST-082` must be added for piano-roll parity sweep. |

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
