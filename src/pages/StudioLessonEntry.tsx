import { useMemo, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  LayoutPanelTop,
  PlayCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ProductMetaPill,
  ProductPageHeader,
  ProductSectionCard,
  ProductShell,
  ProductSurfaceGrid,
} from "@/components/app/ProductShell";
import {
  getLearningCourse,
  getLearningModule,
  getShellLabel,
  getSurfaceLabel,
} from "@/data/learningCatalog";
import { getStudioLessonById } from "@/content/lessons/studio";
import { useStudioLessonEntryState } from "@/hooks/useStudioLessonEntryState";
import type { StudioMode } from "@/types/musicHubStudioModes";

const modeMeta: Record<StudioMode, { label: string; description: string }> = {
  guided: {
    label: "Guided",
    description: "Keep lesson support persistent and bias the shell toward the current task.",
  },
  standard: {
    label: "Standard",
    description: "Open a broader production shell while keeping the lesson available.",
  },
  focused: {
    label: "Focused",
    description: "Use a denser shell when you already know the workflow and want maximum canvas.",
  },
};

export default function StudioLessonEntry() {
  const navigate = useNavigate();
  const { courseId, moduleId } = useParams();
  const course = getLearningCourse(courseId);
  const module = getLearningModule(courseId, moduleId);
  const lesson = getStudioLessonById(module?.studioLessonId);
  const [selectedMode, setSelectedMode] = useState<StudioMode>(module?.recommendedMode ?? "guided");
  const { current, recordLaunch, lastOpenedLabel } = useStudioLessonEntryState(lesson?.lessonId);
  const effectiveMode = current?.mode ?? selectedMode;
  const unavailableReason = useMemo(() => {
    if (lesson) return null;
    return module?.unavailableReason ?? "This module is not wired to a live Studio lesson yet.";
  }, [lesson, module?.unavailableReason]);

  if (!course || !module) {
    return <Navigate to="/learn" replace />;
  }

  const canOpenStudio = Boolean(lesson);

  const handleOpenStudio = () => {
    if (!lesson) return;
    recordLaunch(selectedMode);
    navigate(`/lab/studio?lesson=${encodeURIComponent(lesson.lessonId)}&mode=${selectedMode}`);
  };

  return (
    <ProductShell
      section="Courses"
      title={module.title}
      description="Use a lesson preflight before entering Studio so the mode, objectives, and runtime availability are explicit."
    >
      <ProductPageHeader
        eyebrow={`${course.title} / Studio Entry`}
        title={lesson ? lesson.title : module.title}
        description={
          lesson
            ? "Confirm the shell mode, review the live objectives, and enter Studio with a bounded lesson context."
            : "This module is visible in the curriculum, but it does not yet have a live Studio handoff."
        }
        meta={
          <>
            <ProductMetaPill>{module.duration}</ProductMetaPill>
            <ProductMetaPill>{getShellLabel(module.shell)}</ProductMetaPill>
            {lesson?.estimatedMinutes ? <ProductMetaPill>{lesson.estimatedMinutes} min lesson</ProductMetaPill> : null}
          </>
        }
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              className="font-mono text-xs"
              onClick={() => navigate(`/learn/course/${course.id}/module/${module.id}`)}
            >
              Back to Module
            </Button>
            <Button
              size="sm"
              className="font-mono text-xs"
              disabled={!canOpenStudio}
              onClick={handleOpenStudio}
            >
              {current ? "Continue in Studio" : "Start in Studio"} <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </>
        }
      />

      <ProductSurfaceGrid className="xl:grid-cols-12">
        <ProductSectionCard
          icon={BookOpen}
          eyebrow="Preflight"
          title={lesson ? "Live lesson summary" : "Lesson unavailable"}
          description={
            lesson
              ? lesson.objectives?.join(" ")
              : unavailableReason ?? "A concrete Studio lesson has not been connected yet."
          }
          className="xl:col-span-7"
        >
          {lesson ? (
            <div className="space-y-2">
              {lesson.objectives.map((objective, index) => (
                <div
                  key={`${lesson.lessonId}-${index}`}
                  className="flex items-start gap-2 rounded-2xl border border-border/60 bg-background/55 px-3 py-2"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="font-mono text-xs text-foreground">{objective}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-2xl border border-border/60 bg-background/55 p-4">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="font-mono text-xs leading-relaxed text-muted-foreground">
                {unavailableReason}
              </div>
            </div>
          )}
        </ProductSectionCard>

        <ProductSectionCard
          icon={Clock3}
          eyebrow="Resume"
          title="Current lesson continuity"
          description={
            current
              ? `Last opened ${lastOpenedLabel} in ${modeMeta[current.mode].label} mode.`
              : "No recorded Studio entry for this lesson yet."
          }
          className="xl:col-span-5"
        >
          <div className="rounded-2xl border border-border/60 bg-background/55 p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Entry state</div>
            <div className="mt-2 font-mono text-sm text-foreground">
              {current ? `${modeMeta[current.mode].label} · ${lastOpenedLabel}` : "First launch"}
            </div>
          </div>
        </ProductSectionCard>

        <ProductSectionCard
          icon={LayoutPanelTop}
          eyebrow="Mode"
          title="Choose the Studio shell"
          description="The runtime stays the same. This choice only changes shell density, default visibility, and emphasis."
          className="xl:col-span-12"
        >
          <div className="grid gap-3 md:grid-cols-3">
            {(Object.keys(modeMeta) as StudioMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSelectedMode(mode)}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                  selectedMode === mode
                    ? "border-primary/35 bg-primary/10"
                    : "border-border/60 bg-background/55 hover:border-primary/20"
                }`}
              >
                <div className="font-mono text-sm font-semibold text-foreground">{modeMeta[mode].label}</div>
                <div className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
                  {modeMeta[mode].description}
                </div>
              </button>
            ))}
          </div>
        </ProductSectionCard>

        <ProductSectionCard
          icon={PlayCircle}
          eyebrow="Shell Policy"
          title="Surfaces this module expects"
          description="The lesson contract defines which parts of Studio should be visible or emphasized on entry."
          className="xl:col-span-12"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-background/55 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Primary Surface</div>
              <div className="mt-2 font-mono text-sm text-foreground">{getSurfaceLabel(module.primarySurface)}</div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/55 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Selected Mode</div>
              <div className="mt-2 font-mono text-sm text-foreground">{modeMeta[effectiveMode].label}</div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/55 p-3 md:col-span-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Visible Surfaces</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {module.visibleSurfaces.map((surface) => (
                  <ProductMetaPill key={surface}>{getSurfaceLabel(surface)}</ProductMetaPill>
                ))}
              </div>
            </div>
          </div>
        </ProductSectionCard>
      </ProductSurfaceGrid>
    </ProductShell>
  );
}
