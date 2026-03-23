# MH-067 R1 Contradiction And Deferral Ledger

## Purpose

This ledger records every material conflict between:

- Figma/export intent
- current product-route behavior
- current runtime/backend capability

No contradiction is left implicit. Each one must be decisioned into:

- `Resolved into canonical spec`
- `Blocker`
- `Deferred`
- `Not applicable to R1`

## Ledger

| Contradiction ID | Area | Conflict | Evidence | Resolution Class | Resolution |
| --- | --- | --- | --- | --- | --- |
| `CON-R1-001` | Spec authority | Raw Figma/export corpus contains mixed requirements, claims, research, and future work. | `MH-065`, `MUSICHUB_INTEGRATION_PLAN_REVISED.md` | Resolved into canonical spec | Only `R1 Driver` docs and `MH-066` may directly drive acceptance. |
| `CON-R1-002` | Architecture | Export docs describe seams and assumptions that do not match MusicHub architecture one-to-one. | `MUSICHUB_INTEGRATION_PLAN_REVISED.md` | Resolved into canonical spec | MusicHub runtime and route truth govern implementation feasibility. |
| `CON-R1-003` | Product routes | Design/preview surfaces and imported reference components exist, but product acceptance must be based only on `/studio` and `/studio/workspace`. | current repo routes and imported components | Resolved into canonical spec | Preview/import/reference surfaces do not count as implementation. |
| `CON-R1-004` | Completion claims | Export corpus repeatedly claims features are complete, while product baseline still shows structural and interaction failures. | completion docs vs current baseline defects | Resolved into canonical spec | Completion docs are historical only and do not override product-route validation. |
| `CON-R1-005` | Studio shell | Export intent implies a unified Studio product, while current product behavior has route splits and legacy fallbacks. | `MUSICHUB_MANUAL.md`, current routing | Blocker | `/studio` and `/studio/workspace` must be normalized to one approved baseline product. |
| `CON-R1-006` | Arrangement | Arrangement design intent assumes one coherent viewport, while current baseline exhibits detached/superimposed surface behavior. | `ARRANGEMENT_FEATURES_GUIDE.md`, `DEF-R1-001` | Blocker | Must be structurally repaired before parity work continues. |
| `CON-R1-007` | Piano roll | Piano-roll docs imply scrollable/extendable editing space, while current baseline cannot extend or scroll beyond visible width. | `PIANO_ROLL_DESIGN_PROPOSAL.md`, `DEF-R1-006`, `DEF-R1-007` | Blocker | Required in `R1`; must be fixed on product route. |
| `CON-R1-008` | Interaction contract | Manual expects ruler seek, playhead drag, clip resize, and context menus; current baseline breaks these. | `MUSICHUB_MANUAL.md`, `DEF-R1-002` to `DEF-R1-005` | Blocker | Required in `R1`; repair through runtime/UI integration streams. |
| `CON-R1-009` | Mixer completeness | Export corpus describes deep mixer/routing capabilities, but `R1` only needs a coherent mixer baseline. | `MIXER_DESIGN_GUIDE.md`, `MIXER_ROUTING_COMPLETE.md`, release scope | Deferred | Baseline controls stay in scope; advanced routing/device completeness deferred. |
| `CON-R1-010` | Browser completeness | Gap docs describe broad browser/library features not necessary for first Studio baseline approval. | `UNIFIED_BROWSER_DOCUMENTATION.md`, `SYSTEM_GAP_ANALYSIS.md` | Deferred | Browser baseline presence is in scope; deep library ecosystem is out of scope. |
| `CON-R1-011` | Automation depth | Automation docs include advanced shaping and curves beyond what current baseline can safely prove. | `DESIGN_SPEC_AUTOMATION.md`, `AUTOMATION_SHAPING_RESEARCH.md` | Deferred | Baseline automation presence/basic behavior only; advanced shaping deferred. |
| `CON-R1-012` | Plugin-host relation | Plugins exist as active product work but are not required to validate `/studio` unless a Studio blocker proves dependency. | release scope vs plugin workstream state | Deferred | Plugins are out of `R1` by default. |
| `CON-R1-013` | Backend truth | Some export docs imply backend completeness, while current baseline still depends on mock/dev session seams. | `UI_BACKEND_INTEGRATION_GAPS.md`, `studioSessionSource.ts` | Resolved into canonical spec | Runtime/backend truth governs what can count as supported in `R1`. |
| `CON-R1-014` | Visual acceptance | Visual showcase docs imply polished finality, while current baseline still has layout and hierarchy defects. | visual docs vs active visual defects | Blocker | Visual parity must be validated on product routes, not inferred from showcases. |

## Operating Rule

If a new contradiction is found during validation, it must be added here before more repair work is accepted.

## Approval Condition

This ledger is approved when:

1. every currently known material contradiction is classified
2. no unresolved contradiction remains outside this ledger
3. implementers can use the resolution classes without ambiguity
