import type { LessonDefinition } from "@/types/musicHubLessonDsl";

export const mixerBasicsLesson: LessonDefinition = {
  lessonId: "studio.mixer-basics",
  title: "Meet the Mixer",
  moduleId: "studio-fundamentals",
  version: 1,
  difficulty: "beginner",
  estimatedMinutes: 4,
  layoutMode: "guided",
  objectives: [
    "Open the mixer panel",
    "Mute a track",
    "Solo a track",
  ],
  tags: ["mixer", "mute", "solo", "beginner"],
  steps: [
    {
      stepId: "open-mixer",
      title: "Open the Mixer",
      instruction:
        "Open the mixer panel by clicking the **Mixer** tab at the bottom of the Studio, or press **⌘M**.",
      anchor: {
        targetType: "panel",
        targetId: "mixer",
        highlight: "mixerPanel",
        placement: "bottom",
        fallbackText: "Click the Mixer tab or press ⌘M.",
      },
      expected: {
        kind: "command",
        type: "studio.openPanel",
      },
      validation: {
        kind: "selector",
        path: "panels.mixer",
        equals: true,
      },
      hints: [
        {
          id: "mixer-hint-shortcut",
          text: "You can also press ⌘M (Cmd+M) to toggle the mixer.",
          showAfterSeconds: 8,
        },
      ],
      next: "mute-track",
      skippable: true,
    },
    {
      stepId: "mute-track",
      title: "Mute a Track",
      instruction:
        "Click the **M** button on any channel strip to mute it. Notice how the meter goes silent.",
      anchor: {
        targetType: "mixer-strip",
        targetId: "any",
        highlight: "muteButton",
        placement: "right",
        fallbackText: "Look for the small M button on a channel strip.",
      },
      expected: {
        kind: "command",
        type: "studio.updateTrack",
      },
      validation: {
        all: [
          {
            kind: "ack",
            type: "studio.updateTrack",
            status: "applied_local",
            countGte: 1,
          },
          {
            kind: "selector",
            path: "tracks[].muted",
            equals: true,
          },
        ],
      },
      hints: [
        {
          id: "mute-hint-location",
          text: "Look for the small 'M' button near the bottom of each channel strip.",
          showAfterSeconds: 10,
        },
      ],
      next: "solo-track",
      skippable: true,
    },
    {
      stepId: "solo-track",
      title: "Solo a Track",
      instruction:
        "Click the **S** button on any channel strip to solo it. Only the soloed track will be audible.",
      anchor: {
        targetType: "mixer-strip",
        targetId: "any",
        highlight: "soloButton",
        placement: "right",
        fallbackText: "The S button is right next to the M (mute) button.",
      },
      expected: {
        kind: "command",
        type: "studio.updateTrack",
      },
      validation: {
        all: [
          {
            kind: "ack",
            type: "studio.updateTrack",
            status: "applied_local",
            countGte: 1,
          },
          {
            kind: "selector",
            path: "tracks[].solo",
            equals: true,
          },
        ],
      },
      hints: [
        {
          id: "solo-hint-location",
          text: "The 'S' button is right next to the 'M' (mute) button on each strip.",
          showAfterSeconds: 10,
        },
      ],
      skippable: true,
    },
  ],
};
