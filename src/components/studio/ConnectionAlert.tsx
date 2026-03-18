/**
 * ConnectionAlert — error UX for connected mode.
 * Shows toasts for host offline, reconnecting, socket dropped, etc.
 * Shows a persistent banner in degraded state.
 */

import { useEffect, useRef } from "react";
import { Wifi, WifiOff, AlertTriangle, RefreshCw, Monitor } from "lucide-react";
import { toast } from "sonner";
import type { ConnectionState } from "@/services/hostConnector";
import type { HostErrorEvent } from "@/services/pluginHostSocket";
import type { SidecarStatus } from "@/services/tauriShell";

interface ConnectionAlertProps {
  connectionState: ConnectionState;
  isMock: boolean;
  inShell?: boolean;
  sidecarStatus?: SidecarStatus | null;
  lastError: HostErrorEvent | null;
}

export function ConnectionAlert({ connectionState, isMock, inShell = false, sidecarStatus = null, lastError }: ConnectionAlertProps) {
  const prevState = useRef<ConnectionState>(connectionState);
  const toastId = useRef<string | number | null>(null);

  useEffect(() => {
    const prev = prevState.current;
    prevState.current = connectionState;

    if (prev === connectionState) return;

    // Dismiss reconnecting toast if we reconnected
    if (toastId.current && (connectionState === "connected" || connectionState === "degraded")) {
      toast.dismiss(toastId.current);
      toastId.current = null;
    }

    switch (connectionState) {
      case "connected":
        if (prev === "degraded" || prev === "connecting") {
          toast.success("Plugin host connected", { duration: 2000 });
        }
        break;

      case "degraded":
        toast.warning(inShell && sidecarStatus && !sidecarStatus.healthy
          ? "Host restarting — waiting for sidecar health"
          : "Connection degraded — some features may be limited", {
          duration: 4000,
        });
        break;

      case "disconnected":
        if (prev === "connected" || prev === "degraded") {
          toastId.current = toast.error(
            inShell
              ? "Plugin host sidecar unavailable — restarting…"
              : isMock
                ? "Mock host unavailable"
                : "Plugin host disconnected — reconnecting…",
            {
            duration: Infinity,
            icon: <RefreshCw className="h-4 w-4 animate-spin" />,
          });
        }
        break;

      case "connecting":
        // Silent — no toast for initial connection attempt
        break;
    }
  }, [connectionState]);

  // Show host errors as toasts
  useEffect(() => {
    if (!lastError) return;
    toast.error(`${lastError.source}: ${lastError.message}`, {
      description: lastError.detail,
      duration: 5000,
    });
  }, [lastError]);

  // Degraded banner
  if (connectionState === "degraded") {
    return (
      <div className="flex items-center gap-2 px-3 py-1 text-[10px] font-mono border-b bg-warning/10 border-warning/20 text-warning">
        <AlertTriangle className="h-3 w-3 shrink-0" />
        <span>Partial connectivity — transport may work but meters or params may be stale</span>
      </div>
    );
  }

  return null;
}

/* ── Connection badge for TransportBar ── */

interface ConnectionBadgeProps {
  connectionState: ConnectionState;
  isMock: boolean;
  inShell?: boolean;
  sidecarStatus?: SidecarStatus | null;
  syncState?: "idle" | "syncing" | "synced" | "error";
  onConnect?: () => void;
  onDisconnect?: () => void;
  onRestartShellHost?: () => void;
}

export function ConnectionBadge({
  connectionState,
  isMock,
  inShell = false,
  sidecarStatus = null,
  syncState,
  onConnect,
  onDisconnect,
  onRestartShellHost,
}: ConnectionBadgeProps) {
  const labels: Record<ConnectionState, string> = {
    disconnected: isMock ? "Mock" : "Disconnected",
    connecting: "Connecting…",
    connected: isMock ? "Mock" : "Connected",
    degraded: "Degraded",
  };

  const colors: Record<ConnectionState, string> = {
    disconnected: "text-muted-foreground",
    connecting: "text-muted-foreground",
    connected: "text-primary",
    degraded: "text-warning",
  };

  const isOnline = connectionState === "connected" || connectionState === "degraded";

  const handleClick = () => {
    if (connectionState === "connecting") return;
    if (inShell && !isOnline) {
      onRestartShellHost?.();
      return;
    }
    if (isOnline) onDisconnect?.();
    else onConnect?.();
  };

  const title = inShell
    ? (isOnline ? "Desktop shell connected to sidecar" : "Restart plugin host sidecar")
    : (isOnline ? "Disconnect from host" : "Retry host connection");

  return (
    <button
      className="flex items-center gap-1.5 rounded px-1.5 py-0.5 hover:bg-muted/50 transition-colors"
      onClick={handleClick}
      title={title}
    >
      {isOnline ? (
        <Wifi className={`h-3 w-3 ${colors[connectionState]}`} />
      ) : connectionState === "connecting" ? (
        <RefreshCw className="h-3 w-3 text-muted-foreground animate-spin" />
      ) : (
        <Monitor className="h-3 w-3 text-muted-foreground" />
      )}
      <span className={`text-[10px] uppercase tracking-wider ${colors[connectionState]}`}>
        {labels[connectionState]}
      </span>
      {inShell && sidecarStatus?.running === false && (
        <AlertTriangle className="h-2.5 w-2.5 text-warning" />
      )}
      {syncState === "syncing" && (
        <RefreshCw className="h-2.5 w-2.5 text-primary animate-spin" />
      )}
      {syncState === "error" && (
        <AlertTriangle className="h-2.5 w-2.5 text-destructive" />
      )}
    </button>
  );
}
