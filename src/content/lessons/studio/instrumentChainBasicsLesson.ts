import type { LessonDefinition } from "@/types/musicHubLessonDsl";

export const instrumentChainBasicsLesson: LessonDefinition = {
  lessonId: "studio.instrument-chain-basics",
  moduleId: "studio-fundamentals",
  version: 1,
  title: "Instruments, Presets, and Chains",
  difficulty: "beginner",
  estimatedMinutes: 5,
  layoutMode: "guided",
  objectives: [
    "Add a MIDI track for an instrument.",
    "Load an instrument from the browser.",
    "Open the detail workspace to inspect the selected track.",
  ],
  tags: ["studio", "browser", "instrument", "chain", "guide"],
  viewPolicy: {
    panels: {
      guide: "show",
      browser: "show",
      detail: "show",
      mixer: "hide",
      pianoRoll: "hide",
    },
    viewport: {
      focus: "browser",
    },
    interaction: {
      emphasizeAnchor: true,
      dimNonEssentialPanels: true,
    },
  },
  steps: [
    {
      stepId: "add-midi-track",
      title: "Add a MIDI track",
      instruction: "Click the + MIDI button in the timeline toolbar to create a track for an instrument.",
      anchor: {
        targetType: "panel",
        targetId: "timeline",
        highlight: "addMidiTrack",
        placement: "top",
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
      next: "select-midi-track",
      skippable: true,
    },
    {
      stepId: "select-midi-track",
      title: "Select the MIDI track",
      instruction: "Click the MIDI track lane so the browser adds the device to the track you are working on.",
      anchor: {
        targetType: "track-lane",
        targetId: "first-midi-track",
        placement: "center",
        fallbackText: "Click the first MIDI track lane.",
      },
      expected: {
        kind: "command",
        type: "studio.select",
      },
      validation: {
        all: [
          {
            kind: "command",
            type: "studio.select",
            countGte: 1,
          },
          {
            kind: "selector",
            path: "selection.selectedTrack.type",
            equals: "midi",
          },
        ],
      },
      next: "add-instrument",
      skippable: true,
    },
    {
      stepId: "add-instrument",
      title: "Load an instrument",
      instruction: "Use the browser to add an instrument to the selected MIDI track.",
      anchor: {
        targetType: "panel",
        targetId: "browser",
        placement: "left",
        fallbackText: "Use the Browser panel to add an instrument or preset chain.",
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
      next: "open-detail-workspace",
      skippable: true,
    },
    {
      stepId: "open-detail-workspace",
      title: "Inspect the track detail",
      instruction: "Open the Detail tab so you can inspect the selected track after adding the instrument.",
      anchor: {
        targetType: "panel",
        targetId: "detail",
        placement: "top",
        fallbackText: "Use the Detail tab in the bottom workspace.",
      },
      viewPolicy: {
        panels: {
          detail: "show",
        },
        viewport: {
          focus: "detail",
        },
      },
      expected: {
        kind: "command",
        type: "studio.openPanel",
      },
      validation: {
        all: [
          {
            kind: "ack",
            type: "studio.openPanel",
            status: "applied_local",
            countGte: 1,
          },
          {
            kind: "selector",
            path: "detailPanel.track.id",
            exists: true,
          },
        ],
      },
      skippable: true,
    },
  ],
};
