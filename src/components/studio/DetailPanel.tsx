import { useState, useCallback, useRef, useEffect } from "react";
import { Plus, Power, X, ChevronRight, Cpu, ExternalLink } from "lucide-react";
import {
  ContextMenu, ContextMenuContent, ContextMenuItem,
  ContextMenuSeparator, ContextMenuTrigger,
} from "@/components/ui/context-menu";
import type { DeviceInstance, DeviceType, DeviceParam, SessionTrack } from "@/types/studio";
import { DEVICE_DEFS, getDeviceDisplayInfo, isHostBackedDevice } from "@/types/studio";
import { getTrackColor } from "./TrackLane";
import { NativeParamPanel } from "./NativeParamPanel";
import type { ChainNode, ChainParamsResponse } from "@/services/pluginHostClient";
import type { PluginParamChangedEvent } from "@/services/pluginHostSocket";

function editorActionKey(chainId: string, nodeIndex: number) {
  return `${chainId}:${nodeIndex}`;
}

/* ── Device accent colors (Ableton-style per device type) ── */
const DEVICE_COLORS: Partial<Record<DeviceType, string>> = {
  eq3: "hsl(200, 70%, 45%)",
  compressor: "hsl(35, 80%, 50%)",
  reverb: "hsl(270, 55%, 50%)",
  delay: "hsl(166, 100%, 40%)",
  gain: "hsl(0, 0%, 50%)",
  subtractive: "hsl(340, 65%, 50%)",
  fm: "hsl(280, 70%, 55%)",
  sampler: "hsl(20, 75%, 50%)",
};

/* ── Rotary knob control ── */
function Knob({
  param,
  value,
  color,
  onChange,
}: {
  param: DeviceParam;
  value: number;
  color: string;
  onChange: (v: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const startVal = useRef(0);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setDragging(true);
      startY.current = e.clientY;
      startVal.current = value;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [value]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const delta = (startY.current - e.clientY) / 100;
      const range = param.max - param.min;
      const newVal = Math.max(param.min, Math.min(param.max, startVal.current + delta * range));
      onChange(newVal);
    },
    [dragging, onChange, param.min, param.max]
  );

  const handlePointerUp = useCallback(() => setDragging(false), []);
  const handleDoubleClick = useCallback(() => onChange(param.default), [onChange, param.default]);

  const pct = (value - param.min) / (param.max - param.min);
  const angle = -135 + pct * 270;

  const displayVal =
    Math.abs(value) >= 100
      ? Math.round(value)
      : value.toFixed(value < 1 && value > -1 ? 3 : 1);

  return (
    <div className="flex flex-col items-center gap-[2px] select-none">
      <span className="text-[8px] font-mono text-foreground/65 leading-none truncate max-w-[50px] text-center">
        {param.label}
      </span>
      <div
        className="relative h-[32px] w-[32px] cursor-ns-resize"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      >
        {/* Track ring */}
        <svg className="absolute inset-0" viewBox="0 0 32 32">
          {/* Background arc */}
          <circle
            cx="16" cy="16" r="12"
            fill="none"
            stroke="hsl(var(--foreground) / 0.08)"
            strokeWidth="3"
            strokeDasharray="47 19"
            strokeLinecap="round"
            transform="rotate(-225 16 16)"
          />
          {/* Value arc */}
          <circle
            cx="16" cy="16" r="12"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeDasharray={`${pct * 47} 66`}
            strokeLinecap="round"
            transform="rotate(-225 16 16)"
            opacity="0.85"
          />
        </svg>
        {/* Pointer needle */}
        <div
          className="absolute w-[2px] h-[10px] rounded-full left-1/2 top-[3px]"
          style={{
            backgroundColor: "hsl(var(--foreground) / 0.7)",
            transform: `translateX(-50%) rotate(${angle}deg)`,
            transformOrigin: "50% 13px",
          }}
        />
        {/* Center dot */}
        <div
          className="absolute rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[8px] h-[8px]"
          style={{ backgroundColor: "hsl(var(--foreground) / 0.12)" }}
        />
      </div>
      <span className="text-[7px] font-mono text-foreground/60 tabular-nums leading-none">
        {displayVal}
        {param.unit && <span className="text-foreground/45 ml-px">{param.unit}</span>}
      </span>
    </div>
  );
}

/* ── Device card (Ableton-style) ── */
function DeviceCard({
  device,
  index,
  totalCount,
  onToggle,
  onRemove,
  onParamChange,
  onMoveLeft,
  onMoveRight,
  onResetDefaults,
  nativeNode,
  editorOpen,
  editorBusy,
  onLoadInHost,
  onOpenInHost,
  onCloseInHost,
  onToggleNativeBypass,
}: {
  device: DeviceInstance;
  index: number;
  totalCount: number;
  onToggle: () => void;
  onRemove: () => void;
  onParamChange: (key: string, value: number) => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onResetDefaults: () => void;
  nativeNode?: ChainNode;
  editorOpen?: boolean;
  editorBusy?: boolean;
  onLoadInHost?: () => void;
  onOpenInHost?: () => Promise<void>;
  onCloseInHost?: () => Promise<void>;
  onToggleNativeBypass?: (bypass: boolean) => void;
}) {
  const def = DEVICE_DEFS.find((d) => d.type === device.type);
  if (!def) return null;

  const display = getDeviceDisplayInfo(device);
  const isNativeBacked = display.isHostBacked;
  const displayLabel = display.label;
  const displaySubtitle = display.subtitle;
  const deviceColor = DEVICE_COLORS[device.type] || "hsl(0,0%,50%)";

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
    <div
      className={`flex flex-col shrink-0 transition-opacity ${
        device.enabled ? "" : "opacity-40"
      }`}
      style={{ minWidth: 130, maxWidth: 200 }}
    >
      {/* Colored title bar — like Ableton device headers */}
      <div
        className="flex items-center gap-1 px-2 py-[5px] rounded-t-[4px]"
        style={{ backgroundColor: deviceColor }}
      >
        <button
          onClick={onToggle}
          className="h-3 w-3 rounded-[2px] flex items-center justify-center transition-colors"
          style={{
            backgroundColor: device.enabled ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.3)",
          }}
          title={device.enabled ? "Disable" : "Enable"}
        >
          <Power className="h-[8px] w-[8px] text-white" />
        </button>
        <span className="text-[10px] font-mono font-bold text-white flex-1 truncate drop-shadow-sm">
          {displayLabel}
        </span>
        {isNativeBacked && (
          <span className="text-[8px] font-mono uppercase text-white/80 shrink-0">
            host
          </span>
        )}
        <button
          onClick={onRemove}
          className="text-white/40 hover:text-white/90 transition-colors"
          title="Remove"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* Device body — dark panel with knobs */}
      <div
        className="flex-1 rounded-b-[4px] px-2 py-2 border border-t-0"
        style={{
          backgroundColor: "hsl(var(--card))",
          borderColor: `color-mix(in srgb, ${deviceColor} 20%, hsl(var(--border)))`,
        }}
      >
        {isNativeBacked ? (
          <div className="flex h-full min-h-[72px] flex-col items-start justify-between gap-2">
            <div className="text-[9px] font-mono text-foreground/50">
              Real plugin hosted in the local app
            </div>
            {displaySubtitle && (
              <div className="text-[8px] font-mono text-foreground/35">
                {displaySubtitle}
              </div>
            )}
            {nativeNode && (nativeNode.status !== "loaded" || nativeNode.error) && (
              <div className="text-[8px] font-mono text-amber-300/90">
                {nativeNode.error || `Status: ${nativeNode.status}`}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-1">
              {nativeNode ? (
                <>
                  {editorOpen && onCloseInHost ? (
                    <button
                      className="rounded-[3px] px-2 py-1 text-[8px] font-mono bg-primary/20 text-primary transition-colors hover:bg-primary/30 disabled:cursor-wait disabled:opacity-60"
                      onClick={() => void onCloseInHost()}
                      disabled={editorBusy}
                      title={`Close ${displayLabel} editor in the native host`}
                    >
                      {editorBusy ? "Closing…" : "Close Editor"}
                    </button>
                  ) : onOpenInHost ? (
                    <button
                      className="rounded-[3px] px-2 py-1 text-[8px] font-mono bg-primary/12 text-primary transition-colors hover:bg-primary/20 disabled:cursor-wait disabled:opacity-60"
                      onClick={() => void onOpenInHost()}
                      disabled={editorBusy}
                      title={`Open ${displayLabel} in the native host`}
                    >
                      {editorBusy ? "Opening…" : "Open in Host"}
                    </button>
                  ) : null}
                  {onToggleNativeBypass && (
                    <button
                      className={`rounded-[3px] px-2 py-1 text-[8px] font-mono transition-colors ${
                        nativeNode.bypass
                          ? "bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"
                          : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
                      }`}
                      onClick={() => onToggleNativeBypass(!nativeNode.bypass)}
                      title={`${nativeNode.bypass ? "Enable" : "Bypass"} ${displayLabel}`}
                    >
                      {nativeNode.bypass ? "Enable" : "Bypass"}
                    </button>
                  )}
                </>
              ) : onLoadInHost ? (
                <button
                  className="rounded-[3px] bg-primary/12 px-2 py-1 text-[8px] font-mono text-primary transition-colors hover:bg-primary/20"
                  onClick={onLoadInHost}
                  title={`Load ${displayLabel} in the native host`}
                >
                  Load in Host
                </button>
              ) : null}
            </div>
            <div className="text-[8px] font-mono text-primary/70">
              Use Host Controls below for parameters and editor
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center">
            {def.params.map((p) => (
              <Knob
                key={p.key}
                param={p}
                value={device.params[p.key] ?? p.default}
                color={deviceColor}
                onChange={(v) => onParamChange(p.key, v)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="min-w-[150px]">
        <ContextMenuItem onClick={onToggle} className="text-xs font-mono">
          {device.enabled ? "Disable" : "Enable"}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onMoveLeft} disabled={index === 0} className="text-xs font-mono">
          Move Left
        </ContextMenuItem>
        <ContextMenuItem onClick={onMoveRight} disabled={index >= totalCount - 1} className="text-xs font-mono">
          Move Right
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onResetDefaults} className="text-xs font-mono">
          Reset to Defaults
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onRemove} className="text-xs font-mono text-destructive">
          Remove
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

/* ── Chain separator arrow ── */
function ChainArrow() {
  return (
    <div className="flex items-center shrink-0 px-0.5 self-center">
      <ChevronRight className="h-3 w-3 text-foreground/30" />
    </div>
  );
}

function HostChainSection({
  nativeChainId,
  nativeChainNodes,
  openEditors,
  busyEditors,
  onOpenEditor,
  onCloseEditor,
  onToggleNativeNodeBypass,
  onRemoveNativeNode,
}: {
  nativeChainId: string;
  nativeChainNodes: ChainNode[];
  openEditors?: Record<string, boolean>;
  busyEditors?: Record<string, boolean>;
  onOpenEditor?: (chainId: string, nodeIndex: number) => Promise<unknown> | unknown;
  onCloseEditor?: (chainId: string, nodeIndex: number) => Promise<unknown> | unknown;
  onToggleNativeNodeBypass?: (chainId: string, nodeIndex: number, bypass: boolean) => void;
  onRemoveNativeNode?: (chainId: string, nodeIndex: number) => void;
}) {
  if (nativeChainNodes.length === 0) return null;

  return (
    <div className="border-b px-3 py-2 shrink-0" style={{ borderColor: "hsl(var(--border))" }}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-foreground/65">
          Loaded In Host
        </span>
        <span className="text-[8px] font-mono text-foreground/50 truncate">
          {nativeChainId}
        </span>
      </div>
      <div className="space-y-1">
        {nativeChainNodes.map((node) => (
          (() => {
            const editorKey = editorActionKey(nativeChainId, node.index);
            const editorOpen = Boolean(openEditors?.[editorKey]);
            const editorBusy = Boolean(busyEditors?.[editorKey]);

            return (
          <div
            key={`${node.pluginId}-${node.index}`}
            className="flex items-center gap-2 rounded-[4px] border px-2 py-1.5"
            style={{
              borderColor: "hsl(var(--border))",
              backgroundColor: "hsl(var(--foreground) / 0.03)",
            }}
          >
            <div className="w-2 h-2 rounded-sm bg-primary/60 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-mono text-foreground/80 truncate">
                {node.pluginName}
              </div>
              <div className="text-[8px] font-mono text-foreground/55 truncate">
                {node.vendor} · {node.format} · {node.paramCount} params
                {node.bypass ? " · bypassed" : ""}
              </div>
            </div>
            {onToggleNativeNodeBypass && (
              <button
                className={`flex items-center gap-1 rounded-[3px] px-2 py-1 text-[8px] font-mono transition-colors shrink-0 ${
                  node.bypass
                    ? "text-amber-300 bg-amber-500/15 hover:bg-amber-500/25"
                    : "text-foreground/70 bg-foreground/8 hover:bg-foreground/14"
                }`}
                onClick={() => onToggleNativeNodeBypass(nativeChainId, node.index, !node.bypass)}
                title={`${node.bypass ? "Enable" : "Bypass"} ${node.pluginName} in native host`}
              >
                <Power className="h-3 w-3" />
                {node.bypass ? "Enable" : "Bypass"}
              </button>
            )}
            {editorOpen && onCloseEditor ? (
              <button
                className="flex items-center gap-1 rounded-[3px] px-2 py-1 text-[8px] font-mono text-primary bg-primary/20 hover:bg-primary/30 transition-colors shrink-0 disabled:cursor-wait disabled:opacity-60"
                onClick={() => void onCloseEditor(nativeChainId, node.index)}
                disabled={editorBusy}
                title={`Close ${node.pluginName} editor in native host`}
              >
                <ExternalLink className="h-3 w-3" />
                {editorBusy ? "Closing…" : "Close Editor"}
              </button>
            ) : onOpenEditor && node.supportsEditor !== false ? (
              <button
                className="flex items-center gap-1 rounded-[3px] px-2 py-1 text-[8px] font-mono text-primary bg-primary/10 hover:bg-primary/20 transition-colors shrink-0 disabled:cursor-wait disabled:opacity-60"
                onClick={() => void onOpenEditor(nativeChainId, node.index)}
                disabled={editorBusy}
                title={`Open ${node.pluginName} in native host`}
              >
                <ExternalLink className="h-3 w-3" />
                {editorBusy ? "Opening…" : "Open in Host"}
              </button>
            ) : node.supportsEditor === false ? (
              <span
                className="shrink-0 rounded-[3px] px-2 py-1 text-[8px] font-mono text-foreground/45 bg-foreground/6"
                title={`${node.pluginName} does not expose a native editor in the host`}
              >
                No Editor
              </span>
            ) : null}
            {onRemoveNativeNode && (
              <button
                className="flex items-center gap-1 rounded-[3px] px-2 py-1 text-[8px] font-mono text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors shrink-0"
                onClick={() => onRemoveNativeNode(nativeChainId, node.index)}
                title={`Remove ${node.pluginName} from native host chain`}
              >
                <X className="h-3 w-3" />
                Remove
              </button>
            )}
          </div>
            );
          })()
        ))}
      </div>
    </div>
  );
}

function BrowserDeviceChain({
  devices,
  trackId,
  nativeChainId,
  nativeChainNodes,
  openEditors,
  busyEditors,
  onToggle,
  onRemove,
  onParamChange,
  onMoveDevice,
  onResetDefaults,
  onLoadNativeChain,
  onOpenEditor,
  onCloseEditor,
  onToggleNativeNodeBypass,
}: {
  devices: DeviceInstance[];
  trackId: string;
  nativeChainId?: string;
  nativeChainNodes?: ChainNode[];
  openEditors?: Record<string, boolean>;
  busyEditors?: Record<string, boolean>;
  onToggle: (idx: number) => void;
  onRemove: (idx: number) => void;
  onParamChange: (idx: number, key: string, value: number) => void;
  onMoveDevice: (idx: number, direction: -1 | 1) => void;
  onResetDefaults: (idx: number) => void;
  onLoadNativeChain?: (trackId: string) => Promise<string | null>;
  onOpenEditor?: (chainId: string, nodeIndex: number) => Promise<unknown> | unknown;
  onCloseEditor?: (chainId: string, nodeIndex: number) => Promise<unknown> | unknown;
  onToggleNativeNodeBypass?: (chainId: string, nodeIndex: number, bypass: boolean) => void;
}) {
  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden min-h-0">
      <div className="flex items-stretch gap-0 px-3 py-2 h-full min-w-min">
        {devices.length === 0 ? (
          <div
            className="flex items-center justify-center flex-1 min-w-[300px] rounded-[4px] border border-dashed"
            style={{
              borderColor: "hsl(var(--foreground) / 0.15)",
              backgroundColor: "hsl(var(--foreground) / 0.03)",
            }}
          >
            <span className="text-[11px] font-mono text-foreground/40">
              Drop Audio Effects Here
            </span>
          </div>
        ) : (
          (() => {
            let nativeOrdinal = -1;

            return devices.map((device, idx) => {
              const isHostBacked = isHostBackedDevice(device);
              const nodeIndex = isHostBacked ? ++nativeOrdinal : -1;
              const nativeNode = isHostBacked && nativeChainId && nativeChainNodes
                ? nativeChainNodes.find((node) => node.index === nodeIndex)
                : undefined;

              return (
                <div key={device.id} className="flex items-stretch">
                  {idx > 0 && <ChainArrow />}
                  <DeviceCard
                    device={device}
                    index={idx}
                    totalCount={devices.length}
                    onToggle={() => onToggle(idx)}
                    onRemove={() => onRemove(idx)}
                    onParamChange={(key, val) => onParamChange(idx, key, val)}
                    onMoveLeft={() => onMoveDevice(idx, -1)}
                    onMoveRight={() => onMoveDevice(idx, 1)}
                    onResetDefaults={() => onResetDefaults(idx)}
                    nativeNode={nativeNode}
                    editorOpen={Boolean(
                      isHostBacked &&
                      nativeChainId &&
                      nativeNode &&
                      openEditors?.[editorActionKey(nativeChainId, nativeNode.index)]
                    )}
                    editorBusy={Boolean(
                      isHostBacked &&
                      nativeChainId &&
                      nativeNode &&
                      busyEditors?.[editorActionKey(nativeChainId, nativeNode.index)]
                    )}
                    onLoadInHost={isHostBacked && !nativeNode && onLoadNativeChain
                      ? () => void onLoadNativeChain(trackId)
                      : undefined}
                    onOpenInHost={isHostBacked && nativeChainId && nativeNode && onOpenEditor
                      ? async () => { await onOpenEditor(nativeChainId, nativeNode.index); }
                      : undefined}
                    onCloseInHost={isHostBacked && nativeChainId && nativeNode && openEditors?.[editorActionKey(nativeChainId, nativeNode.index)] && onCloseEditor
                      ? async () => { await onCloseEditor(nativeChainId, nativeNode.index); }
                      : undefined}
                    onToggleNativeBypass={isHostBacked && nativeChainId && nativeNode && onToggleNativeNodeBypass
                      ? (bypass) => onToggleNativeNodeBypass(nativeChainId, nativeNode.index, bypass)
                      : undefined}
                  />
                </div>
              );
            });
          })()
        )}

        {devices.length > 0 && (
          <>
            <ChainArrow />
            <div
              className="flex items-center justify-center min-w-[120px] rounded-[4px] border border-dashed shrink-0 self-stretch"
              style={{
                borderColor: "hsl(var(--foreground) / 0.06)",
                backgroundColor: "hsl(var(--foreground) / 0.01)",
              }}
            >
              <span className="text-[9px] font-mono text-foreground/15">
                Drop Effects Here
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main Detail Panel ── */
interface DetailPanelProps {
  track: SessionTrack | null;
  onDeviceChainChange: (trackId: string, devices: DeviceInstance[]) => void;
  onClose: () => void;
  isConnected?: boolean;
  nativeChainId?: string;
  nativeChainNodes?: ChainNode[];
  nativeNodeCount?: number;
  hasHostBackedDevices?: boolean;
  canLoadNativeChain?: boolean;
  openEditors?: Record<string, boolean>;
  onLoadNativeChain?: (trackId: string) => Promise<string | null>;
  onFetchChainParams?: (chainId: string) => Promise<ChainParamsResponse | null>;
  onFetchPluginPresets?: (chainId: string, nodeIndex: number) => Promise<import("@/services/pluginHostClient").PluginPresetsResponse | null>;
  onLoadPluginPreset?: (chainId: string, nodeIndex: number, index: number) => Promise<{ loaded: boolean; name: string } | null>;
  onSavePluginState?: (chainId: string, nodeIndex: number) => Promise<{ stateId: string } | null>;
  onRestorePluginState?: (chainId: string, nodeIndex: number, stateId: string) => Promise<boolean>;
  onSetParam?: (chainId: string, nodeIndex: number, paramId: number, value: number) => void;
  onParamChanged?: (fn: (e: PluginParamChangedEvent) => void) => () => void;
  onOpenEditor?: (chainId: string, nodeIndex: number) => Promise<unknown> | unknown;
  onCloseEditor?: (chainId: string, nodeIndex: number) => Promise<unknown> | unknown;
  onToggleNativeNodeBypass?: (chainId: string, nodeIndex: number, bypass: boolean) => void;
  onRemoveNativeNode?: (chainId: string, nodeIndex: number) => void;
}

export function DetailPanel({
  track,
  onDeviceChainChange,
  onClose,
  isConnected,
  nativeChainId,
  nativeChainNodes,
  nativeNodeCount,
  hasHostBackedDevices,
  canLoadNativeChain,
  openEditors,
  onLoadNativeChain,
  onFetchChainParams,
  onFetchPluginPresets,
  onLoadPluginPreset,
  onSavePluginState,
  onRestorePluginState,
  onSetParam,
  onParamChanged,
  onOpenEditor,
  onCloseEditor,
  onToggleNativeNodeBypass,
  onRemoveNativeNode,
}: DetailPanelProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [showNativeParams, setShowNativeParams] = useState(false);
  const [loadingNativeChain, setLoadingNativeChain] = useState(false);
  const [busyEditors, setBusyEditors] = useState<Record<string, boolean>>({});
  const trackId = track?.id;

  useEffect(() => {
    if (isConnected && nativeChainId)
      setShowNativeParams(true);
  }, [isConnected, nativeChainId]);

  const handleLoadNativeChainClick = useCallback(async () => {
    if (!trackId || !onLoadNativeChain || loadingNativeChain) return;
    setLoadingNativeChain(true);
    try {
      const loadedChainId = await onLoadNativeChain(trackId);
      if (loadedChainId) {
        setShowNativeParams(true);
      }
    } finally {
      setLoadingNativeChain(false);
    }
  }, [loadingNativeChain, onLoadNativeChain, trackId]);

  const runEditorAction = useCallback(
    async (chainId: string, nodeIndex: number, action?: (chainId: string, nodeIndex: number) => Promise<unknown> | unknown) => {
      if (!action) return;

      const key = editorActionKey(chainId, nodeIndex);
      let started = false;

      setBusyEditors((previous) => {
        if (previous[key]) return previous;
        started = true;
        return { ...previous, [key]: true };
      });

      if (!started) return;

      try {
        await action(chainId, nodeIndex);
      } finally {
        setBusyEditors((previous) => {
          if (!previous[key]) return previous;
          const next = { ...previous };
          delete next[key];
          return next;
        });
      }
    },
    [],
  );

  const handleOpenEditor = useCallback(
    async (chainId: string, nodeIndex: number) => {
      await runEditorAction(chainId, nodeIndex, onOpenEditor);
    },
    [onOpenEditor, runEditorAction],
  );

  const handleCloseEditor = useCallback(
    async (chainId: string, nodeIndex: number) => {
      await runEditorAction(chainId, nodeIndex, onCloseEditor);
    },
    [onCloseEditor, runEditorAction],
  );

  if (!track) return null;

  const devices = (track.device_chain || []) as DeviceInstance[];
  const resolvedHasHostBackedDevices =
    hasHostBackedDevices ?? devices.some((device) => isHostBackedDevice(device));
  const resolvedCanLoadNativeChain =
    canLoadNativeChain ?? Boolean(isConnected && resolvedHasHostBackedDevices && !nativeChainId && onLoadNativeChain);
  const resolvedNativeNodeCount = nativeNodeCount ?? nativeChainNodes?.length ?? 0;
  const color = getTrackColor(track.color);

  const handleAdd = (type: DeviceType) => {
    const def = DEVICE_DEFS.find((d) => d.type === type)!;
    const defaults: Record<string, number> = {};
    for (const p of def.params) defaults[p.key] = p.default;
    const newDevice: DeviceInstance = {
      id: crypto.randomUUID(),
      type,
      enabled: true,
      params: defaults,
    };
    onDeviceChainChange(track.id, [...devices, newDevice]);
  };

  const handleToggle = (idx: number) => {
    const updated = [...devices];
    updated[idx] = { ...updated[idx], enabled: !updated[idx].enabled };
    onDeviceChainChange(track.id, updated);
  };

  const handleRemove = (idx: number) => {
    onDeviceChainChange(track.id, devices.filter((_, i) => i !== idx));
  };

  const handleParamChange = (idx: number, key: string, value: number) => {
    const updated = [...devices];
    updated[idx] = { ...updated[idx], params: { ...updated[idx].params, [key]: value } };
    onDeviceChainChange(track.id, updated);
  };

  const handleMoveDevice = (idx: number, direction: -1 | 1) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= devices.length) return;
    const updated = [...devices];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    onDeviceChainChange(track.id, updated);
  };

  const handleResetDefaults = (idx: number) => {
    const def = DEVICE_DEFS.find((d) => d.type === devices[idx].type);
    if (!def) return;
    const defaults: Record<string, number> = {};
    for (const p of def.params) defaults[p.key] = p.default;
    const updated = [...devices];
    updated[idx] = { ...updated[idx], params: defaults };
    onDeviceChainChange(track.id, updated);
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 py-1 border-b shrink-0" style={{ borderColor: "hsl(var(--border))" }}>
        <div className="w-[3px] h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
        <span className="text-[11px] font-mono font-semibold text-foreground truncate">
          {track.name}
        </span>
        <span
          className="text-[8px] font-mono uppercase px-1 py-[1px] rounded-[2px] shrink-0"
          style={{
            backgroundColor: "hsl(var(--foreground) / 0.08)",
            color: "hsl(var(--foreground) / 0.6)",
          }}
        >
          {track.type}
        </span>

        {/* Native host controls toggle */}
        {isConnected && onFetchChainParams && (
          <button
            className={`flex items-center gap-1 text-[9px] font-mono px-2 py-[3px] rounded-[3px] transition-colors ${
              showNativeParams ? "bg-primary/20 text-primary" : "bg-foreground/[0.08] text-foreground/65 hover:text-foreground/80"
            }`}
            onClick={() => setShowNativeParams(!showNativeParams)}
            title="Show native host plugin controls"
          >
            <Cpu className="h-3 w-3" /> Host Controls
          </button>
        )}

        {nativeChainId && resolvedNativeNodeCount > 0 && (
          <span className="text-[8px] font-mono text-foreground/55">
            {resolvedNativeNodeCount} native node{resolvedNativeNodeCount === 1 ? "" : "s"}
          </span>
        )}

        {resolvedCanLoadNativeChain && (
          <button
            className="flex items-center gap-1 text-[9px] font-mono px-2 py-[3px] rounded-[3px] transition-colors bg-primary/12 text-primary hover:bg-primary/20 disabled:cursor-wait disabled:opacity-60"
            onClick={() => void handleLoadNativeChainClick()}
            disabled={loadingNativeChain}
            title="Load the selected host-backed devices into the local plugin host"
          >
            <Cpu className="h-3 w-3" /> {loadingNativeChain ? "Loading…" : "Load in Host"}
          </button>
        )}

        <div className="flex-1" />

        {/* Add device button */}
        <div className="relative">
          <button
            className="flex items-center gap-1 text-[9px] font-mono px-2 py-[3px] rounded-[3px] transition-colors"
            style={{
              backgroundColor: "hsl(var(--primary) / 0.12)",
              color: "hsl(var(--primary))",
            }}
            onClick={() => setShowAdd(!showAdd)}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(var(--primary) / 0.2)")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "hsl(var(--primary) / 0.12)")}
          >
            <Plus className="h-3 w-3" /> Add Effect
          </button>
          {showAdd && (
            <div
              className="absolute right-0 top-full mt-1 z-[100] rounded-md p-1 shadow-xl min-w-[140px]"
              style={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
              }}
            >
              {DEVICE_DEFS.map((def) => (
                <button
                  key={def.type}
                  className="w-full text-left px-2.5 py-1.5 text-[10px] font-mono rounded-[3px] flex items-center gap-2 transition-colors hover:bg-foreground/10"
                  style={{ color: "hsl(var(--foreground) / 0.8)" }}
                  onClick={() => {
                    handleAdd(def.type);
                    setShowAdd(false);
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-[2px] shrink-0"
                    style={{ backgroundColor: DEVICE_COLORS[def.type] }}
                  />
                  {def.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="text-foreground/40 hover:text-foreground/70 transition-colors ml-1"
          title="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Native param panel — shown when toggle is active and connected */}
      {showNativeParams && isConnected && onFetchChainParams && onFetchPluginPresets && onLoadPluginPreset && onSavePluginState && onRestorePluginState && onSetParam && onParamChanged ? (
        <div className="flex flex-1 min-h-0 flex-col border-t" style={{ borderColor: "hsl(var(--border))" }}>
          {nativeChainId && nativeChainNodes && (
            <HostChainSection
              nativeChainId={nativeChainId}
              nativeChainNodes={nativeChainNodes}
              openEditors={openEditors}
              busyEditors={busyEditors}
              onOpenEditor={handleOpenEditor}
              onCloseEditor={handleCloseEditor}
              onToggleNativeNodeBypass={onToggleNativeNodeBypass}
              onRemoveNativeNode={onRemoveNativeNode}
            />
          )}

          <div className="flex-1 overflow-x-auto overflow-y-hidden min-h-0">
            {nativeChainId ? (
              <NativeParamPanel
                chainId={nativeChainId}
                onFetchParams={onFetchChainParams}
                onFetchPresets={onFetchPluginPresets}
                onLoadPreset={onLoadPluginPreset}
                onSaveState={onSavePluginState}
                onRestoreState={onRestorePluginState}
                onSetParam={(cId, nodeIdx, paramId, value) => onSetParam(cId, nodeIdx, paramId, value)}
                onParamChanged={onParamChanged}
              />
            ) : (
              <div className="flex h-full items-center justify-center px-4">
                <div className="flex max-w-[360px] flex-col items-center gap-3 text-center">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {resolvedHasHostBackedDevices
                      ? "This track has host-backed devices, but no native chain is loaded yet"
                      : "No native chain is loaded for this track yet"}
                  </span>
                  {resolvedCanLoadNativeChain && (
                    <button
                      className="flex items-center gap-1 rounded-[3px] bg-primary/12 px-3 py-1.5 text-[9px] font-mono text-primary transition-colors hover:bg-primary/20 disabled:cursor-wait disabled:opacity-60"
                      onClick={() => void handleLoadNativeChainClick()}
                      disabled={loadingNativeChain}
                    >
                      <Cpu className="h-3 w-3" />
                      {loadingNativeChain ? "Loading…" : "Load in Host"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col">
          {nativeChainId && nativeChainNodes && (
            <HostChainSection
              nativeChainId={nativeChainId}
              nativeChainNodes={nativeChainNodes}
              openEditors={openEditors}
              busyEditors={busyEditors}
              onOpenEditor={handleOpenEditor}
              onCloseEditor={handleCloseEditor}
              onToggleNativeNodeBypass={onToggleNativeNodeBypass}
              onRemoveNativeNode={onRemoveNativeNode}
            />
          )}

          <BrowserDeviceChain
            devices={devices}
            trackId={track.id}
            nativeChainId={nativeChainId}
            nativeChainNodes={nativeChainNodes}
            openEditors={openEditors}
            busyEditors={busyEditors}
            onToggle={handleToggle}
            onRemove={handleRemove}
            onParamChange={handleParamChange}
            onMoveDevice={handleMoveDevice}
            onResetDefaults={handleResetDefaults}
            onLoadNativeChain={onLoadNativeChain}
            onOpenEditor={handleOpenEditor}
            onCloseEditor={handleCloseEditor}
            onToggleNativeNodeBypass={onToggleNativeNodeBypass}
          />
        </div>
      )}
    </div>
  );
}
