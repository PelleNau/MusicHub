export interface Session {
  id: string;
  user_id: string;
  name: string;
  tempo: number;
  time_signature: string;
  created_at: string;
  updated_at: string;
}

export interface TrackSend {
  return_track_id: string;
  level: number; // 0–1
  pre_fader?: boolean;
}

export type SoloMode = "sip" | "afl" | "pfl";
export type MixerStripSection = "io" | "inserts" | "eq" | "sends";

/* ── Device/Effect types ── */
export type EffectType = "eq3" | "compressor" | "reverb" | "delay" | "gain";

/* ── Instrument types ── */
export type InstrumentType = "subtractive" | "fm" | "sampler";

/** Union of all device types (instruments + effects) */
export type DeviceType = EffectType | InstrumentType;

/** Whether a device type is an instrument (sound generator) vs effect (processor) */
export function isInstrumentType(type: DeviceType): type is InstrumentType {
  return type === "subtractive" || type === "fm" || type === "sampler";
}

export interface DeviceParam {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  default: number;
  unit?: string;
  options?: string[]; // for select-style params (e.g., waveform type)
}

export interface DeviceDefinition {
  type: DeviceType;
  label: string;
  params: DeviceParam[];
  category: "instrument" | "effect";
}

export type HostPluginRole = "instrument" | "effect" | "midi-effect" | "analyzer";
export type HostPluginScanStatus = "ok" | "warning" | "failed" | "quarantined";

export interface HostPluginDescriptor {
  id: string;
  path: string;
  name: string;
  vendor: string;
  format: string;
  role: HostPluginRole;
  scanStatus?: HostPluginScanStatus;
}

export interface DeviceInstance {
  id: string;
  type: DeviceType;
  enabled: boolean;
  params: Record<string, number>;
  hostPlugin?: HostPluginDescriptor;
}

type LegacyNativePluginFields = {
  nativePluginId?: string;
  nativePluginPath?: string;
  nativePluginName?: string;
  nativePluginVendor?: string;
  nativePluginFormat?: string;
  nativePluginRole?: HostPluginRole;
  nativePluginScanStatus?: HostPluginScanStatus;
};

export function getHostPluginDescriptor(device: DeviceInstance): HostPluginDescriptor | null {
  const legacyDevice = device as DeviceInstance & LegacyNativePluginFields;
  if (device.hostPlugin) return device.hostPlugin;
  if (!legacyDevice.nativePluginId || !legacyDevice.nativePluginPath) return null;

  return {
    id: legacyDevice.nativePluginId,
    path: legacyDevice.nativePluginPath,
    name: legacyDevice.nativePluginName ?? "",
    vendor: legacyDevice.nativePluginVendor ?? "",
    format: legacyDevice.nativePluginFormat ?? "",
    role: legacyDevice.nativePluginRole ?? "effect",
    scanStatus: legacyDevice.nativePluginScanStatus,
  };
}

export function isHostBackedDevice(device: DeviceInstance): boolean {
  return getHostPluginDescriptor(device) !== null;
}

export function getDeviceDisplayInfo(device: DeviceInstance): {
  label: string;
  subtitle: string | null;
  isHostBacked: boolean;
} {
  const hostPlugin = getHostPluginDescriptor(device);
  const def = DEVICE_DEFS.find((candidate) => candidate.type === device.type);

  if (!hostPlugin) {
    return {
      label: def?.label ?? device.type,
      subtitle: null,
      isHostBacked: false,
    };
  }

  return {
    label: hostPlugin.name || def?.label || device.type,
    subtitle: [hostPlugin.vendor, hostPlugin.format].filter(Boolean).join(" · ") || null,
    isHostBacked: true,
  };
}

export function normalizeDeviceInstance(device: DeviceInstance): DeviceInstance {
  const hostPlugin = getHostPluginDescriptor(device);
  if (!hostPlugin) return device;

  const legacyDevice = device as DeviceInstance & LegacyNativePluginFields;
  const {
    nativePluginId: _nativePluginId,
    nativePluginPath: _nativePluginPath,
    nativePluginName: _nativePluginName,
    nativePluginVendor: _nativePluginVendor,
    nativePluginFormat: _nativePluginFormat,
    nativePluginRole: _nativePluginRole,
    nativePluginScanStatus: _nativePluginScanStatus,
    ...normalizedDevice
  } = legacyDevice;

  return {
    ...normalizedDevice,
    hostPlugin,
  };
}

export function normalizeDeviceChain(devices: DeviceInstance[] | null | undefined): DeviceInstance[] {
  return (devices ?? []).map(normalizeDeviceInstance);
}

/* ── Effect definitions ── */
export const EFFECT_DEFS: DeviceDefinition[] = [
  {
    type: "eq3",
    label: "EQ Three",
    category: "effect",
    params: [
      { key: "lowGain", label: "Low", min: -24, max: 24, step: 0.5, default: 0, unit: "dB" },
      { key: "midGain", label: "Mid", min: -24, max: 24, step: 0.5, default: 0, unit: "dB" },
      { key: "highGain", label: "High", min: -24, max: 24, step: 0.5, default: 0, unit: "dB" },
      { key: "lowFreq", label: "Lo ×", min: 60, max: 800, step: 10, default: 250, unit: "Hz" },
      { key: "highFreq", label: "Hi ×", min: 1000, max: 16000, step: 100, default: 4000, unit: "Hz" },
    ],
  },
  {
    type: "compressor",
    label: "Compressor",
    category: "effect",
    params: [
      { key: "threshold", label: "Thresh", min: -60, max: 0, step: 1, default: -24, unit: "dB" },
      { key: "ratio", label: "Ratio", min: 1, max: 20, step: 0.5, default: 4 },
      { key: "attack", label: "Attack", min: 0, max: 1, step: 0.001, default: 0.003, unit: "s" },
      { key: "release", label: "Release", min: 0.01, max: 1, step: 0.01, default: 0.25, unit: "s" },
      { key: "knee", label: "Knee", min: 0, max: 40, step: 1, default: 10, unit: "dB" },
    ],
  },
  {
    type: "reverb",
    label: "Reverb",
    category: "effect",
    params: [
      { key: "mix", label: "Mix", min: 0, max: 1, step: 0.01, default: 0.3 },
      { key: "decay", label: "Decay", min: 0.1, max: 10, step: 0.1, default: 2, unit: "s" },
    ],
  },
  {
    type: "delay",
    label: "Delay",
    category: "effect",
    params: [
      { key: "mix", label: "Mix", min: 0, max: 1, step: 0.01, default: 0.3 },
      { key: "time", label: "Time", min: 0.01, max: 2, step: 0.01, default: 0.375, unit: "s" },
      { key: "feedback", label: "Feedback", min: 0, max: 0.95, step: 0.01, default: 0.4 },
    ],
  },
  {
    type: "gain",
    label: "Utility",
    category: "effect",
    params: [
      { key: "gain", label: "Gain", min: -24, max: 24, step: 0.5, default: 0, unit: "dB" },
    ],
  },
];

/* ── Instrument definitions ── */
export const INSTRUMENT_DEFS: DeviceDefinition[] = [
  {
    type: "subtractive",
    label: "Analog",
    category: "instrument",
    params: [
      // Oscillators
      { key: "osc1Wave", label: "Osc 1", min: 0, max: 3, step: 1, default: 1, options: ["sine", "triangle", "sawtooth", "square"] },
      { key: "osc2Wave", label: "Osc 2", min: 0, max: 3, step: 1, default: 2, options: ["sine", "triangle", "sawtooth", "square"] },
      { key: "osc2Detune", label: "Detune", min: -100, max: 100, step: 1, default: 7, unit: "ct" },
      { key: "oscMix", label: "Mix", min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: "octave", label: "Oct", min: -3, max: 3, step: 1, default: 0 },
      // Filter
      { key: "filterFreq", label: "Cutoff", min: 20, max: 18000, step: 1, default: 4000, unit: "Hz" },
      { key: "filterQ", label: "Reso", min: 0.1, max: 25, step: 0.1, default: 1 },
      { key: "filterEnv", label: "Env→Flt", min: -8000, max: 8000, step: 100, default: 2000, unit: "Hz" },
      // Amp envelope
      { key: "ampAttack", label: "A", min: 0.001, max: 2, step: 0.001, default: 0.005, unit: "s" },
      { key: "ampDecay", label: "D", min: 0.001, max: 2, step: 0.001, default: 0.2, unit: "s" },
      { key: "ampSustain", label: "S", min: 0, max: 1, step: 0.01, default: 0.7 },
      { key: "ampRelease", label: "R", min: 0.001, max: 5, step: 0.001, default: 0.3, unit: "s" },
      // Filter envelope
      { key: "fltAttack", label: "FA", min: 0.001, max: 2, step: 0.001, default: 0.005, unit: "s" },
      { key: "fltDecay", label: "FD", min: 0.001, max: 2, step: 0.001, default: 0.3, unit: "s" },
      { key: "fltSustain", label: "FS", min: 0, max: 1, step: 0.01, default: 0.2 },
      // Master
      { key: "volume", label: "Vol", min: 0, max: 1, step: 0.01, default: 0.7 },
      { key: "glide", label: "Glide", min: 0, max: 0.5, step: 0.001, default: 0, unit: "s" },
    ],
  },
  {
    type: "fm",
    label: "FM",
    category: "instrument",
    params: [
      // Operator levels
      { key: "op1Level", label: "Op 1", min: 0, max: 1, step: 0.01, default: 1 },
      { key: "op2Level", label: "Op 2", min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: "op3Level", label: "Op 3", min: 0, max: 1, step: 0.01, default: 0 },
      { key: "op4Level", label: "Op 4", min: 0, max: 1, step: 0.01, default: 0 },
      // Ratios
      { key: "op1Ratio", label: "R1", min: 0.5, max: 16, step: 0.01, default: 1 },
      { key: "op2Ratio", label: "R2", min: 0.5, max: 16, step: 0.01, default: 2 },
      { key: "op3Ratio", label: "R3", min: 0.5, max: 16, step: 0.01, default: 3 },
      { key: "op4Ratio", label: "R4", min: 0.5, max: 16, step: 0.01, default: 4 },
      // Modulation indices
      { key: "mod21", label: "2→1", min: 0, max: 10, step: 0.01, default: 2 },
      { key: "mod31", label: "3→1", min: 0, max: 10, step: 0.01, default: 0 },
      { key: "mod42", label: "4→2", min: 0, max: 10, step: 0.01, default: 0 },
      // Algorithm
      { key: "algorithm", label: "Algo", min: 0, max: 3, step: 1, default: 0 },
      // Envelope
      { key: "ampAttack", label: "A", min: 0.001, max: 2, step: 0.001, default: 0.005, unit: "s" },
      { key: "ampDecay", label: "D", min: 0.001, max: 2, step: 0.001, default: 0.3, unit: "s" },
      { key: "ampSustain", label: "S", min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: "ampRelease", label: "R", min: 0.001, max: 5, step: 0.001, default: 0.3, unit: "s" },
      // Master
      { key: "volume", label: "Vol", min: 0, max: 1, step: 0.01, default: 0.6 },
    ],
  },
  {
    type: "sampler",
    label: "Sampler",
    category: "instrument",
    params: [
      { key: "ampAttack", label: "A", min: 0.001, max: 2, step: 0.001, default: 0.001, unit: "s" },
      { key: "ampDecay", label: "D", min: 0.001, max: 2, step: 0.001, default: 0.5, unit: "s" },
      { key: "ampSustain", label: "S", min: 0, max: 1, step: 0.01, default: 1 },
      { key: "ampRelease", label: "R", min: 0.001, max: 5, step: 0.001, default: 0.2, unit: "s" },
      { key: "rootPitch", label: "Root", min: 0, max: 127, step: 1, default: 60 },
      { key: "pitchTrack", label: "Track", min: 0, max: 1, step: 1, default: 1 },
      { key: "volume", label: "Vol", min: 0, max: 1, step: 0.01, default: 0.8 },
      { key: "loopEnabled", label: "Loop", min: 0, max: 1, step: 1, default: 0 },
    ],
  },
];

/** All device definitions (instruments + effects) */
export const DEVICE_DEFS: DeviceDefinition[] = [...INSTRUMENT_DEFS, ...EFFECT_DEFS];

/* ── Automation types ── */

export interface AutomationPoint {
  id: string;
  time: number;   // beats
  value: number;  // normalized 0–1
  curve?: "linear" | "hold" | "smooth";
}

export interface AutomationLaneData {
  id: string;
  target: string;      // e.g. "volume", "pan", "device:abc123:mix"
  label: string;       // display name, e.g. "Volume", "Pan", "Reverb Mix"
  color?: string;      // optional override color
  visible: boolean;
  points: AutomationPoint[];
}

/** Built-in automatable parameters available on every track */
export const TRACK_AUTOMATION_TARGETS = [
  { target: "volume", label: "Volume", defaultValue: 0.8 },
  { target: "pan", label: "Pan", defaultValue: 0.5 },
  { target: "mute", label: "Mute", defaultValue: 0 },
] as const;

/** Get automatable parameters for a track (built-in + device params) */
export function getAutomatableParams(track: SessionTrack): Array<{ target: string; label: string; defaultValue: number }> {
  const params: Array<{ target: string; label: string; defaultValue: number }> = [
    ...TRACK_AUTOMATION_TARGETS,
  ];

  for (const device of track.device_chain || []) {
    const def = DEVICE_DEFS.find(d => d.type === device.type);
    if (!def) continue;
    const display = getDeviceDisplayInfo(device);
    for (const p of def.params) {
      const normalDefault = (p.default - p.min) / (p.max - p.min);
      params.push({
        target: `device:${device.id}:${p.key}`,
        label: `${display.label} › ${p.label}`,
        defaultValue: normalDefault,
      });
    }
  }

  return params;
}

export interface SessionTrack {
  id: string;
  session_id: string;
  name: string;
  type: "midi" | "audio" | "return" | "master" | "group";
  color: number;
  volume: number;
  pan: number;
  is_muted: boolean;
  is_soloed: boolean;
  sort_order: number;
  device_chain: DeviceInstance[];
  sends: TrackSend[];
  input_from: string | null;
  created_at: string;
  clips?: SessionClip[];
  automation_lanes?: AutomationLaneData[];
}

export interface SessionClip {
  id: string;
  track_id: string;
  name: string;
  start_beats: number;
  end_beats: number;
  color: number;
  is_midi: boolean;
  is_muted: boolean;
  audio_url: string | null;
  waveform_peaks: number[] | null;
  midi_data: unknown | null;
  alias_of: string | null;
  created_at: string;
}
