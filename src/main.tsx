import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AppErrorBoundary, StartupCrashScreen, type StartupFault } from "@/components/app/AppErrorBoundary";
import { applyInitialSettings } from "@/hooks/useSettings";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("React root element #root was not found");
}

applyInitialSettings();

const root = createRoot(rootElement);
let startupFault: StartupFault | null = null;

function renderApp() {
  if (startupFault) {
    root.render(
      <React.StrictMode>
        <StartupCrashScreen fault={startupFault} />
      </React.StrictMode>,
    );
    return;
  }

  root.render(
    <React.StrictMode>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </React.StrictMode>,
  );
}

window.addEventListener("error", (event) => {
  startupFault = {
    source: "error",
    message: event.error?.message || event.message || "Unknown startup error",
    stack: event.error?.stack,
  };
  renderApp();
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  startupFault = {
    source: "unhandledrejection",
    message: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  };
  renderApp();
});

renderApp();
