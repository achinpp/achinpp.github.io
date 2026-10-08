import { useRef, useState } from 'react';
import { useMotionValueEvent, useScroll } from 'motion/react';

export type ScrollChrome = {
  /** True when the nav should slide out of the way. */
  hidden: boolean;
  /** True near the top of the page — the nav drops its background there. */
  atTop: boolean;
};

/**
 * Auto-hide state for the floating nav.
 *
 * `threshold` ignores sub-pixel scroll jitter: without it, the inertia at the
 * end of a Lenis glide produces tiny alternating deltas and the nav flickers.
 * The nav also never hides inside the top `revealAbove` pixels, so it can't
 * disappear while the hero is still on screen.
 */
export function useScrollDirection(threshold = 8, revealAbove = 90): ScrollChrome {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [atTop, setAtTop] = useState(true);
  const last = useRef(0);

  useMotionValueEvent(scrollY, 'change', (y) => {
    setAtTop(y < 24);

    if (y < revealAbove) {
      setHidden(false);
      last.current = y;
      return;
    }

    const delta = y - last.current;
    if (Math.abs(delta) < threshold) return;

    last.current = y;
    setHidden(delta > 0);
  });

  return { hidden, atTop };
}
