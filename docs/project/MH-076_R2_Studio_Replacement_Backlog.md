# MH-076 R2 Studio Replacement Backlog

## Purpose

This is the initial work backlog for `R2 Studio Replacement`.

## Active Work Items

| Work Item ID | Area | Owner | Status | Summary |
| --- | --- | --- | --- | --- |
| `R2-001` | route replacement contract | `platform` | Complete | Product-route contract defined in `MH-077`; `/studio` and `/studio/workspace` are the only canonical Studio product routes and legacy review/lab routes no longer hold product authority. |
| `R2-002` | shell replacement composition | `ui-integration` | In Progress | Route unification, shell-chrome replacement, center-workspace composition replacement, surface-chrome replacement, component-chrome replacement, and overlay-chrome replacement are accepted. The next slice replaces deeper remaining old-shell product behavior and composition on `/studio` and `/studio/workspace` under the `MH-077` contract. |
| `R2-003` | runtime preservation | `runtime` | In Progress | The shared `/studio` and `/studio/workspace` baseline contract is enforced by tests. Further slices must preserve all `R1`-validated transport, arrangement, piano-roll, mixer, browser, and automation behavior through composition replacement. |
| `R2-004` | piano-roll/tool adoption | `figmafunktioner` | Open | Move newer piano-roll/tool affordances from reference/imported surfaces into the real product routes where required by the replacement contract. |
| `R2-005` | visual convergence | `ui-alignment` | Open | Align arrangement, piano-roll, and mixer presentation on the replaced product shell. |

## Execution Rules

- `R2-002` and later work must follow `MH-077`
- no stream may broaden scope beyond its assigned work item
- `R1` behavioral regressions are treated as blockers during `R2`
- preview/import/reference-only improvements do not count unless they land on product routes

## Accepted R2 Execution To Date

- accepted route-unification commits:
  - `78e7a25` on `codex/figma-capture-mode`
  - `c57caff` on `codex/figma-capture-mode`
  - `84cc6ba` on `codex/studio-runtime-parity`
- accepted replacement shell-chrome commit:
  - `38bf4e9` on `codex/figma-capture-mode`
- accepted center-workspace composition commits:
  - `d1e382f` on `codex/figma-capture-mode`
  - `e7fae4b` on `codex/figma-capture-mode`
- accepted route-baseline hardening commit:
  - `39bfc62` on `codex/figma-capture-mode`
- accepted overlay-removal commit:
  - `9e565bb` on `codex/figma-capture-mode`
- accepted surface-chrome replacement commits:
  - `52a9c6f` on `codex/figma-capture-mode`
  - `a311e1b` on `codex/figma-capture-mode`
- accepted component-chrome replacement commit:
  - `fede925` on `codex/figma-capture-mode`
- accepted overlay-chrome replacement commit:
  - `5a4b116` on `codex/figma-capture-mode`

## Immediate Next Slice

- replace remaining deeper product-route behavior and composition debt beyond shell and chrome cleanup, especially:
  - arrangement and bottom-workspace composition choices that still reflect the old product shell
  - piano-roll tool and dialog adoption on real routes
  - guide/browser/editor composition behavior when moving between product routes
  - any still-visible legacy interaction behavior affecting `/studio` or `/studio/workspace`
- keep the shared route contract and runtime baseline tests green
