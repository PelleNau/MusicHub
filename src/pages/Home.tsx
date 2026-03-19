import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Music,
  Package,
  Sparkles,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useInventory } from "@/hooks/useInventory";
import {
  ProductMetaPill,
  ProductPageHeader,
  ProductSectionCard,
  ProductShell,
  ProductSurfaceGrid,
} from "@/components/app/ProductShell";

function ActivityHeatmap() {
  const data = useMemo(
    () =>
      Array.from({ length: 56 }, (_, index) => {
        const cycle = index % 7;
        if (cycle === 0 || cycle === 4) return 3;
        if (cycle === 2 || cycle === 5) return 2;
        if (cycle === 1 || cycle === 6) return 1;
        return 0;
      }),
    [],
  );

  return (
    <div>
      <div className="grid grid-cols-7 gap-1">
        {data.map((value, index) => (
          <div
            key={index}
            className="aspect-square rounded-sm"
            style={{
              backgroundColor:
                value === 0 ? "hsl(var(--muted) / 0.28)"
                : value === 1 ? "hsl(var(--primary) / 0.22)"
                : value === 2 ? "hsl(var(--primary) / 0.5)"
                : "hsl(var(--primary) / 0.86)",
            }}
          />
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground">
        <span>Less</span>
        {[0.18, 0.28, 0.5, 0.86].map((opacity) => (
          <div
            key={opacity}
            className="h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: `hsl(var(--primary) / ${opacity})` }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { items } = useInventory();
  const gearCount = items?.length ?? 0;

  return (
    <ProductShell
      section="Home"
      title="Workspace"
      description="Continue learning, resume production, and move between theory, lab, and inventory without changing products."
    >
      <ProductPageHeader
        eyebrow="Home"
        title="Make music. Learn why it works."
        description="MusicHub is one desktop workspace for lessons, theory, exploration, and production. Start from intent, then move directly into the right surface."
        meta={
          <>
            <ProductMetaPill>Desktop-first workflow</ProductMetaPill>
            <ProductMetaPill>{gearCount} items in Flight Case</ProductMetaPill>
            <ProductMetaPill>Guide-aware Studio modes</ProductMetaPill>
          </>
        }
        actions={
          <>
            <Button size="sm" className="font-mono text-xs" onClick={() => navigate("/learn")}>
              Continue Learning
            </Button>
            <Button size="sm" variant="outline" className="font-mono text-xs" onClick={() => navigate("/lab/studio")}>
              Open Studio
            </Button>
          </>
        }
      />

      <ProductSurfaceGrid>
        <ProductSectionCard
          icon={Sparkles}
          title="Start where the current task is"
          description="Use Home as the intent router. Move into Guided Studio for active lessons, Standard Studio for ongoing production, or a support surface when you need context first."
          className="xl:col-span-7"
        >
          <div className="grid gap-3 md:grid-cols-3">
            <button
              type="button"
              onClick={() => navigate("/learn")}
              className="rounded-2xl border border-border/60 bg-background/55 p-4 text-left transition-colors hover:border-primary/30 hover:bg-background/75"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Learn</div>
              <div className="mt-2 font-mono text-sm font-semibold text-foreground">Continue lesson</div>
              <div className="mt-1 font-mono text-xs leading-relaxed text-muted-foreground">
                Resume the next curriculum step and enter Guided Studio with lesson support in place.
              </div>
            </button>
            <button
              type="button"
              onClick={() => navigate("/lab/studio")}
              className="rounded-2xl border border-border/60 bg-background/55 p-4 text-left transition-colors hover:border-primary/30 hover:bg-background/75"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Create</div>
              <div className="mt-2 font-mono text-sm font-semibold text-foreground">Resume session</div>
              <div className="mt-1 font-mono text-xs leading-relaxed text-muted-foreground">
                Open the current production workspace and keep mode, markers, and guide policy intact.
              </div>
            </button>
            <button
              type="button"
              onClick={() => navigate("/lab")}
              className="rounded-2xl border border-border/60 bg-background/55 p-4 text-left transition-colors hover:border-primary/30 hover:bg-background/75"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Explore</div>
              <div className="mt-2 font-mono text-sm font-semibold text-foreground">Enter Lab</div>
              <div className="mt-1 font-mono text-xs leading-relaxed text-muted-foreground">
                Experiment with theory, analysis, and routing surfaces before committing work back into Studio.
              </div>
            </button>
          </div>
        </ProductSectionCard>

        <ProductSectionCard
          icon={Zap}
          title="Activity"
          description="A compact view of recent momentum across the workspace."
          className="xl:col-span-5"
        >
          <ActivityHeatmap />
        </ProductSectionCard>

        <ProductSectionCard
          icon={Music}
          eyebrow="Studio"
          title="Production workspace"
          description="Guided, Standard, and Focused all run on the same Studio runtime. Choose the shell density that matches the session."
          className="xl:col-span-4"
          action={
            <Button variant="ghost" size="sm" className="font-mono text-xs" onClick={() => navigate("/lab/studio")}>
              Open <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          }
        />

        <ProductSectionCard
          icon={BookOpen}
          eyebrow="Courses"
          title="Structured learning"
          description="Curriculum, lessons, and entry states should lead directly into the right Studio mode instead of living as a separate LMS."
          className="xl:col-span-4"
          action={
            <Button variant="ghost" size="sm" className="font-mono text-xs" onClick={() => navigate("/learn")}>
              Open <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          }
        />

        <ProductSectionCard
          icon={Brain}
          eyebrow="Theory"
          title="Reference and applied tools"
          description="Theory stays close to production. Move from concept work into exploration and then back into Studio without changing systems."
          className="xl:col-span-4"
          action={
            <Button variant="ghost" size="sm" className="font-mono text-xs" onClick={() => navigate("/lab/theory")}>
              Explore <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          }
        />

        <ProductSectionCard
          icon={Package}
          eyebrow="Flight Case"
          title="Gear and library state"
          description={`Your inventory currently tracks ${gearCount} items. This surface should stay operational, not decorative.`}
          className="xl:col-span-12"
          action={
            <Button variant="ghost" size="sm" className="font-mono text-xs" onClick={() => navigate("/inventory")}>
              Open Flight Case <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          }
        />
      </ProductSurfaceGrid>
    </ProductShell>
  );
}
