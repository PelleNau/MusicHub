export const APP_SETTINGS_STORAGE_KEY = "app-settings";
export const UI_ZOOM_CHANGED_EVENT = "app:ui-zoom-changed";
export const UI_ZOOM_DEFAULT = 100;
export const UI_ZOOM_MIN = 75;
export const UI_ZOOM_MAX = 150;
export const UI_ZOOM_STEP = 10;

type StoredSettings = {
  uiZoom?: number;
  [key: string]: unknown;
};

function clampUiZoom(value: number) {
  return Math.min(UI_ZOOM_MAX, Math.max(UI_ZOOM_MIN, Math.round(value)));
}

function readStoredSettings(): StoredSettings {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(APP_SETTINGS_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as StoredSettings) : {};
  } catch {
    return {};
  }
}

function writeStoredSettings(settings: StoredSettings) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage failures and keep the in-memory scale applied.
  }
}

export function normalizeUiZoom(value: number | null | undefined) {
  return clampUiZoom(typeof value === "number" && Number.isFinite(value) ? value : UI_ZOOM_DEFAULT);
}

export function getStoredUiZoom() {
  return normalizeUiZoom(readStoredSettings().uiZoom);
}

export function applyUiZoom(zoom: number) {
  const normalized = normalizeUiZoom(zoom);

  if (typeof document === "undefined") {
    return normalized;
  }

  const root = document.documentElement;
  const appRoot = document.getElementById("root");
  const scale = normalized / 100;

  root.style.setProperty("--app-ui-zoom", String(scale));

  if (appRoot) {
    appRoot.style.transformOrigin = "top left";
    appRoot.style.transform = `scale(${scale})`;
    appRoot.style.width = `${100 / scale}%`;
    appRoot.style.minHeight = `${100 / scale}%`;
  }

  return normalized;
}

export function setStoredUiZoom(zoom: number) {
  const normalized = normalizeUiZoom(zoom);
  const settings = readStoredSettings();

  writeStoredSettings({
    ...settings,
    uiZoom: normalized,
  });

  applyUiZoom(normalized);

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<number>(UI_ZOOM_CHANGED_EVENT, {
        detail: normalized,
      }),
    );
  }

  return normalized;
}

export function stepStoredUiZoom(delta: number) {
  return setStoredUiZoom(getStoredUiZoom() + delta);
}
