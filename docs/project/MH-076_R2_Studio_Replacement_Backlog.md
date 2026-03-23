# MH-076 R2 Studio Replacement Backlog

## Purpose

This is the initial work backlog for `R2 Studio Replacement`.

## Active Work Items

| Work Item ID | Area | Owner | Status | Summary |
| --- | --- | --- | --- | --- |
| `R2-001` | route replacement contract | `platform` | Complete | Product-route contract defined in `MH-077`; `/studio` and `/studio/workspace` are the only canonical Studio product routes and legacy review/lab routes no longer hold product authority. |
| `R2-002` | shell replacement composition | `ui-integration` | Ready | Replace the remaining old-shell composition on the product routes with the newer integrated Studio interface under the `MH-077` contract. |
| `R2-003` | runtime preservation | `runtime` | Open | Preserve all `R1`-validated transport, arrangement, piano-roll, mixer, browser, and automation behavior through the shell replacement. |
| `R2-004` | piano-roll/tool adoption | `figmafunktioner` | Open | Move newer piano-roll/tool affordances from reference/imported surfaces into the real product routes where required by the replacement contract. |
| `R2-005` | visual convergence | `ui-alignment` | Open | Align arrangement, piano-roll, and mixer presentation on the replaced product shell. |

## Execution Rules

- `R2-002` and later work must follow `MH-077`
- no stream may broaden scope beyond its assigned work item
- `R1` behavioral regressions are treated as blockers during `R2`
- preview/import/reference-only improvements do not count unless they land on product routes
