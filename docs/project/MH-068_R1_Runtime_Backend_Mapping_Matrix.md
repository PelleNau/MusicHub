# MH-068 R1 Runtime Backend Mapping Matrix

## Purpose

This matrix maps canonical `R1` requirements to actual runtime/backend ownership and feasibility.

It exists to enforce the rule:

- runtime truth governs `R1` feasibility

## Status Values

- `Supported`
- `Partially supported`
- `Not supported`
- `Deferred`

## Runtime / Backend Mapping

| Requirement ID | Runtime Owner | Backend / Runtime Dependency | Current Support | Notes |
| --- | --- | --- | --- | --- |
| `SHL-001` | `ui-integration` + `platform` | route authority in `App.tsx`, Studio route composition | Partially supported | Product route exists, but baseline surface normalization is incomplete. |
| `SHL-002` | `ui-integration` + `platform` | workspace route normalization | Partially supported | Route exists, but legacy/redirect behavior still requires decisioned integration. |
| `SHL-003` | `ui-integration` + `runtime` | mode model, `useStudioModeModel`, route state | Partially supported | Modes exist, but product-route behavior requires validation. |
| `TRN-001` | `runtime` | `useStudioTransportBarModel`, `useStudioRuntime`, transport state | Partially supported | Controls render; end-to-end behavior must be validated. |
| `TRN-002` | `runtime` + `ui-integration` | arrangement overlay/render stack | Partially supported | Visibility can regress through layout composition. |
| `TRN-003` | `runtime` | arrangement interaction runtime | Not supported | Known active defect. |
| `TRN-004` | `runtime` | ruler interaction runtime | Not supported | Known active defect. |
| `ARR-001` | `ui-integration` | timeline/track viewport composition | Not supported | Structural blocker. |
| `ARR-002` | `ui-alignment` + `ui-integration` | toolbar/ruler composition | Not supported | Visual/layout blocker. |
| `ARR-003` | `ui-alignment` + `ui-integration` | canvas/grid/lane rendering | Not supported | Visual/layout blocker. |
| `ARR-004` | `runtime` | clip edit actions, interaction runtime | Not supported | Known active defect. |
| `ARR-005` | `runtime` | track-head interaction/context-menu model | Not supported | Known active defect. |
| `ARR-006` | `runtime` | command dispatch + studio runtime behaviors | Partially supported | Some clip actions exist; route-level behavior still needs revalidation. |
| `PRL-001` | `figmafunktioner` + `ui-integration` | piano-roll surface composition | Partially supported | Surface exists, but continuity is not yet approved. |
| `PRL-002` | `figmafunktioner` + `runtime` | piano-roll overlay/playhead model | Partially supported | Requires product-route validation. |
| `PRL-003` | `figmafunktioner` | piano-roll viewport/timeline model | Not supported | Known active defect. |
| `PRL-004` | `figmafunktioner` | piano-roll editing-range model | Not supported | Known active defect. |
| `PRL-005` | `runtime` + `figmafunktioner` | note-editing hooks and note replacement pipeline | Partially supported | Must be proven on product route. |
| `PRL-006` | `figmafunktioner` | route wiring of imported affordances into live runtime seams | Not supported | Imported/reference components do not count until wired to product route. |
| `MIX-001` | `ui-integration` + `ui-alignment` | mixer route composition | Partially supported | Baseline visual/product integration still unproven. |
| `MIX-002` | `runtime` + `ui-alignment` | channel controls, meters, control state | Partially supported | Some controls exist; whole baseline not validated. |
| `MIX-003` | `persistence` + `plugins` + `runtime` | advanced routing/device-chain/system support | Deferred | Outside default `R1`. |
| `BRW-001` | `ui-integration` | browser panel composition | Partially supported | Must be validated on `/studio/workspace`. |
| `BRW-002` | `persistence` + `runtime` | tag/favorites/library completeness | Deferred | Outside default `R1`. |
| `AUT-001` | `runtime` | automation lane model + product-route presence | Partially supported | Basic baseline must be validated; full depth not required. |
| `AUT-002` | `runtime` | shaping/curve semantics | Deferred | Outside default `R1`. |
| `EDT-001` | `runtime` | tool dispatch + edit interactions | Partially supported | Core edit contract still failing in places. |
| `EDT-002` | `runtime` | shortcut hooks + command dispatch | Partially supported | Requires direct validation on product route. |
| `VIS-001` | `ui-alignment` | CSS variables, design tokens, shared shell styling | Partially supported | Visual language exists, but parity is not yet approved. |
| `VIS-002` | `ui-alignment` + `ui-integration` | arrangement surface styling | Not supported | Active layout/parity failures. |
| `VIS-003` | `ui-alignment` + `figmafunktioner` | piano-roll surface styling | Partially supported | Requires route-level parity validation. |

## Runtime Truth Rule

If current support is `Not supported`, the requirement cannot be claimed as implemented in `R1`.

It must instead be:

- repaired and revalidated, or
- explicitly deferred

## Approval Condition

This matrix is approved when:

1. every canonical requirement has an owner and dependency mapping
2. every unsupported requirement is either represented in `MH-063` or deferred in `MH-066`
