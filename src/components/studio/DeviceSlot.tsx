import { Activity, AudioWaveform, Boxes, Filter, Music, Repeat, Settings, Shield, Sliders, Sparkles, Zap } from "lucide-react";

export type DeviceSlotType =
  | "eq"
  | "compressor"
  | "reverb"
  | "delay"
  | "distortion"
  | "chorus"
  | "filter"
  | "limiter"
  | "gate"
  | "utility"
  | "instrument"
  | "external"
  | "other";

export interface DeviceSlotItem {
  id: string;
  name: string;
  type: DeviceSlotType;
  enabled: boolean;
  preset?: string;
  cpuUsage?: number;
  vendor?: string;
}

interface DeviceSlotProps {
  device: DeviceSlotItem;
  onToggle: (enabled: boolean) => void;
  onClick: () => void;
  onContextMenu?: (event: React.MouseEvent) => void;
}

const DEVICE_ICONS = {
  eq: Sliders,
  compressor: Activity,
  reverb: Repeat,
  delay: AudioWaveform,
  distortion: Zap,
  chorus: Sparkles,
  filter: Filter,
  limiter: Shield,
  gate: Shield,
  utility: Settings,
  instrument: Music,
  external: Boxes,
  other: Settings,
} as const;

const DEVICE_COLORS: Record<DeviceSlotType, string> = {
  eq: "#3b82f6",
  compressor: "#f59e0b",
  reverb: "#8b5cf6",
  delay: "#06b6d4",
  distortion: "#ef4444",
  chorus: "#ec4899",
  filter: "#10b981",
  limiter: "#f97316",
  gate: "#6366f1",
  utility: "#64748b",
  instrument: "#14b8a6",
  external: "#a855f7",
  other: "#6b7280",
};

export function DeviceSlot({
  device,
  onToggle,
  onClick,
  onContextMenu,
}: DeviceSlotProps) {
  const Icon = DEVICE_ICONS[device.type];
  const color = DEVICE_COLORS[device.type];

  return (
    <button
      type="button"
      className="relative w-full cursor-pointer select-none rounded border transition-all duration-150"
      style={{
        background: device.enabled
          ? `linear-gradient(135deg, ${color}15, ${color}05)`
          : "linear-gradient(135deg, var(--surface-3), var(--surface-2))",
        borderColor: device.enabled ? `${color}40` : "var(--border)",
        boxShadow: device.enabled
          ? `0 1px 3px ${color}20, inset 0 1px 0 rgba(255,255,255,0.05)`
          : "0 1px 2px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.02)",
        opacity: device.enabled ? 1 : 0.65,
      }}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      <div className="flex items-center gap-1 px-1.5 py-1">
        <Icon
          className="h-3 w-3 shrink-0"
          style={{
            color: device.enabled ? color : "var(--muted-foreground)",
            opacity: device.enabled ? 1 : 0.55,
          }}
        />
        <div className="min-w-0 flex-1 text-left">
          <div
            className="truncate text-[9px] font-medium"
            style={{ color: device.enabled ? "var(--foreground)" : "var(--muted-foreground)" }}
            title={`${device.name}${device.vendor ? ` (${device.vendor})` : ""}${device.preset ? `\nPreset: ${device.preset}` : ""}`}
          >
            {device.name}
          </div>
          {device.preset ? (
            <div
              className="truncate text-[7px]"
              style={{
                color: device.enabled ? color : "var(--muted-foreground)",
                opacity: device.enabled ? 0.72 : 0.5,
              }}
            >
              {device.preset}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          className="h-2.5 w-2.5 shrink-0 rounded-full border transition-all duration-150 hover:scale-110"
          style={{
            background: device.enabled
              ? `radial-gradient(circle, ${color}, ${color}80)`
              : "radial-gradient(circle, var(--surface-3), var(--surface-2))",
            borderColor: device.enabled ? color : "var(--border)",
            boxShadow: device.enabled
              ? `0 0 6px ${color}, inset 0 1px 1px rgba(255,255,255,0.3)`
              : "inset 0 1px 1px rgba(0,0,0,0.3)",
          }}
          onClick={(event) => {
            event.stopPropagation();
            onToggle(!device.enabled);
          }}
          title={device.enabled ? "Disable device" : "Enable device"}
        />
      </div>
      {device.cpuUsage !== undefined && device.cpuUsage > 5 ? (
        <div
          className="absolute bottom-0 left-0 h-0.5 rounded-b transition-all duration-300"
          style={{
            background:
              device.cpuUsage > 80
                ? "linear-gradient(to right, #ef4444, #dc2626)"
                : device.cpuUsage > 50
                  ? "linear-gradient(to right, #f59e0b, #d97706)"
                  : "linear-gradient(to right, #22c55e, #16a34a)",
            width: `${device.cpuUsage}%`,
          }}
          title={`CPU: ${device.cpuUsage.toFixed(1)}%`}
        />
      ) : null}
    </button>
  );
}
