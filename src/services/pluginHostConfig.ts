const LOCAL_STORAGE_KEY = "musichub.plugin-host.base-url";

export const DEFAULT_PLUGIN_HOST_BASE_URL = "http://127.0.0.1:8080";

function canUseDomApis(): boolean {
  return typeof window !== "undefined";
}

function readViteEnv(key: "VITE_PLUGIN_HOST_URL" | "VITE_PLUGIN_HOST_WS_URL"): string {
  const meta = import.meta as ImportMeta & {
    env?: Record<string, string | undefined>;
  };

  return meta.env?.[key] ?? "";
}

export function normalizePluginHostBaseUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    url.pathname = "";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function buildPluginHostWsUrl(baseUrl: string): string {
  const url = new URL(baseUrl);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws";
  url.search = "";
  url.hash = "";
  return url.toString();
}

export function getStoredPluginHostBaseUrl(): string | null {
  if (!canUseDomApis()) return null;

  try {
    return normalizePluginHostBaseUrl(window.localStorage.getItem(LOCAL_STORAGE_KEY) ?? "");
  } catch {
    return null;
  }
}

export function storePluginHostBaseUrl(baseUrl: string): string | null {
  const normalized = normalizePluginHostBaseUrl(baseUrl);
  if (!normalized || !canUseDomApis()) return normalized;

  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, normalized);
  } catch {
    // Persisting an override is best effort only.
  }

  return normalized;
}

export function resolvePluginHostBaseUrl(): string {
  const envBaseUrl = normalizePluginHostBaseUrl(readViteEnv("VITE_PLUGIN_HOST_URL"));
  return getStoredPluginHostBaseUrl() ?? envBaseUrl ?? DEFAULT_PLUGIN_HOST_BASE_URL;
}

export function resolvePluginHostWsUrl(baseUrl = resolvePluginHostBaseUrl()): string {
  const envWsUrl = readViteEnv("VITE_PLUGIN_HOST_WS_URL").trim();
  if (envWsUrl) return envWsUrl;
  return buildPluginHostWsUrl(baseUrl);
}
