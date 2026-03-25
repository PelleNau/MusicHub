/**
 * NativeParamPanel — browser UI for viewing and editing real plugin parameters
 * from loaded native chains. Fetches via GET /chains/:chainId/params,
 * sends changes via WebSocket plugin.setParam, and listens for plugin.paramChanged.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { AlertCircle, Loader2, RefreshCw, Save } from "lucide-react";
import type { ChainParamsResponse, ChainParamNode, PluginParam, PluginPresetsResponse } from "@/services/pluginHostClient";
import type { PluginParamChangedEvent } from "@/services/pluginHostSocket";

/* ── Knob control for native params ── */

function NativeKnob({
  param,
  color,
  onChangeCommit,
}: {
  param: PluginParam;
  color: string;
  onChangeCommit: (value: number) => void;
}) {
  const [localValue, setLocalValue] = useState(param.value);
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const startVal = useRef(0);

  // Sync from external changes
  useEffect(() => {
    if (!dragging) setLocalValue(param.value);
  }, [param.value, dragging]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
    startY.current = e.clientY;
    startVal.current = localValue;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [localValue]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    const delta = (startY.current - e.clientY) / 120;
    const range = param.max - param.min;
    const newVal = Math.max(param.min, Math.min(param.max, startVal.current + delta * range));
    setLocalValue(newVal);
    onChangeCommit(newVal);
  }, [dragging, param.min, param.max, onChangeCommit]);

  const handlePointerUp = useCallback(() => setDragging(false), []);

  const pct = (localValue - param.min) / (param.max - param.min);
  const angle = -135 + pct * 270;

  return (
    <div className="flex flex-col items-center gap-[2px] select-none">
      <span className="text-[8px] font-mono text-foreground/65 leading-none truncate max-w-[50px] text-center">
        {param.name}
      </span>
      <div
        className="relative h-[28px] w-[28px] cursor-ns-resize"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <svg className="absolute inset-0" viewBox="0 0 28 28">
          <circle
            cx="14" cy="14" r="10"
            fill="none"
            stroke="hsl(var(--foreground) / 0.08)"
            strokeWidth="2.5"
            strokeDasharray="40 16"
            strokeLinecap="round"
            transform="rotate(-225 14 14)"
          />
          <circle
            cx="14" cy="14" r="10"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeDasharray={`${pct * 40} 56`}
            strokeLinecap="round"
            transform="rotate(-225 14 14)"
            opacity="0.85"
          />
        </svg>
        <div
          className="absolute w-[1.5px] h-[8px] rounded-full left-1/2 top-[2px]"
          style={{
            backgroundColor: "hsl(var(--foreground) / 0.7)",
            transform: `translateX(-50%) rotate(${angle}deg)`,
            transformOrigin: "50% 12px",
          }}
        />
      </div>
      <span className="text-[7px] font-mono text-foreground/60 tabular-nums leading-none">
        {param.label}
      </span>
    </div>
  );
}

/* ── Plugin node section ── */

function PluginNodeSection({
  chainId,
  node,
  onFetchPresets,
  onRefreshParams,
  onLoadPreset,
  onSaveState,
  onRestoreState,
  onSetParam,
}: {
  chainId: string;
  node: ChainParamNode;
  onFetchPresets: (chainId: string, nodeIndex: number) => Promise<PluginPresetsResponse | null>;
  onRefreshParams: () => Promise<void>;
  onLoadPreset: (chainId: string, nodeIndex: number, index: number) => Promise<{ loaded: boolean; name: string } | null>;
  onSaveState: (chainId: string, nodeIndex: number) => Promise<{ stateId: string } | null>;
  onRestoreState: (chainId: string, nodeIndex: number, stateId: string) => Promise<boolean>;
  onSetParam: (nodeIndex: number, paramId: number, value: number) => void;
}) {
  const color = "hsl(var(--primary))";
  const [presets, setPresets] = useState<PluginPresetsResponse | null>(null);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [lastStateId, setLastStateId] = useState<string | null>(null);
  const [busy, setBusy] = useState<"preset" | "save" | "restore" | null>(null);

  const refreshPresets = useCallback(async () => {
    const data = await onFetchPresets(chainId, node.nodeIndex);
    if (!data) return;
    setPresets(data);
    setSelectedPreset(data.currentIndex);
  }, [chainId, node.nodeIndex, onFetchPresets]);

  useEffect(() => {
    let cancelled = false;
    void refreshPresets().catch(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [refreshPresets]);

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 px-1">
        <div className="h-2 w-2 rounded-sm bg-primary/60" />
        <span className="text-[10px] font-mono font-semibold text-foreground/70">
          {node.pluginName}
        </span>
        <span className="text-[8px] font-mono text-muted-foreground">
          {node.params.length} params
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 px-1">
        {presets && presets.presets.length > 0 && (
          <>
            <select
              className="rounded-[3px] border border-foreground/10 bg-background px-2 py-1 text-[9px] font-mono text-foreground/80"
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(Number(e.target.value))}
            >
              {presets.presets.map((preset) => (
                <option key={preset.index} value={preset.index}>
                  {preset.name}
                </option>
              ))}
            </select>
            <button
              className="rounded-[3px] bg-primary/12 px-2 py-1 text-[9px] font-mono text-primary transition-colors hover:bg-primary/20 disabled:opacity-50"
              disabled={busy !== null}
              onClick={async () => {
                setBusy("preset");
                try {
                  const result = await onLoadPreset(chainId, node.nodeIndex, selectedPreset);
                  if (result?.loaded) {
                    await Promise.all([onRefreshParams(), refreshPresets()]);
                  }
                } finally {
                  setBusy(null);
                }
              }}
            >
              {busy === "preset" ? "Loading…" : "Load Preset"}
            </button>
          </>
        )}
        <button
          className="flex items-center gap-1 rounded-[3px] bg-foreground/[0.08] px-2 py-1 text-[9px] font-mono text-foreground/70 transition-colors hover:bg-foreground/[0.12] disabled:opacity-50"
          disabled={busy !== null}
          onClick={async () => {
            setBusy("save");
            try {
              const saved = await onSaveState(chainId, node.nodeIndex);
              if (saved?.stateId) setLastStateId(saved.stateId);
            } finally {
              setBusy(null);
            }
          }}
        >
          <Save className="h-3 w-3" />
          {busy === "save" ? "Saving…" : "Save State"}
        </button>
        <button
          className="rounded-[3px] bg-foreground/[0.08] px-2 py-1 text-[9px] font-mono text-foreground/70 transition-colors hover:bg-foreground/[0.12] disabled:opacity-50"
          disabled={busy !== null || !lastStateId}
          onClick={async () => {
            if (!lastStateId) return;
            setBusy("restore");
            try {
              const restored = await onRestoreState(chainId, node.nodeIndex, lastStateId);
              if (restored) {
                await Promise.all([onRefreshParams(), refreshPresets()]);
              }
            } finally {
              setBusy(null);
            }
          }}
        >
          {busy === "restore" ? "Restoring…" : "Restore State"}
        </button>
      </div>
      <div className="flex flex-wrap gap-x-2.5 gap-y-1 px-1">
        {node.params.map((p) => (
          <NativeKnob
            key={p.id}
            param={p}
            color={color}
            onChangeCommit={(v) => onSetParam(node.nodeIndex, p.id, v)}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Main Panel ── */

interface NativeParamPanelProps {
  chainId: string;
  onFetchParams: (chainId: string) => Promise<ChainParamsResponse | null>;
  onFetchPresets: (chainId: string, nodeIndex: number) => Promise<PluginPresetsResponse | null>;
  onLoadPreset: (chainId: string, nodeIndex: number, index: number) => Promise<{ loaded: boolean; name: string } | null>;
  onSaveState: (chainId: string, nodeIndex: number) => Promise<{ stateId: string } | null>;
  onRestoreState: (chainId: string, nodeIndex: number, stateId: string) => Promise<boolean>;
  onSetParam: (chainId: string, nodeIndex: number, paramId: number, value: number) => void;
  onParamChanged: (fn: (e: PluginParamChangedEvent) => void) => () => void;
}

export function NativeParamPanel({
  chainId,
  onFetchParams,
  onFetchPresets,
  onLoadPreset,
  onSaveState,
  onRestoreState,
  onSetParam,
  onParamChanged,
}: NativeParamPanelProps) {
  const [params, setParams] = useState<ChainParamsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadParams = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await onFetchParams(chainId);
      setParams(data);
      if (!data) {
        setError("Failed to fetch parameters from the native host");
      }
    } catch (err) {
      setParams(null);
      setError(err instanceof Error ? err.message : "Failed to fetch parameters from the native host");
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [chainId, onFetchParams]);
  const refreshParams = useCallback(async () => {
    await loadParams({ silent: true });
  }, [loadParams]);

  // Fetch params on mount / chainId change
  useEffect(() => {
    let cancelled = false;
    void loadParams().then(() => {
      if (cancelled) return;
    });
    return () => { cancelled = true; };
  }, [loadParams]);

  // Listen for external param changes
  useEffect(() => {
    return onParamChanged((e) => {
      if (e.chainId !== chainId) return;
      setParams(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          nodes: prev.nodes.map(n => {
            if (n.nodeIndex !== e.nodeIndex) return n;
            return {
              ...n,
              params: n.params.map(p =>
                p.id === e.paramId ? { ...p, value: e.value } : p
              ),
            };
          }),
        };
      });
    });
  }, [chainId, onParamChanged]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-[10px] font-mono text-muted-foreground ml-2">Loading params…</span>
      </div>
    );
  }

  if (!params || params.nodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <div className="flex max-w-[360px] flex-col items-center gap-3 text-center">
          {error ? (
            <>
              <AlertCircle className="h-4 w-4 text-destructive/80" />
              <span className="text-[10px] font-mono text-muted-foreground">{error}</span>
              <button
                className="flex items-center gap-1 rounded-[3px] bg-primary/12 px-3 py-1.5 text-[9px] font-mono text-primary transition-colors hover:bg-primary/20"
                onClick={() => void loadParams()}
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </button>
            </>
          ) : (
            <span className="text-[10px] font-mono text-muted-foreground">No parameters available</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto overflow-y-hidden h-full">
      <div className="flex items-stretch gap-4 px-3 py-2 min-w-min h-full">
        {params.nodes.map(node => (
          <PluginNodeSection
            key={node.nodeIndex}
            chainId={chainId}
            node={node}
            onFetchPresets={onFetchPresets}
            onRefreshParams={refreshParams}
            onLoadPreset={onLoadPreset}
            onSaveState={onSaveState}
            onRestoreState={onRestoreState}
            onSetParam={(nodeIdx, paramId, value) => onSetParam(chainId, nodeIdx, paramId, value)}
          />
        ))}
      </div>
    </div>
  );
}
