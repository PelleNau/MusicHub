# MH-064 R1 Studio Baseline Burndown

## Release Status

- Release: `R1 Studio Baseline`
- Current phase: `Spec Normalization and Validation Audit`
- Validation branch: `codex/studio-integration-baseline`
- Integration trunk: `codex/figma-capture-mode`

## Gate Status

| Gate | Status | Notes |
| --- | --- | --- |
| Scope gate (`MH-055`, `MH-056`) | In Progress | Program package created; now being normalized into an enforceable release contract. |
| Normalization gate (`MH-065`-`MH-070`) | In Progress | Corpus triage, canonical spec, contradiction ledger, and mapping matrices are being established. |
| Validation gate (`MH-057`, `MH-058`) | In Progress | QC package is being refactored to match the normalized spec. |
| Repair gate (`MH-063`) | Open | Active defects are logged, but repair work is paused until the audit is approved. |
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
| Shell and navigation | Audit In Progress | Product-route authority still being normalized against canonical spec. |
| Transport and playhead | Audit In Progress | Known failures exist; no more repair work until spec normalization is approved. |
| Arrangement | Audit In Progress | Structural and visual contradictions logged; repair paused pending audit approval. |
| Piano roll | Audit In Progress | Known baseline failures logged; route/component mapping still being normalized. |
| Mixer | Not Reviewed | Validation not executed yet. |
| Browser | Not Reviewed | Validation not executed yet. |
| Editing and shortcuts | Audit In Progress | Core interaction failures identified, pending normalized repair plan. |
| Visual parity | Audit In Progress | Visual criteria now being normalized against canonical spec. |

## First Audit Batch

1. classify the full Figma corpus in `MH-065`
2. approve the canonical `R1` requirement set in `MH-066`
3. resolve current contradictions in `MH-067`
4. map runtime/backend feasibility in `MH-068`
5. map product-route UI/component/CSS surfaces in `MH-069`
6. bind validation to the normalized contract in `MH-070`
