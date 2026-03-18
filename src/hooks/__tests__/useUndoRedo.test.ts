import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useUndoRedo } from "../useUndoRedo";

describe("useUndoRedo", () => {
  it("starts with empty stacks", () => {
    const { result } = renderHook(() => useUndoRedo());
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
    expect(result.current.undoLabel).toBeNull();
    expect(result.current.redoLabel).toBeNull();
  });

  it("push adds entry to undo stack", () => {
    const { result } = renderHook(() => useUndoRedo());
    act(() => {
      result.current.push({ label: "Test", undo: vi.fn(), redo: vi.fn() });
    });
    expect(result.current.canUndo).toBe(true);
    expect(result.current.undoLabel).toBe("Test");
  });

  it("undo calls the undo callback", () => {
    const undoFn = vi.fn();
    const { result } = renderHook(() => useUndoRedo());
    act(() => {
      result.current.push({ label: "Action", undo: undoFn, redo: vi.fn() });
    });
    act(() => {
      result.current.undo();
    });
    expect(undoFn).toHaveBeenCalledTimes(1);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });

  it("redo calls the redo callback", () => {
    const redoFn = vi.fn();
    const { result } = renderHook(() => useUndoRedo());
    act(() => {
      result.current.push({ label: "Action", undo: vi.fn(), redo: redoFn });
    });
    act(() => {
      result.current.undo();
    });
    act(() => {
      result.current.redo();
    });
    expect(redoFn).toHaveBeenCalledTimes(1);
    expect(result.current.canUndo).toBe(true);
    expect(result.current.canRedo).toBe(false);
  });

  it("push clears redo stack", () => {
    const { result } = renderHook(() => useUndoRedo());
    act(() => {
      result.current.push({ label: "A", undo: vi.fn(), redo: vi.fn() });
    });
    act(() => {
      result.current.undo();
    });
    expect(result.current.canRedo).toBe(true);
    act(() => {
      result.current.push({ label: "B", undo: vi.fn(), redo: vi.fn() });
    });
    expect(result.current.canRedo).toBe(false);
  });

  it("multiple undo/redo cycles work correctly", () => {
    const undo1 = vi.fn();
    const undo2 = vi.fn();
    const { result } = renderHook(() => useUndoRedo());

    act(() => {
      result.current.push({ label: "First", undo: undo1, redo: vi.fn() });
      result.current.push({ label: "Second", undo: undo2, redo: vi.fn() });
    });

    expect(result.current.undoLabel).toBe("Second");

    act(() => result.current.undo());
    expect(undo2).toHaveBeenCalled();
    expect(result.current.undoLabel).toBe("First");

    act(() => result.current.undo());
    expect(undo1).toHaveBeenCalled();
    expect(result.current.canUndo).toBe(false);
  });

  it("undo on empty stack is a no-op", () => {
    const { result } = renderHook(() => useUndoRedo());
    act(() => result.current.undo());
    expect(result.current.canUndo).toBe(false);
  });

  it("redo on empty stack is a no-op", () => {
    const { result } = renderHook(() => useUndoRedo());
    act(() => result.current.redo());
    expect(result.current.canRedo).toBe(false);
  });
});
