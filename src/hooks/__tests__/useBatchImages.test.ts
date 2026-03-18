import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useBatchImages } from "../useBatchImages";
import { InventoryItem } from "@/types/inventory";

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: null, error: null }),
    },
    from: vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }),
    }),
  },
}));

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: qc }, children);
}

const makeItem = (id: string, imageUrl?: string): InventoryItem => ({
  id,
  ecosystem: "Hardware",
  category: "Synth",
  vendor: "Moog",
  product: `Synth ${id}`,
  type: "Instrument",
  imageUrl,
});

describe("useBatchImages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initialises with null progress", () => {
    const { result } = renderHook(() => useBatchImages([]), { wrapper: createWrapper() });
    expect(result.current.progress).toBeNull();
  });

  it("shows toast when all items already have images", async () => {
    const { toast } = await import("sonner");
    const items = [makeItem("1", "http://img.png")];
    const { result } = renderHook(() => useBatchImages(items), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.findAllImages();
    });

    expect(toast.info).toHaveBeenCalledWith("All items already have images");
  });

  it("processes items without images", async () => {
    const { supabase } = await import("@/integrations/supabase/client");
    (supabase.functions.invoke as any).mockResolvedValue({
      data: { success: true, imageUrl: "http://found.png" },
      error: null,
    });

    const items = [makeItem("1"), makeItem("2", "http://existing.png")];
    const { result } = renderHook(() => useBatchImages(items), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.findAllImages();
    });

    // Only 1 item missing image
    expect(supabase.functions.invoke).toHaveBeenCalledTimes(1);
    expect(result.current.progress).toBeNull(); // reset after completion
  });
});
