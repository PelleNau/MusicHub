import { AlertCircle, ArrowRight, BookOpen, CheckCircle2, Clock3 } from "lucide-react";
import { Navigate, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  ProductMetaPill,
  ProductPageHeader,
  ProductSectionCard,
  ProductShell,
  ProductSurfaceGrid,
} from "@/components/app/ProductShell";
import {
  countImplementedModules,
  getLearningCourse,
  getShellLabel,
  listCourseModules,
} from "@/data/learningCatalog";

function getStatusLabel(status: "implemented" | "scaffolded" | "planned") {
  if (status === "implemented") return "Implemented";
  if (status === "scaffolded") return "Scaffolded";
  return "Planned";
}

export default function CourseDetail() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const course = getLearningCourse(courseId);

  if (!course) {
    return <Navigate to="/learn" replace />;
  }

  const modules = listCourseModules(course.id);
  const implemented = countImplementedModules(course.id);

  return (
    <ProductShell
      section="Courses"
      title={course.title}
      description="Course detail ties curriculum intent, shell policy, and concrete Studio entry points together."
    >
      <ProductPageHeader
        eyebrow="Course Detail"
        title={course.title}
        description={course.summary}
        meta={
          <>
            <ProductMetaPill>{course.duration}</ProductMetaPill>
            <ProductMetaPill>{modules.length} mapped modules</ProductMetaPill>
            <ProductMetaPill>{implemented} implemented</ProductMetaPill>
          </>
        }
        actions={
          <Button size="sm" variant="outline" className="font-mono text-xs" onClick={() => navigate("/learn")}>
            Back to Courses
          </Button>
        }
      />

      <ProductSurfaceGrid className="xl:grid-cols-12">
        {modules.map((module) => (
          <ProductSectionCard
            key={module.id}
            icon={BookOpen}
            eyebrow={getStatusLabel(module.status)}
            title={module.title}
            description={module.summary}
            className="xl:col-span-6"
            action={
              <Button
                size="sm"
                variant="ghost"
                className="font-mono text-xs"
                onClick={() => navigate(`/learn/course/${course.id}/module/${module.id}`)}
              >
                Open <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            }
          >
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-border/60 bg-background/55 p-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Shell</div>
                <div className="mt-2 font-mono text-sm text-foreground">{getShellLabel(module.shell)}</div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/55 p-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Duration</div>
                <div className="mt-2 flex items-center gap-2 font-mono text-sm text-foreground">
                  <Clock3 className="h-4 w-4 text-primary" />
                  {module.duration}
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/55 p-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Lessons</div>
                <div className="mt-2 font-mono text-sm text-foreground">{module.lessonCount}</div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/55 p-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Runtime</div>
                <div className="mt-2 flex items-center gap-2 font-mono text-sm text-foreground">
                  {module.studioLessonId ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      Studio entry wired
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-muted-foreground" />
                      Curriculum only
                    </>
                  )}
                </div>
              </div>
            </div>
          </ProductSectionCard>
        ))}
      </ProductSurfaceGrid>
    </ProductShell>
  );
}
