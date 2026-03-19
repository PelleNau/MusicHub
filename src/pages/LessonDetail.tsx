import { ArrowRight, Clock3, LayoutPanelTop, Sparkles } from "lucide-react";
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
  getLearningCourse,
  getLearningModule,
  getShellLabel,
  getSurfaceLabel,
} from "@/data/learningCatalog";

function getStatusCopy(status: "implemented" | "scaffolded" | "planned") {
  if (status === "implemented") return "This module has a live Studio lesson entry.";
  if (status === "scaffolded") return "Curriculum intent is defined, but the lesson runtime is not wired yet.";
  return "This module is planned in the catalog but does not have runtime scaffolding yet.";
}

export default function LessonDetail() {
  const navigate = useNavigate();
  const { courseId, moduleId } = useParams();
  const course = getLearningCourse(courseId);
  const module = getLearningModule(courseId, moduleId);

  if (!course || !module) {
    return <Navigate to="/learn" replace />;
  }

  const canOpenStudio = Boolean(module.studioLessonId);
  const studioEntryHref = `/learn/course/${course.id}/module/${module.id}/studio-entry`;

  return (
    <ProductShell
      section="Courses"
      title={module.title}
      description="Module detail now defines shell policy and Studio entry requirements directly inside the product."
    >
      <ProductPageHeader
        eyebrow={`${course.title} / Module`}
        title={module.title}
        description={module.summary}
        meta={
          <>
            <ProductMetaPill>{module.duration}</ProductMetaPill>
            <ProductMetaPill>{getShellLabel(module.shell)}</ProductMetaPill>
            <ProductMetaPill>{module.lessonCount} lesson{module.lessonCount === 1 ? "" : "s"}</ProductMetaPill>
          </>
        }
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              className="font-mono text-xs"
              onClick={() => navigate(`/learn/course/${course.id}`)}
            >
              Back to Course
            </Button>
            <Button
              size="sm"
              className="font-mono text-xs"
              onClick={() => navigate(studioEntryHref)}
            >
              {canOpenStudio ? "Open Studio Entry" : "Review Entry State"} <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </>
        }
      />

      <ProductSurfaceGrid className="xl:grid-cols-12">
        <ProductSectionCard
          icon={Sparkles}
          eyebrow="Goal"
          title="What this module is trying to teach"
          description={module.goal}
          className="xl:col-span-7"
        />

        <ProductSectionCard
          icon={Clock3}
          eyebrow="Runtime Status"
          title="Current implementation state"
          description={getStatusCopy(module.status)}
          className="xl:col-span-5"
        />

        <ProductSectionCard
          icon={LayoutPanelTop}
          eyebrow="Lesson Shell"
          title="Required shell behavior"
          description="The learning surface should control visible regions by policy, not by inventing separate DAW layouts."
          className="xl:col-span-12"
        >
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border/60 bg-background/55 p-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Primary Surface</div>
              <div className="mt-2 font-mono text-sm text-foreground">{getSurfaceLabel(module.primarySurface)}</div>
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
