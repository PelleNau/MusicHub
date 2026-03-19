import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { HostPlugin } from "@/services/pluginHostClient";
import type { DeviceType } from "@/types/studio";
import { useBrowserAssets } from "@/hooks/useBrowserAssets";
import {
  SUBCATEGORY_MAP,
  type AssetCategory,
  type BrowserAsset,
} from "@/types/browserAsset";

export interface StudioBrowserAssistInfo {
  title: string;
  desc: string;
}

interface UseStudioBrowserPanelStateOptions {
  hostPlugins: HostPlugin[];
  // Browser hover/help text is local assistance state, not canonical Studio runtime state.
  onInfoChange?: (info: StudioBrowserAssistInfo | null) => void;
  infoText: Record<string, StudioBrowserAssistInfo>;
  onAddDevice: (type: DeviceType) => void;
  onAddHostPlugin: (plugin: HostPlugin) => void;
  preferredCollapsed?: boolean;
}

const PANEL_WIDTH_KEY = "studio-browser-width";
const MIN_WIDTH = 160;
const MAX_WIDTH = 400;
const DEFAULT_WIDTH = 210;

export function useStudioBrowserPanelState({
  hostPlugins,
  onInfoChange,
  infoText,
  onAddDevice,
  onAddHostPlugin,
  preferredCollapsed = false,
}: UseStudioBrowserPanelStateOptions) {
  const {
    filteredAssets,
    favorites,
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
  } = useBrowserAssets({ hostPlugins });

  const [collapsed, setCollapsed] = useState(preferredCollapsed);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [panelWidth, setPanelWidth] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(PANEL_WIDTH_KEY);
      if (stored) {
        const value = Number(stored);
        if (value >= MIN_WIDTH && value <= MAX_WIDTH) return value;
      }
    } catch {}
    return DEFAULT_WIDTH;
  });

  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartWidthRef = useRef(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectedRowRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [filteredAssets.length, searchQuery, activeCategory, activeSubcategory, showFavorites, showRecents]);

  useEffect(() => {
    setCollapsed(preferredCollapsed);
  }, [preferredCollapsed]);

  useEffect(() => {
    if (selectedIndex >= 0 && selectedRowRef.current && listRef.current) {
      const row = selectedRowRef.current;
      const container = listRef.current;
      const rowTop = row.offsetTop;
      const rowBottom = rowTop + row.offsetHeight;
      const scrollTop = container.scrollTop;
      const scrollBottom = scrollTop + container.clientHeight;

      if (rowTop < scrollTop) {
        container.scrollTop = rowTop;
      } else if (rowBottom > scrollBottom) {
        container.scrollTop = rowBottom - container.clientHeight;
      }
    }
  }, [selectedIndex]);

  const categories: AssetCategory[] = ["instrument", "effect", "preset", "sample", "loop"];
  const subcategories = activeCategory ? SUBCATEGORY_MAP[activeCategory] : [];

  const handleHover = useCallback((id: string | null) => {
    setHoveredId(id);
    onInfoChange?.(id ? infoText[id] ?? null : null);
  }, [infoText, onInfoChange]);

  const handleActivate = useCallback((asset: BrowserAsset) => {
    if (asset.disabled) return;
    addRecent(asset.id);
    if (asset.source === "device" && asset.deviceType) {
      onAddDevice(asset.deviceType);
    } else if (asset.source === "host-plugin" && asset.hostPlugin) {
      onAddHostPlugin(asset.hostPlugin);
    }
  }, [addRecent, onAddDevice, onAddHostPlugin]);

  const handleResizePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartWidthRef.current = panelWidth;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [panelWidth]);

  const handleResizePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const delta = e.clientX - dragStartXRef.current;
    setPanelWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, dragStartWidthRef.current + delta)));
  }, []);

  const handleResizePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    localStorage.setItem(PANEL_WIDTH_KEY, String(panelWidth));
  }, [panelWidth]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const count = filteredAssets.length;
    if (count === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev < count - 1 ? prev + 1 : prev));
        return;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        return;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < count) {
          const asset = filteredAssets[selectedIndex];
          if (!asset.disabled) handleActivate(asset);
        }
        return;
      case "Escape":
        e.preventDefault();
        if (searchQuery) {
          setSearchQuery("");
        } else {
          setSelectedIndex(-1);
          searchInputRef.current?.blur();
        }
        return;
      case "f":
        if (selectedIndex >= 0 && selectedIndex < count && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          toggleFavorite(filteredAssets[selectedIndex].id);
        }
        return;
      default:
        if (
          e.key.length === 1 &&
          !e.metaKey &&
          !e.ctrlKey &&
          !e.altKey &&
          document.activeElement !== searchInputRef.current
        ) {
          searchInputRef.current?.focus();
        }
    }
  }, [filteredAssets, handleActivate, searchQuery, selectedIndex, setSearchQuery, toggleFavorite]);

  const hoveredInfo = useMemo(() => {
    if (!hoveredId) return null;
    return infoText[hoveredId] ?? null;
  }, [hoveredId, infoText]);

  return {
    filteredAssets,
    favorites,
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
    findSimilar,
    collapsed,
    setCollapsed,
    selectedIndex,
    setSelectedIndex,
    panelWidth,
    searchInputRef,
    selectedRowRef,
    listRef,
    categories,
    subcategories,
    hoveredInfo,
    handleHover,
    handleActivate,
    handleKeyDown,
    handleResizePointerDown,
    handleResizePointerMove,
    handleResizePointerUp,
  };
}
