import type { LessonDefinition } from "@/types/lessonDsl";

/* ── Module 1 metadata ── */

export const MODULE_1_META = {
  levelId: 1,
  moduleId: "1-1",
  title: "What is Sound?",
  subtitle: "Level 1 · Sound & Pitch",
  xpPerPhase: { learn: 15, practice: 20, apply: 15 },
};

/* ── Lesson definitions ── */

export type LessonInteractive =
  | "soundExplorer"   // 1.1
  | "pitchScrub"      // 1.2
  | "dualBalance"     // 1.3
  | "waveformSelector"// 1.4
  | "timbrePresets"   // 1.5
  | "studioTour"      // 1.6
  | "soundShaping"    // 1.7
  | "capstone";       // Capstone

export interface ModuleLesson {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  keyTakeaway?: string;
  interactive: LessonInteractive;
  xp: number;
  /** Requirements that must be met before advancing */
  requirements: Record<string, string>; // key → human label
}

export const MODULE_1_LESSONS: ModuleLesson[] = [
  {
    id: "1.1",
    title: "Sound is Vibration",
    subtitle: "Hear cause & effect",
    body: "Everything you hear is caused by something vibrating — a guitar string, a drum head, your vocal cords, or a speaker cone. These vibrations push and pull air molecules, creating waves.\n\nUse the controls below to explore how **pitch** and **loudness** change the sound you hear.",
    keyTakeaway: "Sound is a pressure wave created by vibration — no vibration, no sound. You can control it with pitch and loudness.",
    interactive: "soundExplorer",
    xp: 10,
    requirements: {
      pitch: "Change the pitch",
      loudness: "Change the loudness",
    },
  },
  {
    id: "1.2",
    title: "Pitch",
    subtitle: "Frequency = how high or low",
    body: "**Pitch** is how high or low a sound is. It's determined by the **frequency** of the vibration — measured in Hertz (Hz).\n\n• Low frequency (e.g., 100 Hz) → low-pitched rumble\n• High frequency (e.g., 2000 Hz) → high-pitched whistle\n\nDrag the slider below to scrub through the full pitch range. Listen to how the sound changes continuously.",
    keyTakeaway: "Higher frequency = higher pitch. The note A4 = 440 Hz.",
    interactive: "pitchScrub",
    xp: 10,
    requirements: {
      scrub: "Explore the pitch range",
    },
  },
  {
    id: "1.3",
    title: "Loudness",
    subtitle: "Amplitude & volume control",
    body: "**Loudness** is how strong or quiet a sound is. It's determined by the **amplitude** — the size of the vibration.\n\nBelow are two different sounds playing at different volumes. Your task: **balance them** so they're equally loud. This is something producers do constantly when mixing music.",
    keyTakeaway: "Loudness = amplitude. Balancing volumes is a fundamental mixing skill.",
    interactive: "dualBalance",
    xp: 10,
    requirements: {
      balance: "Balance the two sounds",
    },
  },
  {
    id: "1.4",
    title: "Waveforms",
    subtitle: "The shape of sound",
    body: "A **waveform** is the shape of a sound wave over time. Different shapes produce different tonal qualities — even at the same pitch and volume.\n\n• **Sine** — pure, clean tone (like a flute)\n• **Square** — buzzy, hollow (like a retro game sound)\n• **Triangle** — softer, mellow (like a soft synth)\n• **Sawtooth** — rich, bright (like a brass instrument)\n\nExplore all four waveforms below.",
    keyTakeaway: "Waveform shape determines tone color. Same pitch, different character.",
    interactive: "waveformSelector",
    xp: 10,
    requirements: {
      explore: "Listen to all 4 waveforms",
    },
  },
  {
    id: "1.5",
    title: "Timbre",
    subtitle: "What makes instruments unique",
    body: "**Timbre** (pronounced 'TAM-ber') is what makes a piano sound different from a guitar, even when they play the same note at the same volume.\n\nIt's determined by the mix of overtones, attack shape, and other subtle qualities. Musicians use descriptive words like *bright*, *warm*, *harsh*, or *smooth* to talk about timbre.\n\nListen to the preset sounds below and tag each one with descriptors that match what you hear.",
    keyTakeaway: "Timbre = tone color. It's why different instruments sound unique.",
    interactive: "timbrePresets",
    xp: 10,
    requirements: {
      listen: "Listen to at least 3 presets",
      tag: "Tag sounds with descriptors",
    },
  },
  {
    id: "1.6",
    title: "Studio Surfaces",
    subtitle: "Know your workspace",
    body: "Before you start making music, let's get familiar with the **Studio** — MusicHub's main workspace.\n\nThe Studio has four key areas:\n• **Transport** — playback controls (play, stop, record, tempo)\n• **Browser** — your sound library\n• **Track Area** — where clips and patterns live\n• **Detail Panel** — properties and parameters\n\nTake a guided tour below to see each area highlighted.",
    keyTakeaway: "The Studio has four main surfaces: Transport, Browser, Tracks, and Detail Panel.",
    interactive: "studioTour",
    xp: 10,
    requirements: {
      tour: "Complete the studio tour",
    },
  },
  {
    id: "1.7",
    title: "Intentional Sound Shaping",
    subtitle: "Combine what you've learned",
    body: "Now it's time to **combine everything** — pitch, loudness, and waveform — to shape sound intentionally.\n\nYou'll be given descriptive prompts like *\"make this sound bright and quiet\"*. Use the controls to match the description by adjusting at least 2 parameters.\n\nThis is exactly how producers think: start with an idea, then shape sound to match it.",
    keyTakeaway: "Great producers think in descriptions, then translate to parameters.",
    interactive: "soundShaping",
    xp: 15,
    requirements: {
      shape: "Complete all sound shaping challenges",
    },
  },
];

export const CAPSTONE_LESSON: ModuleLesson = {
  id: "capstone",
  title: "Mini Sound Scene",
  subtitle: "Create your first composition",
  body: "Time for your **Capstone Project**! Create an 8-second sound scene using 3 contrasting sounds.\n\nFor each of the 3 lanes:\n1. Pick a preset sound\n2. Adjust its pitch and volume\n3. Make sure the sounds are distinct from each other\n\nWhen you're happy, hit **Play Scene** to hear your creation!",
  keyTakeaway: "You made music! Three contrasting sounds, shaped with intention.",
  interactive: "capstone",
  xp: 25,
  requirements: {
    sounds: "Add 3 sounds",
    contrast: "Use contrasting presets",
  },
};

/* ── Legacy exports (used by existing LessonContentViewer / EarTraining) ── */

export interface LearnPage {
  title: string;
  body: string;
  keyTakeaway?: string;
  interactive?: "waveform";
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export const LEARN_PAGES: LearnPage[] = [
  {
    title: "Sound is Vibration",
    body: "Everything you hear is caused by something vibrating — a guitar string, a drum head, your vocal cords, or even a speaker cone. These vibrations push and pull air molecules, creating waves that travel to your ears.\n\nThink of dropping a pebble in a pond: ripples spread outward in every direction. Sound works the same way, except the ripples are invisible pressure changes in the air.",
    keyTakeaway: "Sound is a pressure wave created by vibration — no vibration, no sound.",
  },
  {
    title: "Waveforms & Frequency",
    body: "When we draw sound as a picture, we get a **waveform** — a wavy line that shows how air pressure changes over time. The peaks represent high pressure (compression) and the valleys represent low pressure (rarefaction).\n\n**Frequency** measures how many complete cycles happen per second, measured in Hertz (Hz). A higher frequency means the wave cycles faster — and you hear a higher pitch.",
    interactive: "waveform",
  },
  {
    title: "Pitch = Frequency",
    body: "Your brain interprets frequency as **pitch** — the musical quality of highness or lowness.\n\n• **Low pitch** → slow vibrations → low frequency (e.g., 100 Hz bass rumble)\n• **High pitch** → fast vibrations → high frequency (e.g., 4000 Hz whistle)\n\nWhen musicians say a note is 'higher' or 'lower', they're describing frequency. The note A4 (the standard tuning reference) vibrates at exactly **440 Hz**.",
    keyTakeaway: "Higher frequency = higher pitch. The note A4 = 440 Hz.",
  },
  {
    title: "Knowledge Check",
    body: "Let's make sure you've got the core concept before moving on.",
    quiz: {
      question: "What determines whether a sound is high-pitched or low-pitched?",
      options: [
        "The loudness of the vibration",
        "The frequency (speed) of the vibration",
        "The size of the speaker",
        "The distance from the sound source",
      ],
      correctIndex: 1,
      explanation:
        "Frequency determines pitch. Faster vibrations (higher Hz) produce higher-pitched sounds, while slower vibrations produce lower-pitched sounds.",
    },
  },
];

export interface PracticeExercise {
  id: string;
  type: "classify" | "compare";
  prompt: string;
  frequencyA: number;
  frequencyB?: number;
  correctAnswer: string;
  options: string[];
}

export const PRACTICE_EXERCISES: PracticeExercise[] = [
  { id: "ex-1", type: "classify", prompt: "Listen to this tone. Is it high or low?", frequencyA: 150, correctAnswer: "Low", options: ["High", "Low"] },
  { id: "ex-2", type: "classify", prompt: "Listen to this tone. Is it high or low?", frequencyA: 1200, correctAnswer: "High", options: ["High", "Low"] },
  { id: "ex-3", type: "compare", prompt: "Which tone has a higher pitch?", frequencyA: 330, frequencyB: 660, correctAnswer: "Tone B", options: ["Tone A", "Tone B"] },
  { id: "ex-4", type: "compare", prompt: "Which tone has a higher pitch?", frequencyA: 880, frequencyB: 440, correctAnswer: "Tone A", options: ["Tone A", "Tone B"] },
  { id: "ex-5", type: "classify", prompt: "Listen to this tone. Is it high or low?", frequencyA: 2500, correctAnswer: "High", options: ["High", "Low"] },
];

export const APPLY_LESSON: LessonDefinition = {
  lessonId: "L1-M1-apply",
  title: "Explore Pitch in Studio",
  module: "What is Sound?",
  duration: "5 min",
  objectives: [
    "Play back the original clip",
    "Modify pitch using the detail panel",
    "Compare the transposed result",
  ],
  steps: [
    { stepId: "apply-1", instruction: "Press the Play button to hear the original clip.", anchor: "studio.transport", expectedAction: "transport.play", hint: "The transport bar is at the top of the Studio — click the ▶ button." },
    { stepId: "apply-2", instruction: 'Select the "Melody" track by clicking its header.', anchor: "studio.trackHeader.Melody", expectedAction: "track.select", hint: "Look for the track labeled 'Melody' in the track list on the left." },
    { stepId: "apply-3", instruction: "In the Detail Panel, raise the pitch by +12 semitones using the Pitch slider.", anchor: "studio.detailPanel", expectedAction: "param.change", validation: { parameter: "pitch", delta: 12 }, hint: "Find the Pitch slider and drag it up to +12, or type 12." },
    { stepId: "apply-4", instruction: "Press Play again and listen to the difference!", anchor: "studio.transport", expectedAction: "transport.play", hint: "Hit ▶ one more time — hear how the melody jumped up an octave?" },
  ],
  capstone: { requirements: { playbackOccurred: true, parameterChanges: 1 } },
};
