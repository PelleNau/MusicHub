import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProjectHistory, formatRelativeTime } from "../useProjectHistory";
import { AbletonParseResult } from "@/types/ableton";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const HISTORY_KEY = "flightcase-deep-dive-history";
const LEGACY_KEY = "flightcase-deep-dive";

const fakeResult: AbletonParseResult = {
  tempo: 120,
  timeSignature: "4/4",
  key: "C",
  trackCount: 2,
  tracks: [],
  plugins: [],
  abletonDevices: [],
};

describe("useProjectHistory", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initialises with empty history", () => {
    const { result } = renderHook(() => useProjectHistory());
    expect(result.current.history).toEqual([]);
    expect(result.current.latestEntry).toBeNull();
  });

  it("pushProject adds an entry", () => {
    const { result } = renderHook(() => useProjectHistory());

    act(() => {
      result.current.pushProject("test.als", fakeResult);
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].fileName).toBe("test.als");
    expect(result.current.currentFileName).toBe("test.als");
  });

  it("pushProject replaces entry with same filename", () => {
    const { result } = renderHook(() => useProjectHistory());

    act(() => {
      result.current.pushProject("test.als", fakeResult, "analysis 1");
    });
    act(() => {
      result.current.pushProject("test.als", fakeResult, "analysis 2");
    });

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].analysis).toBe("analysis 2");
  });

  it("updateAnalysis updates existing entry", () => {
    const { result } = renderHook(() => useProjectHistory());

    act(() => {
      result.current.pushProject("test.als", fakeResult);
    });
    act(() => {
      result.current.updateAnalysis("test.als", "new analysis");
    });

    expect(result.current.history[0].analysis).toBe("new analysis");
  });

  it("deleteEntry removes an entry", () => {
    const { result } = renderHook(() => useProjectHistory());

    act(() => {
      result.current.pushProject("test.als", fakeResult);
    });

    const id = result.current.history[0].id;
    act(() => {
      result.current.deleteEntry(id);
    });

    expect(result.current.history).toHaveLength(0);
  });

  it("migrates legacy entry on init", () => {
    localStorage.setItem(LEGACY_KEY, JSON.stringify({ result: fakeResult, analysis: "legacy" }));

    const { result } = renderHook(() => useProjectHistory());

    expect(result.current.history).toHaveLength(1);
    expect(result.current.history[0].analysis).toBe("legacy");
    expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
  });

  it("limits history to 20 entries", () => {
    const { result } = renderHook(() => useProjectHistory());

    act(() => {
      for (let i = 0; i < 25; i++) {
        result.current.pushProject(`project-${i}.als`, fakeResult);
      }
    });

    expect(result.current.history.length).toBeLessThanOrEqual(20);
  });
});

describe("formatRelativeTime", () => {
  it("returns 'Just now' for recent timestamps", () => {
    expect(formatRelativeTime(Date.now())).toBe("Just now");
  });

  it("returns minutes ago", () => {
    expect(formatRelativeTime(Date.now() - 5 * 60_000)).toBe("5m ago");
  });

  it("returns hours ago", () => {
    expect(formatRelativeTime(Date.now() - 3 * 3600_000)).toBe("3h ago");
  });

  it("returns days ago", () => {
    expect(formatRelativeTime(Date.now() - 2 * 86400_000)).toBe("2d ago");
  });

  it("returns date string for old timestamps", () => {
    const old = Date.now() - 30 * 86400_000;
    const result = formatRelativeTime(old);
    // Should be a formatted date, not relative
    expect(result).not.toContain("ago");
    expect(result).not.toBe("Just now");
  });
});
