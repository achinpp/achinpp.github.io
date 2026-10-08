import { useCallback } from 'react';
import { useLenis } from 'lenis/react';

/**
 * Scroll to an element by id. Uses Lenis when it's mounted, and falls back to
 * native scrolling when it isn't — which is the reduced-motion case, where
 * SmoothScrollProvider renders no Lenis instance at all.
 *
 * `offset` leaves room for the floating nav (Stage 1).
 */
export function useScrollTo(offset = -88) {
  const lenis = useLenis();

  return useCallback(
    (id: string) => {
      const target = document.getElementById(id);
      if (!target) return;

      if (lenis) {
        lenis.scrollTo(target, { offset, duration: 1.1 });
        return;
      }

      const top = target.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top, behavior: 'auto' });
    },
    [lenis, offset],
  );
}
