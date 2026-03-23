# MH-065 R1 Figma Corpus Triage Register

## Purpose

This register classifies the full Figma-export corpus before any `R1 Studio Baseline` repair work proceeds.

The corpus is not treated as one flat authoritative spec. It contains mixed material:

- product requirements
- visual targets
- implementation notes
- research
- completion claims
- future/deferred material

For `R1`, only documents classified as authoritative drivers or required supporting references may drive acceptance decisions.

## Classification Rules

Document classes:

- `Authoritative product spec`
  - can directly define canonical `R1` behavior if consistent with runtime truth
- `Visual/design-system reference`
  - can define visual intent, layout, and styling targets
- `Implementation note`
  - useful for integration/mapping, not acceptance truth by itself
- `Research/reference only`
  - informative but non-binding
- `Completion claim`
  - evidence of intent or prior work, never proof of product truth
- `Future/deferred material`
  - explicitly outside the canonical `R1` spec unless separately approved
- `Not relevant to R1`
  - excluded from the Studio baseline audit

Decision tags:

- `R1 Driver`
- `R1 Support`
- `Deferred`
- `Exclude`

## Primary R1 Driver Documents

These documents are allowed to directly drive canonical requirement extraction for `R1`:

- `MUSICHUB_MANUAL.md`
- `MUSICHUB_INTEGRATION_PLAN_REVISED.md`
- `ARRANGEMENT_FEATURES_GUIDE.md`
- `PIANO_ROLL_DESIGN_PROPOSAL.md`
- `PIANO_ROLL_INFORMATION_DESIGN.md`
- `MIXER_DESIGN_GUIDE.md`
- `DESIGN_SPEC_AUTOMATION.md`
- `DESIGN_SYSTEM.md`
- `DARK_MODE_VISUAL_GUIDE.md`
- `DAW_COMPONENT_MAPPING.md`
- `SYSTEM_GAP_ANALYSIS.md`
- `UI_BACKEND_INTEGRATION_GAPS.md`

## Corpus Classification Table

| Document | Class | Decision Tag | Notes |
| --- | --- | --- | --- |
| `README.md` | Implementation note | Exclude | Export-package entrypoint only. |
| `DOCUMENTATION_INDEX.md` | Implementation note | Exclude | Index only. |
| `HANDOVER.md` | Implementation note | Exclude | Export handoff metadata. |
| `MUSICHUB_HANDOFF_PACKAGE.md` | Implementation note | Exclude | Packaging/handoff summary, not product truth. |
| `MUSICHUB_MANUAL.md` | Authoritative product spec | R1 Driver | Primary functional baseline for Studio modes, layout, transport, editing, piano roll, automation, mixer, markers, shortcuts. |
| `CHANGELOG.md` | Completion claim | Exclude | Historical record only. |
| `ROADMAP.md` | Future/deferred material | Deferred | Export-side roadmap, not direct `R1` contract. |
| `CONTRIBUTING.md` | Not relevant to R1 | Exclude | Process only. |
| `ATTRIBUTIONS.md` | Not relevant to R1 | Exclude | Credits only. |
| `QUICK_START_GUIDE.md` | Research/reference only | Exclude | User onboarding aid, not acceptance criteria. |
| `QUICK_REFERENCE.md` | Authoritative product spec | R1 Support | Shortcut and workflow reference. |
| `QUICK_EXPORT_CHEATSHEET.md` | Not relevant to R1 | Exclude | Export/package operations only. |
| `QUICK_PUSH_COMMANDS.md` | Not relevant to R1 | Exclude | Git operations only. |
| `DESIGN_SYSTEM.md` | Visual/design-system reference | R1 Driver | Canonical styling intent. |
| `DESIGN_SYSTEM_SUMMARY.md` | Visual/design-system reference | R1 Support | Summary only. |
| `DESIGN_SYSTEM_PREVIEW.md` | Visual/design-system reference | R1 Support | Preview guidance, not product proof. |
| `DESIGN_SYSTEM_SHOWCASE.md` | Visual/design-system reference | R1 Support | Showcase/reference only. |
| `DESIGN_SYSTEM_QUICK_REFERENCE.md` | Visual/design-system reference | R1 Support | Short-form token guidance. |
| `DESIGN_SYSTEM_WORLD_CLASS_UPGRADE.md` | Future/deferred material | Deferred | Upgrade narrative, not baseline contract. |
| `DARK_MODE_VISUAL_GUIDE.md` | Visual/design-system reference | R1 Driver | Important for current Studio baseline. |
| `DARK_MODE_APPLIED.md` | Completion claim | Exclude | Claim, not verification. |
| `FEATURES_IMPLEMENTED.md` | Completion claim | Exclude | Implementation claims only. |
| `FEATURES_SUMMARY.md` | Completion claim | R1 Support | Useful as cross-check, not authoritative by itself. |
| `CRITICAL_COMPONENTS_BUILD_COMPLETE.md` | Completion claim | Exclude | Completion claim only. |
| `WEEK2_HIGH_PRIORITY_COMPLETE.md` | Completion claim | Exclude | Phase claim only. |
| `WEEK3_MEDIUM_PRIORITY_COMPLETE.md` | Completion claim | Exclude | Phase claim only. |
| `ARRANGEMENT_FEATURES_GUIDE.md` | Authoritative product spec | R1 Driver | Arrangement behavior and editing expectations. |
| `ARRANGEMENT_NEXT_FEATURES.md` | Future/deferred material | Deferred | Explicit next-step planning, not baseline truth. |
| `PUSH_MARQUEE_SELECTION.md` | Future/deferred material | Deferred | Feature-specific future slice. |
| `PIANO_ROLL_DESIGN_PROPOSAL.md` | Authoritative product spec | R1 Driver | Piano-roll target state and deficiencies. |
| `PIANO_ROLL_RESEARCH.md` | Research/reference only | Exclude | Comparative research only. |
| `PIANO_ROLL_INFORMATION_DESIGN.md` | Authoritative product spec | R1 Driver | Piano-roll information hierarchy and behavior intent. |
| `PIANO_ROLL_INFORMATION_DESIGN_COMPLETE.md` | Completion claim | Exclude | Completion claim only. |
| `PIANO_ROLL_MARQUEE_SELECTION.md` | Future/deferred material | Deferred | Feature-specific future slice. |
| `PIANO_ROLL_PHASE1_COMPLETE.md` | Completion claim | Exclude | Completion claim only. |
| `PIANO_ROLL_PHASE_2_COMPLETE.md` | Completion claim | Exclude | Completion claim only. |
| `PIANO_ROLL_PHASE_2_PLAN.md` | Implementation note | R1 Support | Useful for expected extend/scroll/edit behaviors. |
| `PIANO_ROLL_VISUAL_REFINEMENT_COMPLETE.md` | Completion claim | Exclude | Completion claim only. |
| `MIXER_DESIGN_GUIDE.md` | Visual/design-system reference | R1 Driver | Mixer baseline layout and controls. |
| `MIXER_DESIGN_RESEARCH.md` | Research/reference only | Exclude | Comparative research only. |
| `MIXER_DESIGN_FIXED.md` | Completion claim | Exclude | Completion claim only. |
| `MIXER_FEATURE_SUMMARY.md` | Implementation note | R1 Support | Functional summary, not sole authority. |
| `MIXER_GAP_ANALYSIS.md` | Implementation note | R1 Support | Mixer scope and missing pieces. |
| `MIXER_SHOWCASE.md` | Visual/design-system reference | R1 Support | Reference only. |
| `MIXER_COMPRESSION_COMPLETE.md` | Future/deferred material | Deferred | Too specific for current baseline. |
| `MIXER_EXPANDABLE_COMPLETE.md` | Completion claim | Exclude | Completion claim only. |
| `MIXER_INPUT_GAIN_COMPLETE.md` | Future/deferred material | Deferred | Not baseline-critical. |
| `MIXER_RECORD_ARM_COMPLETE.md` | Implementation note | R1 Support | Relevant only where record-arm visual parity is in baseline. |
| `MIXER_ROUTING_COMPLETE.md` | Future/deferred material | Deferred | Routing completeness is out of default `R1`. |
| `SEND_RETURN_COMPLETE.md` | Future/deferred material | Deferred | Advanced routing beyond baseline default. |
| `SEND_RETURN_SYSTEM_SPEC.md` | Future/deferred material | Deferred | Same as above. |
| `AUTOMATION_SHAPING_RESEARCH.md` | Research/reference only | Exclude | Research only. |
| `AUTOMATION_VISUAL_SPEC.md` | Visual/design-system reference | R1 Support | Useful for lane appearance only. |
| `DESIGN_SPEC_AUTOMATION.md` | Authoritative product spec | R1 Driver | Canonical automation behavior target where in scope. |
| `DESIGN_SPEC_FADE_CURVES.md` | Future/deferred material | Deferred | Fade-curve depth beyond current baseline default. |
| `README_AUTOMATION_RESEARCH.md` | Research/reference only | Exclude | Research only. |
| `BROWSER_BUILD_COMPLETE.md` | Completion claim | Exclude | Completion claim only. |
| `BROWSER_FEATURE_RESEARCH.md` | Research/reference only | Exclude | Research only. |
| `UNIFIED_BROWSER_DOCUMENTATION.md` | Authoritative product spec | R1 Support | Browser baseline requirements. |
| `TAG_SYSTEM_DOCUMENTATION.md` | Future/deferred material | Deferred | Useful later, not baseline-critical. |
| `ABLETON_FILTER_RESEARCH.md` | Research/reference only | Exclude | Research only. |
| `DAW_AUDIT_EXECUTIVE_SUMMARY.md` | Research/reference only | Exclude | Audit summary, not direct contract. |
| `DAW_COMPONENT_AUDIT.md` | Implementation note | R1 Support | Mapping aid only. |
| `DAW_COMPONENT_MAPPING.md` | Implementation note | R1 Driver | High-value route/component mapping reference. |
| `SYSTEM_GAP_ANALYSIS.md` | Implementation note | R1 Driver | High-value gap/feasibility source; not direct proof of implementation. |
| `UI_BACKEND_INTEGRATION_GAPS.md` | Implementation note | R1 Driver | Runtime/backend feasibility ceiling. |
| `CODEX_MISSING_COMPONENTS_LIST.md` | Implementation note | Exclude | Internal task list only. |
| `CODEX_VISUAL_REFERENCE.md` | Visual/design-system reference | R1 Support | Reference only. |
| `DEVICE_CHAIN_COMPLETE.md` | Future/deferred material | Deferred | Device-chain completeness is outside default `R1`. |
| `CAPTURE_FUNCTIONALITY_TEST.md` | Not relevant to R1 | Exclude | Capture tooling only. |
| `CAPTURE_MODE_FIXED.md` | Not relevant to R1 | Exclude | Capture tooling only. |
| `TRACK_COLOR_ORGANIZATION_COMPLETE.md` | Completion claim | Exclude | Claim only. |
| `TRACK_REORDERING_FIXED.md` | Completion claim | Exclude | Claim only. |
| `TRACK_REORDERING_IMPLEMENTATION.md` | Implementation note | R1 Support | Relevant to arrangement editing if used on product route. |
| `ZOOM_CONTROL_COMPLETE.md` | Completion claim | Exclude | Claim only. |
| `ZOOM_LOCATION.md` | Visual/design-system reference | R1 Support | Useful for toolbar/ruler geometry expectations. |
| `VISUAL_WALKTHROUGH.md` | Visual/design-system reference | R1 Support | Cross-check on surface coherence. |
| `INTEGRATION_COMPLETE.md` | Completion claim | Exclude | Claim only. |
| `INTEGRATION_QUICK_START.md` | Not relevant to R1 | Exclude | Export package operations only. |
| `MUSICHUB_INTEGRATION_PLAN_REVISED.md` | Implementation note | R1 Driver | Critical because it explicitly constrains how export material maps into the real repo. |
| `DEPLOYMENT_SUMMARY.md` | Not relevant to R1 | Exclude | Deployment only. |
| `EXPORT_GUIDE.md` | Not relevant to R1 | Exclude | Export mechanics only. |
| `EXPORT_SUMMARY.md` | Not relevant to R1 | Exclude | Export summary only. |
| `PUSH_TO_MUSICHUB_READY.md` | Completion claim | Exclude | Push-readiness claim only. |
| `QUALITY_CONTROL_REPORT.md` | Completion claim | Exclude | Historical report, not current contract. |
| `IMPLEMENTATION_CHECKLIST.md` | Implementation note | R1 Support | Useful for extracted requirements only after normalization. |
| `FINAL_CHECKLIST.md` | Completion claim | Exclude | Claim only. |
| `BEFORE_AFTER_COMPARISON.md` | Research/reference only | Exclude | Reference only. |
| `PHASE_0_AUDIT_GUIDE.md` | Research/reference only | Exclude | Audit method reference only. |
| `GITHUB_PUSH_GUIDE.md` | Not relevant to R1 | Exclude | Git operations only. |
| `DESIGN_HANDOFF_SUMMARY.md` | Implementation note | Exclude | Handoff summary only. |
| `FIGMA_EXPORT_SUMMARY.md` | Implementation note | Exclude | Summary only. |
| `figma-export/CODEX_HANDOFF.md` | Implementation note | Exclude | Export/handoff only. |
| `figma-export/FIGMA_IMPORT_GUIDE.md` | Implementation note | Exclude | Import mechanics only. |
| `figma-export/INDEX.md` | Not relevant to R1 | Exclude | Index only. |
| `figma-export/QUICK_REFERENCE.md` | Not relevant to R1 | Exclude | Import/export quick ref. |
| `figma-export/QUICK_START_CARD.md` | Not relevant to R1 | Exclude | Import/export quick ref. |
| `figma-export/README.md` | Not relevant to R1 | Exclude | Export package readme. |
| `guidelines/Guidelines.md` | Research/reference only | Exclude | General design guidance, not baseline contract. |

## Triage Conclusions

1. The export corpus is not self-normalizing.
   - It contains direct conflicts between completion claims, gap analyses, and implementation notes.

2. `MUSICHUB_INTEGRATION_PLAN_REVISED.md` is a critical constraint document.
   - It explicitly states the export source is reference material only and must not be assumed to match MusicHub architecture.

3. Completion reports are not acceptance evidence.
   - They can support history, but they cannot prove current product truth on `/studio`.

4. `R1` must be driven by a reduced canonical spec.
   - That spec is defined in `MH-066`.

## Approval Condition

This register is approved when:

1. the document classifications are accepted
2. the listed `R1 Driver` documents are accepted as the only direct corpus drivers for normalization
3. the remaining documents are accepted as supporting, deferred, or excluded material
