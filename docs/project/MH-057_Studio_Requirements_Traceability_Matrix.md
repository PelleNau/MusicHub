# MH-057 Studio Requirements Traceability Matrix

## Purpose

This matrix ties approved Studio requirements to:

- canonical specification
- implementation surface
- validation method
- current status
- linked defects

This document must be read together with:

- `MH-066_R1_Canonical_Studio_Baseline_Spec.md`
- `MH-068_R1_Runtime_Backend_Mapping_Matrix.md`
- `MH-069_R1_UI_Component_CSS_Mapping_Matrix.md`
- `MH-070_R1_Validation_Mapping_Register.md`

Decision status values:

- `In R1 and supported`
- `In R1 but failing`
- `Out of R1 / Deferred`
- `Not applicable`

## Traceability Matrix

| Requirement ID | Domain | Requirement | Expected Behavior | Canonical Source | Implementation Surface | Validation Method | Status | Defect / Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SHL-001 | Shell | `/studio` is the primary Studio entry | New Studio interface is the default Studio route | `MH-066` | `src/pages/Studio.tsx` and routing config | Interactive manual test | In R1 but failing |  |
| SHL-002 | Shell | `/studio/workspace` resolves to approved workspace surface | Workspace route matches approved baseline composition | `MH-066` | `src/pages/Studio.tsx` | Interactive manual test | In R1 but failing |  |
| SHL-003 | Shell | Guided/Standard/Focused modes are real states | Mode changes alter chrome and density without breaking editing | `MH-066` | mode model and Studio route state | Interactive manual test | In R1 but failing |  |
| TRN-001 | Transport | Transport controls are visible and coherent | Play, stop, record, loop, tempo, time signature, and position are present and legible | `MH-066` | `src/components/studio/TransportBar.tsx` | Visual inspection | In R1 but failing |  |
| TRN-002 | Transport | Playhead is fully visible | Playhead line and marker are not hidden behind layers | `MH-066` | `drawPlayhead.ts`, `TimelineCanvas.tsx` | Interactive manual test | In R1 but failing |  |
| TRN-003 | Transport | Playhead dragging works | User can reposition playhead by dragging | `MH-066` | arrangement interaction model | Interactive manual test | In R1 but failing | `DEF-R1-004` |
| TRN-004 | Transport | Ruler double-click seek works | Double-click on ruler moves playhead to clicked location | `MH-066` | ruler interaction model | Interactive manual test | In R1 but failing | `DEF-R1-003` |
| ARR-001 | Arrangement | Single viewport model | No duplicated or detached canvas layers; scroll behavior remains stable | `MH-066` | `TimelineCanvas.tsx`, `TrackLane.tsx` | Interactive manual test | In R1 but failing | `DEF-R1-001` |
| ARR-002 | Arrangement | Header and ruler spacing is correct | Ruler sits directly under toolbar with compact approved geometry | `MH-066` | `StudioArrangementToolbar.tsx`, `timelineMath.ts` | Visual inspection | In R1 but failing | `DEF-R1-008` |
| ARR-003 | Arrangement | Grid treatment is readable | Bar/beat hierarchy and track boundaries remain visible and stable | `MH-066` | `drawGrid.ts`, `TrackLane.tsx` | Visual inspection | In R1 but failing | `DEF-R1-009` |
| ARR-004 | Arrangement | Clip resize behaves correctly | Resizing changes clip bounds and never deletes the clip | `MH-066` | clip interactions | Interactive manual test | In R1 but failing | `DEF-R1-002` |
| ARR-005 | Arrangement | Track-head context menu exists | Right-click on track head opens the documented menu | `MH-066` | track header components | Interactive manual test | In R1 but failing | `DEF-R1-005` |
| PRL-001 | Piano Roll | Keyboard-to-grid continuity | Keyboard rows and grid rows align as one continuous surface | `MH-066` | `PianoRoll.tsx` and keyboard/grid components | Visual inspection | In R1 but failing |  |
| PRL-002 | Piano Roll | Playhead is visible across the piano roll | Playhead spans ruler and note area with strong visibility | `MH-066` | piano-roll overlay model | Interactive manual test | In R1 but failing |  |
| PRL-003 | Piano Roll | Horizontal scroll works beyond initial viewport | User can scroll to later bars than the first visible region | `MH-066` | `PianoRoll.tsx`, interaction hooks | Interactive manual test | In R1 but failing | `DEF-R1-006` |
| PRL-004 | Piano Roll | Editing area can be extended | User can extend editing range/add bars past the visible width | `MH-066` | piano-roll timeline model | Interactive manual test | In R1 but failing | `DEF-R1-007` |
| PRL-005 | Piano Roll | Core note editing works | Add, move, resize, delete, select, and velocity editing work on the real surface | `MH-066` | piano-roll interaction hooks | Interactive manual test | In R1 but failing |  |
| MIX-001 | Mixer | Mixer baseline is integrated into Studio | Mixer surface follows approved visual language and route model | `MH-066` | mixer surface components | Visual inspection | In R1 but failing |  |
| MIX-002 | Mixer | Core controls are present | Volume, pan, mute, solo, arm, and meters are visible where expected | `MH-066` | mixer channel components | Visual inspection | In R1 but failing |  |
| MIX-003 | Mixer | Advanced routing/device-chain completeness is deferred | Mixer baseline does not require full routing/device completeness in `R1` | `MH-066` | N/A | Decision only | Out of R1 / Deferred |  |
| BRW-001 | Browser | Browser baseline is integrated | Search/filter/category UI is visible and coherent | `MH-066` | browser components | Visual inspection | In R1 but failing |  |
| BRW-002 | Browser | Advanced browser/library depth is deferred | Tags/favorites/deep library ecosystem are not required for `R1` | `MH-066` | N/A | Decision only | Out of R1 / Deferred |  |
| AUT-001 | Automation | Automation baseline is integrated where required | Baseline automation presence and approved interactions exist on product routes | `MH-066` | automation components | Interactive manual test | In R1 but failing |  |
| AUT-002 | Automation | Advanced automation shaping depth is deferred | Curves/shaping depth beyond baseline is out of `R1` | `MH-066` | N/A | Decision only | Out of R1 / Deferred |  |
| EDT-001 | Editing | Tool language matches baseline | Pointer, split, trim, fade, glue, eraser remain coherent where baseline expects them | `MH-066` | arrangement and piano-roll tool surfaces | Visual inspection | In R1 but failing |  |
| EDT-002 | Editing | Core shortcuts work | Copy, paste, duplicate, delete, escape, and tool switching behave correctly | `MH-066` | shortcut hooks | Interactive manual test | In R1 but failing |  |
| VIS-001 | Visual | Design system is consistent across Studio | Typography, spacing, color hierarchy, and controls align with approved direction | `MH-066` | core Studio shell and shared components | Visual inspection | In R1 but failing |  |
| VIS-002 | Visual | Arrangement visual parity is close to spec | Header, ruler, grid, clips, track headers, and playhead read as one system | `MH-066` | arrangement surface | Visual inspection | In R1 but failing |  |
| VIS-003 | Visual | Piano-roll visual parity is close to spec | Keyboard, grid, notes, playhead, and feedback match intended design language | `MH-066` | piano-roll surface | Visual inspection | In R1 but failing |  |

## Explicit Deferrals

These items are out of `R1` unless separately approved:

- full plugin-host completeness
- advanced routing/device-chain completeness
- full backend/native maturity beyond what is required for baseline validation
- optional/future DAW features not needed for the Studio baseline
