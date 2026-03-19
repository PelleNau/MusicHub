# MH-046 Design System Foundation

## Decision

The Figma design system should enter `MusicHub` first as a semantic token layer and bounded shell refinements, not as a generated component architecture.

## Accepted Input

- color tokens and surface hierarchy from the Figma export theme layer
- semantic shell vocabulary for:
  - product shell
  - Studio transport/header chrome
  - lesson surfaces
  - arrangement/timeline surfaces
- bounded control patterns already mapped into real Studio components

## Rejected Input

- generated `src/app/...` repo structure
- generated state/context architecture
- generated Git or release workflow
- any claim that a feature is implemented unless it exists in the real `MusicHub` runtime

## Implementation Rule

When Figma adds new design-system material:

1. import or translate tokens into the real app theme layer
2. apply them to existing shell primitives and real product surfaces
3. keep the runtime and repo architecture unchanged unless there is an independent engineering reason to change it

## First Bounded Import

The first import from the Figma design system is:

- token alignment in `src/index.css`
- product shell visual refinement in `src/components/app/ProductShell.tsx`
- Studio shell refinement in:
  - `src/components/studio/StudioHeaderBar.tsx`
  - `src/components/studio/StudioGuideSidebar.tsx`
  - `src/components/studio/StudioArrangementWorkspace.tsx`
