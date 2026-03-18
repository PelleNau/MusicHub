import type { DeviceType } from "./studio";
import type { HostPlugin } from "@/services/pluginHostClient";

export type AssetSource = "device" | "host-plugin" | "preset" | "sample" | "loop";

export type AssetCategory = "instrument" | "effect" | "preset" | "sample" | "loop";

export interface BrowserAsset {
  id: string;
  name: string;
  source: AssetSource;
  category: AssetCategory;
  subcategory?: string;
  vendor?: string;
  tags?: string[];
  deviceType?: DeviceType;
  hostPlugin?: HostPlugin;
  previewUrl?: string;
  disabled?: boolean;
}

/** Extended asset with precomputed normalized fields for fast search */
export interface IndexedBrowserAsset extends BrowserAsset {
  normalizedName: string;
  normalizedVendor: string;
  normalizedTags: string[];
  normalizedSubcategory: string;
}

/** Subcategory options per category */
export const SUBCATEGORY_MAP: Record<AssetCategory, string[]> = {
  instrument: ["Bass", "Keys", "Leads", "Pads", "Strings", "Synth"],
  effect: ["EQ", "Compressor", "Reverb", "Delay", "Utility"],
  preset: [],
  sample: ["Loops", "One-Shots", "Foley", "Vocals"],
  loop: ["Melodic", "Percussive", "Atmospheric"],
};

/** Display labels for categories */
export const CATEGORY_LABELS: Record<AssetCategory, string> = {
  instrument: "Instruments",
  effect: "Effects",
  preset: "Presets",
  sample: "Samples",
  loop: "Loops",
};

/** Source display badges */
export const SOURCE_LABELS: Record<AssetSource, string> = {
  device: "Device",
  "host-plugin": "Plugin",
  preset: "Preset",
  sample: "Sample",
  loop: "Loop",
};

/** Colors by source type */
export const SOURCE_COLORS: Record<AssetSource, string> = {
  device: "hsl(200, 70%, 45%)",
  "host-plugin": "hsl(270, 55%, 50%)",
  preset: "hsl(35, 80%, 50%)",
  sample: "hsl(166, 100%, 40%)",
  loop: "hsl(120, 50%, 45%)",
};
