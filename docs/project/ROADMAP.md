# MusicHub Roadmap

## Purpose

This roadmap defines the intended implementation sequence for the current architecture phase.

It is ordered to reduce risk:

1. architecture and contracts first
2. integration boundaries second
3. frontend redesign on top of stable behavior

---

## Phase 1 — Architectural Foundation

### Goal

Establish the target Studio domain model and interaction flows as implementation references.

### Outcomes

- stable Studio domain model
- interaction flow definitions
- project control surface in repo
- coordination docs aligned with architecture

### Status

In progress / largely seeded

---

## Phase 2 — Domain Types and Store Boundary

### Goal

Introduce target domain types and prepare the codebase for a normalized Studio state model.

### Outcomes

- target TypeScript domain types
- clear distinction between current runtime types and target domain model
- plan for store normalization
- mapping strategy from current host payloads to target model

### Dependencies

- Phase 1

---

## Phase 3 — Host Adapter and Observable State API

### Goal

Move from ad hoc host-facing UI state to stable adapter and selector boundaries.

### Outcomes

- host adapter layer
- normalized host-to-domain mapping
- stable Studio observable state selectors
- reduced leakage of raw host payloads into UI surfaces

### Dependencies

- Phase 2

---

## Phase 4 — Command Bus

### Goal

Introduce a unified command layer for UI, Guide, templates, and AI.

### Outcomes

- typed Studio commands
- typed transport commands
- typed lesson/browser/content commands
- success/failure/ack handling
- command logging for validation and debugging

### Dependencies

- Phase 3

---

## Phase 5 — Guide Runtime

### Goal

Introduce the learning-native layer as a first-class subsystem instead of UI glue.

### Outcomes

- lesson runtime
- lesson bindings
- anchor-driven highlight/hint system
- validation context and step progression

### Dependencies

- Phase 4

---

## Phase 6 — Studio Surface Refactor

### Goal

Refactor Studio UI to consume selectors and commands instead of mixed page-local integration logic.

### Outcomes

- thinner `Studio.tsx`
- clearer surface boundaries
- better separation between composition, state, and behavior

### Dependencies

- Phase 3
- Phase 4

---

## Phase 7 — Frontend Product Redesign

### Goal

Redesign Studio/Guide/browser UX on top of stable architecture.

### Outcomes

- beginner/guided/pro layouts
- Guide overlays
- better browser/content insertion workflows
- stronger onboarding and learning flows

### Dependencies

- Phase 5
- Phase 6

---

## Current Execution Rule

Do not prioritize deep frontend redesign work ahead of:

- domain model adoption
- adapter boundaries
- command bus introduction

Unless the user explicitly asks for a design spike or isolated concept work.
