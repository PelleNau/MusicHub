import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Home, GraduationCap, Music, Sliders, Puzzle, Package, Search as SearchIcon, Headphones,
  Settings, LogOut, Sun, Zap, Flame, BookOpen,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { MockBreadcrumb } from "@/components/mockups/MockBreadcrumb";
import { MockXPProvider, useMockXP } from "@/components/mockups/MockXPContext";
import { MockPrototypeProvider } from "@/components/mockups/MockPrototypeContext";

const NAV_GROUPS = [
  {
    key: "main",
    label: null,
    items: [
      { label: "Home", icon: Home, path: "/" },
    ],
  },
  {
    key: "learn",
    label: "Learn",
    items: [
      { label: "Learning Path", icon: GraduationCap, path: "/mockup/learn" },
      { label: "Theory Reference", icon: SearchIcon, path: "/mockup/theory" },
      { label: "Curriculum", icon: BookOpen, path: "/mockup/curriculum" },
    ],
  },
  {
    key: "create",
    label: "Create",
    items: [
      { label: "Studio", icon: Music, path: "/mockup/studio" },
      { label: "Patch Lab", icon: Sliders, path: "/mockup/patch-lab" },
      { label: "Bridge", icon: Puzzle, path: "/mockup/bridge" },
    ],
  },
  {
    key: "manage",
    label: "Manage",
    items: [
      { label: "Flight Case", icon: Package, path: "/mockup/inventory" },
    ],
  },
] as const;

function isRouteActive(pathname: string, itemPath: string) {
  if (itemPath === "/mockup") return pathname === "/mockup";
  return pathname.startsWith(itemPath);
}

function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-2">
          <Headphones className="h-5 w-5 text-primary shrink-0" />
          {!collapsed && <span className="font-mono text-sm font-bold tracking-tight">MusicHub</span>}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map((group, gi) => {
          const groupDelay = gi * 60;
          return (
            <SidebarGroup
              key={group.key}
              className="animate-fade-in"
              style={{ animationDelay: `${groupDelay}ms`, animationFillMode: "backwards" }}
            >
              {group.label && (
                <SidebarGroupLabel className="text-[10px] uppercase tracking-wider">
                  {!collapsed ? group.label : "—"}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item, ii) => {
                    const active = isRouteActive(pathname, item.path);
                    const itemDelay = groupDelay + 30 + ii * 20;
                    return (
                      <SidebarMenuItem
                        key={item.label}
                        className="animate-fade-in"
                        style={{ animationDelay: `${itemDelay}ms`, animationFillMode: "backwards" }}
                      >
                        <SidebarMenuButton
                          onClick={() => navigate(item.path)}
                          className={active ? "bg-sidebar-accent text-sidebar-primary font-medium" : ""}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span>{item.label}</span>}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="p-2">
        <SidebarMenu>
          {[
            { icon: Sun, label: "Theme" },
            { icon: Settings, label: "Settings" },
            { icon: LogOut, label: "Sign Out" },
          ].map((item, fi) => (
            <SidebarMenuItem
              key={item.label}
              className="animate-fade-in"
              style={{ animationDelay: `${200 + fi * 30}ms`, animationFillMode: "backwards" }}
            >
              <SidebarMenuButton>
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function TopBar() {
  const { xp, streak } = useMockXP();

  return (
    <header className="h-12 border-b border-border flex items-center px-4 gap-3 bg-chrome shrink-0">
      <SidebarTrigger className="h-8 w-8" />
      <Separator orientation="vertical" className="h-4" />
      <MockBreadcrumb />
      <div className="flex-1" />

      {/* XP + streak */}
      <div className="flex items-center gap-3">
        {streak > 0 && (
        <span className="flex items-center gap-1 text-[10px] font-mono text-warning font-semibold">
            <Flame className="h-3 w-3" />
            {streak}
          </span>
        )}
        <span className="flex items-center gap-1 text-[10px] font-mono text-primary font-semibold">
          <Zap className="h-3 w-3" />
          {xp} XP
        </span>
      </div>

      <Separator orientation="vertical" className="h-4" />

      {/* Avatar */}
      <div className="h-7 w-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
        <span className="text-[10px] font-mono font-bold text-primary">JD</span>
      </div>
    </header>
  );
}

export default function MockAppLayout() {
  return (
    <MockPrototypeProvider>
      <MockXPProvider>
        <SidebarProvider>
          <div className="dawn-lagoon dawn-lagoon-bg min-h-screen flex w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <TopBar />
              <main className="flex-1 overflow-auto">
                <Outlet />
              </main>
            </div>
          </div>
        </SidebarProvider>
      </MockXPProvider>
    </MockPrototypeProvider>
  );
}
