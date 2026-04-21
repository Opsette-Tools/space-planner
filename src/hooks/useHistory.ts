import { useCallback, useRef, useState } from "react";

const MAX_HISTORY = 50;

export interface HistoryApi<T> {
  state: T;
  /** Replace state and push the previous state onto the past stack. */
  set: (next: T | ((prev: T) => T)) => void;
  /** Replace state without recording history (e.g. autosave-only metadata). */
  replace: (next: T | ((prev: T) => T)) => void;
  /** Begin a coalesced commit: subsequent set() calls update present without
   *  pushing extra history entries until commit() is called. */
  beginCoalesce: () => void;
  /** End coalesced commit and snapshot the result onto history. */
  commitCoalesce: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: (next: T) => void;
}

export function useHistory<T>(initial: T): HistoryApi<T> {
  const [present, setPresent] = useState<T>(initial);
  const pastRef = useRef<T[]>([]);
  const futureRef = useRef<T[]>([]);
  const coalesceRef = useRef<{ active: boolean; snapshot: T | null }>({
    active: false,
    snapshot: null,
  });
  const [, force] = useState(0);
  const bump = () => force((n) => n + 1);

  const set: HistoryApi<T>["set"] = useCallback((next) => {
    setPresent((prev) => {
      const value = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      if (value === prev) return prev;
      if (coalesceRef.current.active) {
        // Don't push intermediate states; remember the pre-coalesce snapshot once.
        if (coalesceRef.current.snapshot === null) {
          coalesceRef.current.snapshot = prev;
        }
        return value;
      }
      const past = pastRef.current;
      past.push(prev);
      if (past.length > MAX_HISTORY) past.shift();
      futureRef.current = [];
      bump();
      return value;
    });
  }, []);

  const replace: HistoryApi<T>["replace"] = useCallback((next) => {
    setPresent((prev) =>
      typeof next === "function" ? (next as (p: T) => T)(prev) : next,
    );
  }, []);

  const beginCoalesce = useCallback(() => {
    coalesceRef.current = { active: true, snapshot: null };
  }, []);

  const commitCoalesce = useCallback(() => {
    const snap = coalesceRef.current.snapshot;
    coalesceRef.current = { active: false, snapshot: null };
    if (snap !== null) {
      const past = pastRef.current;
      past.push(snap);
      if (past.length > MAX_HISTORY) past.shift();
      futureRef.current = [];
      bump();
    }
  }, []);

  const undo = useCallback(() => {
    const past = pastRef.current;
    if (past.length === 0) return;
    setPresent((prev) => {
      const last = past.pop()!;
      futureRef.current.push(prev);
      bump();
      return last;
    });
  }, []);

  const redo = useCallback(() => {
    const future = futureRef.current;
    if (future.length === 0) return;
    setPresent((prev) => {
      const next = future.pop()!;
      pastRef.current.push(prev);
      bump();
      return next;
    });
  }, []);

  const reset = useCallback((next: T) => {
    pastRef.current = [];
    futureRef.current = [];
    coalesceRef.current = { active: false, snapshot: null };
    setPresent(next);
    bump();
  }, []);

  return {
    state: present,
    set,
    replace,
    beginCoalesce,
    commitCoalesce,
    undo,
    redo,
    canUndo: pastRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
    reset,
  };
}