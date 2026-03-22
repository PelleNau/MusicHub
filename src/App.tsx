import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // rebuild
import { BrowserRouter, HashRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { Suspense, lazy, useEffect } from "react";

import { isInTauriShell } from "@/services/tauriShell";
import { tauriShell } from "@/services/tauriShell";
import { FloatingDock } from "@/components/app/FloatingDock";
import { DesignAppShell } from "@/components/app/DesignAppShell";
import { CaptureBar } from "@/components/app/CaptureBar";
import { isCaptureMode, shouldShowCaptureBar } from "@/lib/captureMode";
import {
  UI_ZOOM_DEFAULT,
  UI_ZOOM_STEP,
  setStoredUiZoom,
  stepStoredUiZoom,
} from "@/lib/interfaceScale";

import Auth from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";

const Home = lazy(() => import("./pages/Home.tsx"));
const Learn = lazy(() => import("./pages/Learn.tsx"));
const CourseDetail = lazy(() => import("./pages/CourseDetail.tsx"));
const LessonDetail = lazy(() => import("./pages/LessonDetail.tsx"));
const StudioLessonEntry = lazy(() => import("./pages/StudioLessonEntry.tsx"));
const Inventory = lazy(() => import("./pages/Index.tsx"));
const Playground = lazy(() => import("./pages/Playground.tsx"));
const DeepDive = lazy(() => import("./pages/MySpace.tsx"));
const Lab = lazy(() => import("./pages/Lab.tsx"));
const DesignStudio = lazy(() => import("./pages/DesignStudio.tsx"));
const DesignHome = lazy(() => import("./pages/design/DesignHome.tsx"));
const DesignArrangement = lazy(() => import("./pages/design/DesignArrangement.tsx"));
const DesignPianoRoll = lazy(() => import("./pages/design/DesignPianoRoll.tsx"));
const DesignMixer = lazy(() => import("./pages/design/DesignMixer.tsx"));
const TheoryLab = lazy(() => import("./pages/TheoryLab.tsx"));
const TheoryLabExplore = lazy(() => import("./pages/TheoryLabExplore.tsx"));
const TheoryLabTools = lazy(() => import("./pages/TheoryLabTools.tsx"));
const Studio = lazy(() => import("./pages/Studio.tsx"));
const Bridge = lazy(() => import("./pages/Bridge.tsx"));
const CaptureDesignSystemShowcase = lazy(() => import("./pages/CaptureDesignSystemShowcase.tsx"));
const ImportedComponentsShowcase = lazy(() => import("./pages/ImportedComponentsShowcase.tsx"));
const LessonPanelThemePreview = lazy(() => import("./pages/LessonPanelThemePreview.tsx"));
const NeumorphicLibraryPreview = lazy(() => import("./pages/NeumorphicLibraryPreview.tsx"));

const MockAppLayout = lazy(() => import("./pages/mockups/MockAppLayout.tsx"));

const MockLearnHome = lazy(() => import("./pages/mockups/MockLearnHome.tsx"));
const MockLevelDetail = lazy(() => import("./pages/mockups/MockLevelDetail.tsx"));
const MockStudioLesson = lazy(() => import("./pages/mockups/MockStudioLesson.tsx"));
const MockLessonPreview = lazy(() => import("./pages/mockups/MockLessonPreview.tsx"));
const MockModuleFlow = lazy(() => import("./pages/mockups/MockModuleFlow.tsx"));
const MockFlightCase = lazy(() => import("./pages/mockups/MockFlightCase.tsx"));
const MockStudioThemed = lazy(() => import("./pages/mockups/MockStudioThemed.tsx"));
const MockCurriculum = lazy(() => import("./pages/mockups/MockCurriculum.tsx"));
const MockAmpBackline = lazy(() => import("./pages/mockups/MockAmpBackline.tsx"));

const queryClient = new QueryClient();
const Router = isInTauriShell() ? HashRouter : BrowserRouter;
const APP_FLAVOR = import.meta.env.VITE_APP_FLAVOR === "design" ? "design" : "main";
const TAURI_PREVIEW_ROUTE = "/design-studio";

if (APP_FLAVOR === "design" && isInTauriShell() && !window.location.hash) {
  window.location.replace(`#${TAURI_PREVIEW_ROUTE}`);
}

function PageLoader() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 bg-background text-foreground">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="font-mono text-xs text-muted-foreground">Loading application…</p>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const captureMode = isCaptureMode();
  const showCaptureBar = shouldShowCaptureBar();

  if (APP_FLAVOR === "design") {
    return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
  }

  if (!captureMode && loading) return <PageLoader />;
  if (!captureMode && !session) return <Navigate to="/auth" replace />;
  return (
    <Suspense fallback={<PageLoader />}>
      {captureMode ? (
        <>
          <div className={showCaptureBar ? "min-h-screen pt-16" : "min-h-screen"}>{children}</div>
          {showCaptureBar ? <CaptureBar /> : null}
        </>
      ) : (
        <>
          {children}
          <FloatingDock />
        </>
      )}
    </Suspense>
  );
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (session) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function DesignLayoutRoute({
  title,
  description,
  children,
  contentClassName,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  contentClassName?: string;
}) {
  return (
    <DesignAppShell title={title} description={description} contentClassName={contentClassName}>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </DesignAppShell>
  );
}

function AppScaleMenuBridge() {
  useEffect(() => {
    if (!isInTauriShell()) {
      return;
    }

    let unlisten: (() => void) | undefined;
    let disposed = false;

    tauriShell
      .onAppScaleCommand((command) => {
        if (command === "up") {
          stepStoredUiZoom(UI_ZOOM_STEP);
          return;
        }

        if (command === "down") {
          stepStoredUiZoom(-UI_ZOOM_STEP);
          return;
        }

        setStoredUiZoom(UI_ZOOM_DEFAULT);
      })
      .then((cleanup) => {
        if (disposed) {
          cleanup();
          return;
        }

        unlisten = cleanup;
      })
      .catch(() => {
        // Ignore menu bridge failures outside Tauri event contexts.
      });

    return () => {
      disposed = true;
      unlisten?.();
    };
  }, []);

  return null;
}

const App = () => {
  if (APP_FLAVOR === "design") {
    return (
      <QueryClientProvider client={queryClient}>
        <AppScaleMenuBridge />
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Router>
            <Routes>
              <Route
                path="/"
                element={<Navigate to="/design-studio" replace />}
              />
              <Route
                path="/design-studio"
                element={
                  <DesignLayoutRoute
                    title="Design Home"
                    description="Separate desktop app for design review, UI iteration, and surface alignment."
                  >
                    <DesignHome />
                  </DesignLayoutRoute>
                }
              />
              <Route
                path="/design/arrangement"
                element={
                  <DesignLayoutRoute
                    title="Arrangement Review"
                    description="Live arrangement capture surface inside the design app."
                    contentClassName="p-0"
                  >
                    <DesignArrangement />
                  </DesignLayoutRoute>
                }
              />
              <Route
                path="/design/piano-roll"
                element={
                  <DesignLayoutRoute
                    title="Piano Roll Review"
                    description="Live piano-roll capture surface inside the design app."
                    contentClassName="p-0"
                  >
                    <DesignPianoRoll />
                  </DesignLayoutRoute>
                }
              />
              <Route
                path="/design/mixer"
                element={
                  <DesignLayoutRoute
                    title="Mixer Review"
                    description="Live mixer capture surface inside the design app."
                    contentClassName="p-0"
                  >
                    <DesignMixer />
                  </DesignLayoutRoute>
                }
              />
              <Route
                path="/design/components"
                element={
                  <DesignLayoutRoute
                    title="Imported Components"
                    description="Bounded Figma components already ported into the runtime."
                    contentClassName="p-0"
                  >
                    <ImportedComponentsShowcase />
                  </DesignLayoutRoute>
                }
              />
              <Route
                path="/design/library"
                element={
                  <DesignLayoutRoute
                    title="Neumorphic Library"
                    description="Light and dark design-system study plus mixer-control experiments."
                    contentClassName="p-0"
                  >
                    <NeumorphicLibraryPreview />
                  </DesignLayoutRoute>
                }
              />
              <Route
                path="/design/lesson-theme"
                element={
                  <DesignLayoutRoute
                    title="Lesson Theme"
                    description="Comparison between imported lesson styling and tokenized treatment."
                    contentClassName="p-0"
                  >
                    <LessonPanelThemePreview />
                  </DesignLayoutRoute>
                }
              />
              <Route
                path="/design/system-capture"
                element={
                  <DesignLayoutRoute
                    title="System Capture"
                    description="Current design-system capture and visual-language experiments."
                    contentClassName="p-0"
                  >
                    <CaptureDesignSystemShowcase />
                  </DesignLayoutRoute>
                }
              />
              <Route path="*" element={<Navigate to="/design-studio" replace />} />
            </Routes>
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppScaleMenuBridge />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    {APP_FLAVOR === "design" ? <Navigate to="/design-studio" replace /> : <Home />}
                  </ProtectedRoute>
                }
              />
              <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
              <Route path="/learn/course/:courseId" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
              <Route path="/learn/course/:courseId/module/:moduleId" element={<ProtectedRoute><LessonDetail /></ProtectedRoute>} />
              <Route path="/learn/course/:courseId/module/:moduleId/studio-entry" element={<ProtectedRoute><StudioLessonEntry /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
              <Route path="/lab" element={<ProtectedRoute><Lab /></ProtectedRoute>} />
              <Route path="/design-studio" element={<ProtectedRoute><DesignStudio /></ProtectedRoute>} />
              <Route path="/lab/deep-dive" element={<ProtectedRoute><DeepDive /></ProtectedRoute>} />
              <Route path="/lab/patch-lab" element={<ProtectedRoute><Playground /></ProtectedRoute>} />
              <Route path="/lab/studio" element={<ProtectedRoute><Studio /></ProtectedRoute>} />
              <Route path="/lab/bridge" element={<ProtectedRoute><Bridge /></ProtectedRoute>} />
              <Route path="/lab/theory" element={<ProtectedRoute><TheoryLab /></ProtectedRoute>} />
              <Route path="/lab/theory/explore" element={<ProtectedRoute><TheoryLabExplore /></ProtectedRoute>} />
              <Route path="/lab/theory/tools" element={<ProtectedRoute><TheoryLabTools /></ProtectedRoute>} />
              <Route path="/capture/design-system" element={<ProtectedRoute><CaptureDesignSystemShowcase /></ProtectedRoute>} />
              <Route path="/capture/imported-components" element={<ProtectedRoute><ImportedComponentsShowcase /></ProtectedRoute>} />
              <Route path="/preview/imported-components" element={<ProtectedRoute><ImportedComponentsShowcase /></ProtectedRoute>} />
              <Route path="/preview/lesson-panel-theme" element={<ProtectedRoute><LessonPanelThemePreview /></ProtectedRoute>} />
              <Route path="/preview/neumorphic-library" element={<ProtectedRoute><NeumorphicLibraryPreview /></ProtectedRoute>} />
              {/* Mockup routes — unified shell layout */}
              <Route path="/mockup" element={<Suspense fallback={<PageLoader />}><MockAppLayout /></Suspense>}>
                <Route index element={<Navigate to="/" replace />} />
                <Route path="learn" element={<MockLearnHome />} />
                <Route path="learn/level" element={<MockLevelDetail />} />
                <Route path="learn/module" element={<MockModuleFlow />} />
                <Route path="studio" element={<MockStudioLesson />} />
                <Route path="lesson-preview" element={<MockLessonPreview />} />
                <Route path="theory" element={<div className="flex items-center justify-center h-full text-muted-foreground font-mono text-sm">Theory Reference — coming soon</div>} />
                <Route path="inventory" element={<MockFlightCase />} />
                <Route path="studio-themed" element={<MockStudioThemed />} />
                <Route path="curriculum" element={<MockCurriculum />} />
                <Route path="amps" element={<MockAmpBackline />} />
                <Route path="patch-lab" element={<div className="flex items-center justify-center h-full text-muted-foreground font-mono text-sm">Patch Lab — coming soon</div>} />
                <Route path="bridge" element={<div className="flex items-center justify-center h-full text-muted-foreground font-mono text-sm">Bridge — coming soon</div>} />
              </Route>
              {/* Legacy mockup routes */}
              <Route path="/mockup/dashboard" element={<Navigate to="/mockup" replace />} />
              <Route path="/mockup/shell" element={<Navigate to="/mockup" replace />} />
              {/* Legacy redirects */}
              <Route path="/mockup/curriculum" element={<Navigate to="/learn" replace />} />
              <Route path="/playground" element={<Navigate to="/lab/patch-lab" replace />} />
              <Route path="/my-space" element={<Navigate to="/lab/deep-dive" replace />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
