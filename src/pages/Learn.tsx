import { ArrowRight, BookOpen, CheckCircle2, Clock3, Music4 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  ProductMetaPill,
  ProductPageHeader,
  ProductSectionCard,
  ProductShell,
  ProductSurfaceGrid,
} from "@/components/app/ProductShell";
import { countImplementedModules, listCourseModules, listLearningCourses } from "@/data/learningCatalog";

export default function Learn() {
  const navigate = useNavigate();
  const courses = listLearningCourses();

  return (
    <ProductShell
      section="Courses"
      title="Learning path"
      description="Real shell-based curriculum surfaces tied to the current Studio runtime and lesson system."
    >
      <ProductPageHeader
        eyebrow="Courses"
        title="Move from guided fundamentals to full creation"
        description="The learning path now lives inside the real product shell. Courses define module goals, shell policy, and Studio entry, instead of redirecting through mock-only surfaces."
        meta={
          <>
            <ProductMetaPill>{courses.length} courses</ProductMetaPill>
            <ProductMetaPill>Studio-linked modules in Course 2 and Course 5</ProductMetaPill>
            <ProductMetaPill>Guided-to-standard progression</ProductMetaPill>
          </>
        }
      />

      <ProductSurfaceGrid className="xl:grid-cols-12">
        {courses.map((course) => {
          const modules = listCourseModules(course.id);
          const implemented = countImplementedModules(course.id);
          return (
            <ProductSectionCard
              key={course.id}
              icon={BookOpen}
              eyebrow={course.tagline}
              title={course.title}
              description={course.summary}
              className="xl:col-span-6"
              action={
                <Button
                  size="sm"
                  variant="ghost"
                  className="font-mono text-xs"
                  onClick={() => navigate(`/learn/course/${course.id}`)}
                >
                  Open <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              }
            >
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-border/60 bg-background/55 p-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Duration</div>
                  <div className="mt-2 flex items-center gap-2 font-mono text-sm text-foreground">
                    <Clock3 className="h-4 w-4 text-primary" />
                    {course.duration}
                  </div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/55 p-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Modules</div>
                  <div className="mt-2 flex items-center gap-2 font-mono text-sm text-foreground">
                    <Music4 className="h-4 w-4 text-primary" />
                    {modules.length} of {course.moduleCount} mapped
                  </div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-background/55 p-3">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Implemented</div>
                  <div className="mt-2 flex items-center gap-2 font-mono text-sm text-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {implemented} module{implemented === 1 ? "" : "s"} live
                  </div>
                </div>
              </div>
            </ProductSectionCard>
          );
        })}
      </ProductSurfaceGrid>
    </ProductShell>
  );
}
