import type { HostPlugin } from "@/services/pluginHostClient";
import type { DeviceInstance, DeviceType, HostPluginDescriptor } from "@/types/studio";

export function resolveHostPluginDeviceType(plugin: HostPlugin): DeviceType {
  if (plugin.category === "Instrument") return "sampler";

  const fingerprint = [
    plugin.name,
    plugin.vendor,
    plugin.category,
    ...(plugin.tags ?? []),
  ].join(" ").toLowerCase();

  if (fingerprint.includes("compress")) return "compressor";
  if (fingerprint.includes("reverb") || fingerprint.includes("verb")) return "reverb";
  if (fingerprint.includes("delay") || fingerprint.includes("echo")) return "delay";
  if (fingerprint.includes("eq")) return "eq3";
  return "gain";
}

function resolveHostPluginRole(plugin: HostPlugin): HostPluginDescriptor["role"] {
  switch (plugin.category) {
    case "Instrument":
      return "instrument";
    case "MIDI Effect":
      return "midi-effect";
    case "Analyzer":
      return "analyzer";
    default:
      return "effect";
  }
}

export function buildHostPluginDescriptor(plugin: HostPlugin): HostPluginDescriptor {
  return {
    id: plugin.id,
    path: plugin.path,
    name: plugin.name,
    vendor: plugin.vendor,
    format: plugin.format,
    role: resolveHostPluginRole(plugin),
    scanStatus: plugin.scanStatus,
  };
}

const DEFAULT_HOST_PLUGIN_BY_DEVICE_TYPE: Partial<Record<DeviceType, HostPluginDescriptor>> = {
  subtractive: {
    id: "builtin-aumidisynth",
    path: "AudioUnit:Synths/aumu,msyn,appl",
    name: "AUMIDISynth",
    vendor: "Apple",
    format: "AudioUnit",
    role: "instrument",
  },
  fm: {
    id: "builtin-aumidisynth",
    path: "AudioUnit:Synths/aumu,msyn,appl",
    name: "AUMIDISynth",
    vendor: "Apple",
    format: "AudioUnit",
    role: "instrument",
  },
  sampler: {
    id: "builtin-ausampler",
    path: "AudioUnit:Synths/aumu,samp,appl",
    name: "AUSampler",
    vendor: "Apple",
    format: "AudioUnit",
    role: "instrument",
  },
  eq3: {
    id: "builtin-aunbandeq",
    path: "AudioUnit:Effects/aufx,nbeq,appl",
    name: "AUNBandEQ",
    vendor: "Apple",
    format: "AudioUnit",
    role: "effect",
  },
  compressor: {
    id: "builtin-audynamicsprocessor",
    path: "AudioUnit:Effects/aufx,dcmp,appl",
    name: "AUDynamicsProcessor",
    vendor: "Apple",
    format: "AudioUnit",
    role: "effect",
  },
  reverb: {
    id: "builtin-aumatrixreverb",
    path: "AudioUnit:Effects/aufx,mrev,appl",
    name: "AUMatrixReverb",
    vendor: "Apple",
    format: "AudioUnit",
    role: "effect",
  },
  delay: {
    id: "builtin-audelay",
    path: "AudioUnit:Effects/aufx,dely,appl",
    name: "AUDelay",
    vendor: "Apple",
    format: "AudioUnit",
    role: "effect",
  },
  gain: {
    id: "builtin-aupeaklimiter",
    path: "AudioUnit:Effects/aufx,lmtr,appl",
    name: "AUPeakLimiter",
    vendor: "Apple",
    format: "AudioUnit",
    role: "effect",
  },
};

export function getDefaultHostPluginDescriptor(type: DeviceType): HostPluginDescriptor | null {
  return DEFAULT_HOST_PLUGIN_BY_DEVICE_TYPE[type] ?? null;
}

export function buildDefaultHostBackedDevice(
  type: DeviceType,
  params: DeviceInstance["params"],
): DeviceInstance {
  const hostPlugin = getDefaultHostPluginDescriptor(type);
  return {
    id: crypto.randomUUID(),
    type,
    enabled: true,
    params,
    ...(hostPlugin ? { hostPlugin } : {}),
  };
}
