import { Power, Plus, X } from "lucide-react";

export interface DeviceViewDevice {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
}

export interface DeviceViewTrack {
  id: string;
  name: string;
  type: "audio" | "midi" | "return" | "master";
  color: string;
  devices?: DeviceViewDevice[];
}

interface DeviceViewProps {
  track: DeviceViewTrack | null;
  onDeviceToggle: (deviceId: string, enabled: boolean) => void;
  onDeviceClick: (deviceId: string) => void;
  onAddDevice: () => void;
  onClose?: () => void;
}

function DeviceStrip({
  device,
  onToggle,
  onClick,
}: {
  device: DeviceViewDevice;
  onToggle: () => void;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex min-h-[108px] min-w-[148px] flex-col justify-between rounded-xl border px-4 py-3 text-left transition-colors",
        device.enabled
          ? "border-[hsl(212_78%_60%/0.35)] bg-[hsla(212,78%,60%,0.08)]"
          : "border-[hsl(240_8%_24%)] bg-[hsl(240_10%_16%)] opacity-70",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-mono text-xs font-semibold text-white">{device.name}</div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
            {device.type}
          </div>
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
          }}
          className={[
            "flex h-7 w-7 items-center justify-center rounded-lg border transition-colors",
            device.enabled
              ? "border-[hsl(212_78%_60%/0.35)] bg-[hsl(212_78%_60%)] text-white"
              : "border-[hsl(240_8%_24%)] bg-[hsl(240_10%_18%)] text-white/60",
          ].join(" ")}
          title={device.enabled ? "Disable device" : "Enable device"}
        >
          <Power className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-md bg-black/20 px-2 py-1.5 font-mono text-[10px] text-white/55">Setting</div>
        <div className="rounded-md bg-black/20 px-2 py-1.5 font-mono text-[10px] text-white/55">Setting</div>
      </div>
    </button>
  );
}

export function DeviceView({
  track,
  onDeviceToggle,
  onDeviceClick,
  onAddDevice,
  onClose,
}: DeviceViewProps) {
  if (!track) {
    return (
      <div className="flex h-full w-full items-center justify-center border-t border-[hsl(240_8%_20%)] bg-[hsl(240_10%_14%)]">
        <div className="text-center">
          <div className="mb-1 text-sm text-white/40">No Track Selected</div>
          <div className="text-xs text-white/30">Click a track in the mixer to view its devices</div>
        </div>
      </div>
    );
  }

  const deviceCount = track.devices?.length ?? 0;

  return (
    <div className="flex h-full w-full flex-col border-t border-[hsl(240_8%_20%)] bg-[hsl(240_10%_14%)]">
      <div className="flex items-center justify-between border-b border-[hsl(240_8%_20%)] bg-[hsl(240_10%_16%)] px-4 py-2">
        <div className="flex items-center gap-3">
          <div
            className="h-3 w-3 rounded-full"
            style={{ background: track.color, boxShadow: `0 0 8px ${track.color}60` }}
          />
          <div>
            <div className="text-sm font-medium text-white">{track.name}</div>
            <div className="text-xs text-white/50">
              {track.type.charAt(0).toUpperCase() + track.type.slice(1)} Track • {deviceCount} Device{deviceCount !== 1 ? "s" : ""}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAddDevice}
            className="flex items-center gap-1 rounded-lg border border-[hsl(240_8%_24%)] bg-[hsl(240_10%_18%)] px-3 py-1.5 font-mono text-[11px] text-white/85 transition-colors hover:bg-[hsl(240_10%_20%)]"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Device
          </button>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-white/50 transition-colors hover:bg-[hsl(240_10%_18%)] hover:text-white/80"
              title="Close Device View"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {(track.devices ?? []).map((device) => (
            <DeviceStrip
              key={device.id}
              device={device}
              onToggle={() => onDeviceToggle(device.id, !device.enabled)}
              onClick={() => onDeviceClick(device.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
