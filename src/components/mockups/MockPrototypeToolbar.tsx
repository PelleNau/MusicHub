import { useNavigate, useLocation } from "react-router-dom";
import { X, Eye, EyeOff, Home, GraduationCap, Layers, Music, PanelLeft, LayoutDashboard, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMockPrototype } from "./MockPrototypeContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const PAGES = [
  { label: "Dashboard", path: "/mockup/dashboard", icon: LayoutDashboard },
  { label: "Learn", path: "/mockup/learn", icon: GraduationCap },
  { label: "Level", path: "/mockup/learn/level", icon: Layers },
  { label: "Module", path: "/mockup/learn/module", icon: BookOpen },
  { label: "Studio", path: "/mockup/studio", icon: Music },
  { label: "Shell", path: "/mockup/shell", icon: PanelLeft },
  { label: "Lesson", path: "/mockup/lesson-preview", icon: BookOpen },
];

export function MockPrototypeToolbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { showHotspots, toggleHotspots } = useMockPrototype();

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-2 py-1.5
                 rounded-full backdrop-blur-xl bg-white/[0.08] border border-white/[0.12]
                 shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-fade-in"
      style={{ animationDelay: "300ms", animationFillMode: "backwards" }}
    >
      {/* Close — back to index */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/mockup")}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs font-mono">Back to Index</TooltipContent>
      </Tooltip>

      <div className="w-px h-4 bg-white/[0.12] mx-1" />

      {/* Page tabs */}
      {PAGES.map((page) => {
        const active = pathname === page.path;
        const Icon = page.icon;
        return (
          <Tooltip key={page.path}>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate(page.path)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-mono transition-all duration-200 ${
                  active
                    ? "bg-primary text-primary-foreground shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
                }`}
              >
                <Icon className="h-3 w-3" />
                <span className="hidden sm:inline">{page.label}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs font-mono sm:hidden">
              {page.label}
            </TooltipContent>
          </Tooltip>
        );
      })}

      <div className="w-px h-4 bg-white/[0.12] mx-1" />

      {/* Hotspots toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`h-7 w-7 rounded-full transition-colors ${
              showHotspots ? "text-primary bg-primary/20" : "text-muted-foreground"
            }`}
            onClick={toggleHotspots}
          >
            {showHotspots ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs font-mono">
          {showHotspots ? "Hide Hotspots" : "Show Hotspots"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
