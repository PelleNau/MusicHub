# MH-066 R1 Canonical Studio Baseline Spec

## Purpose

This document is the canonical Studio baseline spec for `R1`.

It replaces raw-corpus interpretation with one normalized requirement set for:

- `/studio`
- `/studio/workspace`

Only requirements in this document count toward `R1 Studio Baseline` acceptance.

## Normalization Rules

1. Runtime truth governs `R1` feasibility.
2. Figma/export intent remains the desired target.
3. Preview-only or imported/reference-only surfaces do not count as implementation.
4. A requirement unsupported by current runtime/backend is classified as:
   - `Blocker` if required in `R1`
   - `Deferred` if outside approved `R1` scope

## Canonical Requirement Status Values

- `In R1 and supported`
- `In R1 but failing`
- `Out of R1 / Deferred`
- `Not applicable`

## Canonical R1 Requirement Set

### Shell And Route Authority

| Requirement ID | Canonical Requirement | Product Routes | Current Decision |
| --- | --- | --- | --- |
| `SHL-001` | `/studio` is the primary Studio route and must open the approved Studio baseline, not a preview or legacy shell. | `/studio` | In R1 but failing |
| `SHL-002` | `/studio/workspace` is part of the same product baseline and must resolve to the approved Studio surface, not to an isolated legacy shell. | `/studio/workspace` | In R1 but failing |
| `SHL-003` | Studio modes are real product states of the same Studio, not separate applications. | `/studio`, `/studio/workspace` | In R1 but failing |

### Transport And Playhead

| Requirement ID | Canonical Requirement | Product Routes | Current Decision |
| --- | --- | --- | --- |
| `TRN-001` | Transport controls are present, legible, and coherent on the product Studio surface. | `/studio`, `/studio/workspace` | In R1 but failing |
| `TRN-002` | Playhead is visually continuous and visible across the arrangement surface. | `/studio`, `/studio/workspace` | In R1 but failing |
| `TRN-003` | Dragging the playhead repositions playback on the product Studio surface. | `/studio/workspace` | In R1 but failing |
| `TRN-004` | Double-clicking the arrangement ruler seeks the playhead to the clicked position. | `/studio/workspace` | In R1 but failing |

### Arrangement

| Requirement ID | Canonical Requirement | Product Routes | Current Decision |
| --- | --- | --- | --- |
| `ARR-001` | Arrangement must render as one coherent viewport with synchronized ruler, grid, clips, headers, and scrolling behavior. | `/studio/workspace` | In R1 but failing |
| `ARR-002` | Arrangement header/ruler geometry must match the compact approved layout. | `/studio/workspace` | In R1 but failing |
| `ARR-003` | Grid hierarchy and lane boundaries must remain stable and readable. | `/studio/workspace` | In R1 but failing |
| `ARR-004` | Clip resize must modify bounds without deleting or corrupting clips. | `/studio/workspace` | In R1 but failing |
| `ARR-005` | Track-head context menu must exist on the product surface. | `/studio/workspace` | In R1 but failing |
| `ARR-006` | Core arrangement clip operations must route through real runtime behavior, not preview-only handlers. | `/studio/workspace` | In R1 but failing |

### Piano Roll

| Requirement ID | Canonical Requirement | Product Routes | Current Decision |
| --- | --- | --- | --- |
| `PRL-001` | Piano keyboard and note grid must behave as one continuous editing surface. | `/studio/workspace` | In R1 but failing |
| `PRL-002` | Piano-roll playhead must be visible and coherent on the product surface. | `/studio/workspace` | In R1 but failing |
| `PRL-003` | Piano roll must scroll horizontally beyond the initially visible range. | `/studio/workspace` | In R1 but failing |
| `PRL-004` | Piano roll must support extending the editing range beyond the initial screen width. | `/studio/workspace` | In R1 but failing |
| `PRL-005` | Core note editing must function on the real product route. | `/studio/workspace` | In R1 but failing |
| `PRL-006` | Figma-derived piano-roll tool affordances count only if they are wired into the product route, not if they exist only in imported/reference form. | `/studio/workspace` | In R1 but failing |

### Mixer Baseline

| Requirement ID | Canonical Requirement | Product Routes | Current Decision |
| --- | --- | --- | --- |
| `MIX-001` | A mixer baseline must exist inside the product Studio surface. | `/studio`, `/studio/workspace` | In R1 but failing |
| `MIX-002` | Core mixer controls must be present and visually coherent. | `/studio`, `/studio/workspace` | In R1 but failing |
| `MIX-003` | Advanced routing/device-chain completeness is not required for `R1` unless it blocks baseline approval. | N/A | Out of R1 / Deferred |

### Browser Baseline

| Requirement ID | Canonical Requirement | Product Routes | Current Decision |
| --- | --- | --- | --- |
| `BRW-001` | Browser/library panel must be present and coherent on the product surface. | `/studio/workspace` | In R1 but failing |
| `BRW-002` | Advanced tagging, favorites, and library completeness are deferred unless required to unblock the baseline. | N/A | Out of R1 / Deferred |

### Automation Baseline

| Requirement ID | Canonical Requirement | Product Routes | Current Decision |
| --- | --- | --- | --- |
| `AUT-001` | Automation presence and approved baseline lane behavior must be product-routable if included in the baseline. | `/studio/workspace` | In R1 but failing |
| `AUT-002` | Advanced shaping/curve depth beyond baseline visibility and basic editing is deferred. | N/A | Out of R1 / Deferred |

### Editing And Shortcuts

| Requirement ID | Canonical Requirement | Product Routes | Current Decision |
| --- | --- | --- | --- |
| `EDT-001` | Tool affordances must map to real product interactions, not preview-only surfaces. | `/studio/workspace` | In R1 but failing |
| `EDT-002` | Core editing shortcuts must function on product routes. | `/studio/workspace` | In R1 but failing |

### Visual Parity

| Requirement ID | Canonical Requirement | Product Routes | Current Decision |
| --- | --- | --- | --- |
| `VIS-001` | The baseline must follow the approved dark design-system language across core Studio surfaces. | `/studio`, `/studio/workspace` | In R1 but failing |
| `VIS-002` | Arrangement visual parity must be close enough to spec that geometry, hierarchy, and readability are clearly deliberate. | `/studio/workspace` | In R1 but failing |
| `VIS-003` | Piano-roll visual parity must be close enough to spec that its editing surface reads as an intentional product surface. | `/studio/workspace` | In R1 but failing |

## Explicit R1 Deferrals

These do not count toward `R1 Studio Baseline` unless separately approved:

- plugin-host completeness
- advanced routing/device-chain completeness
- full backend/native parity beyond Studio baseline validation needs
- deep browser/library ecosystem features
- advanced automation shaping and fade-curve depth
- broader learning/product-surface expansion beyond Studio baseline scope

## Approval Condition

This spec is approved when:

1. the canonical requirement list is accepted as the only `R1` requirement set
2. the requirement decisions are accepted
3. all future repair work is required to map to these IDs
