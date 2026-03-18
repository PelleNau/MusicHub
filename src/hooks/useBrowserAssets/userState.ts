import { useState, useCallback } from "react";

const FAVORITES_KEY = "studio-browser-favorites";
const RECENTS_KEY = "studio-browser-recents";
const MAX_RECENTS = 20;

function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveFavorites(favs: Set<string>) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favs]));
}

function loadRecents(): string[] {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecents(recents: string[]) {
  localStorage.setItem(RECENTS_KEY, JSON.stringify(recents));
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(loadFavorites);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveFavorites(next);
      return next;
    });
  }, []);

  return { favorites, toggleFavorite };
}

export function useRecents() {
  const [recents, setRecents] = useState<string[]>(loadRecents);

  const addRecent = useCallback((id: string) => {
    setRecents(prev => {
      const next = [id, ...prev.filter(r => r !== id)].slice(0, MAX_RECENTS);
      saveRecents(next);
      return next;
    });
  }, []);

  return { recents, addRecent };
}
