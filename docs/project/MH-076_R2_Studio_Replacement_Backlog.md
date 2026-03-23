# MH-076 R2 Studio Replacement Backlog

## Purpose

This is the initial work backlog for `R2 Studio Replacement`.

## Active Work Items

| Work Item ID | Area | Owner | Status | Summary |
| --- | --- | --- | --- | --- |
| `R2-001` | route replacement contract | `platform` | Open | Define the exact product-route contract for `/studio` and `/studio/workspace`, including what remains from the `R1` shell and what is replaced. |
| `R2-002` | shell replacement composition | `ui-integration` | Open | Replace the remaining old-shell composition on the product routes with the newer integrated Studio interface. |
| `R2-003` | runtime preservation | `runtime` | Open | Preserve all `R1`-validated transport, arrangement, piano-roll, mixer, browser, and automation behavior through the shell replacement. |
| `R2-004` | piano-roll/tool adoption | `figmafunktioner` | Open | Move newer piano-roll/tool affordances from reference/imported surfaces into the real product routes where required by the replacement contract. |
| `R2-005` | visual convergence | `ui-alignment` | Open | Align arrangement, piano-roll, and mixer presentation on the replaced product shell. |

## Execution Rules

- no `R2` work starts until `R2-001` is decision-complete
- no stream may broaden scope beyond its assigned work item
- `R1` behavioral regressions are treated as blockers during `R2`
- preview/import/reference-only improvements do not count unless they land on product routes
