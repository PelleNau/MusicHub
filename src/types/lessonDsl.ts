/** MusicHub Lesson DSL type definitions — v0.1 */

export interface StepValidation {
  parameter: string;
  delta?: number;
  changed?: boolean;
  eventCount?: number;
}

export interface LessonStep {
  stepId: string;
  instruction: string;
  anchor: string;
  highlight?: string;
  expectedAction?: string;
  validation?: StepValidation;
  hint?: string;
  reset?: string;
  nextStep?: string;
  telemetry?: string;
}

export interface CapstoneDefinition {
  requirements: {
    minimumTracks?: number;
    parameterChanges?: number;
    playbackOccurred?: boolean;
  };
}

export interface LessonAsset {
  id: string;
  type: "preset" | "sample" | "midi";
  url?: string;
}

export interface LessonDefinition {
  lessonId: string;
  title: string;
  module: string;
  duration: string;
  objectives: string[];
  steps: LessonStep[];
  assets?: LessonAsset[];
  capstone?: CapstoneDefinition;
}
