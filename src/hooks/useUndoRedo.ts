import { useCallback, useRef, useState } from "react";

export interface UndoEntry {
  label: string;
  undo: () => void;
  redo: () => void;
}

const MAX_HISTORY = 80;

export interface UndoRedoState {
  push: (entry: UndoEntry) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  undoLabel: string | null;
  redoLabel: string | null;
}

/**
 * Generic undo/redo hook that stores action-based entries (not full snapshots).
 * Each entry has an `undo` and `redo` callback plus a human-readable label.
 * Uses useState version counter to trigger re-renders when the stack changes,
 * so undo/redo button disabled states update reactively.
 */
export function useUndoRedo(): UndoRedoState {
  const pastRef = useRef<UndoEntry[]>([]);
  const futureRef = useRef<UndoEntry[]>([]);
  // Bump to force re-render when stack changes so buttons update
  const [, forceRender] = useState(0);

  const push = useCallback((entry: UndoEntry) => {
    pastRef.current.push(entry);
    if (pastRef.current.length > MAX_HISTORY) pastRef.current.shift();
    futureRef.current = []; // clear redo stack on new action
    forceRender(v => v + 1);
  }, []);

  const undo = useCallback(() => {
    const entry = pastRef.current.pop();
    if (!entry) return;
    entry.undo();
    futureRef.current.push(entry);
    forceRender(v => v + 1);
  }, []);

  const redo = useCallback(() => {
    const entry = futureRef.current.pop();
    if (!entry) return;
    entry.redo();
    pastRef.current.push(entry);
    forceRender(v => v + 1);
  }, []);

  return {
    push,
    undo,
    redo,
    get canUndo() { return pastRef.current.length > 0; },
    get canRedo() { return futureRef.current.length > 0; },
    get undoLabel() { return pastRef.current.length > 0 ? pastRef.current[pastRef.current.length - 1].label : null; },
    get redoLabel() { return futureRef.current.length > 0 ? futureRef.current[futureRef.current.length - 1].label : null; },
  };
}
