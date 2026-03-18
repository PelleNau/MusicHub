# Contributing

This repository is the canonical MusicHub product repository.

## Branching

- `main` is the release baseline.
- All implementation work goes through short-lived branches.
- Branch names must use one of these prefixes:
  - `codex/` for implementation and architecture work
  - `design/` for design-system or design-driven implementation work
  - `fix/` for targeted bug fixes

Examples:

- `codex/studio-guided-shell`
- `design/home-intent-router`
- `fix/transport-loop-guard`

## Merge Policy

- Do not push direct feature work to `main`.
- Open a pull request for every branch.
- Keep pull requests focused on one coherent change.
- Prefer squash merge unless preserving branch history is important.

## Release Versioning

MusicHub uses annotated Git tags for release versions.

Version format:

- `vMAJOR.MINOR.PATCH`

Examples:

- `v0.1.0`
- `v0.2.3`
- `v1.0.0`

Rules:

- `PATCH`: bug fixes, small internal improvements, no intentional product-surface expansion
- `MINOR`: new product capability, new workflow slice, visible feature delivery
- `MAJOR`: breaking architecture or product contract changes

Until first public release, use `0.x.y`.

## Pull Request Expectations

Every PR should state:

- what changed
- why it changed
- what was verified
- what remains risky or intentionally deferred

If a change affects Studio runtime or native host behavior, include:

- desktop/runtime impact
- connected-mode impact
- whether the native core contract changed

## Design Workflow

- Figma is the design source of truth for UI work.
- Implementation should land in code through reviewed PRs.
- Do not block implementation on Figma for minor details, but do not invent major layout structure that conflicts with current design direction.

## Quality Bar

- Build must pass before merge.
- High-risk runtime behavior changes should include targeted verification.
- Avoid broad refactors during design implementation unless they directly reduce delivery risk.
