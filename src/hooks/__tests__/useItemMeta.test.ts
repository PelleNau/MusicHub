import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useItemMeta } from "../useItemMeta";

const STORAGE_KEY = "flightcase-meta";

describe("useItemMeta", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initialises with empty meta when localStorage is empty", () => {
    const { result } = renderHook(() => useItemMeta());
    expect(result.current.itemMeta).toEqual({});
  });

  it("loads existing meta from localStorage", () => {
    const stored = { "item-1": { rating: 4, tags: ["favorite"] } };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    const { result } = renderHook(() => useItemMeta());
    expect(result.current.itemMeta).toEqual(stored);
  });

  it("handles corrupt localStorage gracefully", () => {
    localStorage.setItem(STORAGE_KEY, "not-json!!!");
    const { result } = renderHook(() => useItemMeta());
    expect(result.current.itemMeta).toEqual({});
  });

  it("setRating persists to localStorage", () => {
    const { result } = renderHook(() => useItemMeta());

    act(() => {
      result.current.setRating("item-1", 5);
    });

    expect(result.current.itemMeta["item-1"].rating).toBe(5);
    expect(result.current.itemMeta["item-1"].tags).toEqual([]);

    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(persisted["item-1"].rating).toBe(5);
  });

  it("addTag adds a tag and persists", () => {
    const { result } = renderHook(() => useItemMeta());

    act(() => {
      result.current.addTag("item-1", "bass");
    });

    expect(result.current.itemMeta["item-1"].tags).toEqual(["bass"]);
  });

  it("addTag does not duplicate existing tags", () => {
    const { result } = renderHook(() => useItemMeta());

    act(() => {
      result.current.addTag("item-1", "bass");
    });
    act(() => {
      result.current.addTag("item-1", "bass");
    });

    expect(result.current.itemMeta["item-1"].tags).toEqual(["bass"]);
  });

  it("removeTag removes a tag and persists", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ "item-1": { rating: 3, tags: ["bass", "lead"] } }),
    );

    const { result } = renderHook(() => useItemMeta());

    act(() => {
      result.current.removeTag("item-1", "bass");
    });

    expect(result.current.itemMeta["item-1"].tags).toEqual(["lead"]);
    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(persisted["item-1"].tags).toEqual(["lead"]);
  });
});
