import { useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useInventory } from "@/hooks/useInventory";
import {
  Package, BookOpen, Music, Brain, Zap,
  ChevronRight, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";


/* ── Types ── */
type CardId = "hero" | "activity" | "studio" | "learning" | "theory" | "flightcase";

/* ── Icon with glow ── */
function GlowIcon({ icon: Icon, color }: { icon: React.ElementType; color: "primary" | "accent" | "success" | "warning" }) {
  const glowMap = {
    primary: "shadow-[0_0_20px_hsl(var(--primary)/0.25)]",
    accent: "shadow-[0_0_20px_hsl(var(--accent)/0.25)]",
    success: "shadow-[0_0_20px_hsl(var(--success)/0.25)]",
    warning: "shadow-[0_0_20px_hsl(var(--warning)/0.25)]",
  };
  return (
    <div className={`h-11 w-11 rounded-xl bg-white/[0.08] flex items-center justify-center shrink-0 ${glowMap[color]}`}>
      <Icon className="h-5 w-5 text-foreground" />
    </div>
  );
}

/* ── Activity Heatmap ── */
function ActivityHeatmap() {
  const data = useMemo(
    () =>
      Array.from({ length: 56 }, () => {
        const r = Math.random();
        return r > 0.7 ? 3 : r > 0.4 ? 2 : r > 0.15 ? 1 : 0;
      }),
    [],
  );

  return (
    <>
      <div className="grid grid-cols-7 gap-1">
        {data.map((v, i) => (
          <div
            key={i}
            className="aspect-square rounded-sm"
            style={{
              backgroundColor:
                v === 0 ? "hsl(var(--muted) / 0.3)"
                : v === 1 ? "hsl(var(--primary) / 0.25)"
                : v === 2 ? "hsl(var(--primary) / 0.55)"
                : "hsl(var(--primary) / 0.9)",
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-3 text-[9px] text-muted-foreground font-mono">
        <span>Less</span>
        {[0.15, 0.25, 0.55, 0.9].map((o) => (
          <div key={o} className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: `hsl(var(--primary) / ${o})` }} />
        ))}
        <span>More</span>
      </div>
    </>
  );
}

/* ── Floating music notes ── */
function FloatingNotes() {
  const notes = ["♩", "♪", "♫", "♬"];
  return (
    <>
      {notes.map((n, i) => (
        <span
          key={i}
          className="absolute text-primary/10 font-mono text-xl animate-float pointer-events-none select-none"
          style={{
            top: `${15 + i * 20}%`,
            left: `${5 + i * 25}%`,
            animationDelay: `${i * 0.8}s`,
            animationDuration: `${3 + i * 0.5}s`,
          }}
        >
          {n}
        </span>
      ))}
    </>
  );
}

/* ── Dashboard ── */
export default function Home() {
  const navigate = useNavigate();
  const { items } = useInventory();
  const gearCount = items?.length ?? 0;
  const [expandedCard, setExpandedCard] = useState<CardId | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback((id: CardId) => {
    setExpandedCard((prev) => (prev === id ? null : id));
  }, []);

  const handleNavigate = useCallback(
    (path: string, e: React.MouseEvent) => {
      e.stopPropagation();
      navigate(path);
    },
    [navigate],
  );

  return (
    <div className="dark dawn-lagoon dawn-lagoon-bg min-h-screen w-full">
      {expandedCard && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          style={{ transition: "opacity 0.3s ease" }}
          onClick={() => setExpandedCard(null)}
        />
      )}

      <main className="flex-1 overflow-auto pb-24 relative">
        
        <div className="max-w-6xl mx-auto px-5 py-6">
          <div ref={gridRef} className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            <GlassCard
              className="lg:col-span-2 p-7 flex flex-col justify-center gap-3"
              staggerIndex={0}
              expanded={expandedCard === "hero"}
              containerRef={gridRef}
              onClick={() => toggle("hero")}
              texture="grunge"
              textureOpacity={15}
            >
              <h1 className="font-mono text-lg font-bold tracking-tight text-foreground">
                Make music. Learn why it works.
              </h1>
              <p className="font-mono text-xs text-muted-foreground leading-relaxed max-w-md">
                Your creative workspace for production, theory, and ear training — all in one place.
              </p>
              <div className="pt-2">
                <Button
                  onClick={(e) => handleNavigate("/learn", e)}
                  size="sm"
                  className="font-mono text-xs"
                >
                  Start Learning
                </Button>
              </div>
            </GlassCard>

            <GlassCard
              className="p-6"
              staggerIndex={1}
              expanded={expandedCard === "activity"}
              containerRef={gridRef}
              onClick={() => toggle("activity")}
            >
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-4 w-4 text-primary" />
                <span className="font-mono text-xs font-medium text-foreground">Activity</span>
              </div>
              <ActivityHeatmap />
            </GlassCard>

            <GlassCard
              className="lg:row-span-2 p-6 flex flex-col"
              staggerIndex={2}
              expanded={expandedCard === "studio"}
              containerRef={gridRef}
              onClick={() => toggle("studio")}
              texture="grunge"
              textureOpacity={15}
            >
              <GlowIcon icon={Music} color="primary" />
              <div className="mt-auto pt-6 space-y-2">
                <h2 className="font-mono text-sm font-semibold text-foreground">Studio</h2>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                  Production workspace with timeline, mixer, and MIDI editing.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-mono text-xs gap-1 text-muted-foreground px-0 hover:text-foreground"
                  onClick={(e) => handleNavigate("/lab/studio", e)}
                >
                  Open Studio <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </GlassCard>

            <GlassCard
              className="lg:col-span-2 p-6 flex items-center gap-4"
              staggerIndex={3}
              expanded={expandedCard === "learning"}
              containerRef={gridRef}
              onClick={() => toggle("learning")}
            >
              <GlowIcon icon={BookOpen} color="accent" />
              <div className="flex-1 min-w-0">
                <h2 className="font-mono text-sm font-semibold text-foreground">Learning</h2>
                <p className="font-mono text-xs text-muted-foreground mt-1 leading-relaxed">
                  Structured curriculum from foundations to mastery.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={(e) => handleNavigate("/learn", e)}
              >
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-40" />
              </Button>
            </GlassCard>

            <GlassCard
              className="p-6 flex flex-col gap-4"
              staggerIndex={4}
              expanded={expandedCard === "theory"}
              containerRef={gridRef}
              onClick={() => toggle("theory")}
              texture="geo-blocks"
              textureOpacity={15}
            >
              <GlowIcon icon={Brain} color="success" />
              <div className="space-y-1">
                <h2 className="font-mono text-sm font-semibold text-foreground">Music Theory</h2>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                  Scales, chords &amp; harmony.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="font-mono text-xs gap-1 text-muted-foreground px-0 hover:text-foreground mt-auto"
                onClick={(e) => handleNavigate("/lab/theory", e)}
              >
                Explore <ChevronRight className="h-3 w-3" />
              </Button>
            </GlassCard>

            <GlassCard
              className="p-6 flex flex-col gap-4"
              staggerIndex={5}
              expanded={expandedCard === "flightcase"}
              containerRef={gridRef}
              onClick={() => toggle("flightcase")}
            >
              <GlowIcon icon={Package} color="warning" />
              <div className="space-y-1">
                <h2 className="font-mono text-sm font-semibold text-foreground">Flight Case</h2>
                <p className="font-mono text-xs text-muted-foreground leading-relaxed">
                  {gearCount} items in your gear collection.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="font-mono text-xs gap-1 text-muted-foreground px-0 hover:text-foreground mt-auto"
                onClick={(e) => handleNavigate("/inventory", e)}
              >
                Open <ChevronRight className="h-3 w-3" />
              </Button>
            </GlassCard>

          </div>
        </div>
      </main>
    </div>
  );
}
