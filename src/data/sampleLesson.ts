import type { LessonDefinition } from "@/types/lessonDsl";

export const LESSON_UNDERSTANDING_PITCH: LessonDefinition = {
  lessonId: "L3-M1-pitch",
  title: "Understanding Pitch",
  module: "Level 3 — Module 1",
  duration: "~10 min",
  objectives: [
    "Understand how pitch relates to frequency",
    "Identify high vs low pitch by ear",
    "Use the pitch slider to transpose a clip",
  ],
  steps: [
    {
      stepId: "play-original",
      instruction: "Press Play to hear the original melody clip. Listen carefully to the pitch of each note.",
      anchor: "studio.transport",
      expectedAction: "transport.play",
      hint: "Click the ▶ button in the transport bar or press Space.",
      telemetry: "step.started",
    },
    {
      stepId: "open-detail",
      instruction: "Select the Melody track to open its detail panel on the right.",
      anchor: "studio.trackHeader.Melody",
      highlight: "studio.detailPanel",
      expectedAction: "track.selected",
      hint: "Click on the 'Melody' track header to select it.",
    },
    {
      stepId: "adjust-pitch",
      instruction: "In the Detail Panel, find the Pitch slider and raise it by +12 semitones (one octave up).",
      anchor: "studio.detailPanel",
      expectedAction: "param.changed",
      validation: { parameter: "pitch", delta: 12 },
      hint: "Drag the Pitch knob clockwise, or type 12 in the value field.",
    },
    {
      stepId: "compare",
      instruction: "Press Play again to hear the transposed melody. Notice how the notes sound higher but the pattern is the same.",
      anchor: "studio.transport",
      expectedAction: "transport.play",
      validation: { parameter: "playback", eventCount: 2 },
      hint: "Hit Space or click ▶ to play back your changes.",
    },
  ],
  assets: [
    { id: "melody-c-major", type: "midi" },
  ],
};

export const LESSON_WRITE_MELODY: LessonDefinition = {
  lessonId: "L3-M3-melody",
  title: "Write a Melody in C Major",
  module: "Level 3 — Module 3",
  duration: "~15 min",
  objectives: [
    "Create a new MIDI track",
    "Write a 4-bar melody in C major",
    "Include at least one octave leap",
  ],
  steps: [
    {
      stepId: "create-track",
      instruction: "Create a new MIDI track by clicking the + button in the track list area.",
      anchor: "studio.trackList",
      expectedAction: "track.created",
      hint: "Look for the '+' icon below the existing tracks.",
    },
    {
      stepId: "set-tempo",
      instruction: "Set the project tempo to 120 BPM using the tempo field in the transport bar.",
      anchor: "studio.transport",
      expectedAction: "tempo.changed",
      validation: { parameter: "tempo", delta: 0, changed: true },
      hint: "Click the BPM number in the transport bar and type 120.",
    },
    {
      stepId: "open-piano-roll",
      instruction: "Double-click the empty clip area on your new track to open the Piano Roll editor.",
      anchor: "studio.pianoRoll",
      expectedAction: "pianoRoll.opened",
      hint: "Double-click the empty region in your MIDI track.",
    },
    {
      stepId: "write-notes",
      instruction: "Draw at least 8 notes using only C major scale notes (C D E F G A B). Aim for a singable melody.",
      anchor: "studio.pianoRoll",
      expectedAction: "note.created",
      validation: { parameter: "noteCount", eventCount: 8 },
      hint: "Click on the piano roll grid to place notes. White keys only!",
    },
    {
      stepId: "add-leap",
      instruction: "Add one octave leap — place a note at least 12 semitones away from its neighbour.",
      anchor: "studio.pianoRoll",
      expectedAction: "note.created",
      validation: { parameter: "intervalMax", delta: 12 },
      hint: "Try jumping from a low C to a high C (or any note 12+ semitones apart).",
    },
  ],
  capstone: {
    requirements: {
      minimumTracks: 1,
      parameterChanges: 2,
      playbackOccurred: true,
    },
  },
};

export const SAMPLE_LESSONS: LessonDefinition[] = [
  LESSON_UNDERSTANDING_PITCH,
  LESSON_WRITE_MELODY,
];
