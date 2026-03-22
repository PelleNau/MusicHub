import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useChallengeProgress } from "@/hooks/useChallengeProgress";
import { useAuth } from "@/hooks/useAuth";
import {
  deleteChallengeProgressRecord,
  fetchChallengeProgressRecord,
  reportTheoryPersistenceError,
  upsertChallengeProgressRecord,
} from "@/domain/theory/theoryPersistence";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/domain/theory/theoryPersistence", () => ({
  deleteChallengeProgressRecord: vi.fn(),
  fetchChallengeProgressRecord: vi.fn(),
  reportTheoryPersistenceError: vi.fn(),
  upsertChallengeProgressRecord: vi.fn(),
}));

const mockUseAuth = vi.mocked(useAuth);
const mockDeleteChallengeProgressRecord = vi.mocked(deleteChallengeProgressRecord);
const mockFetchChallengeProgressRecord = vi.mocked(fetchChallengeProgressRecord);
const mockReportTheoryPersistenceError = vi.mocked(reportTheoryPersistenceError);
const mockUpsertChallengeProgressRecord = vi.mocked(upsertChallengeProgressRecord);

function setAuthUser(userId: string | null = "user-1") {
  mockUseAuth.mockReturnValue({
    user: userId ? ({ id: userId } as { id: string }) : null,
  } as ReturnType<typeof useAuth>);
}

describe("useChallengeProgress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuthUser();
    mockFetchChallengeProgressRecord.mockResolvedValue(null);
    mockUpsertChallengeProgressRecord.mockResolvedValue(undefined);
    mockDeleteChallengeProgressRecord.mockResolvedValue(undefined);
  });

  it("loads persisted challenge progress and resolves loading", async () => {
    mockFetchChallengeProgressRecord.mockResolvedValueOnce([1, 3]);

    const { result } = renderHook(() => useChallengeProgress("intervals"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(Array.from(result.current.completedSet)).toEqual([1, 3]);
  });

  it("degrades to empty progress when the read fails", async () => {
    mockFetchChallengeProgressRecord.mockRejectedValueOnce(new Error("read failed"));

    const { result } = renderHook(() => useChallengeProgress("intervals"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.completedSet.size).toBe(0);
    expect(mockReportTheoryPersistenceError).toHaveBeenCalledWith(
      "load challenge progress for intervals",
      expect.any(Error),
    );
  });

  it("handles rejected progress writes without losing the optimistic update", async () => {
    mockUpsertChallengeProgressRecord.mockRejectedValueOnce(new Error("write failed"));

    const { result } = renderHook(() => useChallengeProgress("intervals"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.markCompleted(2);
    });

    expect(Array.from(result.current.completedSet)).toEqual([2]);

    await waitFor(() => {
      expect(mockUpsertChallengeProgressRecord).toHaveBeenCalledWith("user-1", "intervals", [2]);
      expect(mockReportTheoryPersistenceError).toHaveBeenCalledWith(
        "save challenge progress for intervals",
        expect.any(Error),
      );
    });
  });

  it("clears local progress and handles rejected deletes", async () => {
    mockFetchChallengeProgressRecord.mockResolvedValueOnce([0, 1]);
    mockDeleteChallengeProgressRecord.mockRejectedValueOnce(new Error("delete failed"));

    const { result } = renderHook(() => useChallengeProgress("intervals"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.resetProgress();
    });

    expect(result.current.completedSet.size).toBe(0);

    await waitFor(() => {
      expect(mockDeleteChallengeProgressRecord).toHaveBeenCalledWith("user-1", "intervals");
      expect(mockReportTheoryPersistenceError).toHaveBeenCalledWith(
        "reset challenge progress for intervals",
        expect.any(Error),
      );
    });
  });
});
