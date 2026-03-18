import type { LessonDefinition } from "@/types/musicHubLessonDsl";

export const transportBasicsLesson: LessonDefinition = {
  lessonId: "studio.transport-basics",
  moduleId: "studio-basics",
  version: 1,
  title: "Transport Basics",
  difficulty: "beginner",
  estimatedMinutes: 3,
  layoutMode: "guided",
  objectives: [
    "Start playback from the transport.",
    "Stop playback and confirm transport state.",
    "Set a loop region around the current arrangement.",
  ],
  tags: ["studio", "transport", "guide"],
  steps: [
    {
      stepId: "playback-start",
      title: "Start playback",
      instruction: "Press Play in the transport.",
      anchor: {
        targetType: "panel",
        targetId: "transport.play",
        highlight: "transportPlay",
        placement: "bottom",
        fallbackText: "Use the Play control in the top transport bar.",
      },
      expected: {
        kind: "command",
        type: "transport.play",
      },
      validation: {
        all: [
          {
            kind: "ack",
            type: "transport.play",
            status: "applied_local",
            countGte: 1,
          },
          {
            kind: "selector",
            path: "transport.playbackState",
            equals: "playing",
          },
        ],
      },
      next: "playback-stop",
      skippable: true,
    },
    {
      stepId: "playback-stop",
      title: "Stop playback",
      instruction: "Stop playback from the transport.",
      anchor: {
        targetType: "panel",
        targetId: "transport.stop",
        highlight: "transportStop",
        placement: "bottom",
        fallbackText: "Use the Stop control in the transport bar.",
      },
      expected: {
        kind: "command",
        type: "transport.stop",
      },
      validation: {
        all: [
          {
            kind: "ack",
            type: "transport.stop",
            status: "applied_local",
            countGte: 1,
          },
          {
            kind: "selector",
            path: "transport.playbackState",
            equals: "stopped",
          },
        ],
      },
      next: "set-loop",
      skippable: true,
    },
    {
      stepId: "set-loop",
      title: "Enable looping",
      instruction: "Turn looping on and define a loop range.",
      anchor: {
        targetType: "panel",
        targetId: "timeline",
        highlight: "loopRegion",
        placement: "top",
        fallbackText: "Use the loop region in the timeline.",
      },
      expected: {
        kind: "command",
        type: "transport.setLoop",
      },
      validation: {
        all: [
          {
            kind: "ack",
            type: "transport.setLoop",
            status: "applied_local",
            countGte: 1,
          },
          {
            kind: "selector",
            path: "transport.currentBeat",
            gte: 0,
          },
        ],
      },
      skippable: true,
    },
  ],
};
