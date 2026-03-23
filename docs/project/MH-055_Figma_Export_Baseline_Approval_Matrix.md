# MH-055 Figma Export Baseline Approval Matrix

## Purpose

This document defines what the `R1 Studio Baseline` is expected to contain and what is explicitly deferred.

It is the approval frame for the spec-normalization audit and all later Studio baseline validation and repair work.

## Source Of Truth

Raw Figma-export corpus:

- `/Users/pellenaucler/Documents/CodexProjekt/blank-canvas/Musichubfigmaexport`

Normalization documents:

- `docs/project/MH-065_R1_Figma_Corpus_Triage_Register.md`
- `docs/project/MH-066_R1_Canonical_Studio_Baseline_Spec.md`
- `docs/project/MH-067_R1_Contradiction_And_Deferral_Ledger.md`
- `docs/project/MH-068_R1_Runtime_Backend_Mapping_Matrix.md`
- `docs/project/MH-069_R1_UI_Component_CSS_Mapping_Matrix.md`
- `docs/project/MH-070_R1_Validation_Mapping_Register.md`

Reduced repo-side references:

- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/docs/project/MH-045_Figma_Studio_Manual_Reference.md`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/docs/project/MH-046_Design_System_Foundation.md`
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/docs/project/Figma_Component_Generation_Guide.md`

## Baseline Definition

For `R1 Studio Baseline`, "baseline" means:

- `/studio` is the authoritative Studio route
- the new Studio interface is the product baseline, not a preview-only surface
- arrangement, piano roll, transport, mixer baseline, browser baseline, and core editing interactions are validated on the real Studio routes
- unresolved gaps are explicit, classified, and decisioned

## Authority Rule

For `R1`, the approval chain is:

1. raw corpus triaged in `MH-065`
2. canonical requirement set defined in `MH-066`
3. contradictions and deferrals decisioned in `MH-067`
4. runtime/backend feasibility mapped in `MH-068`
5. UI/component/CSS route mapping defined in `MH-069`
6. validation mapping defined in `MH-070`

The raw export corpus is source material, not direct acceptance truth.

## Full Figma-Export Documentation Inventory

### Core Documentation

- `README.md`
- `DOCUMENTATION_INDEX.md`
- `HANDOVER.md`
- `MUSICHUB_HANDOFF_PACKAGE.md`
- `MUSICHUB_MANUAL.md`
- `CHANGELOG.md`
- `ROADMAP.md`
- `CONTRIBUTING.md`
- `ATTRIBUTIONS.md`

### Quick Reference Guides

- `QUICK_START_GUIDE.md`
- `QUICK_REFERENCE.md`
- `QUICK_EXPORT_CHEATSHEET.md`
- `QUICK_PUSH_COMMANDS.md`

### Design System Documentation

- `DESIGN_SYSTEM.md`
- `DESIGN_SYSTEM_SUMMARY.md`
- `DESIGN_SYSTEM_PREVIEW.md`
- `DESIGN_SYSTEM_SHOWCASE.md`
- `DESIGN_SYSTEM_QUICK_REFERENCE.md`
- `DESIGN_SYSTEM_WORLD_CLASS_UPGRADE.md`
- `DARK_MODE_VISUAL_GUIDE.md`
- `DARK_MODE_APPLIED.md`

### Feature Completion Reports

- `FEATURES_IMPLEMENTED.md`
- `FEATURES_SUMMARY.md`
- `CRITICAL_COMPONENTS_BUILD_COMPLETE.md`
- `WEEK2_HIGH_PRIORITY_COMPLETE.md`
- `WEEK3_MEDIUM_PRIORITY_COMPLETE.md`

### Arrangement And Timeline

- `ARRANGEMENT_FEATURES_GUIDE.md`
- `ARRANGEMENT_NEXT_FEATURES.md`
- `PUSH_MARQUEE_SELECTION.md`

### Piano Roll Documentation

- `PIANO_ROLL_DESIGN_PROPOSAL.md`
- `PIANO_ROLL_RESEARCH.md`
- `PIANO_ROLL_INFORMATION_DESIGN.md`
- `PIANO_ROLL_INFORMATION_DESIGN_COMPLETE.md`
- `PIANO_ROLL_MARQUEE_SELECTION.md`
- `PIANO_ROLL_PHASE1_COMPLETE.md`
- `PIANO_ROLL_PHASE_2_COMPLETE.md`
- `PIANO_ROLL_PHASE_2_PLAN.md`
- `PIANO_ROLL_VISUAL_REFINEMENT_COMPLETE.md`

### Mixer Documentation

- `MIXER_DESIGN_GUIDE.md`
- `MIXER_DESIGN_RESEARCH.md`
- `MIXER_DESIGN_FIXED.md`
- `MIXER_FEATURE_SUMMARY.md`
- `MIXER_GAP_ANALYSIS.md`
- `MIXER_SHOWCASE.md`
- `MIXER_COMPRESSION_COMPLETE.md`
- `MIXER_EXPANDABLE_COMPLETE.md`
- `MIXER_INPUT_GAIN_COMPLETE.md`
- `MIXER_RECORD_ARM_COMPLETE.md`
- `MIXER_ROUTING_COMPLETE.md`
- `SEND_RETURN_COMPLETE.md`
- `SEND_RETURN_SYSTEM_SPEC.md`

### Automation Documentation

- `AUTOMATION_SHAPING_RESEARCH.md`
- `AUTOMATION_VISUAL_SPEC.md`
- `DESIGN_SPEC_AUTOMATION.md`
- `DESIGN_SPEC_FADE_CURVES.md`
- `README_AUTOMATION_RESEARCH.md`

### Browser And Library

- `BROWSER_BUILD_COMPLETE.md`
- `BROWSER_FEATURE_RESEARCH.md`
- `UNIFIED_BROWSER_DOCUMENTATION.md`
- `TAG_SYSTEM_DOCUMENTATION.md`

### Research And Analysis

- `ABLETON_FILTER_RESEARCH.md`
- `DAW_AUDIT_EXECUTIVE_SUMMARY.md`
- `DAW_COMPONENT_AUDIT.md`
- `DAW_COMPONENT_MAPPING.md`
- `SYSTEM_GAP_ANALYSIS.md`
- `UI_BACKEND_INTEGRATION_GAPS.md`

### Component Documentation

- `CODEX_MISSING_COMPONENTS_LIST.md`
- `CODEX_VISUAL_REFERENCE.md`
- `DEVICE_CHAIN_COMPLETE.md`
- `CAPTURE_FUNCTIONALITY_TEST.md`
- `CAPTURE_MODE_FIXED.md`

### Track And Organization

- `TRACK_COLOR_ORGANIZATION_COMPLETE.md`
- `TRACK_REORDERING_FIXED.md`
- `TRACK_REORDERING_IMPLEMENTATION.md`

### UI And UX

- `ZOOM_CONTROL_COMPLETE.md`
- `ZOOM_LOCATION.md`
- `VISUAL_WALKTHROUGH.md`

### Integration And Deployment

- `INTEGRATION_COMPLETE.md`
- `INTEGRATION_QUICK_START.md`
- `MUSICHUB_INTEGRATION_PLAN_REVISED.md`
- `DEPLOYMENT_SUMMARY.md`
- `EXPORT_GUIDE.md`
- `EXPORT_SUMMARY.md`
- `PUSH_TO_MUSICHUB_READY.md`

### Quality And Testing

- `QUALITY_CONTROL_REPORT.md`
- `IMPLEMENTATION_CHECKLIST.md`
- `FINAL_CHECKLIST.md`
- `BEFORE_AFTER_COMPARISON.md`
- `PHASE_0_AUDIT_GUIDE.md`

### Git And GitHub

- `GITHUB_PUSH_GUIDE.md`
- `DESIGN_HANDOFF_SUMMARY.md`

### Figma Export Documentation (`/figma-export`)

- `CODEX_HANDOFF.md`
- `FIGMA_IMPORT_GUIDE.md`
- `INDEX.md`
- `QUICK_REFERENCE.md`
- `QUICK_START_CARD.md`
- `README.md`
- `FIGMA_EXPORT_SUMMARY.md`

### Component Generation (`/src/imports`)

- `Figma_Component_Generation_Guide.md`

## Approval Matrix

| Domain | Expected In R1 Baseline | Primary Sources | Approval |
| --- | --- | --- | --- |
| Studio shell and routing | `/studio` and `/studio/workspace` are authoritative product routes | `MUSICHUB_MANUAL.md`, `MUSICHUB_INTEGRATION_PLAN_REVISED.md` | Pending |
| Transport and playhead | Visible, coherent transport; playhead visible and interactive where specified | `MUSICHUB_MANUAL.md`, `FEATURES_SUMMARY.md` | Pending |
| Arrangement | Single viewport model, compact header/ruler geometry, stable editing interactions | `ARRANGEMENT_FEATURES_GUIDE.md`, `VISUAL_WALKTHROUGH.md` | Pending |
| Piano roll | Continuous keyboard/grid surface, working scroll/extend/edit interactions | `PIANO_ROLL_DESIGN_PROPOSAL.md`, `PIANO_ROLL_INFORMATION_DESIGN.md` | Pending |
| Mixer baseline | Integrated mixer surface with core controls and baseline routing presentation | `MIXER_DESIGN_GUIDE.md`, `MIXER_FEATURE_SUMMARY.md` | Pending |
| Browser baseline | Browser/library panel and insertion affordances are present and coherent | `UNIFIED_BROWSER_DOCUMENTATION.md`, `DEVICE_CHAIN_COMPLETE.md` | Pending |
| Automation baseline | Baseline lane presence and approved interactions are present or explicitly deferred | `DESIGN_SPEC_AUTOMATION.md`, `AUTOMATION_VISUAL_SPEC.md` | Pending |
| Editing interactions | Clip resize, playhead drag, ruler seek, context menus, shortcuts behave as specified | `MUSICHUB_MANUAL.md`, `FEATURES_SUMMARY.md`, `QUICK_REFERENCE.md` | Pending |
| Visual parity | Core Studio surfaces follow the approved design system and DAW visual language | `DESIGN_SYSTEM.md`, `DESIGN_SYSTEM_SHOWCASE.md`, `DARK_MODE_VISUAL_GUIDE.md` | Pending |

## Explicit Deferrals

These items are outside `R1 Studio Baseline` unless separately approved:

- plugin-host completeness
- advanced routing and device-chain completeness beyond the Studio baseline need
- full backend/native parity beyond what is required to validate Studio routes
- broader learning/product-surface expansion not required for the Studio baseline
- optional or future DAW features not required by the approved baseline scope

## Approval Questions

This matrix is approved when these are accepted:

1. The baseline is governed by the normalization chain `MH-065` through `MH-070`, not by raw corpus interpretation.
2. The listed domains define the baseline scope.
3. The explicit deferrals are accepted as outside `R1`.
4. Repair work must target the normalized requirement set, not ad hoc product drift.
