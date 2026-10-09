import { useCallback, useRef } from 'react';
import { useMotionValue, useSpring } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { usePointer } from '@/hooks/usePointer';
import { spring } from '@/lib/motion/easings';

/**
 * Magnetic hover: an element leans toward the cursor while the cursor is over
 * it, then springs back.
 *
 * `strength` is the fraction of the cursor's offset from centre that the
 * element travels. Above about 0.3 it stops feeling like weight and starts
 * feeling like the button is running away from you.
 *
 * Returns handlers rather than attaching listeners itself, so the offset is
 * only computed while the pointer is actually over the element — a global
 * `pointermove` subscription would run this maths on every mouse event
 * anywhere on the page.
 */
export function useMagnetic(strength = 0.22) {
  const reduced = useReducedMotion();
  const { isFine } = usePointer();
  const ref = useRef<HTMLElement | null>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, spring.magnetic);
  const y = useSpring(rawY, spring.magnetic);

  const active = !reduced && isFine;

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!active) return;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      rawX.set((e.clientX - (rect.left + rect.width / 2)) * strength);
      rawY.set((e.clientY - (rect.top + rect.height / 2)) * strength);
    },
    [active, rawX, rawY, strength],
  );

  const onPointerLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return {
    ref,
    x: active ? x : undefined,
    y: active ? y : undefined,
    handlers: { onPointerMove, onPointerLeave },
  };
}
