import { useEffect, useState } from 'react';

/**
 * Which section is currently "the one you're looking at".
 *
 * Implemented as a 1px detection band across the middle of the viewport:
 * `rootMargin: '-50% 0px -50% 0px'` shrinks the observer root to a single
 * line, so at most one section intersects it at a time and the active state
 * can never be ambiguous. Comparing `intersectionRatio` across sections
 * instead would let a tall section beat a short one that is genuinely
 * centred, and reading scroll offsets by hand means re-measuring on every
 * resize and font load.
 *
 * Trade-off: a section shorter than half the viewport may never cross the
 * line, and so would never activate. Every section here is at least
 * `min-h-svh`.
 */
export function useActiveSection(ids: string[], fallback = ids[0]): string {
  const [active, setActive] = useState(fallback);

  // The effect depends on the section list's *contents*, not the array's
  // identity — callers may pass a fresh literal on every render. Joining to a
  // string and splitting it back inside means `ids` never enters the effect,
  // so the dependency is honestly complete.
  const key = ids.join(',');

  useEffect(() => {
    const elements = key
      .split(',')
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [key]);

  return active;
}
