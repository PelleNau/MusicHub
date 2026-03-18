import type { LessonDefinition } from "@/types/musicHubLessonDsl";
import { transportBasicsLesson } from "@/content/lessons/studio/transportBasicsLesson";
import { midiClipBasicsLesson } from "@/content/lessons/studio/midiClipBasicsLesson";
import { mixerBasicsLesson } from "@/content/lessons/studio/mixerBasicsLesson";

const studioLessons: Record<string, LessonDefinition> = {
  [transportBasicsLesson.lessonId]: transportBasicsLesson,
  [midiClipBasicsLesson.lessonId]: midiClipBasicsLesson,
  [mixerBasicsLesson.lessonId]: mixerBasicsLesson,
};

export function getStudioLessonById(lessonId?: string | null): LessonDefinition | undefined {
  if (!lessonId) return undefined;
  return studioLessons[lessonId];
}

export function listStudioLessons(): LessonDefinition[] {
  return Object.values(studioLessons);
}
