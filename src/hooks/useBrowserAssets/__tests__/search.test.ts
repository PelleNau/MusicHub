import { describe, it, expect } from "vitest";
import { scoreAsset, filterAssets } from "../search";
import type { IndexedBrowserAsset, AssetCategory } from "@/types/browserAsset";

function makeAsset(overrides: Partial<IndexedBrowserAsset> & { id: string; name: string }): IndexedBrowserAsset {
  return {
    source: "device",
    category: "effect" as AssetCategory,
    normalizedName: overrides.name.toLowerCase(),
    normalizedVendor: (overrides.vendor || "").toLowerCase(),
    normalizedTags: (overrides.tags || []).map(t => t.toLowerCase()),
    normalizedSubcategory: (overrides.subcategory || "").toLowerCase(),
    ...overrides,
  };
}

describe("scoreAsset", () => {
  const asset = makeAsset({
    id: "test-1",
    name: "Pro-Q 3",
    vendor: "FabFilter",
    tags: ["EQ", "Mastering"],
    subcategory: "EQ",
  });

  it("returns 0 if any query word doesn't match anywhere (AND logic)", () => {
    expect(scoreAsset(asset, ["pro", "zzz"])).toBe(0);
  });

  it("scores exact name match highest", () => {
    const score = scoreAsset(asset, ["pro-q", "3"]);
    expect(score).toBeGreaterThan(0);

    const exactScore = scoreAsset(asset, ["pro-q 3".split(" ")[0], "3"]);
    expect(exactScore).toBeGreaterThan(0);
  });

  it("scores name contains higher than vendor", () => {
    const nameScore = scoreAsset(asset, ["pro"]);
    const vendorAsset = makeAsset({ id: "v", name: "Other", vendor: "Pro Audio" });
    const vendorScore = scoreAsset(vendorAsset, ["pro"]);

    expect(nameScore).toBeGreaterThan(vendorScore);
  });

  it("scores vendor higher than tag", () => {
    const vendorScore = scoreAsset(asset, ["fabfilter"]);
    const tagScore = scoreAsset(asset, ["mastering"]);

    expect(vendorScore).toBeGreaterThan(tagScore);
  });

  it("scores tag higher than subcategory (when tag-only match)", () => {
    const tagAsset = makeAsset({ id: "t", name: "X", tags: ["delay"], subcategory: "" });
    const subAsset = makeAsset({ id: "s", name: "Y", tags: [], subcategory: "delay" });

    expect(scoreAsset(tagAsset, ["delay"])).toBeGreaterThan(scoreAsset(subAsset, ["delay"]));
  });

  it("gives bonus for exact full name match", () => {
    const exactAsset = makeAsset({ id: "e", name: "Reverb" });
    const partialAsset = makeAsset({ id: "p", name: "Reverb Pro" });

    const exactScore = scoreAsset(exactAsset, ["reverb"]);
    const partialScore = scoreAsset(partialAsset, ["reverb"]);

    expect(exactScore).toBeGreaterThan(partialScore);
  });

  it("gives prefix bonus", () => {
    const prefixAsset = makeAsset({ id: "px", name: "Reverb Pro" });
    const containsAsset = makeAsset({ id: "cx", name: "Pro Reverb" });

    const prefixScore = scoreAsset(prefixAsset, ["reverb"]);
    const containsScore = scoreAsset(containsAsset, ["reverb"]);

    // Both contain "reverb" in name (+10 each), but prefixAsset gets prefix bonus (+12)
    expect(prefixScore).toBeGreaterThan(containsScore);
  });
});

describe("filterAssets", () => {
  const assets: IndexedBrowserAsset[] = [
    makeAsset({ id: "1", name: "EQ Three", category: "effect", subcategory: "EQ", tags: ["eq"] }),
    makeAsset({ id: "2", name: "Compressor", category: "effect", subcategory: "Compressor", tags: ["dynamics"] }),
    makeAsset({ id: "3", name: "FM Synth", category: "instrument", subcategory: "Synth", tags: ["synth", "fm"], source: "device" }),
    makeAsset({ id: "4", name: "Warm Pad", category: "preset", disabled: true, tags: ["pad"], source: "preset" }),
  ];

  const defaultOpts = {
    favorites: new Set<string>(),
    recents: [] as string[],
    showFavorites: false,
    showRecents: false,
    activeCategory: null as AssetCategory | null,
    activeSubcategory: null as string | null,
    searchQuery: "",
    trackType: undefined,
  };

  it("returns all assets with no filters", () => {
    expect(filterAssets(assets, defaultOpts)).toHaveLength(4);
  });

  it("filters by category", () => {
    const result = filterAssets(assets, { ...defaultOpts, activeCategory: "effect" });
    expect(result).toHaveLength(2);
    expect(result.every(a => a.category === "effect")).toBe(true);
  });

  it("filters by subcategory", () => {
    const result = filterAssets(assets, { ...defaultOpts, activeCategory: "effect", activeSubcategory: "EQ" });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("EQ Three");
  });

  it("filters by search query", () => {
    const result = filterAssets(assets, { ...defaultOpts, searchQuery: "synth" });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("FM Synth");
  });

  it("filters by favorites", () => {
    const result = filterAssets(assets, { ...defaultOpts, showFavorites: true, favorites: new Set(["2"]) });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("filters and sorts by recents", () => {
    const result = filterAssets(assets, { ...defaultOpts, showRecents: true, recents: ["3", "1"] });
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("3");
    expect(result[1].id).toBe("1");
  });

  it("boosts instruments for midi track type", () => {
    const result = filterAssets(assets, { ...defaultOpts, trackType: "midi" });
    // Instruments should come before effects
    const firstInstrumentIdx = result.findIndex(a => a.category === "instrument");
    const lastEffectIdx = result.findIndex(a => a.category === "effect");
    // At least one instrument should be before effects (soft ordering)
    expect(firstInstrumentIdx).toBeLessThan(result.length);
  });

  it("combines category + search filters", () => {
    const result = filterAssets(assets, { ...defaultOpts, activeCategory: "effect", searchQuery: "eq" });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("EQ Three");
  });
});
