# MH-061 R1 Studio Baseline Program Charter

## Release Definition

- Release name: `R1 Studio Baseline`
- Objective: ship the new Studio interface as the primary baseline on `/studio`
- Planning horizon: next release only
- Governance mode: strict gated

## Program Structure

The program uses two layers:

1. Product program layer
   - defines release target, workstreams, gates, and approval model
2. Execution layer
   - uses the existing stream branches, ownership rules, `.coordination` control plane, and CI gates

## In-Scope For R1

- Studio shell and route authority
- transport and playhead behavior
- arrangement baseline
- piano-roll baseline
- mixer baseline
- browser baseline
- core editing interactions
- visual parity sufficient for baseline approval

## Out Of Scope For R1

- plugin-host completeness unless a proven Studio blocker requires it
- advanced routing and device-chain completeness beyond the baseline need
- full backend/native parity beyond what is required to validate Studio
- broader learning/product-surface expansion not needed for Studio baseline approval

## Release Branch Model

- Integration trunk:
  - `codex/figma-capture-mode`
- Release-validation branch:
  - `codex/studio-integration-baseline`

## Program Gates

1. Scope gate
   - `MH-055` and `MH-056` approved
2. Normalization gate
   - `MH-065` through `MH-070` approved and treated as the release contract
3. Validation gate
   - `MH-057` and `MH-058` refactored to match the normalized spec
4. Repair gate
   - all active failures logged in `MH-063`
5. Exit gate
   - `MH-060` satisfied

## Immediate Program Phase

Current phase:

- `R1 Studio Baseline Spec Normalization and Validation Audit`

Objectives:

- freeze feature drift on the baseline branch
- normalize the export corpus into one contradiction-resolved release contract
- snapshot known defects against canonical requirement IDs
- prevent further Studio repair work outside the audit contract

## Approval Authority

- Product approval owner: user / product approver
- Program execution authority: `MusicHub Chief`
- Release gate authority: `MusicHub Chief` using `MH-060`
