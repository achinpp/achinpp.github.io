import { useEffect, useState } from 'react';
import { motion, useSpring } from 'motion/react';
import { usePointer } from '@/hooks/usePointer';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { duration, easeOutExpo } from '@/lib/motion/easings';

/** Anything that should widen the ring. `[data-cursor]` is the manual opt-in. */
const INTERACTIVE = 'a, button, input, textarea, select, summary, [data-cursor]';

const DOT = 6;
const RING = 34;

/**
 * Dot + lagging ring.
 *
 * The dot tracks the pointer with no smoothing — it *is* the cursor, and any
 * lag there makes the whole page feel broken. The ring runs on a soft spring
 * and trails behind, which is where the character comes from.
 *
 * Gated on a fine pointer and on motion being enabled, and it hides the
 * native cursor (via `data-cursor="custom"`, see globals.css) only while it is
 * mounted. So a touch device, or anyone with reduced motion on, keeps their
 * ordinary cursor and loses nothing.
 */
export function CustomCursor() {
  const reduced = useReducedMotion();
  const { x, y, isFine } = usePointer();

  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);

  const enabled = isFine && !reduced;

  const ringX = useSpring(x, { stiffness: 280, damping: 26, mass: 0.5 });
  const ringY = useSpring(y, { stiffness: 280, damping: 26, mass: 0.5 });

  // Hide the native cursor only while this component is alive, so unmounting
  // can never leave the page with no cursor at all.
  useEffect(() => {
    if (!enabled) return;
    document.documentElement.dataset.cursor = 'custom';
    return () => {
      delete document.documentElement.dataset.cursor;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    const onOver = (e: PointerEvent) => {
      const target = e.target as Element | null;
      setHovering(Boolean(target?.closest?.(INTERACTIVE)));
      setVisible(true);
    };

    const onOut = (e: PointerEvent) => {
      // relatedTarget is null only when the pointer left the window entirely.
      if (e.relatedTarget === null) setVisible(false);
    };

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    // A dragged-away or alt-tabbed window would otherwise keep the ring
    // stuck in its pressed state.
    const onBlur = () => {
      setPressed(false);
      setVisible(false);
    };

    document.addEventListener('pointerover', onOver);
    document.addEventListener('pointerout', onOut);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('blur', onBlur);

    return () => {
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [enabled]);

  if (!enabled) return null;

  const ringScale = pressed ? 0.82 : hovering ? 1.75 : 1;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 'var(--z-cursor)' }}
    >
      {/* Ring — trails, and opens up over anything interactive. */}
      <motion.div
        className="absolute rounded-full border"
        style={{
          x: ringX,
          y: ringY,
          left: -RING / 2,
          top: -RING / 2,
          width: RING,
          height: RING,
        }}
        animate={{
          scale: ringScale,
          opacity: visible ? 1 : 0,
          borderColor: hovering ? 'var(--color-mint-400)' : 'var(--color-obsidian-500)',
          backgroundColor: hovering ? 'oklch(0.888 0.145 168 / 0.08)' : 'transparent',
        }}
        transition={{ duration: duration.fast, ease: easeOutExpo }}
      />

      {/* Dot — unsmoothed, straight off the pointer MotionValues. */}
      <motion.div
        className="absolute rounded-full bg-mint-200"
        style={{ x, y, left: -DOT / 2, top: -DOT / 2, width: DOT, height: DOT }}
        animate={{ opacity: visible && !hovering ? 1 : 0, scale: hovering ? 0.4 : 1 }}
        transition={{ duration: duration.instant }}
      />
    </div>
  );
}
