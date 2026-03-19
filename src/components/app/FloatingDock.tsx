import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sparkles, GraduationCap, Brain, Music, Sliders, Puzzle,
  Package, Settings, LogOut,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { SettingsSheet } from "@/components/SettingsSheet";

import { useAuth } from "@/hooks/useAuth";

const NAV_ITEMS = [
  { label: "Home", icon: Sparkles, path: "/" },
  { label: "Learning", icon: GraduationCap, path: "/learn" },
  { label: "Theory", icon: Brain, path: "/lab/theory" },
  { label: "Studio", icon: Music, path: "/lab/studio" },
  { label: "Patch Lab", icon: Sliders, path: "/lab/patch-lab" },
  { label: "Bridge", icon: Puzzle, path: "/lab/bridge" },
  { label: "Flight Case", icon: Package, path: "/inventory" },
] as const;

function shouldHideDock(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/lab" ||
    pathname === "/inventory" ||
    pathname === "/lab/bridge" ||
    pathname === "/lab/deep-dive" ||
    pathname.startsWith("/lab/theory")
  );
}

function isActive(pathname: string, itemPath: string) {
  if (itemPath === "/") return pathname === "/";
  return pathname.startsWith(itemPath);
}

export function FloatingDock() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (shouldHideDock(pathname)) {
    return <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />;
  }

  return (
    <>
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-2 py-1.5 rounded-2xl backdrop-blur-2xl bg-card/80 border border-border/60 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.path);
          return (
            <Tooltip key={item.path}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate(item.path)}
                  className={`relative h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    active
                      ? "bg-primary/15 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.2)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
                  }`}
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {active && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-[3px] w-3 rounded-full bg-primary" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="font-mono text-xs">
                {item.label}
              </TooltipContent>
            </Tooltip>
          );
        })}

        {/* Divider */}
        <div className="h-6 w-px bg-border/50 mx-0.5" />


        {/* Settings */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setSettingsOpen(true)}
              className="h-10 w-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-all duration-200"
            >
              <Settings className="h-[18px] w-[18px]" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="font-mono text-xs">Settings</TooltipContent>
        </Tooltip>

        {/* Sign Out */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={signOut}
              className="h-10 w-10 rounded-xl flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-white/[0.06] transition-all duration-200"
            >
              <LogOut className="h-[18px] w-[18px]" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="font-mono text-xs">Sign Out</TooltipContent>
        </Tooltip>
      </nav>

      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
      
    </>
  );
}
