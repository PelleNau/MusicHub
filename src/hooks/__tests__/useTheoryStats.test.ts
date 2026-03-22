import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTheoryStats } from "@/hooks/useTheoryStats";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchTheoryStatsRecord,
  reportTheoryPersistenceError,
  upsertTheoryStatsRecord,
} from "@/domain/theory/theoryPersistence";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/domain/theory/theoryPersistence", () => ({
  fetchTheoryStatsRecord: vi.fn(),
  reportTheoryPersistenceError: vi.fn(),
  upsertTheoryStatsRecord: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockFetchTheoryStatsRecord = vi.mocked(fetchTheoryStatsRecord);
const mockReportTheoryPersistenceError = vi.mocked(reportTheoryPersistenceError);
const mockUpsertTheoryStatsRecord = vi.mocked(upsertTheoryStatsRecord);

function setAuthUser(userId: string | null = "user-1") {
  mockUseAuth.mockReturnValue({
    user: userId ? ({ id: userId } as { id: string }) : null,
  } as ReturnType<typeof useAuth>);
}

describe("useTheoryStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuthUser();
    mockFetchTheoryStatsRecord.mockResolvedValue(null);
    mockUpsertTheoryStatsRecord.mockResolvedValue(undefined);
  });

  it("loads persisted stats and resolves loading", async () => {
    mockFetchTheoryStatsRecord.mockResolvedValueOnce({
      xp: 125,
      current_streak: 4,
      longest_streak: 9,
      last_practice_date: "2026-03-21",
    });

    const { result } = renderHook(() => useTheoryStats());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.xp).toBe(125);
    expect(result.current.currentStreak).toBe(4);
    expect(result.current.longestStreak).toBe(9);
  });

  it("falls back to zeroed stats when the read fails", async () => {
    mockFetchTheoryStatsRecord.mockRejectedValueOnce(new Error("read failed"));

    const { result } = renderHook(() => useTheoryStats());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.xp).toBe(0);
    expect(result.current.currentStreak).toBe(0);
    expect(result.current.longestStreak).toBe(0);
    expect(mockReportTheoryPersistenceError).toHaveBeenCalledWith(
      "load theory stats",
      expect.any(Error),
    );
  });

  it("applies XP optimistically and handles rejected writes", async () => {
    mockUpsertTheoryStatsRecord.mockRejectedValueOnce(new Error("write failed"));

    const { result } = renderHook(() => useTheoryStats());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.awardXP(10);
    });

    expect(result.current.xp).toBe(10);
    expect(result.current.currentStreak).toBe(1);
    expect(result.current.longestStreak).toBe(1);

    await waitFor(() => {
      expect(mockUpsertTheoryStatsRecord).toHaveBeenCalledWith(
        "user-1",
        expect.objectContaining({
          xp: 10,
          current_streak: 1,
          longest_streak: 1,
          last_practice_date: expect.any(String),
        }),
      );
      expect(mockReportTheoryPersistenceError).toHaveBeenCalledWith(
        "save theory stats",
        expect.any(Error),
      );
    });
  });
});
