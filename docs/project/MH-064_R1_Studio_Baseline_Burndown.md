# MH-064 R1 Studio Baseline Burndown

## Release Status

- Release: `R1 Studio Baseline`
- Current phase: `QC and Repair`
- Validation branch: `codex/studio-integration-baseline`
- Integration trunk: `codex/figma-capture-mode`

## Gate Status

| Gate | Status | Notes |
| --- | --- | --- |
| Scope gate (`MH-055`, `MH-056`) | In Progress | Program package created; awaiting approval and use as release contract. |
| Validation gate (`MH-057`, `MH-058`) | In Progress | Initial requirements and test set seeded; not fully executed yet. |
| Repair gate (`MH-063`) | Open | Active defects logged; structural baseline repair not complete. |
| Exit gate (`MH-060`) | Not Started | Cannot start until blocker and major repairs are completed and revalidated. |

## Defect Counts

| Severity | Count |
| --- | --- |
| Blocker | 4 |
| Critical | 0 |
| Major | 5 |
| Minor | 0 |
| Polish | 0 |

## Domain Status

| Domain | Status | Notes |
| --- | --- | --- |
| Shell and navigation | In Progress | Route authority clarified; baseline behavior still under validation. |
| Transport and playhead | Failed | Playhead dragging and ruler seek currently broken. |
| Arrangement | Failed | Structural viewport issue and core interaction issues present. |
| Piano roll | Failed | Scroll range and extend-range behavior currently blocked. |
| Mixer | Not Reviewed | Validation not executed yet. |
| Browser | Not Reviewed | Validation not executed yet. |
| Editing and shortcuts | In Progress | Core interaction failures already identified. |
| Visual parity | Failed | Header/ruler and arrangement grid parity issues active. |

## First Repair Batch

1. `DEF-R1-001` arrangement structural viewport integrity
2. `DEF-R1-006` piano-roll scroll range
3. `DEF-R1-007` piano-roll extend range
4. `DEF-R1-002` clip resize corruption
5. `DEF-R1-003`, `DEF-R1-004`, `DEF-R1-005` transport and header interactions
