/**
 * manifestGenerator — converts a parsed Ableton project into
 * chain manifests compatible with POST /chains/load.
 */

import type { TrackInfo, DeviceInfo } from "@/types/ableton";
import type { TrackMatchReport, PluginMatch } from "@/lib/pluginMatcher";

/* ── Manifest format (what plugin-host expects) ── */

export interface ManifestNode {
  pluginId: string;
  pluginName: string;
  vendor: string;
  format: string;
  bypass: boolean;
  parameters?: Record<string, string>;
}

export interface ChainManifest {
  name: string;
  trackName: string;
  trackType: string;
  sampleRate?: number;
  blockSize?: number;
  nodes: ManifestNode[];
}

export interface GeneratedManifests {
  manifests: ChainManifest[];
  skipped: { trackName: string; reason: string }[];
}

/* ── Generator ── */

function deviceToNode(device: DeviceInfo, match?: PluginMatch): ManifestNode | null {
  // Skip native Ableton devices — can't load in plugin-host
  if (!device.isPlugin) return null;

  // Only generate nodes for devices that have a host match
  if (match && match.hostMatch) {
    const params: Record<string, string> = {};
    for (const p of device.parameters) {
      params[p.name] = p.value;
    }
    return {
      pluginId: match.hostMatch.id,
      pluginName: match.hostMatch.name,
      vendor: match.hostMatch.vendor,
      format: match.hostMatch.format,
      bypass: false,
      ...(Object.keys(params).length > 0 ? { parameters: params } : {}),
    };
  }

  // No host match — use device info as-is (plugin-host will report "missing")
  const params: Record<string, string> = {};
  for (const p of device.parameters) {
    params[p.name] = p.value;
  }
  return {
    pluginId: "",
    pluginName: device.name,
    vendor: "",
    format: device.pluginFormat || "VST3",
    bypass: false,
    ...(Object.keys(params).length > 0 ? { parameters: params } : {}),
  };
}

export function generateManifests(
  tracks: TrackInfo[],
  matchReports?: TrackMatchReport[],
): GeneratedManifests {
  const manifests: ChainManifest[] = [];
  const skipped: { trackName: string; reason: string }[] = [];

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    const matchReport = matchReports?.[i];

    // Skip master/return tracks with no plugins
    const pluginDevices = track.devices.filter((d) => d.isPlugin);
    if (pluginDevices.length === 0) {
      if (track.type !== "master" && track.type !== "return") {
        skipped.push({ trackName: track.name, reason: "No plugin devices" });
      }
      continue;
    }

    const nodes: ManifestNode[] = [];
    for (let j = 0; j < track.devices.length; j++) {
      const device = track.devices[j];
      const match = matchReport?.matches[j];
      const node = deviceToNode(device, match);
      if (node) nodes.push(node);
    }

    if (nodes.length === 0) {
      skipped.push({ trackName: track.name, reason: "All devices are native (no loadable plugins)" });
      continue;
    }

    manifests.push({
      name: `${track.name} Chain`,
      trackName: track.name,
      trackType: track.type,
      nodes,
    });
  }

  return { manifests, skipped };
}
