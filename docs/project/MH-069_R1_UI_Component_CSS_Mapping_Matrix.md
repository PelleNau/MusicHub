# MH-069 R1 UI Component CSS Mapping Matrix

## Purpose

This matrix maps canonical `R1` requirements to the actual product-route UI surfaces that count toward acceptance.

Rule:

- UI-only existence in preview/imported/reference surfaces does not count as implementation.

## Surface Status Values

- `Product route`
- `Preview only`
- `Imported reference only`
- `Shared styling only`
- `Missing from product route`

## UI / Component / CSS Mapping

| Requirement ID | Product Route(s) | Component Surface | Styling Surface | Current Surface Status | Notes |
| --- | --- | --- | --- | --- | --- |
| `SHL-001` | `/studio` | `src/pages/StudioAreaRoute.tsx`, `src/pages/Studio.tsx`, `src/App.tsx` | shared Studio shell styles + token variables | Product route | Authority exists, but baseline surface still needs full normalization. |
| `SHL-002` | `/studio/workspace` | `src/App.tsx`, `src/pages/Studio.tsx` | same as above | Product route | Must resolve to approved baseline, not legacy fallback behavior. |
| `SHL-003` | `/studio`, `/studio/workspace` | `src/hooks/useStudioModeModel.ts`, Studio shell components | mode-aware shell styling | Product route | Must be validated on product route only. |
| `TRN-001` | `/studio`, `/studio/workspace` | `src/components/studio/TransportBar.tsx` | shared shell tokens in `src/index.css` | Product route | Transport surface is real product UI. |
| `TRN-002` | `/studio/workspace` | arrangement overlay stack, `TimelineCanvas.tsx` | timeline/playhead tokens | Product route | Rendering can be structurally wrong even when styled. |
| `TRN-003` | `/studio/workspace` | playhead interaction layer | timeline/playhead tokens | Product route | Behavior failing on product route. |
| `TRN-004` | `/studio/workspace` | ruler interaction layer | ruler/timeline styling | Product route | Behavior failing on product route. |
| `ARR-001` | `/studio/workspace` | `StudioArrangementWorkspace.tsx`, `TimelineCanvas.tsx`, `TrackLane.tsx` | timeline/grid/track tokens | Product route | Primary arrangement baseline surface. |
| `ARR-002` | `/studio/workspace` | `StudioArrangementToolbar.tsx`, ruler components | spacing, ruler height, toolbar tokens | Product route | Geometry currently unstable. |
| `ARR-003` | `/studio/workspace` | canvas/grid and lane boundaries | timeline/grid/track tokens | Product route | Must be judged on actual product route. |
| `ARR-004` | `/studio/workspace` | clip interaction surfaces | clip styling secondary only | Product route | Visual component presence does not prove behavior. |
| `ARR-005` | `/studio/workspace` | track header / head components | track-header tokens | Missing from product route | No context menu currently available on the product surface. |
| `ARR-006` | `/studio/workspace` | clip-related product components, not imported Figma references | clip tokens, waveform/MIDI preview styles | Product route | Must stay on real components, not `imported/*` stand-ins. |
| `PRL-001` | `/studio/workspace` | `src/components/studio/PianoRoll.tsx` and live piano-roll subcomponents | piano-roll tokens in `src/index.css` | Product route | Product route counts; design pages do not. |
| `PRL-002` | `/studio/workspace` | live piano-roll overlay layer | playhead/timeline tokens | Product route | Must validate on product route. |
| `PRL-003` | `/studio/workspace` | live piano-roll viewport | piano-roll grid styles | Product route | Known product-route failure. |
| `PRL-004` | `/studio/workspace` | live piano-roll timeline/range model | piano-roll grid styles | Product route | Known product-route failure. |
| `PRL-005` | `/studio/workspace` | live note-editing UI | note/velocity styling | Product route | Real behavior only counts on product route. |
| `PRL-006` | `/studio/workspace` | imported Figma piano-roll tools vs live toolchain | imported components use tokens but are reference until wired | Imported reference only | Imported/reference surfaces do not count yet. |
| `MIX-001` | `/studio`, `/studio/workspace` | mixer product surface components | mixer/surface tokens | Product route | Must be validated on actual baseline route. |
| `MIX-002` | `/studio`, `/studio/workspace` | live controls vs imported DS-style references | mixer tokens + shared controls | Product route | Figma references can inform styling, not prove implementation. |
| `BRW-001` | `/studio/workspace` | browser panel components | browser/surface tokens | Product route | Product panel counts; showcase/reference docs do not. |
| `AUT-001` | `/studio/workspace` | live automation lane components | automation/timeline tokens | Product route | If only reference lane exists, requirement is not met. |
| `EDT-001` | `/studio/workspace` | toolbars, menus, and live edit surfaces | shared tool/button styling | Product route | Tool styling is insufficient without behavior on product route. |
| `EDT-002` | `/studio/workspace` | shortcut-enabled live surfaces | N/A | Product route | Shortcut behavior validated only on real route. |
| `VIS-001` | `/studio`, `/studio/workspace` | complete Studio shell | `src/index.css` CSS variables and shared styles | Shared styling only | Tokens exist, but parity requires route-level validation. |
| `VIS-002` | `/studio/workspace` | arrangement surface | timeline/grid/track/clip styling | Product route | Current parity is not approved. |
| `VIS-003` | `/studio/workspace` | piano-roll surface | keyboard/grid/note/velocity styling | Product route | Current parity is not approved. |

## Non-Counting Surfaces

The following do not count toward `R1` acceptance by themselves:

- `src/pages/design/*`
- `src/pages/DesignStudio.tsx`
- `src/components/studio/imported/*`
- any capture-only or showcase-only route

They may inform intent, but they are not acceptance surfaces.

## Approval Condition

This matrix is approved when:

1. every canonical requirement is mapped to a counting or non-counting surface
2. preview/import/reference-only surfaces are explicitly excluded from being mistaken for implementation
