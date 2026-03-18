import { InventoryItem } from "@/types/inventory";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Star } from "lucide-react";
import { ItemMeta, ECOSYSTEM_BADGE_COLORS } from "@/lib/itemMeta";
import { getCategoryFallbackIcon } from "@/lib/categoryIcons";

interface InventoryListProps {
  items: InventoryItem[];
  selectedItem: InventoryItem | null;
  onSelect: (item: InventoryItem) => void;
  itemMeta: Record<string, ItemMeta>;
}

const ecosystemColors = ECOSYSTEM_BADGE_COLORS;

/** Left-edge color bar mapped to ecosystem */
const ECOSYSTEM_EDGE_COLORS: Record<string, string> = {
  Hardware: "bg-primary",
  Ableton: "bg-blue-500",
  Kontakt: "bg-amber-500",
  Reaktor: "bg-fuchsia-500",
  NI: "bg-orange-500",
  Reason: "bg-red-500",
};

function Thumbnail({ category, ecosystem }: { category: string; ecosystem?: string }) {
  const fallback = getCategoryFallbackIcon(category, ecosystem);
  return (
    <div className="w-12 h-12 flex items-center justify-center flex-shrink-0 overflow-hidden rounded-lg bg-secondary/60">
      <img src={fallback} alt={category} className="w-12 h-12 object-cover opacity-80 brightness-150" />
    </div>
  );
}

export function InventoryList({ items, selectedItem, onSelect, itemMeta }: InventoryListProps) {
  return (
    <ScrollArea className="flex-1">
      <div className="flex flex-col gap-px bg-border/10 p-1">
        {items.map((item) => {
          const meta = itemMeta[item.id];
          const isSelected = selectedItem?.id === item.id;
          const edgeColor = ECOSYSTEM_EDGE_COLORS[item.ecosystem] || "bg-muted-foreground";

          return (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className={`group relative flex items-start gap-3 px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                isSelected
                  ? "bg-secondary shadow-lg shadow-primary/5 scale-[1.01]"
                  : "hover:bg-secondary/50 hover:-translate-y-px hover:shadow-md hover:shadow-black/20"
              }`}
            >
              {/* Ecosystem color edge bar */}
              <div className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full ${edgeColor} ${
                isSelected ? "opacity-100" : "opacity-40 group-hover:opacity-70"
              } transition-opacity`} />

              <Thumbnail category={item.category} ecosystem={item.ecosystem} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-0.5">
                  <span className="font-mono text-sm font-medium text-foreground break-words leading-tight">
                    {item.product}
                  </span>
                  {meta?.rating ? (
                    <div className="flex items-center gap-0.5 flex-shrink-0 mt-0.5">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      <span className="font-mono text-[10px] text-warning">{meta.rating}</span>
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">
                    {item.vendor}
                  </span>
                  <span className="text-muted-foreground/50">·</span>
                  <span className="text-xs text-muted-foreground">
                    {item.type}
                  </span>
                  {item.sonicRole && (
                    <>
                      <span className="text-muted-foreground/50">·</span>
                      <span className="text-xs text-muted-foreground italic">
                        {item.sonicRole}
                      </span>
                    </>
                  )}
                </div>
                {meta?.tags && meta.tags.length > 0 && (
                  <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                    {meta.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-[9px] border border-primary/20">
                        {tag}
                      </span>
                    ))}
                    {meta.tags.length > 3 && (
                      <span className="font-mono text-[9px] text-muted-foreground">+{meta.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span
                  className={`px-1.5 py-0.5 rounded font-mono text-[10px] font-medium ${
                    ecosystemColors[item.ecosystem] || "bg-secondary text-muted-foreground"
                  }`}
                >
                  {item.ecosystem === "Hardware" ? "HW" : item.ecosystem}
                </span>
                {item.soundCategory && item.soundCategory !== "Pack" && (
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {item.soundCategory}
                  </span>
                )}
              </div>
            </button>
          );
        })}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center">
              <span className="font-mono text-2xl opacity-30">∅</span>
            </div>
            <p className="font-mono text-sm">No items found</p>
            <p className="font-mono text-[10px] text-muted-foreground/70">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
