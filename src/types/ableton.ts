export interface DeviceParam {
  name: string;
  value: string;
}

export interface DeviceInfo {
  name: string;
  type: "instrument" | "effect" | "unknown";
  isPlugin: boolean;
  nativeType?: string;
  pluginFormat?: string;
  presetName?: string;
  parameters: DeviceParam[];
  sidechain?: SidechainInfo;
}

export interface SidechainInfo {
  enabled: boolean;
  source?: string;        // source track or "External"
  ratio?: string;
  threshold?: string;
  attack?: string;
  release?: string;
}

export interface AutomationPoint {
  time: number;   // in beats
  value: number;
}

export interface AutomationEnvelope {
  paramName: string;       // e.g. "Volume", "Pan", "Device On"
  deviceName?: string;     // which device it belongs to, if any
  points: AutomationPoint[];
}

export interface MidiNote {
  pitch: number;       // 0-127 MIDI note number
  velocity: number;    // 0-127
  start: number;       // in beats (relative to clip start)
  duration: number;    // in beats
  mute: boolean;
}

export interface ClipInfo {
  name: string;
  startBeats: number;
  endBeats: number;
  color: number;
  isDisabled: boolean;
  isMidi: boolean;
  notes: MidiNote[];
  timeSignatureNumerator?: number;
  timeSignatureDenominator?: number;
}

export interface TrackSend {
  returnName: string;
  level: number;
}

export interface TrackInfo {
  name: string;
  type: "midi" | "audio" | "return" | "master" | "group";
  color: number;
  devices: DeviceInfo[];
  volume: number | null;
  pan: number | null;
  isMuted: boolean;
  isSoloed: boolean;
  clipCount: number;
  sends: TrackSend[];
  clips: ClipInfo[];
  automationEnvelopes: AutomationEnvelope[];
}

export interface AbletonParseResult {
  tempo: number | null;
  timeSignature: string | null;
  key: string | null;
  plugins: string[];
  abletonDevices: string[];
  trackCount: number;
  tracks: TrackInfo[];
}
