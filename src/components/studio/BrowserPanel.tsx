import { useMemo } from "react";
import {
  Info,
  Search,
  Star,
  Clock,
  Play,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  SlidersHorizontal,
  Gauge,
  Waves,
  Timer,
  Volume2,
  Sparkles,
  Disc3,
  CircleDot,
  Piano,
  FileAudio,
  Music,
} from "lucide-react";
import type { DeviceType } from "@/types/studio";
import type { HostPlugin } from "@/services/pluginHostClient";
import { useStudioInfo, STUDIO_INFO } from "./StudioInfoContext";
import { useStudioBrowserPanelState } from "@/hooks/useStudioBrowserPanelState";
import {
  CATEGORY_LABELS,
  SOURCE_COLORS,
  SOURCE_LABELS,
  type AssetCategory,
  type BrowserAsset,
} from "@/types/browserAsset";

/* ── Device icon mapping ── */
const DEVICE_ICONS: Partial<Record<DeviceType, React.ReactNode>> = {
  eq3: <SlidersHorizontal className="h-2.5 w-2.5" />,
  compressor: <Gauge className="h-2.5 w-2.5" />,
  reverb: <Waves className="h-2.5 w-2.5" />,
  delay: <Timer className="h-2.5 w-2.5" />,
  gain: <Volume2 className="h-2.5 w-2.5" />,
  subtractive: <Sparkles className="h-2.5 w-2.5" />,
  fm: <Disc3 className="h-2.5 w-2.5" />,
  sampler: <CircleDot className="h-2.5 w-2.5" />,
};

/* ── Category icons ── */
const CATEGORY_ICONS: Record<AssetCategory, React.ReactNode> = {
  instrument: <Piano className="h-3 w-3" />,
  effect: <Sparkles className="h-3 w-3" />,
  preset: <Music className="h-3 w-3" />,
  sample: <FileAudio className="h-3 w-3" />,
  loop: <Disc3 className="h-3 w-3" />,
};

/* ── Info descriptions ── */
const INFO_TEXT: Record<string, { title: string; desc: string }> = {
  browser: { title: "Browser", desc: "Find and load sounds, instruments, effects, and samples. Double-click an item to add it to the selected track's device chain." },
  search: { title: "Search", desc: "Type to search across all categories. Supports plugin names, preset names, descriptive words like 'warm pad', vendor names, and tags." },
  favorites: { title: "Favorites", desc: "Your starred assets for instant access. Click the star on any item to add it to favorites." },
  recents: { title: "Recent", desc: "Recently loaded assets. Quickly reload sounds you've been working with." },
  "cat-instrument": { title: "Instruments", desc: "Virtual instruments that generate sound from MIDI input. Synthesizers, samplers, and wavetable engines." },
  "cat-effect": { title: "Effects", desc: "Signal processors that modify audio. EQs, compressors, reverbs, delays, and more." },
  "cat-preset": { title: "Presets", desc: "Ready-to-use sound configurations for instruments and effects." },
  "cat-sample": { title: "Samples", desc: "Audio files — one-shots, foley, and vocals for layering into your project." },
  "cat-loop": { title: "Loops", desc: "Pre-made audio loops. Tempo-matched rhythmic and melodic patterns." },
};

/* ── Asset row component ── */
function AssetRow({
  asset,
  isFavorite,
  isSelected,
  onActivate,
  onToggleFavorite,
  onFindSimilar,
  onHover,
  rowRef,
}: {
  asset: BrowserAsset;
  isFavorite: boolean;
  isSelected: boolean;
  onActivate: (asset: BrowserAsset) => void;
  onToggleFavorite: (id: string) => void;
  onFindSimilar: (asset: BrowserAsset) => void;
  onHover: (id: string | null) => void;
  rowRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  const icon = asset.deviceType ? DEVICE_ICONS[asset.deviceType] : null;
  const dotColor = SOURCE_COLORS[asset.source];

  return (
    <button
      ref={rowRef}
      className={`w-full flex items-center gap-1.5 py-[4px] px-2 text-left transition-colors rounded-[2px] group/row ${
        asset.disabled ? "opacity-40 cursor-default" : "cursor-pointer hover:bg-accent/30"
      } ${isSelected && !asset.disabled ? "bg-accent/40 ring-1 ring-primary/30" : ""}`}
      onMouseEnter={() => onHover(asset.id)}
      onMouseLeave={() => onHover(null)}
      onDoubleClick={() => {
        if (!asset.disabled) onActivate(asset);
      }}
      onClick={() => {
        if (!asset.disabled) onActivate(asset);
      }}
    >
      {/* Source dot */}
      <div
        className="w-[5px] h-[5px] rounded-full shrink-0"
        style={{ backgroundColor: dotColor }}
      />

      {/* Device icon */}
      {icon && (
        <span className="shrink-0" style={{ color: "hsl(var(--studio-text-muted))" }}>
          {icon}
        </span>
      )}

      {/* Name */}
      <span
        className="text-[10px] font-mono truncate leading-none flex-1 group-hover/row:text-foreground"
        style={{ color: asset.disabled ? "hsl(var(--studio-text-dim))" : "hsl(var(--foreground) / 0.8)" }}
      >
        {asset.name}
      </span>

      {/* Vendor (if from host) */}
      {asset.vendor && asset.vendor !== "Built-in" && (
        <span className="text-[8px] font-mono shrink-0 hidden group-hover/row:inline" style={{ color: "hsl(var(--studio-text-dim))" }}>
          {asset.vendor}
        </span>
      )}

      {/* Source badge */}
      <span
        className="text-[7px] font-mono px-1 py-px rounded shrink-0"
        style={{
          color: "hsl(var(--studio-text-dim))",
          backgroundColor: "hsl(var(--studio-surface))",
        }}
      >
        {asset.disabled ? "soon" : SOURCE_LABELS[asset.source]}
      </span>

      {/* Favorite star */}
      <button
        className={`shrink-0 p-0 transition-opacity ${isFavorite ? "opacity-100" : "opacity-0 group-hover/row:opacity-50"}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(asset.id);
        }}
        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Star
          className="h-2.5 w-2.5"
          style={{ color: isFavorite ? "hsl(50, 85%, 55%)" : "hsl(var(--studio-text-dim))" }}
          fill={isFavorite ? "hsl(50, 85%, 55%)" : "none"}
        />
      </button>

      {/* Find Similar menu */}
      {!asset.disabled && (
        <button
          className="shrink-0 p-0 opacity-0 group-hover/row:opacity-50 hover:!opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onFindSimilar(asset);
          }}
          title="Find similar"
        >
          <MoreHorizontal className="h-2.5 w-2.5" style={{ color: "hsl(var(--studio-text-dim))" }} />
        </button>
      )}
    </button>
  );
}

/* ── Main Browser Panel ── */
interface BrowserPanelProps {
  onAddDevice: (type: DeviceType) => void;
  onAddHostPlugin: (plugin: HostPlugin) => void;
  hostPlugins?: HostPlugin[];
  onRefreshHostPlugins?: () => void;
  preferredCollapsed?: boolean;
}

export function BrowserPanel({
  onAddDevice,
  onAddHostPlugin,
  hostPlugins = [],
  onRefreshHostPlugins,
  preferredCollapsed,
}: BrowserPanelProps) {
  const { hoveredInfo: contextInfo, setHoveredInfo } = useStudioInfo();
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
    findSimilar,
    collapsed,
    setCollapsed,
    selectedIndex,
    panelWidth,
    searchInputRef,
    selectedRowRef,
    listRef,
    categories,
    subcategories,
    hoveredInfo: localInfo,
    handleHover,
    handleActivate,
    handleKeyDown,
    handleResizePointerDown,
    handleResizePointerMove,
    handleResizePointerUp,
  } = useStudioBrowserPanelState({
    hostPlugins,
    onInfoChange: setHoveredInfo,
    infoText: INFO_TEXT,
    onAddDevice,
    onAddHostPlugin,
    preferredCollapsed,
  });

  const hoveredInfo = localInfo || contextInfo || INFO_TEXT.browser;
  /* ── Collapsed state ── */
  if (collapsed) {
    return (
      <div
        className="w-8 shrink-0 flex flex-col items-center py-2 border-r bg-card"
        style={{ borderColor: "hsl(var(--border))" }}
      >
        <button
          onClick={() => setCollapsed(false)}
          className="transition-colors p-1"
          style={{ color: "hsl(var(--studio-text-dim))" }}
          title="Show browser (Ctrl+Alt+B)"
        >
          <PanelLeftOpen className="h-3.5 w-3.5" />
        </button>
        <div className="flex flex-col items-center gap-2 mt-3">
          <button
            className="transition-colors p-0.5"
            style={{ color: "hsl(var(--studio-text-dim))" }}
            title="Search"
            onClick={() => setCollapsed(false)}
          >
            <Search className="h-3 w-3" />
          </button>
          <button
            className="transition-colors p-0.5"
            style={{ color: "hsl(var(--studio-text-dim))" }}
            title="Favorites"
            onClick={() => { setCollapsed(false); setShowFavorites(true); setShowRecents(false); }}
          >
            <Star className="h-3 w-3" />
          </button>
          <div className="w-3 border-t my-0.5" style={{ borderColor: "hsl(var(--border))" }} />
          {categories.map((cat) => (
            <button
              key={cat}
              className="transition-colors p-0.5"
              style={{ color: "hsl(var(--studio-text-dim))" }}
              title={CATEGORY_LABELS[cat]}
              onClick={() => {
                setCollapsed(false);
                setActiveCategory(cat);
                setShowFavorites(false);
                setShowRecents(false);
              }}
            >
              {CATEGORY_ICONS[cat]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ── Expanded state ── */
  return (
    <div
      className="shrink-0 flex flex-row select-none bg-card outline-none relative"
      style={{ width: `${panelWidth}px` }}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      {/* Main content column */}
      <div className="flex-1 flex flex-col min-w-0 border-r" style={{ borderColor: "hsl(var(--border))" }}>
      {/* Header */}
      <div className="flex items-center border-b shrink-0" style={{ borderColor: "hsl(var(--border))" }}>
        <div
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[9px] font-mono font-semibold uppercase tracking-wider border-b-2"
          style={{
            color: "hsl(var(--foreground))",
            borderColor: "hsl(var(--primary))",
          }}
        >
          <Search className="h-3 w-3" />
          Browser
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="transition-colors shrink-0 px-2"
          style={{ color: "hsl(var(--studio-text-dim))" }}
          title="Collapse browser"
        >
          <PanelLeftClose className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Search bar */}
      <div
        className="flex items-center gap-1 px-2 py-1.5 border-b shrink-0"
        style={{ borderColor: "hsl(var(--border))" }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-1.5 top-1/2 -translate-y-1/2 h-3 w-3" style={{ color: "hsl(var(--studio-text-dim))" }} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search sounds, plugins, presets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onMouseEnter={() => handleHover("search")}
            onMouseLeave={() => handleHover(null)}
            onKeyDown={(e) => {
              // Let ArrowDown/ArrowUp/Enter/Escape bubble to panel handler
              if (["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(e.key)) {
                // Don't prevent default here — let the panel handler deal with it
              }
            }}
            className="w-full h-[24px] pl-6 pr-2 text-[10px] font-mono rounded-[3px] outline-none transition-colors"
            style={{
              backgroundColor: "hsl(var(--studio-surface))",
              color: "hsl(var(--foreground) / 0.8)",
              border: "1px solid hsl(var(--studio-border))",
            }}
          />
        </div>
      </div>

      {/* Quick-access pills */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-1 border-b shrink-0" style={{ borderColor: "hsl(var(--border))" }}>
        <button
          className="flex items-center gap-1 px-1.5 py-[2px] rounded-[3px] text-[9px] font-mono transition-colors"
          style={{
            backgroundColor: showFavorites ? "hsl(var(--primary) / 0.15)" : "transparent",
            color: showFavorites ? "hsl(var(--primary))" : "hsl(var(--studio-text-muted))",
            border: `1px solid ${showFavorites ? "hsl(var(--primary) / 0.3)" : "hsl(var(--studio-border))"}`,
          }}
          onMouseEnter={() => handleHover("favorites")}
          onMouseLeave={() => handleHover(null)}
          onClick={() => {
            setShowFavorites(!showFavorites);
            setShowRecents(false);
          }}
        >
          <Star className="h-2.5 w-2.5" fill={showFavorites ? "currentColor" : "none"} />
          Favorites
        </button>
        <button
          className="flex items-center gap-1 px-1.5 py-[2px] rounded-[3px] text-[9px] font-mono transition-colors"
          style={{
            backgroundColor: showRecents ? "hsl(var(--primary) / 0.15)" : "transparent",
            color: showRecents ? "hsl(var(--primary))" : "hsl(var(--studio-text-muted))",
            border: `1px solid ${showRecents ? "hsl(var(--primary) / 0.3)" : "hsl(var(--studio-border))"}`,
          }}
          onMouseEnter={() => handleHover("recents")}
          onMouseLeave={() => handleHover(null)}
          onClick={() => {
            setShowRecents(!showRecents);
            setShowFavorites(false);
          }}
        >
          <Clock className="h-2.5 w-2.5" />
          Recent
        </button>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1 border-b shrink-0" style={{ borderColor: "hsl(var(--border))" }}>
        <button
          className="shrink-0 px-1.5 py-[2px] rounded-[3px] text-[8px] font-mono font-semibold uppercase tracking-wider transition-colors"
          style={{
            backgroundColor: !activeCategory ? "hsl(var(--primary) / 0.15)" : "transparent",
            color: !activeCategory ? "hsl(var(--primary))" : "hsl(var(--studio-text-muted))",
          }}
          onClick={() => setActiveCategory(null)}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className="shrink-0 px-1.5 py-[2px] rounded-[3px] text-[8px] font-mono font-semibold uppercase tracking-wider transition-colors"
            style={{
              backgroundColor: activeCategory === cat ? "hsl(var(--primary) / 0.15)" : "transparent",
              color: activeCategory === cat ? "hsl(var(--primary))" : "hsl(var(--studio-text-muted))",
            }}
            onMouseEnter={() => handleHover(`cat-${cat}`)}
            onMouseLeave={() => handleHover(null)}
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Subcategory chips (when a category is selected) */}
      {subcategories.length > 0 && (
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1 border-b shrink-0" style={{ borderColor: "hsl(var(--border))" }}>
          <button
            className="shrink-0 px-1.5 py-[1px] rounded-[3px] text-[8px] font-mono transition-colors"
            style={{
              backgroundColor: !activeSubcategory ? "hsl(var(--accent) / 0.2)" : "transparent",
              color: !activeSubcategory ? "hsl(var(--foreground) / 0.8)" : "hsl(var(--studio-text-dim))",
            }}
            onClick={() => setActiveSubcategory(null)}
          >
            All
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub}
              className="shrink-0 px-1.5 py-[1px] rounded-[3px] text-[8px] font-mono transition-colors"
              style={{
                backgroundColor: activeSubcategory === sub ? "hsl(var(--accent) / 0.2)" : "transparent",
                color: activeSubcategory === sub ? "hsl(var(--foreground) / 0.8)" : "hsl(var(--studio-text-dim))",
              }}
              onClick={() => setActiveSubcategory(activeSubcategory === sub ? null : sub)}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {/* Results list */}
      <div ref={listRef} className="flex-1 overflow-y-auto min-h-0">
        {filteredAssets.length > 0 ? (
          <div className="py-0.5">
            {filteredAssets.map((asset, idx) => (
              <AssetRow
                key={asset.id}
                asset={asset}
                isFavorite={favorites.has(asset.id)}
                isSelected={idx === selectedIndex}
                onActivate={handleActivate}
                onToggleFavorite={toggleFavorite}
                onFindSimilar={findSimilar}
                onHover={handleHover}
                rowRef={idx === selectedIndex ? selectedRowRef : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="px-3 py-8 text-center">
            <span className="text-[10px] font-mono" style={{ color: "hsl(var(--studio-text-dim))" }}>
              {searchQuery ? `No results for "${searchQuery}"` :
               showFavorites ? "No favorites yet — star items to save them" :
               showRecents ? "No recent items" :
               "No items match the current filter"}
            </span>
          </div>
        )}
      </div>

      {/* Info View */}
      <div
        className="px-2 py-2 border-t shrink-0 min-h-[56px] bg-muted/25"
        style={{ borderColor: "hsl(var(--border))" }}
      >
        {hoveredInfo ? (
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <Info className="h-2.5 w-2.5 shrink-0" style={{ color: "hsl(var(--studio-text-dim))" }} />
              <span className="text-[10px] font-mono font-semibold leading-none truncate" style={{ color: "hsl(var(--studio-text-muted))" }}>
                {hoveredInfo.title}
              </span>
            </div>
            <span className="text-[9px] font-mono leading-[1.4] line-clamp-4" style={{ color: "hsl(var(--studio-text-dim))" }}>
              {hoveredInfo.desc}
            </span>
          </div>
        ) : (
          <span className="text-[9px] font-mono leading-tight" style={{ color: "hsl(var(--studio-text-dim))" }}>
            Hover over an item for info
          </span>
        )}
      </div>
      </div>

      {/* Resize handle */}
      <div
        className="w-[5px] shrink-0 cursor-col-resize hover:bg-primary/20 active:bg-primary/30 transition-colors group flex items-center justify-center"
        onPointerDown={handleResizePointerDown}
        onPointerMove={handleResizePointerMove}
        onPointerUp={handleResizePointerUp}
        title="Drag to resize browser"
      >
        <div className="w-px h-8 bg-border group-hover:bg-primary/40 group-active:bg-primary/60 transition-colors rounded-full" />
      </div>
    </div>
  );
}
