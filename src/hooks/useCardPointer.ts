import { useCallback, useEffect, useRef } from 'react';
import { useSpring } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { usePointer } from '@/hooks/usePointer';
import { spring } from '@/lib/motion/easings';

/**
 * Card hover: a cursor-tracked spotlight plus a slight 3D tilt, from one
 * pointer handler.
 *
 * Both effects need the cursor's position relative to the card, which means a
 * `getBoundingClientRect()`. Two separate hooks would read the rect twice per
 * event for the same number, so they share one handler.
 *
 * **The spotlight is CSS custom properties, not React state.** `--mx` / `--my`
 * are written straight onto the element and read by a `radial-gradient` in the
 * card's own layers. State would re-render the card on every mouse move, and
 * mouse events outpace frames.
 *
 * **Writes are collapsed to one per frame.** Setting a custom property
 * invalidates style and repaints the gradient; without the rAF gate a fast
 * drag across a card would queue several of those inside a single frame and
 * only the last would ever be seen.
 *
 * The tilt is a pair of springs so the card settles instead of snapping, and
 * `rotateX`/`rotateY` are `undefined` when the effect is off — a `motion.div`
 * given `undefined` writes no transform at all, which matters because the
 * detail morph (Stage 4) animates the same property.
 *
 * Off entirely for a coarse pointer (nothing hovers on touch) and under
 * reduced motion (a gradient chasing the cursor is motion, whatever it is
 * attached to). Hover still reads in those cases — the card's border brighten
 * is plain CSS and never depended on this.
 */
export function useCardPointer(maxTilt = 5) {
  const reduced = useReducedMotion();
  const { isFine } = usePointer();
  const enabled = isFine && !reduced;

  const ref = useRef<HTMLElement | null>(null);
  const rotateX = useSpring(0, spring.magnetic);
  const rotateY = useSpring(0, spring.magnetic);

  /** Latest position, waiting for the next frame. */
  const pending = useRef<{ x: number; y: number } | null>(null);
  const rafId = useRef(0);

  const flush = useCallback(() => {
    rafId.current = 0;
    const el = ref.current;
    const next = pending.current;
    if (!el || !next) return;
    el.style.setProperty('--mx', `${next.x}px`);
    el.style.setProperty('--my', `${next.y}px`);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!enabled) return;
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      pending.current = { x, y };
      if (!rafId.current) rafId.current = requestAnimationFrame(flush);

      // Tilt away from the cursor: pushing the top of the card tips it back.
      rotateX.set((y / rect.height - 0.5) * -2 * maxTilt);
      rotateY.set((x / rect.width - 0.5) * 2 * maxTilt);
    },
    [enabled, flush, maxTilt, rotateX, rotateY],
  );

  /**
   * Only the tilt resets. The spotlight is left where it was and faded out by
   * a CSS opacity transition on the layer itself — snapping it back to the
   * centre on leave would drag a visible streak across the card.
   */
  const onPointerLeave = useCallback(() => {
    rotateX.set(0);
    rotateY.set(0);
  }, [rotateX, rotateY]);

  useEffect(
    () => () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    },
    [],
  );

  return {
    ref,
    enabled,
    rotateX: enabled ? rotateX : undefined,
    rotateY: enabled ? rotateY : undefined,
    handlers: { onPointerMove, onPointerLeave },
  };
}
