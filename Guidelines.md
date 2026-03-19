# MusicHub Guidelines for Figma Make

Use these guidelines for any generated code, handoff package, or Git instructions related to MusicHub.

## Source of Truth

- The only canonical repository is `https://github.com/PelleNau/MusicHub`.

## Boundaries

### Figma Owns

- Visual design
- Layout structure
- Component composition
- Presentation differences between Studio modes
- UX behavior intent
- Information hierarchy
- Copy and design-side handoff documentation

### Figma Does Not Own

- Repository history or release/version strategy
- Final repository structure decisions
- Runtime architecture
- State ownership
- Native/core contracts
- Transport, playback, recording, and connected-mode authority
- Final implementation file mapping
- Merge or release readiness

### Codex Owns

- Mapping design into the real `MusicHub` repository
- Implementation structure
- Runtime correctness
- State and command boundaries
- Integration with native/core systems
- Technical review of generated code before merge
- Final decision on what is accepted, adapted, or rebuilt

## Product Constraints

- MusicHub is desktop-first and desktop-primary.
- The frontend is React + TypeScript.
- The app runs inside a native shell (`src-tauri`).
- The native/core side is authoritative for audio, MIDI, transport, recording, and connected-mode behavior.
- Do not design or generate code as if browser-only parity is a product requirement.
- Do not invent a second source of truth for Studio runtime behavior.

## Repo Structure

- Respect the existing repository layout.
- Do not invent a new app root like `src/app/...`.
- Do not generate instructions that assume a different project structure.
- Use the real top-level folders that already exist:
  - `src/components`
  - `src/hooks`
  - `src/domain`
  - `src/services`
  - `src/types`
  - `src/pages`
  - `src/content`
  - `src-tauri`

## Studio Architecture

- Studio is one product with three presentation modes:
  - `guided`
  - `standard`
  - `focused`
- These are modes of one Studio, not separate products.
- Generated code must fit the existing mode-aware Studio shell, not replace it with a new standalone architecture.
- Guided mode must reduce cognitive load and not expose every DAW panel at once.

## Design-to-Code Expectations

- Generate code and docs as reference material, not as authoritative implementation.
- Prefer reusable components and clear interaction logic over generic scaffolding.
- Do not prescribe file paths unless they match the real `MusicHub` repo.
- Do not assume `react-router-dom` if the repo uses `react-router`.
- Do not assume a design system package or library that is not already present in the repo.

## Documentation and Handover

- Handover docs should describe design intent, interaction rules, and component boundaries.
- Handover docs must not claim generated code is production-ready without review.
- Do not include repository push/setup instructions in the handoff package.

## Preferred Output Format

- A clear design summary
- Reusable component breakdown
- Interaction and behavior notes
- Screen or mode-specific rationale
- Optional generated reference code, clearly marked as reference only
- No repository setup or deployment instructions

## What Good Output Looks Like

- Clear design intent
- Reusable UI components
- Explicit behavior rules
- Accurate references to the existing repository
- No duplicate repo setup
- No invented Git workflow
- No direct-to-main instructions

## What Bad Output Looks Like

- `src/app/...` as the authoritative project structure
- standalone Vite app instructions that ignore the existing repo
- arbitrary version tags like `v0.6.0`
- claims that generated code is ready to merge without technical review
