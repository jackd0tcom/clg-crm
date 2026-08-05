import { useState, useEffect, useCallback } from "react";

const STORAGE_PREFIX = "clg-cms:filters";

function getStorageKey(pageKey: string, userId: number | null) {
  return `${STORAGE_PREFIX}:${userId ?? "guest"}:${pageKey}`;
}

export function usePersistedFilter<T extends Record<string, unknown>>(
  pageKey: string,
  userId: number | null,
  defaultFilter: T,
) {
  const storageKey = getStorageKey(pageKey, userId);

  const [filter, setFilterState] = useState<T>(() => {
    // Only read on first render if we have a userId
    if (!userId) return defaultFilter;

    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return defaultFilter;
      return { ...defaultFilter, ...JSON.parse(saved) };
    } catch {
      return defaultFilter;
    }
  });

  // If userId loads after mount (Auth0 sync), re-read saved prefs
  useEffect(() => {
    if (!userId) return;

    try {
      const saved = localStorage.getItem(getStorageKey(pageKey, userId));
      if (saved) {
        setFilterState({ ...defaultFilter, ...JSON.parse(saved) });
      }
    } catch {
      // ignore bad data
    }
  }, [userId, pageKey]); // don't include defaultFilter — it's a new object every render

  const setFilter = useCallback(
    (next: T | ((prev: T) => T)) => {
      setFilterState((prev) => {
        const updated = typeof next === "function" ? next(prev) : next;

        if (userId) {
          localStorage.setItem(
            getStorageKey(pageKey, userId),
            JSON.stringify(updated),
          );
        }

        return updated;
      });
    },
    [pageKey, userId],
  );

  return [filter, setFilter] as const;
}
