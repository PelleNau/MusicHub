import type { LessonDefinition } from "@/types/musicHubLessonDsl";
import { transportBasicsLesson } from "@/content/lessons/studio/transportBasicsLesson";
import { midiClipBasicsLesson } from "@/content/lessons/studio/midiClipBasicsLesson";
import { mixerBasicsLesson } from "@/content/lessons/studio/mixerBasicsLesson";
import { audioEditingBasicsLesson } from "@/content/lessons/studio/audioEditingBasicsLesson";
import { instrumentChainBasicsLesson } from "@/content/lessons/studio/instrumentChainBasicsLesson";
import { recordingBasicsLesson } from "@/content/lessons/studio/recordingBasicsLesson";
import { sketchCapstoneLesson } from "@/content/lessons/studio/sketchCapstoneLesson";

const studioLessons: Record<string, LessonDefinition> = {
  [transportBasicsLesson.lessonId]: transportBasicsLesson,
  [midiClipBasicsLesson.lessonId]: midiClipBasicsLesson,
  [mixerBasicsLesson.lessonId]: mixerBasicsLesson,
  [audioEditingBasicsLesson.lessonId]: audioEditingBasicsLesson,
  [instrumentChainBasicsLesson.lessonId]: instrumentChainBasicsLesson,
  [recordingBasicsLesson.lessonId]: recordingBasicsLesson,
  [sketchCapstoneLesson.lessonId]: sketchCapstoneLesson,
};

export function getStudioLessonById(lessonId?: string | null): LessonDefinition | undefined {
  if (!lessonId) return undefined;
  return studioLessons[lessonId];
}

export function listStudioLessons(): LessonDefinition[] {
  return Object.values(studioLessons);
}
