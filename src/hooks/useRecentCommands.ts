import { useCallback, useState } from 'react';

const STORAGE_KEY = 'scc.recent';
const LIMIT = 4;

/** localStorage throws outright in some privacy modes. */
function read(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    // Anything could be under this key — another tab, an old version, a
    // person with devtools open. Validate rather than trust the shape.
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * The last few commands used, most recent first.
 *
 * `localStorage`, not `sessionStorage`: the point of a recents list is that it
 * is there when you come back tomorrow. That is the opposite of the boot
 * overlay (Stage 2), which uses `sessionStorage` precisely so that tomorrow
 * counts as a new visit.
 */
export function useRecentCommands() {
  const [recent, setRecent] = useState<string[]>(read);

  const remember = useCallback((id: string) => {
    setRecent((prev) => {
      const next = [id, ...prev.filter((existing) => existing !== id)].slice(0, LIMIT);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* a recents list is a convenience, not a requirement */
      }
      return next;
    });
  }, []);

  return { recent, remember };
}
