import { DEVICE_DEFS, type DeviceType } from "@/types/studio";
import type { HostPlugin } from "@/services/pluginHostClient";
import type { AssetCategory, IndexedBrowserAsset } from "@/types/browserAsset";

/** Map built-in device type to subcategory */
function deviceSubcategory(type: DeviceType): string | undefined {
  switch (type) {
    case "eq3": return "EQ";
    case "compressor": return "Compressor";
    case "reverb": return "Reverb";
    case "delay": return "Delay";
    case "gain": return "Utility";
    case "subtractive": return "Synth";
    case "fm": return "Synth";
    case "sampler": return "Keys";
    default: return undefined;
  }
}

/** Map built-in device type to category */
function deviceCategory(type: DeviceType): AssetCategory {
  switch (type) {
    case "subtractive":
    case "fm":
    case "sampler":
      return "instrument";
    default:
      return "effect";
  }
}

/** Normalize a BrowserAsset into an IndexedBrowserAsset with precomputed search fields */
function indexAsset(asset: Omit<IndexedBrowserAsset, "normalizedName" | "normalizedVendor" | "normalizedTags" | "normalizedSubcategory">): IndexedBrowserAsset {
  return {
    ...asset,
    normalizedName: asset.name.toLowerCase(),
    normalizedVendor: (asset.vendor || "").toLowerCase(),
    normalizedTags: (asset.tags || []).map(t => t.toLowerCase()),
    normalizedSubcategory: (asset.subcategory || "").toLowerCase(),
  };
}

/** Build unified asset list from built-in devices + host plugins + placeholders */
export function buildAssets(hostPlugins: HostPlugin[]): IndexedBrowserAsset[] {
  const assets: IndexedBrowserAsset[] = [];

  // Built-in devices
  for (const def of DEVICE_DEFS) {
    assets.push(indexAsset({
      id: `device-${def.type}`,
      name: def.label,
      source: "device",
      category: deviceCategory(def.type),
      subcategory: deviceSubcategory(def.type),
      vendor: "Built-in",
      tags: [def.category, def.type],
      deviceType: def.type,
    }));
  }

  // Host plugins
  for (const plugin of hostPlugins) {
    const cat: AssetCategory = plugin.category === "Instrument" ? "instrument" : "effect";
    assets.push(indexAsset({
      id: `host-${plugin.id}`,
      name: plugin.name,
      source: "host-plugin",
      category: cat,
      subcategory: plugin.tags?.[0],
      vendor: plugin.vendor,
      tags: plugin.tags,
      hostPlugin: plugin,
    }));
  }

  // Placeholder presets/samples (disabled, coming soon)
  const placeholders = [
    { id: "p-warm-pad", name: "Warm Pad", source: "preset" as const, category: "preset" as const, subcategory: "Pads", disabled: true, tags: ["pad", "warm", "ambient"] },
    { id: "p-deep-bass", name: "Deep Bass", source: "preset" as const, category: "preset" as const, subcategory: "Bass", disabled: true, tags: ["bass", "deep", "sub"] },
    { id: "s-kick-808", name: "808 Kick", source: "sample" as const, category: "sample" as const, subcategory: "One-Shots", disabled: true, tags: ["kick", "808", "drum"] },
    { id: "s-snare-acoustic", name: "Acoustic Snare", source: "sample" as const, category: "sample" as const, subcategory: "One-Shots", disabled: true, tags: ["snare", "acoustic", "drum"] },
    { id: "l-house-drum", name: "House Drums 120", source: "loop" as const, category: "loop" as const, subcategory: "Percussive", disabled: true, tags: ["house", "drums", "120bpm"] },
    { id: "l-ambient-texture", name: "Ambient Texture", source: "loop" as const, category: "loop" as const, subcategory: "Atmospheric", disabled: true, tags: ["ambient", "texture", "pad"] },
  ];

  for (const p of placeholders) {
    assets.push(indexAsset(p));
  }

  return assets;
}
