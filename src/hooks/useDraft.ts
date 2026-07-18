import { useCallback, useMemo, useRef, useState } from "react";

export type DraftResult<T> = {
  draft: T;
  setField: <K extends keyof T>(key: K, value: T[K]) => void;
  setDraft: (updater: T | ((prev: T) => T)) => void;
  dirty: boolean;
  reset: (newInitial?: T) => void;
};

export function useDraft<T>(
  initial: T,
  equal: (a: T, b: T) => boolean
): DraftResult<T> {
  const [draft, setDraftState] = useState<T>(initial);
  const initialRef = useRef<T>(initial);

  const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setDraftState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setDraft = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setDraftState((prev) =>
        typeof updater === "function"
          ? (updater as (p: T) => T)(prev)
          : updater
      );
    },
    []
  );

  const reset = useCallback((newInitial?: T) => {
    if (newInitial !== undefined) {
      initialRef.current = newInitial;
      setDraftState(newInitial);
    } else {
      setDraftState(initialRef.current);
    }
  }, []);

  const dirty = useMemo(
    () => !equal(draft, initialRef.current),
    [draft, equal]
  );

  return { draft, setField, setDraft, dirty, reset };
}
