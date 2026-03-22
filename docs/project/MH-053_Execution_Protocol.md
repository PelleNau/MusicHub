# MH-053 — Execution Protocol

## Purpose

Define one unambiguous operating path for requests, assignment, execution order, escalation, and merge preparation.

This protocol exists so that:
- requests come through one decision point
- ownership boundaries are preserved
- streams do not self-prioritize
- merge order follows product logic, not branch age

Authority:
- `/Users/pellenaucler/Documents/CodexProjekt/MusicHub/docs/project/MusicHub_Platform_Directive.md`

## Command Chain

### 1. User

The user gives requests to `MusicHub Chief`.

The user does not assign work directly to parallel streams without Chief review.

### 2. MusicHub Chief

`MusicHub Chief` is responsible for:
- interpreting the request
- clarifying scope with the user when needed
- deciding whether the work is:
  - Runtime
  - Plugins
  - Database / Persistence
  - Figma Frontend Mapping
  - UI Alignment
  - Integration Baseline
- assigning the task to the correct branch/worktree
- sequencing work against the global queue
- rejecting overlapping or out-of-order work

### 3. Stream Owner

The stream owner executes only the assigned work inside the branch’s ownership boundary.

The stream owner must:
- follow the handover doc
- update the handover doc when scope or state changes
- escalate any cross-boundary dependency immediately

The stream owner must not:
- invent new architecture
- change ownership
- reprioritize the queue
- absorb work from another stream without approval

## Request Flow

Every request follows this path:

1. Request arrives from user to `MusicHub Chief`
2. `MusicHub Chief` classifies the request
3. `MusicHub Chief` checks ownership boundary
4. `MusicHub Chief` checks queue priority
5. `MusicHub Chief` does one of:
   - assign to an existing stream
   - create a new stream
   - reject/reframe the request
   - hold it for a later queue position
6. Assigned stream executes
7. Results return through `MusicHub Chief`

## Consultation Rule

`MusicHub Chief` must consult the user before:
- changing branch ownership
- changing merge order
- redirecting work to a different stream than the user expects
- merging one stream’s responsibilities into another
- accepting architecture changes with non-obvious consequences

`MusicHub Chief` does not need to consult the user for:
- straightforward routing into an already-owned stream
- routine handover updates
- small execution-order adjustments inside an already approved priority block

## Global Queue

This is the current required execution order.

### Priority Block 1 — Governance and Boundaries

1. Platform directive
2. Execution protocol
3. Handover accuracy
4. Explicit ownership boundaries

These always come first because without them every other stream overlaps.

### Priority Block 2 — Core Product Baseline

1. Studio runtime parity
2. Supabase persistence contract clarity
3. Figma frontend mapping into runtime seams
4. Studio UI alignment

These are the streams required to produce a usable real-product baseline.

### Priority Block 3 — Integration

1. Studio integration baseline

This branch assembles approved work from the upstream streams.
It does not jump ahead of them.

### Priority Block 4 — Specialized Infrastructure

1. Plugin integration

Plugin work does not jump ahead of the core product baseline unless a current task is blocked on it.

## Stream Order Rules

### Runtime

Runtime order:
1. clip context-menu parity
2. transport parity
3. device/send runtime ownership
4. remaining Studio runtime gaps

### Database / Persistence

Database order:
1. inventory current schema/functions/integration points
2. define persistence contract
3. centralize write boundaries
4. then modify schema/functions if needed

### Figma Function Mapping

Function mapping order:
1. piano-roll tool flow parity
2. human interaction validation
3. only then adjacent mapped functions

### UI Alignment

UI order:
1. arrangement
2. piano roll
3. mixer
4. then design-system extraction

### Integration Baseline

Integration order:
1. pull approved runtime work
2. pull approved function mapping
3. pull approved UI alignment
4. then validate one coherent Studio baseline

### Plugins

Plugin order:
1. plugin-host lifecycle
2. plugin discovery
3. plugin transport reliability
4. device-chain insertion path

## Escalation Conditions

Stop and escalate to `MusicHub Chief` if:
- a task touches another stream’s boundary
- a required dependency is not yet merged or approved
- a stream’s handover doc is stale
- a PR contains mixed ownership
- a requested task conflicts with queue order
- startup/platform behavior is being misclassified as Runtime, Plugins, or Database

## PR Rule

PRs are created only after:
- ownership is clear
- the handover doc is accurate
- the branch is clean enough for review

Default PR base:
- `codex/figma-capture-mode`

PRs remain draft until `MusicHub Chief` says they are ready for merge review.

## Merge Rule

Merge order follows system dependency, not convenience:

1. governance/ownership streams
2. runtime and persistence boundary streams
3. function mapping
4. UI alignment
5. integration baseline
6. plugin integration unless it is blocking earlier work

## Anti-Ambiguity Rules

- One request, one owner.
- One cross-boundary issue, one escalation.
- No stream self-assigns platform work.
- No stream self-upgrades priority.
- No merge happens because a branch “looks ready”; it merges because it fits the queue and ownership model.
