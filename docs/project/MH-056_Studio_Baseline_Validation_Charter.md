# MH-056 Studio Baseline Validation Charter

## Project Definition

- Project name: `Studio Baseline QC and Validation`
- Release target: `R1 Studio Baseline`
- Product routes:
  - `/studio`
  - `/studio/workspace`
- Primary branch:
  - `codex/studio-integration-baseline`
- Spec source:
  - `MH-066_R1_Canonical_Studio_Baseline_Spec.md`
- Raw source material:
  - `/Users/pellenaucler/Documents/CodexProjekt/blank-canvas/Musichubfigmaexport`

## Purpose

This project exists to validate that the integrated Studio baseline is fit to serve as the next product baseline.

It does not exist to invent new feature scope or absorb unrelated product work.

## Goals

1. Normalize the Figma/export corpus into one contradiction-resolved canonical `R1` spec.
2. Prove that the new Studio interface is the real product baseline.
3. Validate core editing behavior against the canonical spec.
4. Record all deviations as explicit defects or approved deferrals.
5. Produce a release-quality decision: `Approved`, `Conditionally Approved`, or `Blocked`.

## Non-Goals

- no new feature work outside approved defects
- no silent scope expansion
- no reliance on preview/demo routes as proof of product readiness
- no mixing plugin-host completeness into `R1` unless a specific Studio blocker requires it

## Roles

### Product Approver

- approves baseline scope
- approves deferrals
- makes final product acceptance call

### Chief / QA Lead

- owns the validation program
- owns `MH-057`, `MH-058`, `MH-059`, `MH-060`, and `MH-063`
- classifies defects and sequences repairs
- controls merge order and release gates

### Stream Owners

- repair defects inside owned scope only
- provide evidence for repairs
- do not expand scope without Chief direction

### Validation Operator

- executes manual and interactive validation
- records evidence
- reports results against requirement IDs and test IDs

### Release Gatekeeper

- checks exit criteria
- blocks signoff if gate conditions fail

## Validation Domains

1. shell and navigation
2. transport and playhead
3. arrangement
4. piano roll
5. mixer and routing
6. automation
7. browser/library/device insertion
8. editing interactions and shortcuts
9. visual parity

## Validation Methods

Only these methods are valid:

- visual inspection
- interactive manual test
- automated UI test
- code inspection
- console/runtime inspection
- build/typecheck validation
- regression comparison against approved reference material

## Working Rules

- no ad hoc fixes without a mapped requirement or defect
- no new feature work mixed into QC repairs
- no subsystem signoff without evidence
- no product approval based on "looks fine"
- no preview-route success counted as product-route success
- no raw-corpus interpretation bypassing the canonical spec

## Deliverables

- `MH-055` baseline approval matrix
- `MH-065` corpus triage register
- `MH-066` canonical baseline spec
- `MH-067` contradiction and deferral ledger
- `MH-068` runtime/backend mapping matrix
- `MH-069` UI/component/CSS mapping matrix
- `MH-070` validation mapping register
- `MH-057` requirements traceability matrix
- `MH-058` test catalog
- `MH-059` defect triage rules
- `MH-060` exit criteria
- `MH-063` defect ledger
- `MH-064` release burndown

## Approval Questions

This charter is approved when these are accepted:

1. The project definition and scope are correct.
2. The listed roles are acceptable.
3. The validation domains are sufficient.
4. The validation methods and working rules are acceptable.
5. The release gate must run through this charter.
6. No Studio repair work should proceed until the normalization audit is approved.
