import {
  Home, GraduationCap, Music, Sliders, Puzzle, Package, Search as SearchIcon, Headphones,
  Settings, LogOut, Sun, ChevronDown,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MockPrototypeToolbar } from "@/components/mockups/MockPrototypeToolbar";
import { Hotspot } from "@/components/mockups/Hotspot";

const NAV_ROUTES: Record<string, string> = {
  Home: "/mockup/dashboard",
  "Learning Path": "/mockup/learn",
  Studio: "/mockup/studio",
};

const NAV = {
  main: [
    { label: "Home", icon: Home, path: "/", active: true },
  ],
  learn: [
    { label: "Learning Path", icon: GraduationCap, path: "/learn", active: false },
    { label: "Theory Reference", icon: SearchIcon, path: "/learn/reference", active: false },
  ],
  create: [
    { label: "Studio", icon: Music, path: "/studio", active: false },
    { label: "Patch Lab", icon: Sliders, path: "/patch-lab", active: false },
    { label: "Bridge", icon: Puzzle, path: "/studio/bridge", active: false },
  ],
  manage: [
    { label: "Flight Case", icon: Package, path: "/inventory", active: false },
  ],
};

const NAV_GROUPS = [
  { key: "main", label: null, items: NAV.main },
  { key: "learn", label: "Learn", items: NAV.learn },
  { key: "create", label: "Create", items: NAV.create },
  { key: "manage", label: "Manage", items: NAV.manage },
] as const;

function MockSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

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
          const groupDelay = gi * 120;
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
                    const itemDelay = groupDelay + 60 + ii * 40;
                    const hotspotRoute = NAV_ROUTES[item.label];

                    const menuItem = (
                      <SidebarMenuItem
                        key={item.label}
                        className="animate-fade-in"
                        style={{ animationDelay: `${itemDelay}ms`, animationFillMode: "backwards" }}
                      >
                        <SidebarMenuButton className={item.active ? "bg-sidebar-accent text-sidebar-primary font-medium" : ""}>
                          <item.icon className="h-4 w-4 shrink-0" />
                          {!collapsed && <span>{item.label}</span>}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );

                    if (hotspotRoute) {
                      return (
                        <Hotspot key={item.label} to={hotspotRoute} label={item.label}>
                          {menuItem}
                        </Hotspot>
                      );
                    }

                    return menuItem;
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
              style={{ animationDelay: `${500 + fi * 50}ms`, animationFillMode: "backwards" }}
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

export default function MockAppShell() {
  return (
    <SidebarProvider>
      <div className="dawn-lagoon dawn-lagoon-bg min-h-screen flex w-full">
        <MockSidebar />

        <div className="flex-1 flex flex-col">
          {/* Top bar */}
          <header className="h-12 border-b border-border flex items-center px-4 gap-3 bg-chrome">
            <SidebarTrigger className="h-8 w-8" />
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm text-muted-foreground font-mono">Home</span>
            <div className="flex-1" />
            <div className="h-7 w-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
              <span className="text-[10px] font-mono font-bold text-primary">JD</span>
            </div>
          </header>

          {/* Content area */}
          <main className="flex-1 p-6 flex items-center justify-center pb-20">
            <Card
              className="max-w-md w-full animate-fade-in"
              style={{ animationDelay: "400ms", animationFillMode: "backwards" }}
            >
              <CardContent className="p-8 text-center space-y-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto">
                  <Headphones className="h-6 w-6 text-primary" />
                </div>
                <h2 className="font-mono text-lg font-bold">App Shell Mockup</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This is the persistent sidebar + top bar layout. Page content renders in this area. Use the trigger button to collapse/expand the sidebar.
                </p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>

      <MockPrototypeToolbar />
    </SidebarProvider>
  );
}
