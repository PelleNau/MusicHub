import { useNavigate } from "react-router-dom";
import { Layout, Home, GraduationCap, Layers, Music, PanelLeft, BookOpen, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCKUPS = [
  { title: "Dashboard", desc: "New home screen — XP, progress, quick starts, recent projects", icon: Home, route: "/mockup/dashboard" },
  { title: "Learn Home", desc: "Learning Ladder — 8-level vertical timeline with progression", icon: GraduationCap, route: "/mockup/learn" },
  { title: "Level Detail", desc: "Single level view — modules with Learn/Practice/Apply/Checkpoint", icon: Layers, route: "/mockup/learn/level" },
  { title: "Module Flow", desc: "Full Learn → Practice → Apply experience for Module 1: What is Sound?", icon: BookOpen, route: "/mockup/learn/module" },
  { title: "Studio + Lesson Guide", desc: "Studio with contextual lesson guide panel & theory reference", icon: Music, route: "/mockup/studio" },
  { title: "App Shell", desc: "Persistent sidebar + top bar layout — collapsible navigation", icon: PanelLeft, route: "/mockup/shell" },
  { title: "Lesson DSL Preview", desc: "Interactive lesson preview — step through DSL definitions with anchor highlights", icon: BookOpen, route: "/mockup/lesson-preview" },
  { title: "Studio (Ocean Theme)", desc: "DAW layout with dawn-lagoon glassmorphism — collapsible lesson guide panel", icon: Palette, route: "/mockup/studio-themed" },
  { title: "Curriculum Explorer", desc: "All 36 modules across 6 courses — dense bento grid with expand-to-explore", icon: GraduationCap, route: "/mockup/curriculum" },
];

export default function MockIndex() {
  const navigate = useNavigate();

  return (
    <div className="dawn-lagoon dawn-lagoon-bg min-h-screen text-foreground flex flex-col">
      <header className="h-12 border-b border-border flex items-center px-4 gap-3 bg-chrome shrink-0">
        <Layout className="h-5 w-5 text-primary" />
        <span className="font-mono text-sm font-semibold">Platform Mockups</span>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div
          className="max-w-lg text-center mb-10 animate-fade-in"
          style={{ animationDelay: "0ms", animationFillMode: "backwards" }}
        >
          <h1 className="text-2xl font-mono font-bold mb-2">UX Mockups</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Static prototypes of the new platform layout — explore each to review the proposed navigation, dashboard, learning path, and studio integration.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
          {MOCKUPS.map((m, i) => (
            <div
              key={m.route}
              className="animate-fade-in rounded-2xl backdrop-blur-xl bg-white/[0.06] border border-white/[0.08] cursor-pointer
                         transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_24px_-6px_hsl(var(--primary)/0.25)] group"
              style={{ animationDelay: `${(i + 1) * 80}ms`, animationFillMode: "backwards" }}
              onClick={() => navigate(m.route)}
            >
              <div className="p-5 flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <m.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-mono font-semibold">{m.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
