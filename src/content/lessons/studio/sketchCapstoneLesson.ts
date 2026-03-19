import type { LessonDefinition } from "@/types/musicHubLessonDsl";

export const sketchCapstoneLesson: LessonDefinition = {
  lessonId: "studio.sketch-capstone",
  moduleId: "studio-fundamentals",
  version: 1,
  title: "Build a Full Sketch",
  difficulty: "beginner",
  estimatedMinutes: 7,
  layoutMode: "standard",
  objectives: [
    "Create the core tracks for a first sketch.",
    "Load an instrument and place a MIDI clip into the arrangement.",
    "Prepare an audio track and confirm the sketch plays back as one bounded setup.",
  ],
  tags: ["studio", "capstone", "arrangement", "instrument", "recording"],
  viewPolicy: {
    panels: {
      guide: "show",
      browser: "show",
      detail: "show",
      mixer: "hide",
      pianoRoll: "hide",
    },
    viewport: {
      focus: "arrangement",
    },
    interaction: {
      emphasizeAnchor: true,
      dimNonEssentialPanels: true,
    },
  },
  steps: [
    {
      stepId: "create-midi-track",
      title: "Create the instrument lane",
      instruction: "Add a MIDI track so the sketch has a lane for harmony or melody.",
      anchor: {
        targetType: "panel",
        targetId: "timeline",
        highlight: "addMidiTrack",
        placement: "top",
        fallbackText: "Use the + MIDI button in the arrangement toolbar.",
      },
      expected: {
        kind: "command",
        type: "studio.createTrack",
      },
      validation: {
        all: [
          { kind: "ack", type: "studio.createTrack", status: "applied_local", countGte: 1 },
          { kind: "selector", path: "tracks.firstMidiTrack.id", exists: true },
        ],
      },
      next: "load-instrument",
      skippable: true,
    },
    {
      stepId: "load-instrument",
      title: "Load the instrument",
      instruction: "Use the Browser to add an instrument or chain to the MIDI track you just created.",
      anchor: {
        targetType: "panel",
        targetId: "browser",
        placement: "left",
        fallbackText: "Use the Browser to add an instrument to the selected MIDI track.",
      },
      expected: {
        kind: "command",
        type: "browser.addDevice",
      },
      validation: {
        kind: "ack",
        type: "browser.addDevice",
        status: "applied_local",
        countGte: 1,
      },
      next: "create-midi-clip",
      skippable: true,
    },
    {
      stepId: "create-midi-clip",
      title: "Place the musical idea",
      instruction: "Double-click in the MIDI lane to create a clip that can hold the main sketch idea.",
      anchor: {
        targetType: "track-lane",
        targetId: "first-midi-track",
        placement: "center",
        fallbackText: "Double-click in the first MIDI track lane to create a clip.",
      },
      expected: {
        kind: "command",
        type: "studio.createClip",
      },
      validation: {
        all: [
          { kind: "ack", type: "studio.createClip", status: "applied_local", countGte: 1 },
          { kind: "selector", path: "selection.selectedClipIds", countGte: 1 },
        ],
      },
      next: "add-audio-track",
      skippable: true,
    },
    {
      stepId: "add-audio-track",
      title: "Add the audio lane",
      instruction: "Add an audio track so the sketch can also hold vocals, guitar, or another recorded layer.",
      anchor: {
        targetType: "panel",
        targetId: "timeline",
        highlight: "addAudioTrack",
        placement: "top",
        fallbackText: "Use the + Audio button in the arrangement toolbar.",
      },
      expected: {
        kind: "command",
        type: "studio.createTrack",
      },
      validation: {
        all: [
          { kind: "ack", type: "studio.createTrack", status: "applied_local", countGte: 2 },
          { kind: "selector", path: "tracks.firstAudioTrack.id", exists: true },
        ],
      },
      next: "arm-audio-track",
      skippable: true,
    },
    {
      stepId: "arm-audio-track",
      title: "Prepare the audio track",
      instruction: "Arm the audio track so the sketch is ready for a recorded layer when you need it.",
      anchor: {
        targetType: "track",
        targetId: "first-audio-track",
        highlight: "armToggle",
        placement: "left",
        fallbackText: "Use the red R button on the first audio track.",
      },
      expected: {
        kind: "command",
        type: "studio.updateTrack",
      },
      validation: {
        all: [
          { kind: "ack", type: "studio.updateTrack", status: "applied_local", countGte: 1 },
          { kind: "selector", path: "tracks.firstAudioTrack.nativeArmed", equals: true },
        ],
      },
      next: "play-the-sketch",
      skippable: true,
    },
    {
      stepId: "play-the-sketch",
      title: "Play the sketch",
      instruction: "Press Play to confirm the sketch setup is live across transport, arrangement, and track state.",
      anchor: {
        targetType: "panel",
        targetId: "transport.play",
        highlight: "transportPlay",
        placement: "top",
        fallbackText: "Use the Play control in the transport bar.",
      },
      expected: {
        kind: "command",
        type: "transport.play",
      },
      validation: {
        all: [
          { kind: "ack", type: "transport.play", status: "applied_local", countGte: 1 },
          { kind: "selector", path: "transport.playbackState", equals: "playing" },
        ],
      },
      skippable: true,
    },
  ],
};
