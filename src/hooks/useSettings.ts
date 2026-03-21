import { useState, useCallback, useEffect } from "react";
import {
  APP_SETTINGS_STORAGE_KEY,
  UI_ZOOM_CHANGED_EVENT,
  applyUiZoom,
  normalizeUiZoom,
} from "@/lib/interfaceScale";

export type Theme = "dark" | "light" | "ocean";

export type BlendMode = "luminosity" | "multiply" | "overlay" | "soft-light" | "screen" | "normal";

export interface AppSettings {
  theme: Theme;
  uiZoom: number;    // 75–150
  fontSize: number;  // 12–20
  textureOpacity: number;  // 0–100
  cardBgAlpha: number;     // 0–50
  blendMode: BlendMode;    // default "luminosity"
  studioModePreference: "auto" | "guided" | "standard" | "focused";
}

const STORAGE_KEY = APP_SETTINGS_STORAGE_KEY;
const LEGACY_THEME_KEY = "app-theme";

const DEFAULTS: AppSettings = {
  theme: "dark",
  uiZoom: 100,
  fontSize: 14,
  textureOpacity: 35,
  cardBgAlpha: 6,
  blendMode: "luminosity",
  studioModePreference: "auto",
};

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppSettings>;
      return {
        ...DEFAULTS,
        ...parsed,
        uiZoom: normalizeUiZoom(parsed.uiZoom),
      };
    }
    // Migrate legacy theme key
    const legacyTheme = localStorage.getItem(LEGACY_THEME_KEY);
    if (legacyTheme === "light" || legacyTheme === "dark") {
      return { ...DEFAULTS, theme: legacyTheme };
    }
  } catch {
    // Fall back to defaults when local storage is unavailable or invalid.
  }
  return { ...DEFAULTS };
}

function persistSettings(settings: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    // Keep legacy key in sync for the IIFE in App.tsx
    localStorage.setItem(LEGACY_THEME_KEY, settings.theme);
  } catch {
    // Ignore storage write failures; settings still apply for the current session.
  }
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("dark", "light", "dawn-lagoon");
  if (theme === "ocean") {
    // Ocean uses dark as base + dawn-lagoon for CSS variable overrides
    root.classList.add("dark", "dawn-lagoon");
  } else {
    root.classList.add(theme);
  }
}

function applyFontSize(size: number) {
  if (typeof document === "undefined" || !document.body) return;
  document.body.style.setProperty("--app-font-size", `${size}px`);
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  // Apply all side effects on mount and when settings change
  useEffect(() => {
    applyTheme(settings.theme);
    applyUiZoom(settings.uiZoom);
    applyFontSize(settings.fontSize);
    persistSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleZoomChange = (event: Event) => {
      const zoom = normalizeUiZoom((event as CustomEvent<number>).detail);
      setSettings((prev) => (prev.uiZoom === zoom ? prev : { ...prev, uiZoom: zoom }));
    };

    window.addEventListener(UI_ZOOM_CHANGED_EVENT, handleZoomChange as EventListener);
    return () => {
      window.removeEventListener(UI_ZOOM_CHANGED_EVENT, handleZoomChange as EventListener);
    };
  }, []);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  }, []);

  return { settings, updateSetting } as const;
}

// Static initializer — call after the DOM exists to avoid startup failures in WebView shells.
export function applyInitialSettings() {
  const s = loadSettings();
  applyTheme(s.theme);
  applyUiZoom(s.uiZoom);
  applyFontSize(s.fontSize);
}
