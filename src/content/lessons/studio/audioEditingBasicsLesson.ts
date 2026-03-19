import type { LessonDefinition } from "@/types/musicHubLessonDsl";

export const audioEditingBasicsLesson: LessonDefinition = {
  lessonId: "studio.audio-edit-basics",
  moduleId: "studio-fundamentals",
  version: 1,
  title: "Audio Editing Fundamentals",
  difficulty: "beginner",
  estimatedMinutes: 4,
  layoutMode: "guided",
  objectives: [
    "Add an audio track to the session.",
    "Select the audio track you want to edit.",
    "Open the detail workspace for the selected track.",
  ],
  tags: ["studio", "audio", "editing", "guide"],
  viewPolicy: {
    panels: {
      guide: "show",
      browser: "hide",
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
      stepId: "add-audio-track",
      title: "Add an audio track",
      instruction: "Click the + Audio button in the timeline toolbar to add a new audio track.",
      anchor: {
        targetType: "panel",
        targetId: "timeline",
        highlight: "addAudioTrack",
        placement: "top",
        fallbackText: "Use the + Audio button in the timeline toolbar.",
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
      next: "select-audio-track",
      skippable: true,
    },
    {
      stepId: "select-audio-track",
      title: "Select the audio track",
      instruction: "Click the new audio track lane so the editor context follows that track.",
      anchor: {
        targetType: "track-lane",
        targetId: "first-audio-track",
        placement: "center",
        fallbackText: "Click the lane area of the first audio track.",
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
            equals: "audio",
          },
        ],
      },
      next: "open-detail-workspace",
      skippable: true,
    },
    {
      stepId: "open-detail-workspace",
      title: "Open the detail workspace",
      instruction: "Open the Detail tab in the bottom workspace so the selected track is ready for editing.",
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
