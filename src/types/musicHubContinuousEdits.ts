export type MusicHubContinuousEditKind =
  | "track.volume"
  | "track.pan"
  | "track.sends"
  | "track.reorder"
  | "clip.move"
  | "clip.resize"
  | "automation.change"
  | "automation.add"
  | "automation.remove";

export interface MusicHubContinuousEdit {
  id: string;
  kind: MusicHubContinuousEditKind;
  sessionId?: string | null;
  trackId?: string;
  clipId?: string;
  laneId?: string;
  occurredAt: string;
  payload: Record<string, unknown>;
}
