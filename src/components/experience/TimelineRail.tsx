import { useEffect, useRef, useState } from 'react';
import { motion, useTransform, type MotionValue } from 'motion/react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/** Soft start, long tail — stops the rail ending in a hard stub. */
const RAIL_MASK =
  'linear-gradient(to bottom, transparent 0, #000 14px, #000 calc(100% - 64px), transparent 100%)';

/**
 * The connector, drawn by scroll.
 *
 * Three layers: a static hairline track that is always there so nothing about
 * the layout depends on scroll position, a mint progress line scaled from the
 * top, and a glowing head riding the end of it.
 *
 * **No spring on the progress value.** Lenis already smooths the scroll
 * position this reads from, so a spring on top would only add lag — and the
 * one case with no Lenis (reduced motion, where the provider mounts none) is
 * also the case where the line is simply drawn in full and never animates.
 *
 * The head is translated, not positioned: animating `top` in percent would
 * put a layout pass in the scroll path every frame. That needs a pixel
 * height, hence the ResizeObserver — the rail spans the whole list, so its
 * height changes whenever a card reflows.
 */
export function TimelineRail({ progress }: { progress: MotionValue<number> }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setHeight(entry.contentRect.height));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const headY = useTransform(progress, [0, 1], [0, height]);
  // Hidden before the draw starts and once it has run out, so there is never
  // a dot parked at either end of the rail.
  const headOpacity = useTransform(progress, [0, 0.03, 0.9, 1], [0, 1, 1, 0]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-[7px] w-px lg:left-1/2 lg:-translate-x-1/2"
      style={{ maskImage: RAIL_MASK, WebkitMaskImage: RAIL_MASK }}
    >
      <span className="absolute inset-0 bg-hairline-strong" />

      <motion.span
        className="absolute inset-0 bg-gradient-to-b from-mint-400 via-mint-500 to-mint-700"
        style={{ originY: 0, scaleY: reduced ? 1 : progress }}
      />

      {!reduced && (
        <motion.span
          style={{ y: headY, opacity: headOpacity }}
          className="absolute top-0 left-1/2 -ml-[3.5px] size-2 rounded-full bg-mint-300 shadow-glow-sm"
        />
      )}
    </div>
  );
}
