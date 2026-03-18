/**
 * pluginMatcher — cross-references parsed Ableton project plugins
 * against the Bridge's scanned plugin library and the user's inventory.
 */

import type { DeviceInfo, TrackInfo } from "@/types/ableton";
import type { HostPlugin } from "@/services/pluginHostClient";
import type { InventoryItem } from "@/types/inventory";

/* ── Match result types ── */

export type MatchStatus = "available" | "alternative" | "missing" | "native";

export interface PluginMatch {
  /** Original device from the Ableton project */
  device: DeviceInfo;
  /** Match classification */
  status: MatchStatus;
  /** Matched host plugin (from Bridge scan) */
  hostMatch?: HostPlugin;
  /** Matched inventory item */
  inventoryMatch?: InventoryItem;
  /** Similarity score 0–1 */
  confidence: number;
  /** Why this match was chosen */
  reason: string;
}

export interface TrackMatchReport {
  trackName: string;
  trackType: string;
  matches: PluginMatch[];
  availableCount: number;
  alternativeCount: number;
  missingCount: number;
  nativeCount: number;
}

export interface ProjectMatchReport {
  tracks: TrackMatchReport[];
  totalDevices: number;
  available: number;
  alternatives: number;
  missing: number;
  native: number;
}

/* ── Normalization helpers ── */

/** Strip common suffixes, whitespace, casing for fuzzy compare */
function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.(vst3?|au|aax|clap|dll|component)$/i, "")
    .replace(/[_\-\s]+/g, " ")
    .replace(/\s*(x64|x86|stereo|mono)\s*/gi, "")
    .trim();
}

/** Extract core product name (drop vendor prefix if "Vendor - Product") */
function coreName(name: string): string {
  const n = normalize(name);
  const dashIdx = n.indexOf(" - ");
  return dashIdx > 0 ? n.slice(dashIdx + 3).trim() : n;
}

/** Simple token-overlap similarity 0–1 */
function similarity(a: string, b: string): number {
  const ta = new Set(normalize(a).split(/\s+/));
  const tb = new Set(normalize(b).split(/\s+/));
  if (ta.size === 0 || tb.size === 0) return 0;
  let overlap = 0;
  for (const t of ta) {
    if (tb.has(t)) overlap++;
  }
  return overlap / Math.max(ta.size, tb.size);
}

/* ── Main matcher ── */

function matchDevice(
  device: DeviceInfo,
  hostPlugins: HostPlugin[],
  inventory: InventoryItem[],
): PluginMatch {
  // Native Ableton devices are always available
  if (!device.isPlugin) {
    return {
      device,
      status: "native",
      confidence: 1,
      reason: `Native Ableton device`,
    };
  }

  const deviceNorm = normalize(device.name);
  const deviceCore = coreName(device.name);

  // 1. Try exact match against host plugins
  for (const hp of hostPlugins) {
    const hpNorm = normalize(hp.name);
    if (hpNorm === deviceNorm || hpNorm === deviceCore) {
      return {
        device,
        status: "available",
        hostMatch: hp,
        confidence: 1,
        reason: `Exact match: ${hp.name} (${hp.format})`,
      };
    }
  }

  // 2. Fuzzy match against host plugins
  let bestHost: HostPlugin | undefined;
  let bestHostScore = 0;
  for (const hp of hostPlugins) {
    const score = Math.max(
      similarity(device.name, hp.name),
      similarity(device.name, `${hp.vendor} ${hp.name}`),
    );
    if (score > bestHostScore) {
      bestHostScore = score;
      bestHost = hp;
    }
  }
  if (bestHostScore >= 0.7 && bestHost) {
    return {
      device,
      status: "available",
      hostMatch: bestHost,
      confidence: bestHostScore,
      reason: `Fuzzy match: ${bestHost.name} (${(bestHostScore * 100).toFixed(0)}% similarity)`,
    };
  }

  // 3. Check inventory for alternative
  let bestInv: InventoryItem | undefined;
  let bestInvScore = 0;
  for (const item of inventory) {
    const score = Math.max(
      similarity(device.name, item.product),
      similarity(device.name, `${item.vendor} ${item.product}`),
    );
    if (score > bestInvScore) {
      bestInvScore = score;
      bestInv = item;
    }
  }

  // If inventory has a strong match AND host has a moderate match, it's "available"
  if (bestHostScore >= 0.5 && bestHost) {
    return {
      device,
      status: "available",
      hostMatch: bestHost,
      inventoryMatch: bestInv && bestInvScore >= 0.4 ? bestInv : undefined,
      confidence: bestHostScore,
      reason: `Partial match: ${bestHost.name} (${(bestHostScore * 100).toFixed(0)}%)`,
    };
  }

  if (bestInvScore >= 0.5 && bestInv) {
    return {
      device,
      status: "alternative",
      inventoryMatch: bestInv,
      confidence: bestInvScore,
      reason: `Inventory alternative: ${bestInv.vendor} ${bestInv.product}`,
    };
  }

  // 4. Missing
  return {
    device,
    status: "missing",
    confidence: 0,
    reason: `No match found for "${device.name}"`,
  };
}

export function matchProject(
  tracks: TrackInfo[],
  hostPlugins: HostPlugin[],
  inventory: InventoryItem[],
): ProjectMatchReport {
  const trackReports: TrackMatchReport[] = tracks.map((track) => {
    const matches = track.devices.map((d) => matchDevice(d, hostPlugins, inventory));
    return {
      trackName: track.name,
      trackType: track.type,
      matches,
      availableCount: matches.filter((m) => m.status === "available").length,
      alternativeCount: matches.filter((m) => m.status === "alternative").length,
      missingCount: matches.filter((m) => m.status === "missing").length,
      nativeCount: matches.filter((m) => m.status === "native").length,
    };
  });

  return {
    tracks: trackReports,
    totalDevices: trackReports.reduce((s, t) => s + t.matches.length, 0),
    available: trackReports.reduce((s, t) => s + t.availableCount, 0),
    alternatives: trackReports.reduce((s, t) => s + t.alternativeCount, 0),
    missing: trackReports.reduce((s, t) => s + t.missingCount, 0),
    native: trackReports.reduce((s, t) => s + t.nativeCount, 0),
  };
}
