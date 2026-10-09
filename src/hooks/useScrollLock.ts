import { useEffect } from 'react';
import { useLenis } from 'lenis/react';

/**
 * Freeze the page behind an overlay.
 *
 * Both halves are needed. `overflow: hidden` on `<body>` stops native
 * scrolling, but Lenis drives the scroll position itself and would happily
 * keep consuming wheel events behind a modal — so it has to be told to stop
 * as well. `useLenis()` returns `undefined` when no instance is mounted,
 * which is the reduced-motion case, and the optional calls handle it.
 *
 * The `scroll-lock` utility also sets `scrollbar-gutter: stable`, so removing
 * the scrollbar doesn't shift the page a dozen pixels sideways as the overlay
 * opens.
 */
export function useScrollLock(active: boolean) {
  const lenis = useLenis();

  useEffect(() => {
    if (!active) return;

    lenis?.stop();
    document.body.classList.add('scroll-lock');

    return () => {
      lenis?.start();
      document.body.classList.remove('scroll-lock');
    };
  }, [active, lenis]);
}
