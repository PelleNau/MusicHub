import { RefreshCw, CheckCircle, XCircle, AlertTriangle, Clock, Cpu, HardDrive, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { ConnectionStatus } from "@/hooks/usePluginHost";
import type { HealthResponse } from "@/services/pluginHostClient";

interface SystemStatusViewProps {
  connection: ConnectionStatus;
  health: HealthResponse | null;
  lastHealthCheck: string | null;
  onCheckHealth: () => void;
  onSetBaseUrl: (url: string) => void;
}

function StatusIndicator({ status }: { status: ConnectionStatus }) {
  const config = {
    connected:    { icon: CheckCircle,    label: "CONNECTED",    color: "text-primary",     bg: "bg-primary/10 border-primary/30" },
    connecting:   { icon: RefreshCw,      label: "CONNECTING",   color: "text-muted-foreground", bg: "bg-secondary border-border" },
    disconnected: { icon: XCircle,        label: "DISCONNECTED", color: "text-destructive", bg: "bg-destructive/10 border-destructive/30" },
    error:        { icon: AlertTriangle,  label: "ERROR",        color: "text-accent",      bg: "bg-accent/10 border-accent/30" },
  }[status];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-3 rounded-lg border p-4 ${config.bg}`}>
      <Icon className={`h-6 w-6 ${config.color} ${status === "connecting" ? "animate-spin" : ""}`} />
      <div>
        <p className={`font-mono text-sm font-bold ${config.color}`}>{config.label}</p>
        <p className="font-mono text-[10px] text-muted-foreground">Plugin Host Service</p>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub }: { icon: typeof Cpu; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-mono text-[10px] text-muted-foreground uppercase">{label}</span>
      </div>
      <p className="font-mono text-lg font-bold text-foreground">{value}</p>
      {sub && <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export function SystemStatusView({ connection, health, lastHealthCheck, onCheckHealth, onSetBaseUrl }: SystemStatusViewProps) {
  const [urlInput, setUrlInput] = useState("http://127.0.0.1:8080");
  const [showConfig, setShowConfig] = useState(false);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Status + config */}
      <div className="flex items-start justify-between gap-4">
        <StatusIndicator status={connection} />
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1.5 font-mono text-xs" onClick={onCheckHealth}>
            <RefreshCw className="h-3 w-3" /> Check Now
          </Button>
          <Button size="sm" variant="ghost" className="h-8 gap-1.5 font-mono text-xs" onClick={() => setShowConfig(!showConfig)}>
            <Settings className="h-3 w-3" /> Config
          </Button>
        </div>
      </div>

      {showConfig && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <p className="font-mono text-xs font-semibold text-foreground">Host URL</p>
          <div className="flex gap-2">
            <Input
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              className="h-8 font-mono text-xs flex-1"
              placeholder="http://127.0.0.1:8080"
            />
            <Button size="sm" variant="outline" className="h-8 font-mono text-xs" onClick={() => onSetBaseUrl(urlInput)}>
              Apply
            </Button>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground">
            The plugin-host service must be running locally. Default port is 8080.
          </p>
        </div>
      )}

      {/* Health metrics */}
      {health ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <MetricCard icon={HardDrive} label="Plugins" value={String(health.pluginCount)} sub={health.scanCacheValid ? "Cache valid" : "Cache stale"} />
            <MetricCard icon={Cpu} label="Sample Rate" value={`${health.sampleRate / 1000} kHz`} />
            <MetricCard icon={Settings} label="Buffer Size" value={String(health.bufferSize)} sub={`${(health.bufferSize / health.sampleRate * 1000).toFixed(1)}ms latency`} />
            <MetricCard icon={Clock} label="Uptime" value={formatUptime(health.uptime)} />
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <p className="font-mono text-xs font-semibold text-foreground mb-3">System Info</p>
            <div className="grid grid-cols-2 gap-y-2 gap-x-8 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Version</span>
                <span className="text-foreground font-semibold">{health.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">OS</span>
                <span className="text-foreground">{health.os}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={health.status === "ok" ? "default" : "destructive"} className="font-mono text-[10px]">{health.status.toUpperCase()}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Check</span>
                <span className="text-foreground">{lastHealthCheck ? new Date(lastHealthCheck).toLocaleTimeString() : "—"}</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-secondary/20 p-12 text-center">
          <XCircle className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-mono text-sm text-muted-foreground">No health data available</p>
          <p className="font-mono text-[10px] text-muted-foreground/60 mt-1">
            Ensure the plugin-host service is running on the configured URL
          </p>
        </div>
      )}

      {/* Placeholder: future features */}
      <div className="rounded-lg border border-dashed border-border bg-secondary/10 p-4">
        <p className="font-mono text-[10px] text-muted-foreground uppercase font-semibold mb-1">Coming Soon</p>
        <p className="font-mono text-xs text-muted-foreground">
          Plugin quarantine management · Failure tracking database · A/B comparison engine
        </p>
      </div>
    </div>
  );
}
