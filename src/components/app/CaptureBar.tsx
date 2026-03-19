import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Camera, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

import {
  getCaptureScenario,
  getCaptureScenarioById,
  getCaptureScenarios,
} from "@/lib/captureMode";

function normalizeHref(href: string) {
  return href.startsWith("/") ? href : `/${href}`;
}

export function CaptureBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const scenarios = useMemo(() => getCaptureScenarios(), []);
  const scenarioId = getCaptureScenario();
  const currentScenario = getCaptureScenarioById(scenarioId) ?? scenarios[0];
  const currentIndex = scenarios.findIndex((scenario) => scenario.id === currentScenario.id);
  const previousScenario = currentIndex > 0 ? scenarios[currentIndex - 1] : null;
  const nextScenario = currentIndex < scenarios.length - 1 ? scenarios[currentIndex + 1] : null;

  const applySetup = () => {
    const targetHref = normalizeHref(currentScenario.href);
    const currentHref = `${location.pathname}${location.search}`;
    if (currentHref === targetHref) {
      window.location.assign(targetHref);
      return;
    }

    navigate(targetHref);
  };

  return (
    <div className="fixed inset-x-0 top-0 z-[120] border-b border-sky-300/40 bg-sky-500/92 text-sky-50 shadow-[0_12px_32px_-18px_rgba(14,165,233,0.85)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1680px] items-center gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-100/30 bg-sky-100/15">
            <Camera className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-sky-100/75">
              Capture Mode
            </div>
            <div className="truncate text-sm font-semibold">{currentScenario.title}</div>
            <div className="truncate text-xs text-sky-100/80">
              {currentScenario.description} Save as <span className="font-mono">{currentScenario.filename}</span>
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden rounded-full border border-sky-100/25 bg-sky-100/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-sky-100/80 md:inline-flex">
            {currentIndex + 1} / {scenarios.length}
          </span>
          <button
            type="button"
            onClick={() => previousScenario && navigate(normalizeHref(previousScenario.href))}
            disabled={!previousScenario}
            className="inline-flex h-9 items-center gap-1 rounded-xl border border-sky-100/25 bg-sky-100/10 px-3 text-xs font-medium transition-colors hover:bg-sky-100/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </button>
          <button
            type="button"
            onClick={applySetup}
            className="inline-flex h-9 items-center gap-1 rounded-xl border border-sky-100/25 bg-sky-950/20 px-3 text-xs font-semibold transition-colors hover:bg-sky-950/30"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Apply Setup
          </button>
          <button
            type="button"
            onClick={() => nextScenario && navigate(normalizeHref(nextScenario.href))}
            disabled={!nextScenario}
            className="inline-flex h-9 items-center gap-1 rounded-xl border border-sky-100/25 bg-sky-100/10 px-3 text-xs font-medium transition-colors hover:bg-sky-100/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
