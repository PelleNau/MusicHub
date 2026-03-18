import { useState, useCallback } from "react";
import { ItemMeta } from "@/lib/itemMeta";

const STORAGE_KEY = "flightcase-meta";

function loadMeta(): Record<string, ItemMeta> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

/**
 * Manages per-item metadata (ratings + tags) stored in localStorage.
 */
export function useItemMeta() {
  const [itemMeta, setItemMeta] = useState<Record<string, ItemMeta>>(loadMeta);

  const saveMeta = useCallback((newMeta: Record<string, ItemMeta>) => {
    setItemMeta(newMeta);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newMeta));
  }, []);

  const setRating = useCallback(
    (id: string, rating: number) => {
      saveMeta({
        ...itemMeta,
        [id]: { ...itemMeta[id], rating, tags: itemMeta[id]?.tags || [] },
      });
    },
    [itemMeta, saveMeta],
  );

  const addTag = useCallback(
    (id: string, tag: string) => {
      const current = itemMeta[id] || { rating: 0, tags: [] };
      if (current.tags.includes(tag)) return;
      saveMeta({ ...itemMeta, [id]: { ...current, tags: [...current.tags, tag] } });
    },
    [itemMeta, saveMeta],
  );

  const removeTag = useCallback(
    (id: string, tag: string) => {
      const current = itemMeta[id] || { rating: 0, tags: [] };
      saveMeta({ ...itemMeta, [id]: { ...current, tags: current.tags.filter((t) => t !== tag) } });
    },
    [itemMeta, saveMeta],
  );

  return { itemMeta, setRating, addTag, removeTag } as const;
}
