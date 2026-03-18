import { useState, useMemo } from "react";
import { InventoryItem } from "@/types/inventory";
import { ECOSYSTEM_COLORS } from "./types";
import { Search, GripVertical, ChevronRight } from "lucide-react";

function classifyItem(item: InventoryItem): string {
  const cat = (item.category || "").toLowerCase();
  const type = (item.type || "").toLowerCase();
  const eco = (item.ecosystem || "").toLowerCase();

  // Expansions & Packs first (very specific)
  if (type.includes("expansion") || type.includes("pack") || type === "sample library")
    return "Packs & Expansions";

  // Drums / Percussion
  if (cat.includes("drum") || cat.includes("percussion")
    || type.includes("drum") || type.includes("percussion"))
    return "Drums & Percussion";

  // Keys & Piano
  if (type.includes("piano") || type.includes("organ")
    || type.includes("keys") || cat === "keyboard"
    || type.includes("stage piano") || type.includes("electric piano"))
    return "Keys & Piano";

  // Vocal & Choir
  if (type.includes("vocal") || type.includes("choir")
    || cat.includes("vocal") || cat.includes("choir"))
    return "Vocal & Choir";

  // Strings & Guitar
  if (cat === "guitar" || type.includes("guitar")
    || type.includes("string") || type.includes("phrase string"))
    return "Strings & Guitar";

  // Brass & Winds
  if (type.includes("brass") || type.includes("wind")
    || type.includes("woodwind"))
    return "Brass & Winds";

  // World & Cinematic
  if (type.includes("world") || type.includes("cinematic")
    || type.includes("experimental") || type.includes("creative instrument"))
    return "World & Cinematic";

  // Effects (both hardware FX and software effects)
  if (cat === "effect" || cat === "fx"
    || type.includes("effect") || type.includes("compressor")
    || type.includes("reverb") || type.includes("delay")
    || type.includes("distortion") || type.includes("eq")
    || type.includes("limiter") || type.includes("modulation")
    || type.includes("filter") || type.includes("dynamics")
    || type.includes("saturation") || type.includes("channel strip")
    || type.includes("mastering") || type.includes("bitcrusher")
    || type.includes("lo-fi") || type.includes("pitch correction")
    || type.includes("fx"))
    return "Effects";

  // Synths (catch-all for instruments / synths)
  if (cat === "synth" || cat === "synthesizer" || cat === "instrument"
    || type.includes("synth") || type.includes("sampler")
    || type.includes("groovebox") || type.includes("instrument")
    || type.includes("granular") || type.includes("wavetable")
    || type.includes("bass") || type.includes("mallet")
    || type.includes("kontakt") || type.includes("pattern")
    || type.includes("performance") || type.includes("play series"))
    return "Synths";

  // Controllers & I/O
  if (cat === "controller" || type.includes("controller")
    || type.includes("mixer") || type.includes("interface")
    || type.includes("monitor") || type.includes("dj"))
    return "Controllers & I/O";

  // Rack (Ableton racks are utility)
  if (type === "rack") return "Effects";

  return "Other";
}

const CATEGORY_ORDER = [
  "Synths",
  "Drums & Percussion",
  "Keys & Piano",
  "Strings & Guitar",
  "Brass & Winds",
  "Vocal & Choir",
  "World & Cinematic",
  "Effects",
  "Packs & Expansions",
  "Controllers & I/O",
  "Other",
];

interface GearPaletteProps {
  items: InventoryItem[];
}

export function GearPalette({ items }: GearPaletteProps) {
  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(["Synths"]));

  const grouped = useMemo(() => {
    const map: Record<string, InventoryItem[]> = {};
    items.forEach(item => {
      const role = classifyItem(item);
      if (!map[role]) map[role] = [];
      map[role].push(item);
    });
    Object.values(map).forEach(list =>
      list.sort((a, b) => `${a.vendor} ${a.product}`.localeCompare(`${b.vendor} ${b.product}`))
    );
    return map;
  }, [items]);

  const filtered = useMemo(() => {
    if (!search.trim()) return grouped;
    const q = search.toLowerCase();
    const result: Record<string, InventoryItem[]> = {};
    Object.entries(grouped).forEach(([role, list]) => {
      const matches = list.filter(i =>
        `${i.vendor} ${i.product} ${i.type} ${i.category} ${i.ecosystem}`.toLowerCase().includes(q)
      );
      if (matches.length) result[role] = matches;
    });
    return result;
  }, [grouped, search]);

  const toggleCat = (cat: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col bg-card border-r border-border w-56 shrink-0">
      <div className="p-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search gear…"
            className="w-full h-8 pl-7 pr-2 rounded-md bg-secondary border border-border text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {CATEGORY_ORDER.filter(c => filtered[c]).map(cat => {
          const isOpen = expandedCats.has(cat) || !!search.trim();
          return (
            <div key={cat}>
              <button
                onClick={() => toggleCat(cat)}
                className="w-full flex items-center gap-1.5 px-3 py-2 text-left hover:bg-secondary/50 transition-colors"
              >
                <ChevronRight className={`h-3 w-3 text-muted-foreground shrink-0 transition-transform duration-150 ${isOpen ? "rotate-90" : ""}`} />
                <span className="font-mono text-[11px] font-semibold text-foreground flex-1 truncate">
                  {cat}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                  {filtered[cat].length}
                </span>
              </button>

              {isOpen && (
                <div className="pb-1">
                  {filtered[cat].map(item => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={e => {
                        e.dataTransfer.setData("inventoryId", item.id);
                        e.dataTransfer.effectAllowed = "copy";
                      }}
                      className="flex items-center gap-1.5 px-2 py-1.5 mx-1 rounded cursor-grab active:cursor-grabbing hover:bg-secondary/80 transition-colors group"
                    >
                      <GripVertical className="h-3 w-3 text-muted-foreground/30 group-hover:text-muted-foreground shrink-0" />
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: ECOSYSTEM_COLORS[item.ecosystem] || "gray" }}
                        title={item.ecosystem}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-[11px] text-foreground truncate">
                          {item.product}
                        </div>
                        <div className="font-mono text-[9px] text-muted-foreground truncate">
                          {item.vendor}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
