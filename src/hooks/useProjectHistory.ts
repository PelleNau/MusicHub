import { useState, useCallback, useEffect } from "react";
import { AbletonParseResult } from "@/types/ableton";
import { toast } from "sonner";

const HISTORY_KEY = "flightcase-deep-dive-history";
const LEGACY_KEY = "flightcase-deep-dive";
const MAX_HISTORY = 20;

export interface HistoryEntry {
  id: string;
  fileName: string;
  timestamp: number;
  result: AbletonParseResult;
  analysis: string;
}

// ── localStorage helpers ──

function readHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function writeHistory(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)));
  } catch {}
}

function migrateLegacyEntry(): HistoryEntry | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.result) return null;
    localStorage.removeItem(LEGACY_KEY);
    return {
      id: `legacy-${Date.now()}`,
      fileName: "Untitled Project.als",
      timestamp: Date.now(),
      result: data.result,
      analysis: data.analysis || "",
    };
  } catch {
    return null;
  }
}

// ── Formatting ──

export function formatRelativeTime(ts: number): string {
  const diffMs = Date.now() - ts;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(ts).toLocaleDateString();
}

// ── Hook ──

export function useProjectHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentFileName, setCurrentFileName] = useState("");

  // Initialise: migrate legacy, then load history
  useEffect(() => {
    const legacy = migrateLegacyEntry();
    if (legacy) {
      const updated = [legacy, ...readHistory()].slice(0, MAX_HISTORY);
      writeHistory(updated);
      setHistory(updated);
      setCurrentFileName(legacy.fileName);
      return;
    }
    setHistory(readHistory());
  }, []);

  const latestEntry = history.length > 0 ? history[0] : null;

  /** Add or update a project in history and mark it as current */
  const pushProject = useCallback((fileName: string, result: AbletonParseResult, analysis = "") => {
    const entry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      fileName,
      timestamp: Date.now(),
      result,
      analysis,
    };
    const existing = readHistory().filter((h) => h.fileName !== fileName);
    const updated = [entry, ...existing].slice(0, MAX_HISTORY);
    writeHistory(updated);
    setHistory(updated);
    setCurrentFileName(fileName);
  }, []);

  /** Update analysis text for the current project */
  const updateAnalysis = useCallback((fileName: string, analysis: string) => {
    const entries = readHistory();
    const idx = entries.findIndex((h) => h.fileName === fileName);
    if (idx === -1) return;
    entries[idx] = { ...entries[idx], analysis, timestamp: Date.now() };
    writeHistory(entries);
    setHistory(entries);
  }, []);

  /** Delete a single entry by id */
  const deleteEntry = useCallback((id: string) => {
    const updated = readHistory().filter((h) => h.id !== id);
    writeHistory(updated);
    setHistory(updated);
    toast.success("Removed from history");
  }, []);

  return {
    history,
    currentFileName,
    setCurrentFileName,
    latestEntry,
    pushProject,
    updateAnalysis,
    deleteEntry,
  } as const;
}
