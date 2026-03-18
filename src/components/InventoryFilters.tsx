import { useRef, useEffect, useState } from "react";

interface InventoryFiltersProps {
  categories: string[];
  soundCategories: string[];
  selectedCategory: string;
  selectedSoundCategory: string;
  onCategoryChange: (cat: string) => void;
  onSoundCategoryChange: (cat: string) => void;
}

/** Animated sliding indicator for filter pills */
function FilterRow({
  items,
  selected,
  onSelect,
  label,
  accentClass,
}: {
  items: string[];
  selected: string;
  onSelect: (val: string) => void;
  label: string;
  accentClass: { active: string; indicator: string };
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const activeBtn = containerRef.current.querySelector(`[data-filter-value="${selected}"]`) as HTMLElement | null;
    if (activeBtn) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const btnRect = activeBtn.getBoundingClientRect();
      setIndicator({
        left: btnRect.left - containerRect.left,
        width: btnRect.width,
        opacity: 1,
      });
    }
  }, [selected, items]);

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mr-2 flex-shrink-0">
        {label}
      </span>
      <div ref={containerRef} className="relative flex items-center gap-0.5">
        {/* Sliding indicator */}
        <div
          className={`absolute top-0 h-full rounded-md transition-all duration-300 ease-out ${accentClass.indicator}`}
          style={{
            left: indicator.left,
            width: indicator.width,
            opacity: indicator.opacity,
          }}
        />
        {items.map((cat) => (
          <button
            key={cat}
            data-filter-value={cat}
            onClick={() => onSelect(cat)}
            className={`relative z-10 px-2.5 py-1 rounded-md font-mono text-[11px] transition-colors whitespace-nowrap ${
              selected === cat
                ? accentClass.active
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}

export function InventoryFilters({
  categories,
  soundCategories,
  selectedCategory,
  selectedSoundCategory,
  onCategoryChange,
  onSoundCategoryChange,
}: InventoryFiltersProps) {
  return (
    <div className="flex flex-col gap-2 border-b px-6 py-2.5">
      <FilterRow
        items={categories}
        selected={selectedCategory}
        onSelect={onCategoryChange}
        label="Type"
        accentClass={{
          active: "text-accent font-medium",
          indicator: "bg-accent/15 border border-accent/25",
        }}
      />
      <FilterRow
        items={soundCategories}
        selected={selectedSoundCategory}
        onSelect={onSoundCategoryChange}
        label="Sound"
        accentClass={{
          active: "text-primary font-medium",
          indicator: "bg-primary/10 border border-primary/25",
        }}
      />
    </div>
  );
}
