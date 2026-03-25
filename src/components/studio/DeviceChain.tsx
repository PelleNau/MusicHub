import { useState, useCallback, useRef } from "react";
import { Plus, Power, X, ChevronDown, ChevronUp } from "lucide-react";
import type { DeviceInstance, DeviceType, DeviceParam } from "@/types/studio";
import { DEVICE_DEFS, getDeviceDisplayInfo } from "@/types/studio";

/* ── Param knob (horizontal slider style) ── */
function ParamSlider({
  param,
  value,
  onChange,
}: {
  param: DeviceParam;
  value: number;
  onChange: (v: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const computeValue = useCallback(
    (clientX: number) => {
      const rect = ref.current?.getBoundingClientRect();
      if (!rect) return value;
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return param.min + pct * (param.max - param.min);
    },
    [value, param.min, param.max]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      onChange(computeValue(e.clientX));
    },
    [computeValue, onChange]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      onChange(computeValue(e.clientX));
    },
    [dragging, computeValue, onChange]
  );

  const handlePointerUp = useCallback(() => setDragging(false), []);
  const handleDoubleClick = useCallback(() => onChange(param.default), [onChange, param.default]);

  const pct = ((value - param.min) / (param.max - param.min)) * 100;

  const displayVal =
    Math.abs(value) >= 100
      ? Math.round(value)
      : value.toFixed(value < 1 && value > -1 ? 3 : 1);

  return (
    <div className="flex items-center gap-1 min-w-0">
      <span className="text-[7px] font-mono text-foreground/65 w-7 shrink-0 truncate">
        {param.label}
      </span>
      <div
        ref={ref}
        className="relative h-[8px] flex-1 min-w-[40px] rounded-sm bg-foreground/10 cursor-ew-resize overflow-hidden border border-foreground/10"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleDoubleClick}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-sm bg-primary/50"
          style={{ width: `${pct}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-[2px] -ml-[1px] bg-foreground/80 rounded-sm"
          style={{ left: `${pct}%` }}
        />
      </div>
      <span className="text-[7px] font-mono text-foreground/60 tabular-nums w-8 text-right shrink-0">
        {displayVal}
        {param.unit ? <span className="text-foreground/45 ml-px">{param.unit}</span> : null}
      </span>
    </div>
  );
}

/* ── Single device card ── */
function DeviceCard({
  device,
  onToggle,
  onRemove,
  onParamChange,
}: {
  device: DeviceInstance;
  onToggle: () => void;
  onRemove: () => void;
  onParamChange: (key: string, value: number) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const def = DEVICE_DEFS.find((d) => d.type === device.type);
  if (!def) return null;
  const display = getDeviceDisplayInfo(device);

  return (
    <div
      className={`rounded-[4px] border transition-colors ${
        device.enabled
          ? "border-primary/30 bg-primary/5"
          : "border-foreground/10 bg-foreground/[0.08] opacity-60"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-1 px-1.5 py-0.5">
        <button
          onClick={onToggle}
          className={`h-3 w-3 rounded-sm flex items-center justify-center transition-colors ${
            device.enabled ? "bg-primary text-primary-foreground" : "bg-foreground/15 text-foreground/55"
          }`}
          title={device.enabled ? "Disable" : "Enable"}
        >
          <Power className="h-2 w-2" />
        </button>
        <span className="text-[8px] font-mono font-medium text-foreground flex-1 truncate">
          {display.label}
        </span>
        {display.isHostBacked && (
          <span className="text-[7px] font-mono uppercase text-foreground/45 shrink-0">
            host
          </span>
        )}
        <span className="text-[7px] font-mono text-foreground/45 truncate max-w-[90px]">
          {display.subtitle}
        </span>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-foreground/50 hover:text-foreground/70 transition-colors"
        >
          {collapsed ? (
            <ChevronDown className="h-2.5 w-2.5" />
          ) : (
            <ChevronUp className="h-2.5 w-2.5" />
          )}
        </button>
        <button
          onClick={onRemove}
          className="text-foreground/50 hover:text-destructive transition-colors"
          title="Remove"
        >
          <X className="h-2.5 w-2.5" />
        </button>
      </div>

      {/* Params */}
      {!collapsed && (
        <div className="px-1.5 pb-1 space-y-[2px]">
          {display.isHostBacked && (
            <div className="text-[7px] font-mono text-foreground/45">
              Parameters open in the native host.
            </div>
          )}
          {def.params.map((p) => (
            <ParamSlider
              key={p.key}
              param={p}
              value={device.params[p.key] ?? p.default}
              onChange={(v) => onParamChange(p.key, v)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Add device menu ── */
function AddDeviceMenu({ onAdd, onClose }: { onAdd: (type: DeviceType) => void; onClose: () => void }) {
  return (
    <div className="absolute left-0 top-full mt-1 z-50 bg-card border border-border rounded-md p-1 shadow-lg min-w-[100px]">
      {DEVICE_DEFS.map((def) => (
        <button
          key={def.type}
          className="w-full text-left px-2 py-1 text-[9px] font-mono text-foreground rounded hover:bg-primary/10 hover:text-foreground transition-colors"
          onClick={() => {
            onAdd(def.type);
            onClose();
          }}
        >
          {def.label}
        </button>
      ))}
    </div>
  );
}

/* ── Main DeviceChain component ── */
interface DeviceChainProps {
  devices: DeviceInstance[];
  onChange: (devices: DeviceInstance[]) => void;
}

export function DeviceChain({ devices, onChange }: DeviceChainProps) {
  const [showAdd, setShowAdd] = useState(false);

  const handleAdd = useCallback(
    (type: DeviceType) => {
      const def = DEVICE_DEFS.find((d) => d.type === type)!;
      const defaults: Record<string, number> = {};
      for (const p of def.params) defaults[p.key] = p.default;

      const newDevice: DeviceInstance = {
        id: crypto.randomUUID(),
        type,
        enabled: true,
        params: defaults,
      };
      onChange([...devices, newDevice]);
    },
    [devices, onChange]
  );

  const handleToggle = useCallback(
    (idx: number) => {
      const updated = [...devices];
      updated[idx] = { ...updated[idx], enabled: !updated[idx].enabled };
      onChange(updated);
    },
    [devices, onChange]
  );

  const handleRemove = useCallback(
    (idx: number) => {
      onChange(devices.filter((_, i) => i !== idx));
    },
    [devices, onChange]
  );

  const handleParamChange = useCallback(
    (idx: number, key: string, value: number) => {
      const updated = [...devices];
      updated[idx] = {
        ...updated[idx],
        params: { ...updated[idx].params, [key]: value },
      };
      onChange(updated);
    },
    [devices, onChange]
  );

  return (
    <div className="space-y-1">
      {devices.map((device, idx) => (
        <DeviceCard
          key={device.id}
          device={device}
          onToggle={() => handleToggle(idx)}
          onRemove={() => handleRemove(idx)}
          onParamChange={(key, val) => handleParamChange(idx, key, val)}
        />
      ))}

      {/* Add button */}
      <div className="relative">
        <button
          className="flex items-center gap-0.5 text-[8px] font-mono text-foreground/60 hover:text-foreground/80 transition-colors"
          onClick={() => setShowAdd(!showAdd)}
        >
          <Plus className="h-2.5 w-2.5" /> Effect
        </button>
        {showAdd && <AddDeviceMenu onAdd={handleAdd} onClose={() => setShowAdd(false)} />}
      </div>
    </div>
  );
}
