import { useLocation, Link } from "react-router-dom";
import {
  Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ROUTE_LABELS: Record<string, string> = {
  "/mockup": "Home",
  "/mockup/learn": "Learn",
  "/mockup/learn/level": "Level 3: Scales & Melody",
  "/mockup/learn/module": "Module 1: What is Sound?",
  "/mockup/studio": "Studio",
  "/mockup/lesson-preview": "Lesson Preview",
  "/mockup/inventory": "Flight Case",
  "/mockup/theory": "Theory Reference",
};

function getCrumbs(pathname: string) {
  const crumbs: { label: string; path: string }[] = [];

  // Always start with Home
  if (pathname !== "/mockup") {
    crumbs.push({ label: "Home", path: "/mockup" });
  }

  // Build intermediate crumbs
  if (pathname.startsWith("/mockup/learn")) {
    if (pathname !== "/mockup/learn") {
      crumbs.push({ label: "Learn", path: "/mockup/learn" });
    }
    if (pathname.startsWith("/mockup/learn/level") && pathname !== "/mockup/learn/level") {
      crumbs.push({ label: "Level 3", path: "/mockup/learn/level" });
    }
    if (pathname === "/mockup/learn/module") {
      crumbs.push({ label: "Level 3", path: "/mockup/learn/level" });
    }
  }

  return crumbs;
}

export function MockBreadcrumb() {
  const { pathname } = useLocation();
  const crumbs = getCrumbs(pathname);
  const currentLabel = ROUTE_LABELS[pathname] ?? pathname.split("/").pop() ?? "";

  if (pathname === "/mockup") return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb) => (
          <BreadcrumbItem key={crumb.path}>
            <BreadcrumbLink asChild>
              <Link to={crumb.path} className="text-xs font-mono">{crumb.label}</Link>
            </BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
        ))}
        <BreadcrumbItem>
          <BreadcrumbPage className="text-xs font-mono">{currentLabel}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
