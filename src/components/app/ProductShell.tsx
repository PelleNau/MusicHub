import { ReactNode, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Brain,
  FlaskConical,
  GraduationCap,
  Headphones,
  Home,
  LogOut,
  Microscope,
  Music,
  Package,
  Radio,
  Settings,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { SettingsSheet } from "@/components/SettingsSheet";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

type ProductShellProps = {
  section: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
};

type NavItem = {
  label: string;
  path: string;
  icon: typeof Home;
};

const navGroups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Core",
    items: [{ label: "Home", path: "/", icon: Home }],
  },
  {
    label: "Learn",
    items: [
      { label: "Courses", path: "/learn", icon: GraduationCap },
      { label: "Theory", path: "/lab/theory", icon: Brain },
    ],
  },
  {
    label: "Create",
    items: [
      { label: "Studio", path: "/lab/studio", icon: Music },
      { label: "Bridge", path: "/lab/bridge", icon: Radio },
    ],
  },
  {
    label: "Explore",
    items: [
      { label: "Lab", path: "/lab", icon: FlaskConical },
      { label: "Deep Dive", path: "/lab/deep-dive", icon: Microscope },
      { label: "Flight Case", path: "/inventory", icon: Package },
    ],
  },
];

function matchesPath(pathname: string, path: string) {
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}

function ProductSidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" variant="inset" className="border-r border-border/60">
      <SidebarHeader className="px-3 py-4">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-left"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <Headphones className="h-4 w-4" />
          </div>
          {!collapsed ? (
            <div className="min-w-0">
              <div className="font-mono text-sm font-semibold tracking-tight text-foreground">MusicHub</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                Desktop Workspace
              </div>
            </div>
          ) : null}
        </button>
      </SidebarHeader>

      <SidebarContent className="px-2 pb-4">
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="px-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">
              {collapsed ? "—" : group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const active = matchesPath(pathname, item.path);
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        tooltip={item.label}
                        isActive={active}
                        onClick={() => navigate(item.path)}
                        className={cn(
                          "h-10 rounded-xl font-mono text-xs",
                          active
                            ? "bg-sidebar-accent text-sidebar-primary shadow-[0_0_0_1px_hsl(var(--primary)/0.16)]"
                            : "text-sidebar-foreground/75 hover:text-sidebar-foreground",
                        )}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed ? <span>{item.label}</span> : null}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

export function ProductShell({
  section,
  title,
  description,
  actions,
  children,
  contentClassName,
}: ProductShellProps) {
  const { user, signOut } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const initials = useMemo(() => {
    const source = user?.user_metadata?.name || user?.email || "MH";
    return String(source)
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("")
      .slice(0, 2) || "MH";
  }, [user]);

  return (
    <>
      <SidebarProvider defaultOpen>
        <div className="min-h-screen w-full bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.08),transparent_32%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.06),transparent_28%),hsl(var(--background))]">
          <ProductSidebar />
          <SidebarInset className="min-h-screen border-l-0 bg-transparent">
            <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border/60 bg-background/72 px-4 backdrop-blur-xl">
              <SidebarTrigger className="h-8 w-8 rounded-xl border border-border/60 bg-card/70" />
              <div className="min-w-0">
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  {section}
                </div>
                {title ? (
                  <div className="truncate font-mono text-sm font-semibold tracking-tight text-foreground">
                    {title}
                  </div>
                ) : null}
              </div>
              <div className="ml-auto flex items-center gap-2">
                {description ? (
                  <div className="hidden max-w-md truncate font-mono text-[11px] text-muted-foreground lg:block">
                    {description}
                  </div>
                ) : null}
                {actions}
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-card/72 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Settings className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={signOut}
                  className="hidden h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-card/72 text-muted-foreground transition-colors hover:text-destructive md:flex"
                >
                  <LogOut className="h-4 w-4" />
                </button>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 font-mono text-xs font-semibold text-primary">
                  {initials}
                </div>
              </div>
            </header>
            <main className={cn("min-h-[calc(100vh-3.5rem)] px-4 py-4 md:px-6 md:py-5", contentClassName)}>
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
      <SettingsSheet open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}

type ProductPageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  meta?: ReactNode;
  actions?: ReactNode;
};

export function ProductPageHeader({
  eyebrow,
  title,
  description,
  meta,
  actions,
}: ProductPageHeaderProps) {
  return (
    <section className="mb-6 rounded-[28px] border border-border/60 bg-card/70 px-5 py-5 shadow-[0_20px_70px_rgba(0,0,0,0.16)] backdrop-blur-xl md:px-7 md:py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-3xl space-y-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
            {eyebrow}
          </div>
          <h1 className="font-mono text-2xl font-semibold tracking-tight text-foreground md:text-[2rem]">
            {title}
          </h1>
          <p className="max-w-2xl font-mono text-xs leading-relaxed text-muted-foreground md:text-sm">
            {description}
          </p>
          {meta ? <div className="flex flex-wrap items-center gap-2 pt-1">{meta}</div> : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}

type ProductSectionCardProps = {
  icon: typeof Home;
  title: string;
  description: string;
  eyebrow?: string;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function ProductSectionCard({
  icon: Icon,
  title,
  description,
  eyebrow,
  action,
  children,
  className,
}: ProductSectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-[24px] border border-border/60 bg-card/72 p-5 shadow-[0_12px_50px_rgba(0,0,0,0.14)] backdrop-blur-xl",
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/18 bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            {eyebrow ? (
              <div className="mb-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                {eyebrow}
              </div>
            ) : null}
            <h2 className="font-mono text-sm font-semibold tracking-tight text-foreground">{title}</h2>
            <p className="mt-1 font-mono text-xs leading-relaxed text-muted-foreground">{description}</p>
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

export function ProductSurfaceGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid grid-cols-1 gap-4 xl:grid-cols-12", className)}>{children}</div>;
}

export function ProductMetaPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-border/60 bg-background/60 px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
      {children}
    </span>
  );
}
