# MH-080 — Platform Ownership Resolution Handover

## Objective

Resolve the ownership dispute that blocked the plugin branch from carrying plugin-coupled support hooks, fixtures, and validation files.

## Current State

- Worktree:
  - `/Users/pellenaucler/Documents/CodexProjekt/MusicHub`
- Branch:
  - `codex/platform-ownership-resolution`
- Base:
  - `main`
- Current head:
  - `51388a3`
- Review scope versus `main`:
  - `.coordination/ownership.json` only
- Branch intent:
  - platform-only boundary change
  - no runtime, UI, plugin-host, or build-system behavior changes

## Exact Change

- Expanded `plugins` ownership to include plugin-coupled support files:
  - plugin-facing Studio hooks
  - plugin-specific validation files
  - plugin session dev fixture and persistence tests
- Tightened `runtime` and `ui-integration` deny lists so those files are no longer ambiguous.
- Intentionally did **not** move `vite.config.ts` into plugin ownership.

## Why This Exists

The preserved plugin work on `codex/plugin-scope-holding` could not be replayed cleanly while the ownership map still treated several plugin-coupled support files as non-plugin scope.

Without this change:
- `codex/plugin-integration` fails Chief ownership review
- the restored support files cannot be carried on the plugin branch cleanly

With this change:
- `codex/plugin-integration` can carry the replayed support files under an explicit boundary decision
- the plugin branch becomes reviewable without forcing a technically invalid split

## Review Guidance

Check only:
- whether the added plugin-owned paths are genuinely plugin-coupled
- whether any of those paths should remain cross-stream instead
- whether excluding `vite.config.ts` is still correct

Do not review this branch as a behavior change branch. It is a boundary-definition branch.

## Dependency

This branch should land before reviewing or integrating:
- `codex/plugin-integration`

## Validation

- manual ownership review of the affected file set
- plugin branch ownership gate passes when evaluated against this updated ownership map

## Do Not Touch

- do not mix in control-plane queue cleanup from the root worktree
- do not mix in the unrelated blueprint/docs/assets files currently untracked in the root worktree
- do not add behavior changes here
