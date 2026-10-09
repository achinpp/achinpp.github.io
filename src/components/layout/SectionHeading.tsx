import { motion } from 'motion/react';
import { getSection } from '@/data/sections';
import { duration, easeOutExpo } from '@/lib/motion/easings';
import { fadeUp, maskReveal, maskRevealGroup, revealViewport } from '@/lib/motion/variants';

type Props = {
  /** Section id — the index and codename are read from `sections.ts`. */
  id: string;
  /** Display headline. Defaults to the section's nav label. */
  title?: string;
  /** One or two lines under the headline. Optional. */
  lede?: string;
};

/** The rule that extends out of the eyebrow. Draws left to right. */
const rule = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: duration.cinematic, ease: easeOutExpo } },
};

/**
 * Every section opens the same way: a mono `index / CODENAME` eyebrow with a
 * rule running off to the right, then the headline on a mask reveal.
 *
 * The eyebrow is `aria-hidden`. `01 / SERVICE RECORD` is in-fiction dressing —
 * read aloud before the real heading it is noise, and the `<h2>` already names
 * the section.
 */
export function SectionHeading({ id, title, lede }: Props) {
  const section = getSection(id);
  if (!section) return null;

  return (
    <motion.header
      variants={maskRevealGroup()}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
    >
      <div aria-hidden className="flex items-center gap-4">
        <span className="mask-line">
          <motion.span
            variants={maskReveal}
            className="block font-mono text-label whitespace-nowrap text-mint-600"
          >
            {section.index} / {section.codename}
          </motion.span>
        </span>
        <motion.span
          variants={rule}
          style={{ originX: 0 }}
          className="h-px flex-1 bg-gradient-to-r from-hairline-strong to-transparent"
        />
      </div>

      <h2 className="mt-5">
        <span className="mask-line">
          <motion.span variants={maskReveal} className="block text-gradient-ink text-display-lg">
            {title ?? section.label}
          </motion.span>
        </span>
      </h2>

      {lede && (
        <motion.p
          variants={fadeUp}
          className="mt-6 max-w-lg text-sm leading-relaxed text-ink-muted"
        >
          {lede}
        </motion.p>
      )}
    </motion.header>
  );
}
