import { useState, useCallback, useMemo, useEffect } from "react";
import type { HostPlugin } from "@/services/pluginHostClient";
import type { AssetCategory, BrowserAsset } from "@/types/browserAsset";
import { buildAssets } from "./normalize";
import { filterAssets } from "./search";
import { useFavorites, useRecents } from "./userState";

interface UseBrowserAssetsOptions {
  hostPlugins?: HostPlugin[];
  trackType?: string;
}

export function useBrowserAssets({ hostPlugins = [], trackType }: UseBrowserAssetsOptions = {}) {
  const { favorites, toggleFavorite } = useFavorites();
  const { recents, addRecent } = useRecents();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<AssetCategory | null>(null);
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showRecents, setShowRecents] = useState(false);

  const allAssets = useMemo(() => buildAssets(hostPlugins), [hostPlugins]);

  // Reset subcategory when category changes
  useEffect(() => {
    setActiveSubcategory(null);
  }, [activeCategory]);

  const filteredAssets = useMemo(
    () => filterAssets(allAssets, {
      favorites,
      recents,
      showFavorites,
      showRecents,
      activeCategory,
      activeSubcategory,
      searchQuery,
      trackType,
    }),
    [allAssets, favorites, recents, showFavorites, showRecents, activeCategory, activeSubcategory, searchQuery, trackType]
  );

  const findSimilar = useCallback((asset: BrowserAsset) => {
    setSearchQuery("");
    setShowFavorites(false);
    setShowRecents(false);
    setActiveCategory(asset.category);
    setActiveSubcategory(asset.subcategory || null);
  }, []);

  return {
    allAssets,
    filteredAssets,
    favorites,
    recents,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    activeSubcategory,
    setActiveSubcategory,
    showFavorites,
    setShowFavorites,
    showRecents,
    setShowRecents,
    toggleFavorite,
    addRecent,
    findSimilar,
  };
}
