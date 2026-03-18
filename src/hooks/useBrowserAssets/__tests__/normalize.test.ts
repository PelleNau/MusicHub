import { describe, it, expect } from "vitest";
import { buildAssets } from "../normalize";
import type { HostPlugin } from "@/services/pluginHostClient";

describe("buildAssets (normalize)", () => {
  it("creates indexed assets from built-in devices with normalized fields", () => {
    const assets = buildAssets([]);
    const deviceAssets = assets.filter(a => a.source === "device");

    expect(deviceAssets.length).toBeGreaterThan(0);

    for (const asset of deviceAssets) {
      expect(asset.normalizedName).toBe(asset.name.toLowerCase());
      expect(asset.normalizedVendor).toBe("built-in");
      expect(asset.vendor).toBe("Built-in");
      expect(asset.id).toMatch(/^device-/);
      expect(["instrument", "effect"]).toContain(asset.category);
    }
  });

  it("creates indexed assets from host plugins", () => {
    const plugins: HostPlugin[] = [
      { id: "serum", name: "Serum", vendor: "Xfer Records", version: "1.0", format: "VST3", category: "Instrument", path: "/p", tags: ["Synth", "Wavetable"], installed: true, latencySamples: 0, supportsStateRestore: true, lastScanned: "" },
      { id: "pro-q3", name: "Pro-Q 3", vendor: "FabFilter", version: "3.0", format: "VST3", category: "Effect", path: "/p", tags: ["EQ", "Mastering"], installed: true, latencySamples: 0, supportsStateRestore: true, lastScanned: "" },
    ];

    const assets = buildAssets(plugins);
    const hostAssets = assets.filter(a => a.source === "host-plugin");

    expect(hostAssets).toHaveLength(2);

    const serum = hostAssets.find(a => a.name === "Serum")!;
    expect(serum.category).toBe("instrument");
    expect(serum.normalizedVendor).toBe("xfer records");
    expect(serum.normalizedTags).toEqual(["synth", "wavetable"]);
    expect(serum.hostPlugin).toBe(plugins[0]);

    const proQ = hostAssets.find(a => a.name === "Pro-Q 3")!;
    expect(proQ.category).toBe("effect");
    expect(proQ.normalizedName).toBe("pro-q 3");
  });

  it("includes disabled placeholders for presets, samples, loops", () => {
    const assets = buildAssets([]);
    const disabled = assets.filter(a => a.disabled);

    expect(disabled.length).toBeGreaterThan(0);
    for (const a of disabled) {
      expect(["preset", "sample", "loop"]).toContain(a.source);
      expect(a.normalizedName).toBe(a.name.toLowerCase());
    }
  });

  it("maps device types to correct categories", () => {
    const assets = buildAssets([]);
    const instruments = assets.filter(a => a.source === "device" && a.category === "instrument");
    const effects = assets.filter(a => a.source === "device" && a.category === "effect");

    // subtractive, fm, sampler → instrument
    const instrumentTypes = instruments.map(a => a.deviceType);
    expect(instrumentTypes).toContain("subtractive");
    expect(instrumentTypes).toContain("fm");
    expect(instrumentTypes).toContain("sampler");

    // eq3, compressor, reverb, delay, gain → effect
    const effectTypes = effects.map(a => a.deviceType);
    expect(effectTypes).toContain("eq3");
    expect(effectTypes).toContain("compressor");
    expect(effectTypes).toContain("reverb");
  });
});
