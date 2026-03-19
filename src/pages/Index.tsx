import { useState, useMemo, useCallback } from "react";
import { Search, Package, Plus, Library, X, HardDrive, Cpu, ChevronRight, Loader2, Pencil, Trash2 } from "lucide-react";
import { getCategoryFallbackIcon } from "@/lib/categoryIcons";
import { InventoryItem } from "@/types/inventory";
import { useInventory } from "@/hooks/useInventory";
import { useItemMeta } from "@/hooks/useItemMeta";

import { InventoryFormDialog } from "@/components/InventoryFormDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { BulkImportDialog } from "@/components/BulkImportDialog";
import { ProductShell } from "@/components/app/ProductShell";
import { useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { ItemMeta } from "@/lib/itemMeta";

/* ── Glass wrapper ── */
function Glass({
  className = "",
  children,
  staggerIndex = 0,
  onClick,
}: {
  className?: string;
  children: React.ReactNode;
  staggerIndex?: number;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        animationDelay: `${staggerIndex * 40}ms`,
        animationFillMode: "backwards",
      }}
      className={`animate-fade-in backdrop-blur-xl bg-white/[0.06] border border-white/[0.08] rounded-2xl overflow-hidden
        transition-all duration-300 ${onClick ? "cursor-pointer hover:bg-white/[0.10] hover:border-white/[0.15] hover:shadow-[0_0_30px_hsl(var(--primary)/0.12)]" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

/* ── Ecosystem filter tabs ── */
type EcoFilter = "All" | "Hardware" | "Software";
const ECO_TABS: { label: string; value: EcoFilter; icon: React.ElementType }[] = [
  { label: "All", value: "All", icon: Package },
  { label: "Hardware", value: "Hardware", icon: HardDrive },
  { label: "Software", value: "Software", icon: Cpu },
];

/* ── Gear card ── */
function GearCard({
  item,
  index,
  isSelected,
  onSelect,
  meta,
}: {
  item: InventoryItem;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  meta?: ItemMeta;
}) {
  const imgSrc = item.imageUrl || getCategoryFallbackIcon(item.category, item.ecosystem);

  return (
    <button
      onClick={onSelect}
      style={{ animationDelay: `${(index + 3) * 40}ms`, animationFillMode: "backwards" }}
      className={`animate-fade-in text-left group w-full rounded-lg px-3 py-2 transition-all duration-200 border
        ${isSelected
          ? "bg-primary/10 border-primary/30 shadow-[0_0_20px_hsl(var(--primary)/0.15)]"
          : "bg-white/[0.04] border-white/[0.06] hover:bg-white/[0.08] hover:border-white/[0.12]"
        }`}
    >
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-md bg-white/[0.06] border border-white/[0.06] flex items-center justify-center shrink-0 overflow-hidden mt-0.5">
          <img
            src={imgSrc}
            alt={item.product}
            className="h-5 w-5 object-contain opacity-70 brightness-150 group-hover:opacity-100 transition-opacity"
          />
        </div>
        <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-3 gap-y-1">
          <p className="font-mono text-xs text-foreground font-medium truncate max-w-[10rem] shrink-0">{item.product}</p>
          <p className="font-mono text-[10px] text-muted-foreground truncate max-w-[8rem] shrink-0">{item.vendor}</p>
          {item.type && <p className="font-mono text-[10px] text-muted-foreground/60 truncate max-w-[6rem] shrink-0">{item.type}</p>}
          <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[9px] uppercase tracking-wider shrink-0">
            {item.category}
          </span>
          {item.soundCategory && (
            <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent font-mono text-[9px] uppercase tracking-wider shrink-0">
              {item.soundCategory}
            </span>
          )}
          <span className="px-1.5 py-0.5 rounded bg-white/[0.06] text-muted-foreground font-mono text-[9px] uppercase tracking-wider shrink-0">
            {item.ecosystem === "Hardware" ? "HW" : "SW"}
          </span>
          {meta?.rating ? (
            <span className="flex items-center gap-0.5 shrink-0">
              <Star className="h-3 w-3 fill-warning text-warning" />
              <span className="font-mono text-[10px] text-warning">{meta.rating}</span>
            </span>
          ) : null}
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0 group-hover:text-muted-foreground/60 transition-colors mt-1" />
      </div>
    </button>
  );
}

/* ── Detail panel ── */
function DetailPanel({
  item,
  onClose,
  onEdit,
  onDelete,
  meta,
  onSetRating,
  onAddTag,
  onRemoveTag,
}: {
  item: InventoryItem;
  onClose: () => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  meta?: ItemMeta;
  onSetRating: (id: string, rating: number) => void;
  onAddTag: (id: string, tag: string) => void;
  onRemoveTag: (id: string, tag: string) => void;
}) {
  const imgSrc = item.imageUrl || getCategoryFallbackIcon(item.category, item.ecosystem);
  const [tagInput, setTagInput] = useState("");

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (t) {
      onAddTag(item.id, t);
      setTagInput("");
    }
  };

  return (
    <div className="animate-fade-in h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Item Detail</p>
        <div className="flex items-center gap-1">
          <button onClick={() => onEdit(item)} className="h-7 w-7 rounded-lg bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.12] transition-colors" title="Edit">
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button onClick={() => onDelete(item)} className="h-7 w-7 rounded-lg bg-white/[0.06] flex items-center justify-center hover:bg-destructive/20 transition-colors" title="Delete">
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button onClick={onClose} className="h-7 w-7 rounded-lg bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.12] transition-colors">
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Hero */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="h-24 w-24 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center
            shadow-[0_0_24px_hsl(var(--primary)/0.12)]">
            <img src={imgSrc} alt={item.product} className="h-16 w-16 object-contain opacity-80 brightness-150" />
          </div>
          <div>
            <p className="font-mono text-sm text-foreground font-semibold">{item.product}</p>
            <p className="font-mono text-[11px] text-muted-foreground">{item.vendor}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-[9px] uppercase tracking-wider">
              {item.category}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-muted-foreground font-mono text-[9px] uppercase tracking-wider">
              {item.ecosystem}
            </span>
            {item.soundCategory && (
              <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-mono text-[9px] uppercase tracking-wider">
                {item.soundCategory}
              </span>
            )}
          </div>
        </div>

        {/* Star rating */}
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => onSetRating(item.id, star)} className="p-0.5">
              <Star className={`h-4 w-4 transition-colors ${(meta?.rating || 0) >= star ? "fill-warning text-warning" : "text-muted-foreground/30 hover:text-warning/50"}`} />
            </button>
          ))}
        </div>

        {/* Tags */}
        <div>
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Tags</p>
          <div className="flex flex-wrap gap-1 mb-2">
            {meta?.tags?.map((tag) => (
              <span key={tag} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-[9px] flex items-center gap-1 border border-primary/20">
                {tag}
                <button onClick={() => onRemoveTag(item.id, tag)} className="hover:text-destructive"><X className="h-2.5 w-2.5" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-1">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              placeholder="Add tag…"
              className="flex-1 px-2 py-1 rounded bg-white/[0.06] border border-white/[0.06] font-mono text-[10px] text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/30"
            />
            <button onClick={handleAddTag} className="px-2 py-1 rounded bg-primary/10 text-primary font-mono text-[9px] hover:bg-primary/20 transition-colors">+</button>
          </div>
        </div>

        {/* Description */}
        {item.description && (
          <div>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Description</p>
            <p className="font-mono text-[11px] text-muted-foreground/80 leading-relaxed">{item.description}</p>
          </div>
        )}

        {/* Details grid */}
        <div>
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Details</p>
          <div className="grid grid-cols-2 gap-2">
            {item.type && <MetaCell label="Type" value={item.type} />}
            {item.synthesis && <MetaCell label="Synthesis" value={item.synthesis} />}
            {item.sonicRole && <MetaCell label="Sonic Role" value={item.sonicRole} />}
            {item.yearReleased && <MetaCell label="Year" value={String(item.yearReleased)} />}
            {item.msrp && <MetaCell label="MSRP" value={item.msrp} />}
            {item.location && <MetaCell label="Location" value={item.location} />}
            {item.quantity && <MetaCell label="Qty" value={String(item.quantity)} />}
            {item.serialNumber && <MetaCell label="Serial" value={item.serialNumber} />}
            {item.purchaseYear && <MetaCell label="Purchased" value={String(item.purchaseYear)} />}
            {item.purchasePrice && <MetaCell label="Price" value={`$${item.purchasePrice}`} />}
          </div>
        </div>

        {/* Specs */}
        {item.specs?.custom && item.specs.custom.length > 0 && (
          <div>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Specs</p>
            <div className="space-y-1.5">
              {item.specs.custom.map((s) => (
                <div key={s.label} className="flex justify-between items-baseline py-1 border-b border-white/[0.04]">
                  <span className="font-mono text-[10px] text-muted-foreground">{s.label}</span>
                  <span className="font-mono text-[10px] text-foreground text-right max-w-[60%]">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Use Cases */}
        {item.useCases && (
          <div>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Use Cases</p>
            <p className="font-mono text-[11px] text-muted-foreground/80 leading-relaxed">{item.useCases}</p>
          </div>
        )}

        {/* Notes */}
        {item.notes && (
          <div>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Notes</p>
            <p className="font-mono text-[11px] text-muted-foreground/80 leading-relaxed">{item.notes}</p>
          </div>
        )}

        {/* URL */}
        {item.url && (
          <div>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] text-primary hover:underline">
              Product page →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.04]">
      <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="font-mono text-[11px] text-foreground truncate mt-0.5">{value}</p>
    </div>
  );
}

/* ── Category row in sidebar ── */
function CategoryRow({
  category,
  count,
  isSelected,
  onSelect,
  soundChips,
  selectedSoundCategory,
  onSoundSelect,
}: {
  category: string;
  count: number;
  isSelected: boolean;
  onSelect: () => void;
  soundChips?: { name: string; count: number }[];
  selectedSoundCategory?: string;
  onSoundSelect?: (sc: string) => void;
}) {
  const icon = getCategoryFallbackIcon(category);
  const hasChips = isSelected && soundChips && soundChips.length > 0;

  return (
    <div>
      <button
        onClick={onSelect}
        className={`w-full flex items-center gap-2.5 py-1.5 px-2 rounded-lg transition-all duration-200 text-left
          ${isSelected
            ? "bg-primary/10 text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
          }`}
      >
        <div className="h-6 w-6 rounded bg-white/[0.06] flex items-center justify-center shrink-0 overflow-hidden">
          <img src={icon} alt={category} className="h-4 w-4 object-contain opacity-60 brightness-150" />
        </div>
        <span className="font-mono text-[11px] flex-1 truncate">{category}</span>
        <span className="font-mono text-[10px] text-muted-foreground/60 tabular-nums">{count}</span>
      </button>

      {/* Inline sound sub-filter chips */}
      <div
        className={`overflow-hidden transition-all duration-200 ${
          hasChips ? "max-h-40 opacity-100 mt-1 mb-1" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-wrap gap-1 ml-8 mr-1">
          {soundChips?.map((sc) => (
            <button
              key={sc.name}
              onClick={() => onSoundSelect?.(selectedSoundCategory === sc.name ? "All" : sc.name)}
              className={`px-2 py-0.5 rounded-full font-mono text-[9px] transition-all duration-150
                ${selectedSoundCategory === sc.name
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "bg-white/[0.04] text-muted-foreground border border-white/[0.04] hover:bg-white/[0.08] hover:text-foreground"
                }`}
            >
              {sc.name} <span className="opacity-60">({sc.count})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main ── */
const Index = () => {
  const { items: inventoryItems, isLoading, addItem, updateItem, deleteItem } = useInventory();
  const queryClient = useQueryClient();
  const { itemMeta, setRating, addTag, removeTag } = useItemMeta();

  // Filters
  const [selectedEco, setSelectedEco] = useState<EcoFilter>("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSoundCategory, setSelectedSoundCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Selection & dialogs
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);

  // ── Handlers ──
  const handleAdd = () => { setEditingItem(null); setFormOpen(true); };
  const handleEdit = (item: InventoryItem) => { setEditingItem(item); setFormOpen(true); };
  const handleDelete = (item: InventoryItem) => { setDeletingItem(item); setDeleteOpen(true); };

  const handleFormSave = (item: InventoryItem) => {
    const mutation = editingItem ? updateItem : addItem;
    mutation.mutate(item, {
      onSuccess: () => { setFormOpen(false); setSelectedItem(item); },
    });
  };

  const handleDeleteConfirm = () => {
    if (!deletingItem) return;
    deleteItem.mutate(deletingItem.id, {
      onSuccess: () => {
        setDeleteOpen(false);
        if (selectedItem?.id === deletingItem.id) setSelectedItem(null);
        setDeletingItem(null);
      },
    });
  };

  const handleBulkImport = useCallback(
    async (items: InventoryItem[]) => {
      let success = 0;
      for (const item of items) {
        try {
          await new Promise<void>((resolve, reject) => {
            addItem.mutate(item, { onSuccess: () => { success++; resolve(); }, onError: reject });
          });
        } catch {
          // Keep importing remaining items even if one entry fails.
        }
      }
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    [addItem, queryClient],
  );

  // ── Derived data ──

  // Filtered by ecosystem
  const ecoFiltered = useMemo(() => {
    if (selectedEco === "All") return inventoryItems;
    if (selectedEco === "Hardware") return inventoryItems.filter((i) => i.ecosystem === "Hardware");
    return inventoryItems.filter((i) => i.ecosystem !== "Hardware");
  }, [selectedEco, inventoryItems]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    ecoFiltered.forEach((i) => map.set(i.category, (map.get(i.category) || 0) + 1));
    return map;
  }, [ecoFiltered]);

  const categories = useMemo(() => {
    const order = ["Synth", "Keyboard", "Drums", "Guitar", "FX", "Library", "Controller"];
    const cats = Array.from(categoryCounts.keys());
    const sorted = [
      ...order.filter((c) => cats.includes(c)),
      ...cats.filter((c) => !order.includes(c) && c !== "Other").sort(),
      ...(cats.includes("Other") ? ["Other"] : []),
    ];
    return sorted;
  }, [categoryCounts]);

  // Sound category counts (from eco+category filtered)
  const categoryFiltered = useMemo(() => {
    if (selectedCategory === "All") return ecoFiltered;
    return ecoFiltered.filter((i) => i.category === selectedCategory);
  }, [ecoFiltered, selectedCategory]);

  // Per-category sound chips (for inline display)
  const soundChipsForCategory = useMemo(() => {
    const map = new Map<string, { name: string; count: number }[]>();
    ecoFiltered.forEach((i) => {
      if (!i.soundCategory) return;
      const chips = map.get(i.category) || [];
      const existing = chips.find((c) => c.name === i.soundCategory);
      if (existing) existing.count++;
      else chips.push({ name: i.soundCategory, count: 1 });
      map.set(i.category, chips);
    });
    map.forEach((chips) => chips.sort((a, b) => a.name.localeCompare(b.name)));
    return map;
  }, [ecoFiltered]);

  // Final filtered items
  const filteredItems = useMemo(() => {
    let items = categoryFiltered;
    if (selectedSoundCategory !== "All") {
      items = items.filter((i) => i.soundCategory === selectedSoundCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((i) => {
        const meta = itemMeta[i.id];
        return [i.product, i.vendor, i.category, i.type, i.sonicRole, i.keywords, i.description, i.useCases, i.notes, ...(meta?.tags ?? [])]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(q);
      });
    }
    return items;
  }, [categoryFiltered, selectedSoundCategory, searchQuery, itemMeta]);

  const ecoCounts = useMemo(() => ({
    All: inventoryItems.length,
    Hardware: inventoryItems.filter((i) => i.ecosystem === "Hardware").length,
    Software: inventoryItems.filter((i) => i.ecosystem !== "Hardware").length,
  }), [inventoryItems]);

  // ── Render ──

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="font-mono text-xs text-muted-foreground">Loading inventory…</p>
        </div>
      </div>
    );
  }

  return (
    <ProductShell
      section="Flight Case"
      title="Gear inventory"
      description="Keep the inventory operational and close to Studio, Bridge, and the rest of the workspace."
      contentClassName="px-0 py-0 md:px-0 md:py-0"
    >
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Header ── */}
      <Glass className="mx-4 mt-4 mb-3 !rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3" staggerIndex={0}>
        <div className="flex items-center gap-3">
          <Package className="h-4 w-4 text-primary" />
          <span className="font-mono text-xs font-semibold text-foreground tracking-tight">FLIGHT CASE</span>
          <span className="font-mono text-[10px] text-muted-foreground">{filteredItems.length} / {inventoryItems.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search gear…"
              className="pl-8 pr-3 py-1.5 w-48 sm:w-64 rounded-lg bg-white/[0.06] border border-white/[0.06] font-mono text-[11px] text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-primary/30 focus:bg-white/[0.08] transition-all"
            />
          </div>
          <button
            onClick={() => setBulkImportOpen(true)}
            className="h-8 px-3 rounded-lg bg-white/[0.06] border border-white/[0.06] font-mono text-[10px] text-muted-foreground hover:text-foreground hover:bg-white/[0.10] transition-all flex items-center gap-1.5"
          >
            <Library className="h-3 w-3" /> <span className="hidden sm:inline">Import</span>
          </button>
          <button
            onClick={handleAdd}
            className="h-8 px-3 rounded-lg bg-primary/20 border border-primary/30 font-mono text-[10px] text-primary hover:bg-primary/30 transition-all flex items-center gap-1.5"
          >
            <Plus className="h-3 w-3" /> <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </Glass>

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden px-4 pb-4 gap-3">
        {/* Sidebar */}
        <Glass className="w-52 shrink-0 flex-col !rounded-xl hidden md:flex" staggerIndex={1}>
          {/* Eco tabs */}
          <div className="p-3 border-b border-white/[0.06]">
            <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest mb-2">Ecosystem</p>
            <div className="space-y-0.5">
              {ECO_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => { setSelectedEco(tab.value); setSelectedCategory("All"); setSelectedSoundCategory("All"); }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-mono text-[11px] transition-all duration-200
                    ${selectedEco === tab.value
                      ? "bg-primary/15 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                    }`}
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  <span className="flex-1 text-left">{tab.label}</span>
                  <span className="text-[10px] opacity-60 tabular-nums">{ecoCounts[tab.value]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div className="flex-1 overflow-y-auto p-3">
            <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest mb-2">Categories</p>
            <button
              onClick={() => { setSelectedCategory("All"); setSelectedSoundCategory("All"); }}
              className={`w-full text-left px-2 py-1.5 rounded-lg font-mono text-[11px] mb-0.5 transition-all
                ${selectedCategory === "All"
                  ? "bg-primary/10 text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                }`}
            >
              All <span className="opacity-60 ml-1">{ecoFiltered.length}</span>
            </button>
            {categories.map((cat) => (
              <CategoryRow
                key={cat}
                category={cat}
                count={categoryCounts.get(cat) || 0}
                isSelected={selectedCategory === cat}
                onSelect={() => { setSelectedCategory(cat); setSelectedSoundCategory("All"); }}
                soundChips={soundChipsForCategory.get(cat)}
                selectedSoundCategory={selectedSoundCategory}
                onSoundSelect={setSelectedSoundCategory}
              />
            ))}
          </div>

          {/* Stats */}
          <div className="p-3 border-t border-white/[0.06]">
            <div className="flex justify-between font-mono text-[10px] text-muted-foreground/60">
              <span>{ecoCounts.Hardware} hw</span>
              <span>{ecoCounts.Software} sw</span>
              <span>{inventoryItems.length} total</span>
            </div>
          </div>
        </Glass>

        {/* Gear list */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredItems.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center">
                  <span className="font-mono text-2xl opacity-30">∅</span>
                </div>
                <p className="font-mono text-xs text-muted-foreground/50">No items match your filters</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {filteredItems.map((item, i) => (
                <GearCard
                  key={item.id}
                  item={item}
                  index={i}
                  isSelected={selectedItem?.id === item.id}
                  onSelect={() => setSelectedItem(item)}
                  meta={itemMeta[item.id]}
                />
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        {selectedItem && (
          <Glass className="w-80 shrink-0 !rounded-xl hidden md:block" staggerIndex={0}>
            <DetailPanel
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
              onEdit={handleEdit}
              onDelete={handleDelete}
              meta={itemMeta[selectedItem.id]}
              onSetRating={setRating}
              onAddTag={addTag}
              onRemoveTag={removeTag}
            />
          </Glass>
        )}
      </div>

      {/* Dialogs */}
      <InventoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        item={editingItem}
        onSave={handleFormSave}
        isSaving={addItem.isPending || updateItem.isPending}
      />
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        itemName={deletingItem?.product || ""}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteItem.isPending}
      />
      <BulkImportDialog
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
        onImport={handleBulkImport}
        existingProducts={inventoryItems.map((i) => i.product)}
      />
    </div>
    </ProductShell>
  );
};

export default Index;
