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
| DEF-R1-001 | `ARR-001` | `ST-020` | Blocker | structural/layout | `/studio/workspace` | `ui-integration` | Closed | Arrangement surface now resolves through one coherent Studio composition and no longer presents detached or duplicated viewport behavior. |
| DEF-R1-002 | `ARR-004` | `ST-022` | Blocker | interaction | `/studio/workspace` | `runtime` | Closed | Arrangement clip resize now updates clip bounds on the live route without deleting the clip. |
| DEF-R1-003 | `TRN-004` | `ST-011` | Major | interaction | `/studio/workspace` | `runtime` | Closed | Ruler seek is restored on the product route, including double-clicking to move the playhead. |
| DEF-R1-004 | `TRN-003` | `ST-012` | Major | interaction | `/studio/workspace` | `runtime` | Closed | Playhead dragging is restored on the product route. |
| DEF-R1-005 | `ARR-005` | `ST-023` | Major | interaction | `/studio/workspace` | `runtime` | Closed | Track-head context menu now renders on the product route. |
| DEF-R1-006 | `PRL-003` | `ST-031` | Blocker | interaction | `/studio/workspace` | `figmafunktioner` | Closed | Piano roll can now scroll beyond the initial visible range. |
| DEF-R1-007 | `PRL-004` | `ST-032` | Blocker | interaction | `/studio/workspace` | `figmafunktioner` | Closed | Piano roll can now extend the editing area beyond the initial visible width. |
| DEF-R1-008 | `ARR-002`, `VIS-002` | `ST-021` | Major | visual parity | `/studio/workspace` | `ui-integration` | Closed | Arrangement header and ruler geometry are restored to the compact product layout on the accepted Studio route. |
| DEF-R1-009 | `ARR-003` | `ST-020`, `ST-021` | Major | visual parity | `/studio/workspace` | `ui-integration` | Closed | Arrangement grid treatment and lane boundaries are now stable and readable on the product route. |
| DEF-R1-010 | `MIX-001`, `MIX-002` | `ST-040`, `ST-041` | Major | baseline breadth | `/studio`, `/studio/workspace` | `ui-integration` | Closed | Mixer baseline routing is restored on the product Studio routes and the workspace now opens the approved mixer-first baseline state. |
| DEF-R1-011 | `BRW-001` | `ST-050` | Major | baseline breadth | `/studio/workspace` | `ui-integration` | Closed | Browser/library baseline is restored on the product workspace route via the real arrangement workspace surface. |
| DEF-R1-012 | `AUT-001` | `ST-060` | Major | baseline breadth | `/studio/workspace` | `runtime` | Open | Automation baseline presence and approved lane behavior are not product-routable on the Studio workspace route. |
| DEF-R1-013 | `EDT-001` | `ST-070` | Major | editing contract | `/studio`, `/studio/workspace` | `runtime` | Closed | Product routes now restore the expected editor presence and tool/edit affordance contract needed for baseline editing. |
| DEF-R1-014 | `EDT-002` | `ST-071` | Major | editing contract | `/studio`, `/studio/workspace` | `runtime` | Closed | Core baseline editing shortcuts are now wired on the product routes for duplicate and escape-driven selection clearing. |

## Recording Rules

- new defects must be added here before repair begins
- new defects must reference the normalized requirement set from `MH-066`
- status changes must be reflected here after triage and revalidation
- closed defects remain in the ledger with final status rather than being deleted
