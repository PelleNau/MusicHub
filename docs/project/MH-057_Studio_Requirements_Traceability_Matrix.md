# MH-057 Studio Requirements Traceability Matrix

## Purpose

This matrix ties approved Studio requirements to:

- source specification
- implementation surface
- validation method
- current status
- linked defects

Status values:

- `Not Reviewed`
- `Pass`
- `Fail`
- `Deferred`
- `Blocked`

## Traceability Matrix

| Requirement ID | Domain | Requirement | Expected Behavior | Primary Source | Implementation Surface | Validation Method | Status | Defect / Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| SHL-001 | Shell | `/studio` is the primary Studio entry | New Studio interface is the default Studio route | `MUSICHUB_MANUAL.md`, `MUSICHUB_INTEGRATION_PLAN_REVISED.md` | `src/pages/Studio.tsx` and routing config | Interactive manual test | Not Reviewed |  |
| SHL-002 | Shell | `/studio/workspace` resolves to approved workspace surface | Workspace route matches approved baseline composition | `MH-055`, `MUSICHUB_MANUAL.md` | `src/pages/Studio.tsx` | Interactive manual test | Not Reviewed |  |
| SHL-003 | Shell | Guided/Standard/Focused modes are real states | Mode changes alter chrome and density without breaking editing | `MUSICHUB_MANUAL.md`, `FEATURES_SUMMARY.md` | mode model and Studio route state | Interactive manual test | Not Reviewed |  |
| TRN-001 | Transport | Transport controls are visible and coherent | Play, stop, record, loop, tempo, time signature, and position are present and legible | `MUSICHUB_MANUAL.md` | `src/components/studio/TransportBar.tsx` | Visual inspection | Not Reviewed |  |
| TRN-002 | Transport | Playhead is fully visible | Playhead line and marker are not hidden behind layers | `FEATURES_SUMMARY.md`, `MUSICHUB_MANUAL.md` | `drawPlayhead.ts`, `TimelineCanvas.tsx` | Interactive manual test | Not Reviewed |  |
| TRN-003 | Transport | Playhead dragging works | User can reposition playhead by dragging | `MUSICHUB_MANUAL.md` | arrangement interaction model | Interactive manual test | Fail | `DEF-R1-004` |
| TRN-004 | Transport | Ruler double-click seek works | Double-click on ruler moves playhead to clicked location | `MUSICHUB_MANUAL.md` | ruler interaction model | Interactive manual test | Fail | `DEF-R1-003` |
| ARR-001 | Arrangement | Single viewport model | No duplicated or detached canvas layers; scroll behavior remains stable | `ARRANGEMENT_FEATURES_GUIDE.md`, `FEATURES_SUMMARY.md` | `TimelineCanvas.tsx`, `TrackLane.tsx` | Interactive manual test | Fail | `DEF-R1-001` |
| ARR-002 | Arrangement | Header and ruler spacing is correct | Ruler sits directly under toolbar with compact approved geometry | `MUSICHUB_MANUAL.md`, `ZOOM_CONTROL_COMPLETE.md` | `StudioArrangementToolbar.tsx`, `timelineMath.ts` | Visual inspection | Fail | `DEF-R1-008` |
| ARR-003 | Arrangement | Grid treatment is readable | Bar/beat hierarchy and track boundaries remain visible and stable | `FEATURES_SUMMARY.md`, `VISUAL_WALKTHROUGH.md` | `drawGrid.ts`, `TrackLane.tsx` | Visual inspection | Fail | `DEF-R1-009` |
| ARR-004 | Arrangement | Clip resize behaves correctly | Resizing changes clip bounds and never deletes the clip | `FEATURES_SUMMARY.md`, `MUSICHUB_MANUAL.md` | clip interactions | Interactive manual test | Fail | `DEF-R1-002` |
| ARR-005 | Arrangement | Track-head context menu exists | Right-click on track head opens the documented menu | `MUSICHUB_MANUAL.md`, `ARRANGEMENT_NEXT_FEATURES.md` | track header components | Interactive manual test | Fail | `DEF-R1-005` |
| PRL-001 | Piano Roll | Keyboard-to-grid continuity | Keyboard rows and grid rows align as one continuous surface | `PIANO_ROLL_INFORMATION_DESIGN.md`, `PIANO_ROLL_VISUAL_REFINEMENT_COMPLETE.md` | `PianoRoll.tsx` and keyboard/grid components | Visual inspection | Not Reviewed |  |
| PRL-002 | Piano Roll | Playhead is visible across the piano roll | Playhead spans ruler and note area with strong visibility | `PIANO_ROLL_INFORMATION_DESIGN.md` | piano-roll overlay model | Interactive manual test | Not Reviewed |  |
| PRL-003 | Piano Roll | Horizontal scroll works beyond initial viewport | User can scroll to later bars than the first visible region | `PIANO_ROLL_DESIGN_PROPOSAL.md`, `PIANO_ROLL_PHASE_2_PLAN.md` | `PianoRoll.tsx`, interaction hooks | Interactive manual test | Fail | `DEF-R1-006` |
| PRL-004 | Piano Roll | Editing area can be extended | User can extend editing range/add bars past the visible width | `PIANO_ROLL_PHASE_2_PLAN.md` | piano-roll timeline model | Interactive manual test | Fail | `DEF-R1-007` |
| PRL-005 | Piano Roll | Core note editing works | Add, move, resize, delete, select, and velocity editing work on the real surface | `MUSICHUB_MANUAL.md`, `PIANO_ROLL_PHASE1_COMPLETE.md` | piano-roll interaction hooks | Interactive manual test | Not Reviewed |  |
| MIX-001 | Mixer | Mixer baseline is integrated into Studio | Mixer surface follows approved visual language and route model | `MIXER_DESIGN_GUIDE.md`, `DAW_COMPONENT_AUDIT.md` | mixer surface components | Visual inspection | Not Reviewed |  |
| MIX-002 | Mixer | Core controls are present | Volume, pan, mute, solo, arm, and meters are visible where expected | `MIXER_FEATURE_SUMMARY.md`, `MIXER_GAP_ANALYSIS.md` | mixer channel components | Visual inspection | Not Reviewed |  |
| BRW-001 | Browser | Browser baseline is integrated | Search/filter/category UI is visible and coherent | `UNIFIED_BROWSER_DOCUMENTATION.md`, `MUSICHUB_MANUAL.md` | browser components | Visual inspection | Not Reviewed |  |
| EDT-001 | Editing | Tool language matches baseline | Pointer, split, trim, fade, glue, eraser remain coherent where baseline expects them | `MUSICHUB_MANUAL.md`, `FEATURES_SUMMARY.md` | arrangement and piano-roll tool surfaces | Visual inspection | Not Reviewed |  |
| EDT-002 | Editing | Core shortcuts work | Copy, paste, duplicate, delete, escape, and tool switching behave correctly | `FEATURES_SUMMARY.md`, `QUICK_REFERENCE.md` | shortcut hooks | Interactive manual test | Not Reviewed |  |
| VIS-001 | Visual | Design system is consistent across Studio | Typography, spacing, color hierarchy, and controls align with approved direction | `DESIGN_SYSTEM.md`, `DARK_MODE_VISUAL_GUIDE.md`, `DAW_COMPONENT_AUDIT.md` | core Studio shell and shared components | Visual inspection | Not Reviewed |  |
| VIS-002 | Visual | Arrangement visual parity is close to spec | Header, ruler, grid, clips, track headers, and playhead read as one system | `VISUAL_WALKTHROUGH.md`, `ARRANGEMENT_FEATURES_GUIDE.md` | arrangement surface | Visual inspection | Not Reviewed |  |
| VIS-003 | Visual | Piano-roll visual parity is close to spec | Keyboard, grid, notes, playhead, and feedback match intended design language | `PIANO_ROLL_VISUAL_REFINEMENT_COMPLETE.md`, `PIANO_ROLL_INFORMATION_DESIGN.md` | piano-roll surface | Visual inspection | Not Reviewed |  |

## Explicit Deferrals

These items are out of `R1` unless separately approved:

- full plugin-host completeness
- advanced routing/device-chain completeness
- full backend/native maturity beyond what is required for baseline validation
- optional/future DAW features not needed for the Studio baseline
