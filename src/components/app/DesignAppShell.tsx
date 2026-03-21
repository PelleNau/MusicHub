import { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Grid3X3,
  Layers3,
  MonitorPlay,
  Music2,
  Palette,
  Piano,
  SlidersHorizontal,
  SlidersVertical,
} from "lucide-react";

import { cn } from "@/lib/utils";

type DesignShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  contentClassName?: string;
};

type DesignNavItem = {
  label: string;
  path: string;
  icon: typeof Layers3;
};

const navItems: DesignNavItem[] = [
  { label: "Home", path: "/design-studio", icon: Layers3 },
  { label: "Arrangement", path: "/design/arrangement", icon: Music2 },
  { label: "Piano Roll", path: "/design/piano-roll", icon: Piano },
  { label: "Mixer", path: "/design/mixer", icon: SlidersVertical },
  { label: "Components", path: "/design/components", icon: Grid3X3 },
  { label: "Library", path: "/design/library", icon: SlidersHorizontal },
  { label: "Lesson Theme", path: "/design/lesson-theme", icon: Palette },
  { label: "System Capture", path: "/design/system-capture", icon: MonitorPlay },
];

function matchesPath(pathname: string, path: string) {
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function DesignAppShell({
  title,
  description,
  children,
  contentClassName,
}: DesignShellProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0f1116] text-white">
      <div className="flex min-h-screen">
        <aside className="w-[260px] shrink-0 border-r border-white/10 bg-[#14161d] px-5 py-6">
          <div className="mb-8 space-y-2">
            <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-cyan-300/70">MusicHub Design</div>
            <div className="font-mono text-sm text-white/55">Separate desktop target for design review and UI iteration.</div>
          </div>

          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = matchesPath(pathname, item.path);
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left font-mono text-sm transition-colors",
                    active
                      ? "bg-cyan-400/12 text-cyan-200 shadow-[inset_0_0_0_1px_rgba(103,232,249,0.22)]"
                      : "text-white/68 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="border-b border-white/10 bg-[#12141a] px-6 py-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.24em] text-white/42">Design Workspace</div>
            <div className="mt-1 font-mono text-lg font-semibold tracking-tight text-white">{title}</div>
            {description ? <div className="mt-1 max-w-4xl font-mono text-sm text-white/56">{description}</div> : null}
          </header>

          <main className={cn("min-h-0 flex-1 overflow-auto px-6 py-6", contentClassName)}>{children}</main>
        </div>
      </div>
    </div>
  );
}
