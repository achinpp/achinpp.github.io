import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useMotionValue } from 'motion/react';
import { PointerContext, type PointerState } from './pointer-context';

const FINE_POINTER_QUERY = '(hover: hover) and (pointer: fine)';

/** Off-screen until the first real move, so nothing starts out lit. */
const OFFSCREEN = -9999;

/**
 * One pointer listener for the whole site.
 *
 * The backdrop canvas, the spotlight glow and the custom cursor all need the
 * cursor position. Three components each attaching their own `pointermove`
 * handler means three callbacks per mouse event — and mouse events fire
 * faster than frames. This publishes the position two ways instead:
 *
 *   - MotionValues (`x`, `y`) for anything Framer Motion drives, which
 *     bypasses React's render cycle entirely
 *   - `posRef` for rAF loops that shouldn't even touch a MotionValue
 *
 * Neither path causes a re-render, so the provider can sit at the root.
 */
export function PointerProvider({ children }: { children: ReactNode }) {
  const x = useMotionValue(OFFSCREEN);
  const y = useMotionValue(OFFSCREEN);
  const posRef = useRef({ x: OFFSCREEN, y: OFFSCREEN, inside: false });

  const [isFine, setIsFine] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(FINE_POINTER_QUERY).matches,
  );

  // A tablet with a trackpad attached mid-session flips this.
  useEffect(() => {
    const mql = window.matchMedia(FINE_POINTER_QUERY);
    const onChange = (e: MediaQueryListEvent) => setIsFine(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!isFine) return;

    const onMove = (e: PointerEvent) => {
      // Ignore touch/pen even on a fine-pointer device.
      if (e.pointerType !== 'mouse') return;
      x.set(e.clientX);
      y.set(e.clientY);
      posRef.current.x = e.clientX;
      posRef.current.y = e.clientY;
      posRef.current.inside = true;
    };

    const onLeave = (e: PointerEvent) => {
      // relatedTarget is null when the pointer actually left the window,
      // rather than just crossing into a child element.
      if (e.relatedTarget === null) posRef.current.inside = false;
    };

    const onEnter = () => {
      posRef.current.inside = true;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerout', onLeave);
    document.addEventListener('pointerover', onEnter);

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerout', onLeave);
      document.removeEventListener('pointerover', onEnter);
    };
  }, [isFine, x, y]);

  const value = useMemo<PointerState>(() => ({ x, y, posRef, isFine }), [x, y, isFine]);

  return <PointerContext.Provider value={value}>{children}</PointerContext.Provider>;
}
