# MusicHub UX Journey v1

## Product Frame

MusicHub should feel like one environment with three user intents:

- `Learn`
- `Create`
- `Explore`

These intents map to the system like this:

- `Learn` -> guided Studio lessons + Theory
- `Create` -> Studio production workflow
- `Explore` -> Lab experimentation + Flight Case discovery

Top-level destinations should be:

- `Home`
- `Studio`
- `Lab`
- `Theory`
- `Flight Case`

`Bridge` should remain infrastructure, settings, and diagnostics. It should not be a primary destination for normal users.

## Primary Journey

The first journey to optimize is:

1. user logs in
2. user lands on `Home`
3. `Home` presents the best next action
4. user enters `Studio` in the right mode
5. lesson guidance, production, and theory links stay in one session context
6. user completes a task and continues without losing momentum

This is the core product promise:

1. learn
2. try
3. understand
4. produce

## Screen Map

### Login

Purpose:

- get the user in fast
- state what MusicHub is in one sentence

Content:

- title: `MusicHub`
- subtitle: `Learn, experiment, and produce in one environment.`
- support line: `Start with a lesson or jump straight into Studio.`

Do not place deep navigation or system concepts here.

### Home

Purpose:

- restore context
- route intent
- present the best next action

Section order:

1. `Continue where you left off`
2. `Choose your path`
3. `Recent sessions`
4. `Current lessons`
5. `System status`

Primary action block should prefer one of:

- `Continue Lesson`
- `Resume Session`
- `Start Guided Session`

Then show three intent cards:

- `Learn`
- `Create`
- `Explore`

Home should be an intent router, not a DAW launcher or analytics dashboard.

### Learn Entry

Purpose:

- guide the user into a structured path

Visible:

- current path
- recommended next lesson
- lesson categories

Lesson categories:

- transport
- clips
- notes
- arrangement
- mixing
- sound design

Primary outcomes:

- continue lesson
- preview lesson
- open theory explanation
- start guided Studio session

### Studio

Studio should support three modes of emphasis, not three separate architectures.

#### Guided

Used when a lesson is active.

Visible:

- lesson panel open
- target highlights
- next-step instruction
- reduced distraction

#### Standard

Default production mode.

Visible:

- full Studio layout
- guide available but secondary
- lesson panel collapsible

#### Focused

Expert-heavy mode.

Visible:

- minimal guide chrome
- dense production layout

### Theory

Purpose:

- explain musical concepts through current user work

Theory should connect back into real clips, notes, scales, harmony, and structure from Studio sessions.

### Lab

Purpose:

- support low-pressure experimentation

Key rule:

- Lab output should be movable into Studio

### Flight Case

Purpose:

- organize resources

It should support action:

- preview
- favorite
- insert into Studio or Lab

## Navigation Model

### Global Navigation

- `Home`
- `Studio`
- `Lab`
- `Theory`
- `Flight Case`

Secondary utility:

- connection status
- audio engine status
- settings
- account
- help

### Studio-Local Surfaces

- transport
- browser
- timeline
- detail
- piano roll
- mixer
- lesson panel

These are workspace surfaces, not separate apps.

## State Transitions

From `Home`:

- `Continue Lesson` -> `Studio` in `Guided`
- `Resume Session` -> `Studio` in `Standard`
- `Start New Session` -> `Studio` with onboarding hints
- `Explore Concepts` -> `Theory` or `Lab`
- `Browse Assets` -> `Flight Case`

From `Studio`:

- open `Theory` for explanation of current material
- open `Lab` to experiment on selected material
- return to `Home` without losing session identity

From `Theory`:

- `Apply in Studio`
- `Try in Lab`

From `Lab`:

- `Send to Studio`
- `Save experiment`

## First Journey To Implement

Design and implement this first:

1. login
2. `Home`
3. `Continue learning`
4. `Studio` in guided mode
5. lesson panel visible
6. transport lesson or clip lesson runs
7. completion surface appears
8. user chooses:
   - next lesson
   - open theory
   - keep working in Studio

If this flow feels coherent, the product direction is working.

## Immediate UI Priorities

Build now:

- login screen
- `Home` intent router
- lesson-first Studio shell
- lesson header
- lesson progress rail
- lesson step cards
- completion surface
- guided layout chrome
- theory/lab cross-links

Avoid for now:

- deep piano-roll behavior redesign
- transport authority changes
- mutation-heavy rewrites
- exposing `Bridge` as a primary destination
