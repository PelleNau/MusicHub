import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useStreamingAnalysis } from "../useStreamingAnalysis";

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
}));

describe("useStreamingAnalysis", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("initialises with empty state", () => {
    const { result } = renderHook(() => useStreamingAnalysis());
    expect(result.current.analysis).toBe("");
    expect(result.current.analyzing).toBe(false);
  });

  it("reset clears analysis", () => {
    const { result } = renderHook(() => useStreamingAnalysis());

    act(() => {
      result.current.setAnalysis("some text");
    });
    expect(result.current.analysis).toBe("some text");

    act(() => {
      result.current.reset();
    });
    expect(result.current.analysis).toBe("");
    expect(result.current.analyzing).toBe(false);
  });

  it("abort sets analyzing to false", () => {
    const { result } = renderHook(() => useStreamingAnalysis());

    act(() => {
      result.current.abort();
    });
    expect(result.current.analyzing).toBe(false);
  });

  it("run handles HTTP error gracefully", async () => {
    const { toast } = await import("sonner");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ error: "Rate limited" }), { status: 429 }),
    );

    const { result } = renderHook(() => useStreamingAnalysis());

    await act(async () => {
      await result.current.run({
        tempo: 120,
        timeSignature: "4/4",
        key: "C",
        trackCount: 0,
        tracks: [],
        plugins: [],
        abletonDevices: [],
      });
    });

    expect(result.current.analyzing).toBe(false);
    expect(toast.error).toHaveBeenCalled();
  });
});
