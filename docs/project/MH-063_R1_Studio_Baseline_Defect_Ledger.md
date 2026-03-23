# MH-063 R1 Studio Baseline Defect Ledger

## Purpose

This is the master defect ledger for `R1 Studio Baseline`.

Every active release defect must map to:

- one or more `MH-057` requirement IDs
- one or more `MH-058` test IDs where applicable
- one or more contradiction or normalization decisions from `MH-067` where applicable
- one owning stream

## Active Defects

| Defect ID | Requirement IDs | Test IDs | Severity | Type | Route | Owner | Status | Summary |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| DEF-R1-001 | `ARR-001` | `ST-020` | Blocker | structural/layout | `/studio/workspace` | `ui-integration` | Open | Arrangement surface shows detached or duplicated viewport behavior. |
| DEF-R1-002 | `ARR-004` | `ST-022` | Blocker | interaction | `/studio/workspace` | `runtime` | Open | Resizing arrangement clips can delete the clip instead of resizing it. |
| DEF-R1-003 | `TRN-004` | `ST-011` | Major | interaction | `/studio/workspace` | `runtime` | Open | Double-clicking the ruler does not move the playhead. |
| DEF-R1-004 | `TRN-003` | `ST-012` | Major | interaction | `/studio/workspace` | `runtime` | Open | Dragging the playhead does not work. |
| DEF-R1-005 | `ARR-005` | `ST-023` | Major | interaction | `/studio/workspace` | `runtime` | Open | Right-click track-head context menu is missing. |
| DEF-R1-006 | `PRL-003` | `ST-031` | Blocker | interaction | `/studio/workspace` | `figmafunktioner` | Open | Piano roll cannot scroll beyond the initial visible range. |
| DEF-R1-007 | `PRL-004` | `ST-032` | Blocker | interaction | `/studio/workspace` | `figmafunktioner` | Open | Piano roll cannot extend the editing area beyond the visible width. |
| DEF-R1-008 | `ARR-002`, `VIS-002` | `ST-021` | Major | visual parity | `/studio/workspace` | `ui-alignment` | Open | Arrangement header and ruler geometry do not match the approved compact layout. |
| DEF-R1-009 | `ARR-003` | `ST-020`, `ST-021` | Major | visual parity | `/studio/workspace` | `ui-alignment` | Open | Arrangement grid treatment and lane boundaries are unstable or visually incoherent. |

## Recording Rules

- new defects must be added here before repair begins
- new defects must reference the normalized requirement set from `MH-066`
- status changes must be reflected here after triage and revalidation
- closed defects remain in the ledger with final status rather than being deleted
