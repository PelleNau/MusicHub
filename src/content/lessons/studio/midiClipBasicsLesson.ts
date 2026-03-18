import type { LessonDefinition } from "@/types/musicHubLessonDsl";

export const midiClipBasicsLesson: LessonDefinition = {
  lessonId: "studio.midi-clip-basics",
  moduleId: "studio-basics",
  version: 1,
  title: "Create Your First MIDI Clip",
  difficulty: "beginner",
  estimatedMinutes: 5,
  layoutMode: "guided",
  objectives: [
    "Add a MIDI track to the session.",
    "Create an empty MIDI clip on the track.",
    "Open the piano roll editor.",
  ],
  tags: ["studio", "midi", "clip", "guide"],
  steps: [
    {
      stepId: "add-midi-track",
      title: "Add a MIDI track",
      instruction: "Click the + MIDI button to add a new MIDI track.",
      anchor: {
        targetType: "panel",
        targetId: "timeline",
        highlight: "addMidiTrack",
        placement: "center",
        fallbackText: "Use the + MIDI button in the timeline toolbar.",
      },
      expected: {
        kind: "command",
        type: "studio.createTrack",
      },
      validation: {
        all: [
          {
            kind: "ack",
            type: "studio.createTrack",
            status: "applied_local",
            countGte: 1,
          },
          {
            kind: "selector",
            path: "tracks.count",
            gte: 1,
          },
        ],
      },
      next: "create-midi-clip",
      skippable: true,
    },
    {
      stepId: "create-midi-clip",
      title: "Create a MIDI clip",
      instruction: "Double-click in the track lane to create an empty MIDI clip.",
      anchor: {
        targetType: "track-lane",
        targetId: "first-midi-track",
        highlight: "trackLane",
        placement: "center",
        fallbackText: "Double-click in the MIDI track lane area.",
      },
      expected: {
        kind: "command",
        type: "studio.createClip",
      },
      validation: {
        all: [
          {
            kind: "ack",
            type: "studio.createClip",
            status: "applied_local",
            countGte: 1,
          },
          {
            kind: "selector",
            path: "selection.selectedClipIds",
            countGte: 1,
          },
        ],
      },
      next: "open-piano-roll",
      skippable: true,
    },
    {
      stepId: "open-piano-roll",
      title: "Open the piano roll",
      instruction: "Double-click the MIDI clip to open the piano roll editor.",
      anchor: {
        targetType: "clip",
        targetId: "first-midi-clip",
        highlight: "clip",
        placement: "bottom",
        fallbackText: "Double-click on the MIDI clip you just created.",
      },
      expected: {
        kind: "command",
        type: "studio.openPanel",
      },
      validation: {
        kind: "selector",
        path: "panels.pianoRoll",
        equals: true,
      },
      skippable: true,
    },
  ],
};
