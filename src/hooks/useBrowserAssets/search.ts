import type { IndexedBrowserAsset, AssetCategory } from "@/types/browserAsset";

/**
 * Score an asset against query words using precomputed normalized fields.
 * Ranking: exact name (+20) > prefix (+12) > name contains (+10) > vendor (+6) > tag (+4) > subcategory (+3)
 * AND logic: all words must match somewhere or score is 0.
 */
export function scoreAsset(asset: IndexedBrowserAsset, queryWords: string[]): number {
  let score = 0;
  const fullQuery = queryWords.join(" ");

  for (const word of queryWords) {
    let wordScore = 0;

    if (asset.normalizedName.includes(word)) {
      wordScore = 10;
    } else if (asset.normalizedVendor.includes(word)) {
      wordScore = 6;
    } else if (asset.normalizedTags.some(t => t.includes(word))) {
      wordScore = 4;
    } else if (asset.normalizedSubcategory.includes(word)) {
      wordScore = 3;
    } else if (asset.category.includes(word)) {
      wordScore = 2;
    } else {
      return 0; // AND logic: all words must match somewhere
    }

    score += wordScore;
  }

  // Bonus for exact name match
  if (asset.normalizedName === fullQuery) score += 20;
  // Bonus for prefix match
  else if (asset.normalizedName.startsWith(fullQuery)) score += 12;

  return score;
}

/** Filter and rank assets based on all active filters */
export function filterAssets(
  assets: IndexedBrowserAsset[],
  opts: {
    favorites: Set<string>;
    recents: string[];
    showFavorites: boolean;
    showRecents: boolean;
    activeCategory: AssetCategory | null;
    activeSubcategory: string | null;
    searchQuery: string;
    trackType?: string;
  }
): IndexedBrowserAsset[] {
  let results = assets;

  // Favorites filter
  if (opts.showFavorites) {
    results = results.filter(a => opts.favorites.has(a.id));
  }

  // Recents filter
  if (opts.showRecents) {
    const recentSet = new Set(opts.recents);
    results = results.filter(a => recentSet.has(a.id));
    results.sort((a, b) => opts.recents.indexOf(a.id) - opts.recents.indexOf(b.id));
  }

  // Category filter
  if (opts.activeCategory) {
    results = results.filter(a => a.category === opts.activeCategory);
  }

  // Subcategory filter
  if (opts.activeSubcategory) {
    results = results.filter(a => a.subcategory === opts.activeSubcategory);
  }

  // Search
  if (opts.searchQuery.trim()) {
    const queryWords = opts.searchQuery.toLowerCase().trim().split(/\s+/);
    const scored = results
      .map(a => ({ asset: a, score: scoreAsset(a, queryWords) }))
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score);
    results = scored.map(s => s.asset);
  }

  // Contextual ranking: boost matching track type
  if (opts.trackType && !opts.searchQuery.trim()) {
    const isMidi = opts.trackType === "midi";
    results = [...results].sort((a, b) => {
      const aBoost = isMidi && a.category === "instrument" ? -1 : 0;
      const bBoost = isMidi && b.category === "instrument" ? -1 : 0;
      return aBoost - bBoost;
    });
  }

  return results;
}
