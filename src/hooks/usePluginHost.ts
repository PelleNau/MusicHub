/**
 * usePluginHost — manages connection state, polling, and API interactions
 * with the local plugin-host backend.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  pluginHost,
  PluginHostClient,
  HostError,
  type HealthResponse,
  type HostPlugin,
  type ScanResponse,
  type ChainLoadResponse,
  type RenderPreviewResponse,
  type DiagnosticEntry,
  type ChainLoadRequest,
  type RenderPreviewRequest,
  type ScanRequest,
} from "@/services/pluginHostClient";

export type ConnectionStatus = "connected" | "connecting" | "disconnected" | "error";

export interface PluginHostState {
  /* Connection */
  connection: ConnectionStatus;
  health: HealthResponse | null;
  lastHealthCheck: string | null;

  /* Plugin library */
  plugins: HostPlugin[];
  pluginsLoading: boolean;

  /* Scan */
  scanResult: ScanResponse | null;
  scanning: boolean;

  /* Chain */
  chainResult: ChainLoadResponse | null;
  chainLoading: boolean;

  /* Render */
  renderResult: RenderPreviewResponse | null;
  renderRequestId: string | null;
  renderEnvelopeElapsed: number | null;
  renderError: string | null;
  rendering: boolean;

  /* Diagnostics */
  diagnostics: DiagnosticEntry[];
  errors: DiagnosticEntry[];
}

export interface PluginHostActions {
  checkHealth: () => Promise<void>;
  fetchPlugins: () => Promise<void>;
  triggerScan: (opts?: ScanRequest) => Promise<void>;
  loadChain: (req: ChainLoadRequest) => Promise<void>;
  renderPreview: (req: RenderPreviewRequest) => Promise<void>;
  clearDiagnostics: () => void;
  setBaseUrl: (url: string) => void;
}

const HEALTH_POLL_INTERVAL = 5_000;

function diagFromError(err: unknown, stage: string, pluginName?: string): DiagnosticEntry {
  const message = err instanceof HostError
    ? `[${err.status}] ${err.message}`
    : (err as Error).message || "Unknown error";
  return {
    timestamp: new Date().toISOString(),
    level: "error",
    stage,
    pluginName,
    message,
    detail: err instanceof HostError ? `op=${err.operation} reqId=${err.requestId}` : undefined,
  };
}

function diagInfo(stage: string, message: string): DiagnosticEntry {
  return { timestamp: new Date().toISOString(), level: "info", stage, message };
}

export function usePluginHost(): [PluginHostState, PluginHostActions] {
  const clientRef = useRef<PluginHostClient>(pluginHost);

  const [connection, setConnection] = useState<ConnectionStatus>("connecting");
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [lastHealthCheck, setLastHealthCheck] = useState<string | null>(null);

  const [plugins, setPlugins] = useState<HostPlugin[]>([]);
  const [pluginsLoading, setPluginsLoading] = useState(false);

  const [scanResult, setScanResult] = useState<ScanResponse | null>(null);
  const [scanning, setScanning] = useState(false);

  const [chainResult, setChainResult] = useState<ChainLoadResponse | null>(null);
  const [chainLoading, setChainLoading] = useState(false);

  const [renderResult, setRenderResult] = useState<RenderPreviewResponse | null>(null);
  const [rendering, setRendering] = useState(false);

  const [diagnostics, setDiagnostics] = useState<DiagnosticEntry[]>([]);

  const addDiag = useCallback((entry: DiagnosticEntry) => {
    setDiagnostics(prev => [entry, ...prev].slice(0, 200));
  }, []);

  /* ── Health check ── */
  const checkHealth = useCallback(async () => {
    try {
      const res = await clientRef.current.health();
      setHealth(res.data);
      setConnection("connected");
      setLastHealthCheck(new Date().toISOString());
    } catch (err) {
      setConnection(health ? "error" : "disconnected");
      addDiag(diagFromError(err, "health"));
    }
  }, [health, addDiag]);

  /* ── Fetch plugins ── */
  const fetchPlugins = useCallback(async () => {
    setPluginsLoading(true);
    try {
      const res = await clientRef.current.plugins();
      setPlugins(res.data.plugins);
      addDiag(diagInfo("plugins", `Loaded ${res.data.plugins.length} plugins (cache age: ${res.data.scanCacheAge}s)`));
    } catch (err) {
      addDiag(diagFromError(err, "plugins"));
    } finally {
      setPluginsLoading(false);
    }
  }, [addDiag]);

  /* ── Scan ── */
  const triggerScan = useCallback(async (opts?: ScanRequest) => {
    setScanning(true);
    addDiag(diagInfo("scan", "Plugin scan started…"));
    try {
      const res = await clientRef.current.scan(opts);
      setScanResult(res.data);
      addDiag(diagInfo("scan", `Scan complete: ${res.data.pluginCount} plugins found, ${res.data.failedPlugins.length} failures`));
      // Auto-refresh plugin list after scan
      await fetchPlugins();
    } catch (err) {
      addDiag(diagFromError(err, "scan"));
    } finally {
      setScanning(false);
    }
  }, [addDiag, fetchPlugins]);

  /* ── Chain load ── */
  const loadChain = useCallback(async (req: ChainLoadRequest) => {
    setChainLoading(true);
    setChainResult(null);
    addDiag(diagInfo("chains/load", "Loading chain…"));
    try {
      const res = await clientRef.current.loadChain(req);
      setChainResult(res.data);
      addDiag(diagInfo("chains/load",
        `Chain "${res.data.name}" loaded: ${res.data.loadedCount}/${res.data.nodeCount} nodes (${res.data.missingCount} missing, ${res.data.errorCount} errors)`));
      // Add per-node diagnostics for failures
      res.data.nodes.filter(n => n.status === "error").forEach(n => {
        addDiag({
          timestamp: new Date().toISOString(),
          level: "error",
          stage: "chains/load",
          pluginName: n.pluginName,
          pluginId: n.pluginId,
          message: n.error || "Plugin failed to load",
        });
      });
    } catch (err) {
      addDiag(diagFromError(err, "chains/load"));
    } finally {
      setChainLoading(false);
    }
  }, [addDiag]);

  /* ── Render preview ── */
  const [renderRequestId, setRenderRequestId] = useState<string | null>(null);
  const [renderEnvelopeElapsed, setRenderEnvelopeElapsed] = useState<number | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  const renderPreview = useCallback(async (req: RenderPreviewRequest) => {
    setRendering(true);
    setRenderResult(null);
    setRenderError(null);
    setRenderRequestId(null);
    setRenderEnvelopeElapsed(null);
    addDiag(diagInfo("render/preview", "Rendering preview…"));
    try {
      const res = await clientRef.current.renderPreview(req);
      setRenderResult(res.data);
      setRenderRequestId(res.requestId);
      setRenderEnvelopeElapsed(res.elapsedMs);
      addDiag(diagInfo("render/preview",
        `Render complete: ${res.data.durationMs}ms, peak=${res.data.peakAmplitude.toFixed(3)}, rms=${res.data.rmsLevel.toFixed(3)}`));
      if (res.data.clipped) {
        addDiag({ timestamp: new Date().toISOString(), level: "warning", stage: "render/preview", message: "Output clipped!" });
      }
      if (res.data.silentOutput) {
        addDiag({ timestamp: new Date().toISOString(), level: "warning", stage: "render/preview", message: "Output is silent" });
      }
    } catch (err) {
      const msg = err instanceof HostError
        ? err.message
        : (err as Error).message || "Unknown render error";
      setRenderError(msg);
      if (err instanceof HostError) {
        setRenderRequestId(err.requestId || null);
      }
      addDiag(diagFromError(err, "render/preview"));
    } finally {
      setRendering(false);
    }
  }, [addDiag]);

  const clearDiagnostics = useCallback(() => setDiagnostics([]), []);

  const setBaseUrl = useCallback((url: string) => {
    clientRef.current = new PluginHostClient(url);
    setConnection("connecting");
    setHealth(null);
  }, []);

  /* ── Health polling ── */
  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, HEALTH_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [checkHealth]);

  const errors = diagnostics.filter(d => d.level === "error");

  const state: PluginHostState = {
    connection, health, lastHealthCheck,
    plugins, pluginsLoading,
    scanResult, scanning,
    chainResult, chainLoading,
    renderResult, renderRequestId, renderEnvelopeElapsed, renderError, rendering,
    diagnostics, errors,
  };

  const actions: PluginHostActions = {
    checkHealth, fetchPlugins, triggerScan,
    loadChain, renderPreview, clearDiagnostics, setBaseUrl,
  };

  return [state, actions];
}
