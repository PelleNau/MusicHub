import type { LessonDefinition } from "@/types/musicHubLessonDsl";

export const recordingBasicsLesson: LessonDefinition = {
  lessonId: "studio.recording-basics",
  moduleId: "studio-fundamentals",
  version: 1,
  title: "Recording Basics",
  difficulty: "beginner",
  estimatedMinutes: 5,
  layoutMode: "guided",
  objectives: [
    "Add an audio track for recording.",
    "Arm and monitor the track you want to capture.",
    "Start and stop recording from the real transport path.",
  ],
  tags: ["studio", "recording", "audio", "guide"],
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
      instruction: "Click the + Audio button in the arrangement toolbar to create a track for recording.",
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
          { kind: "ack", type: "studio.createTrack", status: "applied_local", countGte: 1 },
          { kind: "selector", path: "tracks.firstAudioTrack.id", exists: true },
        ],
      },
      next: "arm-audio-track",
      skippable: true,
    },
    {
      stepId: "arm-audio-track",
      title: "Arm the audio track",
      instruction: "Use the R button on the first audio track so the transport can record into it.",
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
      next: "enable-input-monitoring",
      skippable: true,
    },
    {
      stepId: "enable-input-monitoring",
      title: "Enable input monitoring",
      instruction: "Click the I button on the same track so incoming audio is monitored before you record.",
      anchor: {
        targetType: "track",
        targetId: "first-audio-track",
        highlight: "monitorToggle",
        placement: "left",
        fallbackText: "Use the I button on the first audio track.",
      },
      expected: {
        kind: "command",
        type: "studio.updateTrack",
      },
      validation: {
        all: [
          { kind: "ack", type: "studio.updateTrack", status: "applied_local", countGte: 2 },
          { kind: "selector", path: "tracks.firstAudioTrack.nativeMonitoring", equals: true },
        ],
      },
      next: "start-recording",
      skippable: true,
    },
    {
      stepId: "start-recording",
      title: "Start recording",
      instruction: "Press the record button in the transport to start a real recording pass.",
      anchor: {
        targetType: "panel",
        targetId: "transport.record",
        highlight: "transportRecord",
        placement: "top",
        fallbackText: "Use the record button in the transport bar.",
      },
      expected: {
        kind: "command",
        type: "transport.toggleRecord",
      },
      validation: {
        all: [
          { kind: "ack", type: "transport.toggleRecord", status: "applied_local", countGte: 1 },
          { kind: "selector", path: "connection.recording", equals: true },
        ],
      },
      next: "stop-recording",
      skippable: true,
    },
    {
      stepId: "stop-recording",
      title: "Stop recording",
      instruction: "Press the record button again to stop the take cleanly.",
      anchor: {
        targetType: "panel",
        targetId: "transport.record",
        highlight: "transportRecord",
        placement: "top",
        fallbackText: "Use the record button in the transport bar again.",
      },
      expected: {
        kind: "command",
        type: "transport.toggleRecord",
      },
      validation: {
        all: [
          { kind: "command", type: "transport.toggleRecord", countGte: 2 },
          { kind: "selector", path: "connection.recording", equals: false },
        ],
      },
      skippable: true,
    },
  ],
};
