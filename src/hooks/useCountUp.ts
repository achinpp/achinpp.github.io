import { useEffect, useRef } from 'react';
import { animate } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { duration, easeOutExpo } from '@/lib/motion/easings';

/** `4` → `04`. Matches the mono index style used across the site. */
function pad(value: number) {
  return value < 10 ? `0${value}` : String(value);
}

/**
 * Count a number up, once.
 *
 * Returns a ref to attach to the element that shows the figure. The value is
 * written with `textContent` rather than held in state: a count-up is ~70
 * frames, and 70 re-renders of a component tree to change two characters is
 * the kind of thing that makes a page feel heavy for no visible reason. Same
 * reasoning as the scroll percentage in `<StatusHUD />` (Stage 1).
 *
 * `active` is expected to come from a `useInView(ref, { once: true })`, which
 * is what keeps it from re-running on every scroll pass. Under reduced motion
 * the final value is written immediately — a number ticking upward is motion,
 * and the figure is the content, not the animation.
 *
 * A `null` target means the figure was never supplied; the caller renders its
 * own placeholder and this hook does nothing.
 */
export function useCountUp(target: number | null, active: boolean) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || target === null || !active) return;

    if (reduced) {
      el.textContent = pad(target);
      return;
    }

    const controls = animate(0, target, {
      duration: duration.cinematic,
      ease: easeOutExpo,
      onUpdate: (value) => {
        el.textContent = pad(Math.round(value));
      },
    });

    return () => controls.stop();
  }, [target, active, reduced]);

  return ref;
}
