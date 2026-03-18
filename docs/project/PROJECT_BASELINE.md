# MusicHub Project Baseline

## Purpose

This document is the project-level source of truth for what MusicHub is and what architectural rules future work must follow.

If there is a conflict between ad hoc implementation convenience and this baseline, this baseline should win unless explicitly overridden.

---

## Product Definition

MusicHub is a learning-native music creation platform built on a real DAW core.

It is not:

- a browser toy DAW
- a static learning portal
- a set of disconnected tools

It is:

- a serious production environment
- a guided learning environment
- a unified workflow where learning, experimentation, and production happen in one system

Its two operating identities are:

1. `Studio`
   - the production workspace powered by the native DAW core
2. `Guide`
   - the learning and assistance runtime that can observe, explain, and direct work inside Studio

That combination is the product.

---

## Platform Target

MusicHub should be treated as a desktop-primary product.

That means:

- the React frontend remains the main UI layer
- the Tauri shell is the product container
- the native host/core remains authoritative for real-time Studio behavior
- web compatibility is not a parity target for the Studio product

Web surfaces may still exist for supporting product needs, but the Studio runtime should be designed and implemented for desktop operation first.

---

## Authoritative Architecture Inputs

The following documents define the target architecture and should be treated as primary references:

1. `docs/MusicHub_Studio_Domain_Model_v2.md`
2. `docs/MusicHub_Interaction_Flows_v1.md`
3. `/Users/pellenaucler/Downloads/MusicHub_Architecture_Brief.md`

Until the architecture brief is moved into the repo, the in-repo documents above are the practical source of truth for implementation.

---

## Core Architecture Rules

### 1. Native host is authoritative in connected mode

The native host is the source of truth for:

- transport state
- playback state
- playhead/timing
- plugin parameter truth
- routing truth
- meter truth
- recording / monitoring state
- render/export behavior

The web app must not maintain a competing authority for these concerns.

### 2. Web app is authoritative for experience orchestration

The web app owns:

- panel layout
- view composition
- browser and content UX
- selection and focus
- lesson overlays
- guidance flows
- optimistic UI where safe

### 3. Build around commands and observable state

The core product contract is:

1. Studio exposes observable state
2. Studio accepts high-level commands
3. Guide, templates, macros, and AI features operate through that same command interface

### 4. Domain model over raw payloads

Frontend and Guide systems should consume:

- stable domain types
- selectors
- summaries

They should not couple directly to raw host payloads.

### 5. Summaries are broad, detail is on demand

The shared store should expose:

- track summaries
- clip summaries
- transport summary
- panel state
- selection state
- mixer summaries
- plugin summaries

It should not keep heavyweight low-level detail always live.

### 6. Modes do not fork the model

Beginner, Guided, and Pro mode must remain configuration layers over the same Studio runtime and domain model.

### 7. Lessons do not mutate core state directly

Lessons and guidance logic attach to Studio state through:

- commands
- bindings
- anchors
- validation summaries

They should not hardwire themselves into core Studio entities.

---

## Current Strategic Objective

Move the current codebase toward:

- a stable Studio domain model
- a typed command bus
- a stable observable state API
- clear host adapter boundaries
- a first-class Guide runtime

Do not spend the next phase primarily polishing UI on top of unstable application architecture.

---

## Non-Goals For The Current Phase

- redesigning every frontend surface before the architecture is stable
- mirroring native engine internals into browser state
- building tutorial logic as ad hoc component state
- allowing connected mode to drift back into dual authority

---

## Default Instruction For Codex

Unless explicitly overridden by the user:

> Follow `docs/project/ROADMAP.md` and `docs/project/TASKS.md` as the default execution plan.
