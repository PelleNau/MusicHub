import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFavorites, useRecents } from "../userState";

describe("useFavorites", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts empty with no stored data", () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites.size).toBe(0);
  });

  it("toggles a favorite on and off", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => result.current.toggleFavorite("item-1"));
    expect(result.current.favorites.has("item-1")).toBe(true);

    act(() => result.current.toggleFavorite("item-1"));
    expect(result.current.favorites.has("item-1")).toBe(false);
  });

  it("persists favorites to localStorage", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => result.current.toggleFavorite("item-a"));
    act(() => result.current.toggleFavorite("item-b"));

    const stored = JSON.parse(localStorage.getItem("studio-browser-favorites")!);
    expect(stored).toContain("item-a");
    expect(stored).toContain("item-b");
  });

  it("loads persisted favorites on mount", () => {
    localStorage.setItem("studio-browser-favorites", JSON.stringify(["x", "y"]));
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites.has("x")).toBe(true);
    expect(result.current.favorites.has("y")).toBe(true);
  });
});

describe("useRecents", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts empty with no stored data", () => {
    const { result } = renderHook(() => useRecents());
    expect(result.current.recents).toHaveLength(0);
  });

  it("adds a recent item to the front", () => {
    const { result } = renderHook(() => useRecents());

    act(() => result.current.addRecent("a"));
    act(() => result.current.addRecent("b"));

    expect(result.current.recents[0]).toBe("b");
    expect(result.current.recents[1]).toBe("a");
  });

  it("deduplicates — re-adding moves to front", () => {
    const { result } = renderHook(() => useRecents());

    act(() => result.current.addRecent("a"));
    act(() => result.current.addRecent("b"));
    act(() => result.current.addRecent("a"));

    expect(result.current.recents).toEqual(["a", "b"]);
  });

  it("caps at 20 items", () => {
    const { result } = renderHook(() => useRecents());

    for (let i = 0; i < 25; i++) {
      act(() => result.current.addRecent(`item-${i}`));
    }

    expect(result.current.recents).toHaveLength(20);
    expect(result.current.recents[0]).toBe("item-24");
  });

  it("persists recents to localStorage", () => {
    const { result } = renderHook(() => useRecents());

    act(() => result.current.addRecent("z"));

    const stored = JSON.parse(localStorage.getItem("studio-browser-recents")!);
    expect(stored).toEqual(["z"]);
  });
});
