# Git Workflow

## Purpose

This repository is the only product source of truth for MusicHub. Git history should reflect deliberate product checkpoints rather than mixed experimentation from multiple tools.

## Baseline Rules

- `main` is the stable integration branch.
- Work happens on short-lived branches.
- Pull requests are required for non-trivial changes.
- Releases are identified by Git tags.

## Branch Types

### `codex/*`

Use for:

- implementation
- runtime changes
- Studio integration work
- native/host contract changes

### `design/*`

Use for:

- design-driven UI implementation
- shell redesign work
- component-system alignment with Figma

### `fix/*`

Use for:

- targeted bug fixes
- regressions
- release blockers

## Release Strategy

Use annotated tags:

- `v0.1.0`
- `v0.1.1`
- `v0.2.0`

Recommended first milestones:

- `v0.1.0`
  - stable desktop app boot
  - native host connectivity
  - first working Guided Studio shell
- `v0.2.0`
  - Standard and Focused shell variants
  - lesson-first Studio flow stabilized
- `v0.3.0`
  - stronger native recording and plugin workflows

## Pull Request Checklist

Each PR should answer:

1. What changed?
2. Why now?
3. What was verified?
4. What is intentionally not included?
5. Does this change any native-core or runtime contract?

## Figma Relationship

- Figma defines design intent.
- Git defines product history.
- Do not use Figma as the system of record for implementation state.
- When a design milestone becomes implementation-ready, capture that change in code and merge it through Git.

## Recommended Branch Flow For Current Work

1. Start from `main`
2. Create a branch such as `design/studio-guided-shell`
3. Implement the Figma-guided shell change
4. Open PR
5. Review
6. Merge to `main`
7. Tag when the product checkpoint is coherent
