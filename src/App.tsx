import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // rebuild
import { BrowserRouter, HashRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { Suspense, lazy } from "react";

import { isInTauriShell } from "@/services/tauriShell";
import { FloatingDock } from "@/components/app/FloatingDock";

import Auth from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";

const Home = lazy(() => import("./pages/Home.tsx"));
const Learn = lazy(() => import("./pages/Learn.tsx"));
const CourseDetail = lazy(() => import("./pages/CourseDetail.tsx"));
const LessonDetail = lazy(() => import("./pages/LessonDetail.tsx"));
const Inventory = lazy(() => import("./pages/Index.tsx"));
const Playground = lazy(() => import("./pages/Playground.tsx"));
const DeepDive = lazy(() => import("./pages/MySpace.tsx"));
const Lab = lazy(() => import("./pages/Lab.tsx"));
const TheoryLab = lazy(() => import("./pages/TheoryLab.tsx"));
const TheoryLabExplore = lazy(() => import("./pages/TheoryLabExplore.tsx"));
const TheoryLabTools = lazy(() => import("./pages/TheoryLabTools.tsx"));
const Studio = lazy(() => import("./pages/Studio.tsx"));
const Bridge = lazy(() => import("./pages/Bridge.tsx"));

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

  if (loading) return <PageLoader />;
  if (!session) return <Navigate to="/auth" replace />;
  return (
    <Suspense fallback={<PageLoader />}>
      {children}
      <FloatingDock />
    </Suspense>
  );
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (session) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => {

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <AuthProvider>
            <Routes>
              <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
              <Route path="/learn/course/:courseId" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
              <Route path="/learn/course/:courseId/module/:moduleId" element={<ProtectedRoute><LessonDetail /></ProtectedRoute>} />
              <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
              <Route path="/lab" element={<ProtectedRoute><Lab /></ProtectedRoute>} />
              <Route path="/lab/deep-dive" element={<ProtectedRoute><DeepDive /></ProtectedRoute>} />
              <Route path="/lab/patch-lab" element={<ProtectedRoute><Playground /></ProtectedRoute>} />
              <Route path="/lab/studio" element={<ProtectedRoute><Studio /></ProtectedRoute>} />
              <Route path="/lab/bridge" element={<ProtectedRoute><Bridge /></ProtectedRoute>} />
              <Route path="/lab/theory" element={<ProtectedRoute><TheoryLab /></ProtectedRoute>} />
              <Route path="/lab/theory/explore" element={<ProtectedRoute><TheoryLabExplore /></ProtectedRoute>} />
              <Route path="/lab/theory/tools" element={<ProtectedRoute><TheoryLabTools /></ProtectedRoute>} />
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
