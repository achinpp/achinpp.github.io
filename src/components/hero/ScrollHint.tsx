import { motion, useScroll, useTransform } from 'motion/react';
import { ChevronDown } from 'lucide-react';

/**
 * "There's more below." Fades out over the first 40% of a viewport of scroll,
 * because a hint that's still visible after you've taken the hint is noise.
 *
 * Sits above the 28px HUD strip — `bottom-12` clears it on every breakpoint.
 */
export function ScrollHint() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 220], [1, 0]);

  return (
    <motion.div
      aria-hidden
      style={{ opacity }}
      className="pointer-events-none absolute inset-x-0 bottom-12 flex flex-col items-center gap-1.5 text-ink-faint"
    >
      <span className="font-mono text-[0.5625rem] tracking-[0.3em] uppercase">scroll</span>
      <ChevronDown size={14} className="text-mint-500 motion-ok:animate-hint" />
    </motion.div>
  );
}
