import type { TrackMeterData } from "@/hooks/useAudioEngine";
import type { HostConnectorState } from "@/hooks/useHostConnector";
import type { MeterLevel } from "@/services/pluginHostSocket";
import type { SessionTrack } from "@/types/studio";

function trackMeterToLevel(meter: Readonly<TrackMeterData> | undefined): MeterLevel | null {
  if (!meter) return null;

  const linToDb = (value: number) => (value > 0 ? 20 * Math.log10(value) : -Infinity);
  const peakL = meter.peak[0] ?? 0;
  const peakR = meter.peak[1] ?? peakL;
  const rmsL = meter.rms[0] ?? 0;
  const rmsR = meter.rms[1] ?? rmsL;

  return {
    peak: linToDb(Math.max(peakL, peakR)),
    rms: linToDb(Math.max(rmsL, rmsR)),
  };
}

export function resolveMasterMeter(options: {
  hostState: HostConnectorState;
  hostAvailable: boolean;
  engine?: {
    masterMeterData?: Readonly<TrackMeterData>;
  };
}): MeterLevel | null {
  const { hostState, hostAvailable, engine } = options;
  return !hostState.isMock && hostAvailable
    ? hostState.masterMeter
    : trackMeterToLevel(engine?.masterMeterData);
}

export function resolveTrackMeters(options: {
  tracks: SessionTrack[];
  hostState: HostConnectorState;
  hostAvailable: boolean;
  engine?: {
    getTrackMeter: (trackId: string) => Readonly<TrackMeterData> | undefined;
  };
}): Record<string, MeterLevel> {
  const { tracks, hostState, hostAvailable, engine } = options;
  return !hostState.isMock && hostAvailable
    ? Object.fromEntries(
        tracks.map((track) => [
          track.id,
          hostState.trackMeters[track.id] ?? { peak: -Infinity, rms: -Infinity },
        ]),
      )
    : Object.fromEntries(
        tracks.map((track) => [
          track.id,
          trackMeterToLevel(engine?.getTrackMeter(track.id)) ?? {
            peak: -Infinity,
            rms: -Infinity,
          },
        ]),
      );
}
