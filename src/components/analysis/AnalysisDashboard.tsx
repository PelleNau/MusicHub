import { useMemo } from "react";
import { AbletonParseResult, TrackInfo, DeviceInfo } from "@/types/ableton";
import { InventoryItem } from "@/types/inventory";
import { OwnershipChart } from "./OwnershipChart";
import { TrackDeviceMap } from "./TrackDeviceMap";
import { SignalChainIssues } from "./SignalChainIssues";
import { ProjectStats } from "./ProjectStats";
import { ArrangementTimeline } from "./ArrangementTimeline";

export interface AnalysisData {
  totalDevices: number;
  ownedDevices: number;
  missingDevices: string[];
  ownedNames: string[];
  trackBreakdown: {
    track: TrackInfo;
    instruments: (DeviceInfo & { owned: boolean })[];
    effects: (DeviceInfo & { owned: boolean })[];
  }[];
  issues: SignalIssue[];
  deviceTypeCounts: { name: string; value: number }[];
}

export interface SignalIssue {
  trackName: string;
  severity: "warning" | "error" | "info";
  message: string;
}

function detectIssues(tracks: TrackInfo[]): SignalIssue[] {
  const issues: SignalIssue[] = [];

  for (const track of tracks) {
    if (track.devices.length === 0) continue;

    // Duplicate effects
    const effectNames = track.devices
      .filter((d) => d.type !== "instrument")
      .map((d) => d.name);
    const counts = new Map<string, number>();
    for (const n of effectNames) counts.set(n, (counts.get(n) || 0) + 1);
    for (const [name, count] of counts) {
      if (count >= 3) {
        issues.push({
          trackName: track.name,
          severity: "error",
          message: `${count}× identical "${name}" stacked — likely misconfiguration`,
        });
      } else if (count === 2) {
        issues.push({
          trackName: track.name,
          severity: "warning",
          message: `Duplicate "${name}" on same track — intentional?`,
        });
      }
    }

    // No EQ before reverb/delay
    const effectOrder = track.devices.filter((d) => d.type !== "instrument");
    const hasEq = effectOrder.some((d) => d.name.toLowerCase().includes("eq"));
    const hasReverb = effectOrder.some((d) => d.name.toLowerCase().includes("reverb"));
    const hasDelay = effectOrder.some((d) => d.name.toLowerCase().includes("delay"));
    if ((hasReverb || hasDelay) && !hasEq && track.type !== "return") {
      issues.push({
        trackName: track.name,
        severity: "info",
        message: `No EQ before time-based effects — consider filtering before reverb/delay`,
      });
    }

    // Extreme reverb pre-delay
    for (const d of track.devices) {
      if (d.name.toLowerCase().includes("reverb")) {
        const preDelay = d.parameters.find((p) => p.name.toLowerCase().includes("pre delay") || p.name === "PreDelay");
        if (preDelay) {
          const val = parseFloat(preDelay.value);
          if (!isNaN(val) && val > 0.5) {
            issues.push({
              trackName: track.name,
              severity: "warning",
              message: `Reverb pre-delay ${preDelay.value}s is unusually long — typical range is 0-100ms`,
            });
          }
        }
      }
    }

    // Empty track
    const instruments = track.devices.filter((d) => d.type === "instrument");
    if (instruments.length === 0 && track.type === "midi") {
      issues.push({
        trackName: track.name,
        severity: "info",
        message: `MIDI track with no instruments loaded`,
      });
    }
  }

  return issues;
}

interface Props {
  parsedResult: AbletonParseResult;
  inventoryItems: InventoryItem[];
}

export function AnalysisDashboard({ parsedResult, inventoryItems }: Props) {
  const ownedSet = useMemo(() => {
    const s = new Set<string>();
    for (const item of inventoryItems) {
      s.add(item.product.toLowerCase());
      s.add(`${item.vendor} ${item.product}`.toLowerCase());
    }
    return s;
  }, [inventoryItems]);

  const analysis = useMemo<AnalysisData>(() => {
    const allDevices: (DeviceInfo & { owned: boolean })[] = [];
    const trackBreakdown: AnalysisData["trackBreakdown"] = [];

    for (const track of parsedResult.tracks) {
      const enriched = track.devices.map((d) => ({
        ...d,
        owned: ownedSet.has(d.name.toLowerCase()),
      }));
      allDevices.push(...enriched);
      trackBreakdown.push({
        track,
        instruments: enriched.filter((d) => d.type === "instrument"),
        effects: enriched.filter((d) => d.type !== "instrument"),
      });
    }

    const ownedDevices = allDevices.filter((d) => d.owned).length;
    const missingDevices = [...new Set(allDevices.filter((d) => !d.owned).map((d) => d.name))];
    const ownedNames = [...new Set(allDevices.filter((d) => d.owned).map((d) => d.name))];

    // Device type breakdown
    const typeCounts = new Map<string, number>();
    for (const d of allDevices) {
      const label = d.type === "instrument" ? "Instruments" : d.isPlugin ? "Plugins (FX)" : "Native FX";
      typeCounts.set(label, (typeCounts.get(label) || 0) + 1);
    }
    const deviceTypeCounts = Array.from(typeCounts.entries()).map(([name, value]) => ({ name, value }));

    const issues = detectIssues(parsedResult.tracks);

    return {
      totalDevices: allDevices.length,
      ownedDevices,
      missingDevices,
      ownedNames,
      trackBreakdown,
      issues,
      deviceTypeCounts,
    };
  }, [parsedResult, ownedSet]);

  return (
    <div className="space-y-6 p-4">
      {/* Top stats row */}
      <ProjectStats parsedResult={parsedResult} analysis={analysis} />

      {/* Arrangement Timeline - full width */}
      <ArrangementTimeline tracks={parsedResult.tracks} tempo={parsedResult.tempo} />

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <OwnershipChart analysis={analysis} />
        <SignalChainIssues issues={analysis.issues} />
      </div>
    </div>
  );
}
