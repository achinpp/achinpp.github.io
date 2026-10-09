import { motion } from 'motion/react';
import { BOOT_MS } from '@/hooks/useBootSequence';
import { duration, easeOutExpo, stagger } from '@/lib/motion/easings';

const LINES = [
  'POST ................ OK',
  'MOUNT /dev/identity .. OK',
  'VERIFY SIGNATURE ..... OK',
];

/**
 * First-visit boot sequence.
 *
 * Deliberately 1.5 seconds and dismissed by *any* input (see
 * useBootSequence). An intro animation is a toll booth between a visitor and
 * the thing they came for, so it has to be over before it becomes one — and
 * it never plays for reduced-motion visitors at all.
 *
 * `aria-hidden` with nothing focusable inside: the hero is already in the DOM
 * and readable behind it, so assistive tech should ignore this entirely
 * rather than announce three lines of fake POST output.
 */
export function BootOverlay() {
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: duration.base, ease: easeOutExpo }}
      className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-obsidian-950"
      style={{ zIndex: 'var(--z-overlay)' }}
    >
      <motion.ul
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: stagger.loose } } }}
        className="space-y-1 font-mono text-[0.6875rem] tracking-[0.18em] text-mint-600 uppercase sm:text-xs"
      >
        {LINES.map((line) => (
          <motion.li
            key={line}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            transition={{ duration: duration.instant }}
          >
            {line}
          </motion.li>
        ))}
      </motion.ul>

      {/* Progress runs the full BOOT_MS so the bar and the dismissal agree. */}
      <div className="h-px w-40 overflow-hidden bg-obsidian-800 sm:w-56">
        <motion.div
          className="h-full origin-left bg-mint-400"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: BOOT_MS / 1000, ease: 'linear' }}
        />
      </div>

      <p className="font-mono text-[0.5625rem] tracking-[0.25em] text-obsidian-600 uppercase">
        press any key to skip
      </p>
    </motion.div>
  );
}
