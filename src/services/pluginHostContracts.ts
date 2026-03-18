import type { DeviceInstance, TrackSend } from "@/types/studio";

export interface HostGraphClip {
  id: string;
  track_id: string;
  name: string;
  start_beats: number;
  end_beats: number;
  color: number;
  is_midi: boolean;
  audio_url: string | null;
  waveform_peaks: number[] | null;
  midi_data: unknown | null;
  alias_of: string | null;
}

export interface HostGraphTrack {
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
  clips?: HostGraphClip[];
  chainId?: string;
  chain_id?: string;
  muted?: boolean;
  mute?: boolean;
  solo?: boolean;
}

export interface NativePlaybackClipState {
  id?: string;
  track_id?: string;
  start_beats?: number;
  end_beats?: number;
  is_midi?: boolean;
}

export interface NativePlaybackTrackState {
  trackId: string;
  status: "idle" | "monitoring" | "playing";
  activeClips?: NativePlaybackClipState[];
}
