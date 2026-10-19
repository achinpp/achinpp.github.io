import { motion } from 'motion/react';
import { Camera } from 'lucide-react';
import type { Achievement } from '@/data/achievements';
import { fadeUp, revealViewport, staggerGroup } from '@/lib/motion/variants';

/**
 * Photographs from an event, pinned under the badge wall.
 *
 * They live in the badge column rather than in a section of their own,
 * because what they are for is evidence: the hexagon says `Finalist` and this
 * is the thing that happened. Two columns away it would be a gallery.
 *
 * **The line above the pictures carries what the badge cannot.** A hexagon is
 * 128px wide and the note under it has to survive at that width, so anything
 * longer than about three words goes here instead. For Red Cypher that is the
 * size of the field the finals were drawn from, which is the part of the
 * result that actually means something.
 *
 * **The credit line is not decoration.** These are the organiser's official
 * photographs, with REF Media branding bars burnt into the source. The bars
 * come off in `scripts/process-media.py`, because a white logo strip on an
 * obsidian page is a slab of daylight, and the credit they carried moves here
 * at a size somebody can actually read.
 *
 * **Only photographs live here.** The finals scoreboard was in this list for
 * one stage, at the same weight as the two pictures of the day. It is behind
 * the hexagon now, which is a better place for a receipt: see
 * `<BadgeReveal>`. What is left is one shape, two to a row, which is what
 * made the pair read as a wall rather than as two unrelated pictures.
 *
 * The treatment is the same bargain the hero portrait makes. Desaturated and
 * dimmed at rest, because photographs on a page built from obsidian and a
 * single mint accent otherwise read as snapshots pasted over the design; full
 * colour on hover, which is when someone is looking closely enough to want
 * the detail.
 *
 * Renders nothing for an achievement with no photographs, and nothing at all
 * when none of them have any.
 */
export function FieldRecord({ achievements }: { achievements: Achievement[] }) {
  const withImages = achievements.filter((a) => a.images.length > 0);
  if (withImages.length === 0) return null;

  return (
    <div className="mt-12 space-y-12">
      {withImages.map((achievement) => (
        <Record key={achievement.id} achievement={achievement} />
      ))}
    </div>
  );
}

/** One event's photographs. */
function Record({ achievement }: { achievement: Achievement }) {
  return (
    <motion.section
      variants={staggerGroup()}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
      aria-label={`Photographs from ${achievement.event}`}
    >
      {achievement.fieldNote && (
        <motion.p
          variants={fadeUp}
          className="mb-5 flex items-start gap-3 text-[0.8125rem] leading-relaxed text-ink-muted"
        >
          <Camera aria-hidden size={13} className="mt-1 shrink-0 text-mint-600" />
          {achievement.fieldNote}
        </motion.p>
      )}

      <ul className="grid gap-5 sm:grid-cols-2">
        {achievement.images.map((image) => (
          <motion.li key={image.src} variants={fadeUp}>
            <figure className="group relative overflow-hidden rounded-xl border border-hairline bg-obsidian-950 transition-colors duration-400 hover:border-mint-900">
              <img
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                loading="lazy"
                decoding="async"
                className="block w-full opacity-70 [filter:saturate(0.4)_contrast(1.06)_brightness(0.86)] transition-all duration-500 ease-out-expo group-hover:opacity-100 group-hover:[filter:saturate(1)_contrast(1)_brightness(1)]"
              />

              {/* The caption sits on the picture rather than under it, so the
                  panel stays one object instead of an image with a label
                  floating beneath it. */}
              <figcaption className="absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,oklch(0.105_0.012_265/0.92),transparent)] px-4 pt-10 pb-3.5 font-mono text-[0.5625rem] tracking-[0.2em] text-ink-muted uppercase">
                {image.caption}
              </figcaption>
            </figure>
          </motion.li>
        ))}
      </ul>

      {achievement.imageCredit && (
        <motion.p
          variants={fadeUp}
          className="mt-3.5 font-mono text-[0.5625rem] leading-relaxed tracking-[0.16em] text-obsidian-500 uppercase"
        >
          Photographs: {achievement.imageCredit}
        </motion.p>
      )}
    </motion.section>
  );
}
