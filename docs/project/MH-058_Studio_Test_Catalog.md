# MH-058 Studio Test Catalog

## Purpose

This catalog defines the executable validation set for `R1 Studio Baseline`.

It is bound to:

- `MH-066_R1_Canonical_Studio_Baseline_Spec.md`
- `MH-070_R1_Validation_Mapping_Register.md`

Each test case includes:

- test ID
- mapped requirement IDs
- route
- preconditions
- steps
- expected result
- evidence
- severity if failed

## Shell And Navigation

### ST-001 Studio Entry Route

- Requirement IDs: `SHL-001`
- Route: `/studio`
- Preconditions: dev server running
- Steps:
  1. Open `/studio` in a fresh tab.
  2. Observe the first loaded Studio surface.
- Expected Result:
  - Studio opens into the approved new Studio interface.
  - It does not land on the legacy shell.
- Evidence:
  - screenshot
- Severity If Failed:
  - `Critical`

### ST-002 Workspace Route

- Requirement IDs: `SHL-002`
- Route: `/studio/workspace`
- Preconditions: dev server running
- Steps:
  1. Open `/studio/workspace`.
  2. Verify route behavior and loaded surface.
- Expected Result:
  - Workspace route resolves to the approved baseline workspace composition.
- Evidence:
  - screenshot
- Severity If Failed:
  - `Critical`

### ST-003 Studio Modes

- Requirement IDs: `SHL-003`
- Route: `/studio`
- Preconditions: dev server running; Studio entry available
- Steps:
  1. Switch between Guided, Standard, and Focused modes if available on the product route.
  2. Observe chrome density, visible controls, and layout stability.
- Expected Result:
  - Modes behave as states of the same Studio product.
  - No route split or legacy fallback is required.
- Evidence:
  - screenshots or short video
- Severity If Failed:
  - `Major`

## Transport And Playhead

### ST-010 Transport Surface

- Requirement IDs: `TRN-001`
- Route: `/studio` or `/studio/workspace`
- Preconditions: Studio loaded
- Steps:
  1. Inspect the transport area.
  2. Verify visibility of play, stop, record, loop, tempo, time signature, and position.
- Expected Result:
  - Transport controls are present, legible, and aligned.
- Evidence:
  - screenshot
- Severity If Failed:
  - `Major`

### ST-011 Ruler Double-Click Seek

- Requirement IDs: `TRN-004`
- Route: `/studio/workspace`
- Preconditions: arrangement visible
- Steps:
  1. Double-click two different positions on the ruler.
  2. Observe playhead location after each action.
- Expected Result:
  - Playhead moves immediately to the clicked location.
  - No console error.
- Evidence:
  - short video or before/after screenshots
- Severity If Failed:
  - `Major`

### ST-012 Playhead Drag

- Requirement IDs: `TRN-003`
- Route: `/studio/workspace`
- Preconditions: arrangement visible
- Steps:
  1. Click and drag the playhead.
  2. Release at a new position.
- Expected Result:
  - Playhead follows the pointer during drag and settles at the release point.
- Evidence:
  - short video
- Severity If Failed:
  - `Major`

## Arrangement

### ST-020 Arrangement Viewport Integrity

- Requirement IDs: `ARR-001`, `ARR-003`
- Route: `/studio/workspace`
- Preconditions: arrangement visible
- Steps:
  1. Scroll horizontally and vertically.
  2. Observe background, clips, track rows, and ruler behavior.
- Expected Result:
  - One coherent arrangement viewport.
  - No detached or superimposed canvas layers.
  - Track row boundaries remain stable.
- Evidence:
  - video
- Severity If Failed:
  - `Blocker`

### ST-021 Arrangement Geometry

- Requirement IDs: `ARR-002`, `VIS-002`
- Route: `/studio/workspace`
- Preconditions: arrangement visible
- Steps:
  1. Inspect toolbar-to-ruler spacing.
  2. Inspect ruler-to-grid relationship.
  3. Inspect playhead visibility and lane boundaries.
- Expected Result:
  - Geometry matches the approved compact arrangement layout.
- Evidence:
  - screenshot
- Severity If Failed:
  - `Major`

### ST-022 Clip Resize

- Requirement IDs: `ARR-004`
- Route: `/studio/workspace`
- Preconditions: at least one clip exists
- Steps:
  1. Drag the right clip edge to extend or trim.
  2. Drag the left clip edge to adjust start.
- Expected Result:
  - Clip resizes correctly.
  - Clip is not deleted.
- Evidence:
  - video
- Severity If Failed:
  - `Blocker`

### ST-023 Track Head Context Menu

- Requirement IDs: `ARR-005`
- Route: `/studio/workspace`
- Preconditions: track headers visible
- Steps:
  1. Right-click a track head.
- Expected Result:
  - Context menu opens with documented track options.
- Evidence:
  - screenshot
- Severity If Failed:
  - `Major`

## Piano Roll

### ST-030 Piano Roll Continuity

- Requirement IDs: `PRL-001`, `VIS-003`
- Route: `/studio/workspace`
- Preconditions: piano roll open
- Steps:
  1. Inspect keyboard and note-grid seam.
  2. Inspect row highlighting and grid continuity.
- Expected Result:
  - Keyboard and grid feel continuous.
  - No visible disconnect.
- Evidence:
  - screenshot
- Severity If Failed:
  - `Major`

### ST-031 Piano Roll Scroll Range

- Requirement IDs: `PRL-003`
- Route: `/studio/workspace`
- Preconditions: piano roll open
- Steps:
  1. Attempt to scroll horizontally beyond the initially visible area.
  2. Attempt to navigate toward later bars.
- Expected Result:
  - Piano roll scrolls beyond the initial viewport width.
- Evidence:
  - video
- Severity If Failed:
  - `Blocker`

### ST-032 Piano Roll Extend Bars

- Requirement IDs: `PRL-004`
- Route: `/studio/workspace`
- Preconditions: piano roll open
- Steps:
  1. Attempt to extend the editing area or add bars beyond the initial view.
- Expected Result:
  - User can extend editing range beyond the initial screen width.
- Evidence:
  - video
- Severity If Failed:
  - `Blocker`

### ST-033 Piano Roll Editing

- Requirement IDs: `PRL-005`
- Route: `/studio/workspace`
- Preconditions: piano roll contains notes
- Steps:
  1. Move a note.
  2. Resize a note.
  3. Delete a note.
  4. Select multiple notes.
- Expected Result:
  - Core note editing works on the product route.
- Evidence:
  - short video
- Severity If Failed:
  - `Major`

## Additional Product-Route Validation

### ST-024 Arrangement Runtime Wiring

- Requirement IDs: `ARR-006`
- Route: `/studio/workspace`
- Preconditions: at least one clip exists
- Steps:
  1. Trigger approved arrangement clip operations on the product route.
  2. Observe whether behavior routes through real runtime-backed outcomes.
- Expected Result:
  - Product-route operations behave as runtime-backed features, not preview-only stand-ins.
- Evidence:
  - short video and console check
- Severity If Failed:
  - `Critical`

### ST-034 Piano Roll Playhead Visibility

- Requirement IDs: `PRL-002`
- Route: `/studio/workspace`
- Preconditions: piano roll open
- Steps:
  1. Observe playhead across ruler and note area.
  2. Move or seek transport if needed.
- Expected Result:
  - Playhead is visible and coherent across the piano-roll surface.
- Evidence:
  - screenshot
- Severity If Failed:
  - `Major`

### ST-035 Product Wiring Of Figma Piano Roll Affordances

- Requirement IDs: `PRL-006`
- Route: `/studio/workspace`
- Preconditions: piano roll open
- Steps:
  1. Inspect whether piano-roll affordances present on the product route are the live wired versions.
  2. Confirm they are not only available in preview/import/reference-only surfaces.
- Expected Result:
  - Product route uses live wired affordances.
- Evidence:
  - route screenshot and code inspection note
- Severity If Failed:
  - `Major`

### ST-040 Mixer Baseline Presence

- Requirement IDs: `MIX-001`
- Route: `/studio`
- Preconditions: Studio loaded
- Steps:
  1. Open or inspect the mixer baseline surface from the product Studio route.
- Expected Result:
  - Mixer baseline is part of the product Studio experience.
- Evidence:
  - screenshot
- Severity If Failed:
  - `Major`

### ST-041 Mixer Core Controls

- Requirement IDs: `MIX-002`
- Route: `/studio`
- Preconditions: mixer visible
- Steps:
  1. Inspect mixer channels.
  2. Verify presence of core controls and meters expected in the baseline.
- Expected Result:
  - Core controls are present and visually coherent.
- Evidence:
  - screenshot or short video
- Severity If Failed:
  - `Major`

### ST-050 Browser Baseline Presence

- Requirement IDs: `BRW-001`
- Route: `/studio/workspace`
- Preconditions: Studio loaded
- Steps:
  1. Inspect browser/library panel presence and coherence.
- Expected Result:
  - Browser baseline is visible and coherent on the product route.
- Evidence:
  - screenshot
- Severity If Failed:
  - `Major`

### ST-060 Automation Baseline Presence

- Requirement IDs: `AUT-001`
- Route: `/studio/workspace`
- Preconditions: arrangement visible
- Steps:
  1. Inspect whether baseline automation presence and approved interactions are available on the product route.
- Expected Result:
  - Automation baseline exists where required for the Studio baseline.
- Evidence:
  - screenshot or short video
- Severity If Failed:
  - `Major`

### ST-070 Tool And Edit Contract

- Requirement IDs: `EDT-001`
- Route: `/studio/workspace`
- Preconditions: arrangement and piano roll available
- Steps:
  1. Inspect and exercise core editing tools used on the product route.
- Expected Result:
  - Tool language remains coherent and maps to real behavior.
- Evidence:
  - short video
- Severity If Failed:
  - `Major`

### ST-071 Core Shortcut Contract

- Requirement IDs: `EDT-002`
- Route: `/studio/workspace`
- Preconditions: Studio loaded
- Steps:
  1. Execute baseline keyboard shortcuts on the product route.
- Expected Result:
  - Core shortcut contract works without console/runtime errors.
- Evidence:
  - short video or key-event log
- Severity If Failed:
  - `Major`

### ST-080 Visual Design-System Sweep

- Requirement IDs: `VIS-001`
- Route: `/studio`, `/studio/workspace`
- Preconditions: Studio loaded
- Steps:
  1. Inspect overall design-system consistency across the baseline shell and controls.
- Expected Result:
  - Core Studio surfaces read as one coherent design system.
- Evidence:
  - screenshot set
- Severity If Failed:
  - `Major`

### ST-081 Arrangement Visual Parity Sweep

- Requirement IDs: `VIS-002`
- Route: `/studio/workspace`
- Preconditions: arrangement visible
- Steps:
  1. Inspect header, ruler, grid, clips, track headers, and playhead as one arrangement system.
- Expected Result:
  - Arrangement surface is visually coherent and close to approved intent.
- Evidence:
  - screenshot set
- Severity If Failed:
  - `Major`

### ST-082 Piano Roll Visual Parity Sweep

- Requirement IDs: `VIS-003`
- Route: `/studio/workspace`
- Preconditions: piano roll open
- Steps:
  1. Inspect keyboard, grid, notes, playhead, and feedback styling.
- Expected Result:
  - Piano-roll surface is visually coherent and close to approved intent.
- Evidence:
  - screenshot set
- Severity If Failed:
  - `Major`
- Expected Result:
  - Core editing interactions work without corruption or console errors.
- Evidence:
  - video
- Severity If Failed:
  - `Major`

## Mixer

### ST-040 Mixer Baseline Surface

- Requirement IDs: `MIX-001`, `MIX-002`
- Route: `/studio`
- Preconditions: mixer surface available in baseline
- Steps:
  1. Open the mixer surface.
  2. Inspect channels and core controls.
- Expected Result:
  - Mixer surface is present and visually coherent.
  - Core controls are visible.
- Evidence:
  - screenshot
- Severity If Failed:
  - `Major`

## Browser And Editing

### ST-050 Browser Baseline

- Requirement IDs: `BRW-001`
- Route: `/studio`
- Preconditions: browser visible
- Steps:
  1. Inspect browser panel.
  2. Verify search/filter/category affordances exist.
- Expected Result:
  - Browser baseline is present and coherent.
- Evidence:
  - screenshot
- Severity If Failed:
  - `Major`

## Immediate First Validation Batch

Run these first:

- `ST-001`, `ST-002`
- `ST-010`, `ST-011`, `ST-012`
- `ST-020`, `ST-021`, `ST-022`, `ST-023`
- `ST-030`, `ST-031`, `ST-032`, `ST-033`
