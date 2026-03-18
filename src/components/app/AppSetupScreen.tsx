import { AlertTriangle, FileCode2 } from "lucide-react";
import { MISSING_SUPABASE_CONFIG_MESSAGE } from "@/integrations/supabase/client";

export function AppSetupScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="w-full max-w-2xl space-y-6 rounded-xl border border-border bg-card p-8 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-destructive/10 p-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-mono text-lg font-semibold">Application setup required</h1>
            <p className="font-mono text-xs text-muted-foreground">
              The app cannot start without Supabase configuration.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background p-4">
          <p className="font-mono text-xs text-foreground">{MISSING_SUPABASE_CONFIG_MESSAGE}</p>
        </div>

        <div className="space-y-3 rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-2 font-mono text-xs font-semibold text-foreground">
            <FileCode2 className="h-4 w-4 text-primary" />
            Required keys
          </div>
          <pre className="overflow-auto rounded border border-border bg-card p-3 font-mono text-[11px] text-muted-foreground">
{`VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=`}
          </pre>
          <p className="font-mono text-[11px] text-muted-foreground">
            Copy <span className="text-foreground">.env.example</span> to <span className="text-foreground">.env</span> and fill in the project values.
          </p>
        </div>
      </div>
    </div>
  );
}
