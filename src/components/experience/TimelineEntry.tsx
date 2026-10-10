import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import type { ExperienceEntry } from '@/data/experience';
import { Tag } from '@/components/ui/Tag';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { duration, easeOutExpo, stagger } from '@/lib/motion/easings';
import { fadeUp, maskReveal, revealViewport, staggerGroup } from '@/lib/motion/variants';

/**
 * Arms when the entry crosses the middle 40% of the viewport, which is
 * roughly where the rail's drawing head reaches it. A tighter band than this
 * risks never firing on a short viewport, since the band has to be crossed by
 * the element to intersect at all.
 */
const ARM_VIEWPORT = { once: true, margin: '-30% 0px -30% 0px' } as const;

/**
 * The marker on the rail. `-left-px` centres the 16px node over the rail at
 * `left-[7px]`; from `lg` the rail moves to the middle of the row and the node
 * centres on that instead.
 */
function Node({ armed }: { armed: boolean }) {
  const reduced = useReducedMotion();

  return (
    <span aria-hidden className="absolute top-[1.1rem] -left-px lg:left-1/2 lg:-translate-x-1/2">
      <span className="relative block size-4">
        {/* One-shot ring on arming. A permanent pulse on every node turns the
            rail into a string of blinking lights; this fires once and stops.
            Gated on `reduced` rather than left to <MotionConfig>, which would
            drop the scale and animate only the opacity — a ring fading in
            place with no expansion is a glitch, not a restrained version. */}
        {armed && !reduced && (
          <motion.span
            initial={{ scale: 0.6, opacity: 0.55 }}
            animate={{ scale: 2.4, opacity: 0 }}
            transition={{ duration: 0.9, ease: easeOutExpo }}
            className="absolute inset-0 rounded-full border border-mint-400"
          />
        )}

        <span
          className={`absolute inset-0 rounded-full border transition-all duration-500 ease-out-expo ${
            armed
              ? 'border-mint-400 bg-mint-950 shadow-glow-xs'
              : 'border-obsidian-600 bg-obsidian-900'
          }`}
        />
        <span
          className={`absolute inset-[0.3125rem] rounded-full transition-colors duration-500 ease-out-expo ${
            armed ? 'bg-mint-400' : 'bg-obsidian-600'
          }`}
        />
      </span>
    </span>
  );
}

export function TimelineEntry({ entry, index }: { entry: ExperienceEntry; index: number }) {
  const ref = useRef<HTMLLIElement>(null);
  const armed = useInView(ref, ARM_VIEWPORT);

  /** Alternating sides from `lg` up; a single left rail below it. */
  const onRight = index % 2 === 1;

  return (
    <li ref={ref} className="relative">
      <Node armed={armed} />

      {/* Spur from the rail to the card edge. */}
      <span
        aria-hidden
        className={`absolute top-[1.6rem] left-[7px] h-px w-[2.4rem] bg-hairline lg:w-12 ${
          onRight ? 'lg:left-1/2' : 'lg:right-1/2 lg:left-auto'
        }`}
      />

      <motion.article
        variants={staggerGroup(stagger.tight)}
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        className={`group relative ml-11 overflow-hidden pane px-5 py-5 transition-all duration-400 ease-out-expo hover:-translate-y-0.5 hover:border-mint-900 hover:shadow-glow-sm sm:px-7 sm:py-6 lg:ml-0 lg:w-[calc(50%-3rem)] ${
          onRight ? 'lg:ml-auto' : ''
        }`}
      >
        {/* Top edge lights up on hover — the card's only hover decoration.
            The mouse-tracking glow border is Stage 4's signature; borrowing it
            here would spend it early. */}
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-mint-400/50 to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100"
        />

        <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <Tag tone="accent">{entry.tag}</Tag>
          {entry.period ? (
            <span className="font-mono text-[0.625rem] tracking-[0.16em] text-ink-faint uppercase">
              {entry.period}
            </span>
          ) : (
            /* Honest blank. See the header of src/data/experience.ts. */
            <span className="font-mono text-[0.625rem] tracking-[0.16em] text-obsidian-500 uppercase">
              [ dates tbc ]
            </span>
          )}
        </motion.div>

        <h3 className="mt-4">
          <span className="mask-line">
            <motion.span
              variants={maskReveal}
              className="block text-display-md text-ink"
              transition={{ duration: duration.reveal, ease: easeOutExpo }}
            >
              {entry.role}
            </motion.span>
          </span>
        </h3>

        <motion.p
          variants={fadeUp}
          className="mt-2 font-mono text-[0.75rem] tracking-[0.06em] text-mint-500"
        >
          {entry.org}
          {entry.orgNote && <span className="text-mint-700"> · {entry.orgNote}</span>}
          <span className="text-obsidian-500"> · {entry.location}</span>
        </motion.p>

        <motion.div variants={fadeUp} className="mt-5 h-px bg-hairline" />

        <motion.ul variants={fadeUp} className="mt-5 space-y-2.5">
          {entry.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-2.5 text-sm leading-relaxed text-ink-muted">
              <ChevronRight
                aria-hidden
                size={14}
                className="mt-1 shrink-0 text-mint-700 transition-colors duration-400 group-hover:text-mint-500"
              />
              <span>{bullet}</span>
            </li>
          ))}
        </motion.ul>

        {/* Review-time marker only. `import.meta.env.DEV` is statically false
            in a production build, so this whole branch is dropped from the
            bundle — it exists so draft copy can't be mistaken for confirmed
            content while the stage is being reviewed. */}
        {import.meta.env.DEV && entry.draftBullets && (
          <p className="mt-4 font-mono text-[0.5625rem] tracking-[0.18em] text-signal-400 uppercase">
            ⚠ draft copy: dev only, not supplied content
          </p>
        )}
      </motion.article>
    </li>
  );
}
