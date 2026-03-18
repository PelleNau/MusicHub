import { useState, useCallback, useEffect } from "react";

type Theme = "dark" | "light" | "ocean";

const STORAGE_KEY = "app-theme";

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "ocean") return stored;
  } catch {}
  return "dark";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "light", "dawn-lagoon");
  if (theme === "ocean") {
    root.classList.add("dark", "dawn-lagoon");
  } else {
    root.classList.add(theme);
  }
}

export function useThemeToggle() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : prev === "light" ? "ocean" : "dark";
      try { localStorage.setItem(STORAGE_KEY, next); } catch {}
      return next;
    });
  }, []);

  return { theme, toggleTheme } as const;
}
