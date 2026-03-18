import { useState } from "react";
import { BookOpen, Play, Clock, Target, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { listStudioLessons } from "@/content/lessons/studio";
import type { LessonDefinition } from "@/types/musicHubLessonDsl";

interface LessonLauncherProps {
  activeLessonId?: string | null;
  onStartLesson: (lessonId: string) => void;
}

export function LessonLauncher({ activeLessonId, onStartLesson }: LessonLauncherProps) {
  const [open, setOpen] = useState(false);
  const lessons = listStudioLessons();

  const handleStart = (lessonId: string) => {
    onStartLesson(lessonId);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="font-mono text-xs gap-1.5 text-foreground/70 border border-border/50 hover:border-border hover:text-foreground"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Lessons
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[340px] sm:w-[380px] font-mono">
        <SheetHeader>
          <SheetTitle className="font-mono text-sm">Studio Lessons</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-2">
          {lessons.length === 0 ? (
            <p className="text-xs text-muted-foreground">No lessons available yet.</p>
          ) : (
            lessons.map((lesson) => (
              <LessonCard
                key={lesson.lessonId}
                lesson={lesson}
                isActive={activeLessonId === lesson.lessonId}
                onStart={() => handleStart(lesson.lessonId)}
              />
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function LessonCard({
  lesson,
  isActive,
  onStart,
}: {
  lesson: LessonDefinition;
  isActive: boolean;
  onStart: () => void;
}) {
  return (
    <div
      className={`rounded-lg border p-3 space-y-2 transition-colors ${
        isActive
          ? "border-primary/50 bg-primary/5"
          : "border-border bg-card hover:border-border/80"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-foreground">{lesson.title}</p>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            {lesson.difficulty && (
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 font-mono">
                {lesson.difficulty}
              </Badge>
            )}
            {lesson.estimatedMinutes && (
              <span className="flex items-center gap-0.5">
                <Clock className="h-2.5 w-2.5" />
                {lesson.estimatedMinutes}m
              </span>
            )}
            <span className="flex items-center gap-0.5">
              <Target className="h-2.5 w-2.5" />
              {lesson.steps.length} steps
            </span>
          </div>
        </div>
        <Button
          size="sm"
          variant={isActive ? "secondary" : "default"}
          className="h-7 px-2.5 text-[10px] gap-1"
          onClick={onStart}
        >
          {isActive ? (
            <>Active</>
          ) : (
            <>
              <Play className="h-2.5 w-2.5" /> Start
            </>
          )}
        </Button>
      </div>
      {lesson.objectives && lesson.objectives.length > 0 && (
        <ul className="space-y-0.5">
          {lesson.objectives.map((obj, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
              <ChevronRight className="h-2.5 w-2.5 mt-0.5 shrink-0 text-primary/60" />
              {obj}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
