import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type AppErrorBoundaryState = {
  error: Error | null;
};

export class AppErrorBoundary extends React.Component<React.PropsWithChildren, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    error: null,
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("AppErrorBoundary", error, errorInfo);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-background p-6 text-foreground">
          <div className="mx-auto max-w-3xl space-y-4">
            <Alert variant="destructive">
              <AlertTitle>Application startup failed</AlertTitle>
              <AlertDescription>
                <p className="font-mono text-xs whitespace-pre-wrap break-words">
                  {this.state.error.message || String(this.state.error)}
                </p>
              </AlertDescription>
            </Alert>
            {this.state.error.stack ? (
              <Alert>
                <AlertTitle>Stack</AlertTitle>
                <AlertDescription>
                  <pre className="overflow-auto whitespace-pre-wrap break-words font-mono text-[11px]">
                    {this.state.error.stack}
                  </pre>
                </AlertDescription>
              </Alert>
            ) : null}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export type StartupFault = {
  source: "error" | "unhandledrejection";
  message: string;
  stack?: string;
};

export function StartupCrashScreen({ fault }: { fault: StartupFault }) {
  return (
    <div className="min-h-screen bg-background p-6 text-foreground">
      <div className="mx-auto max-w-3xl space-y-4">
        <Alert variant="destructive">
          <AlertTitle>Application startup failed</AlertTitle>
          <AlertDescription>
            <p className="font-mono text-xs whitespace-pre-wrap break-words">
              [{fault.source}] {fault.message}
            </p>
          </AlertDescription>
        </Alert>
        {fault.stack ? (
          <Alert>
            <AlertTitle>Stack</AlertTitle>
            <AlertDescription>
              <pre className="overflow-auto whitespace-pre-wrap break-words font-mono text-[11px]">
                {fault.stack}
              </pre>
            </AlertDescription>
          </Alert>
        ) : null}
      </div>
    </div>
  );
}
