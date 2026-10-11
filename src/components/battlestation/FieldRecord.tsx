import { motion } from 'motion/react';
import { Camera } from 'lucide-react';
import type { Achievement } from '@/data/achievements';
import { fadeUp, revealViewport, staggerGroup } from '@/lib/motion/variants';

/**
 * A picture from an event, pinned under the badge wall.
 *
 * It lives in the badge column rather than in a section of its own, because
 * what it is for is evidence: the hexagon says `Finalist` and this is the
 * thing that happened. Two columns away it would be a gallery.
 *
 * The treatment is the same bargain the hero portrait makes. Desaturated and
 * dimmed at rest, because the one photograph on a page built from obsidian
 * and a single mint accent will otherwise read as a snapshot pasted over the
 * design; full colour on hover, which is when someone is looking closely
 * enough to want the detail.
 *
 * Renders nothing when no achievement carries an image, which is the state it
 * is in right now. See `ACHIEVEMENTS[0].image` for what is missing.
 */
export function FieldRecord({ achievements }: { achievements: Achievement[] }) {
  const withImages = achievements.filter((a) => a.image !== null);
  if (withImages.length === 0) return null;

  return (
    <motion.ul
      variants={staggerGroup()}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
      className="mt-12 grid gap-5 sm:grid-cols-2"
    >
      {withImages.map((achievement) => {
        const image = achievement.image;
        if (!image) return null;

        return (
          <motion.li key={achievement.id} variants={fadeUp}>
            <figure className="group relative overflow-hidden rounded-xl border border-hairline bg-obsidian-950 transition-colors duration-400 hover:border-mint-900">
              <img
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                loading="lazy"
                decoding="async"
                className="block w-full opacity-80 [filter:saturate(0.5)_contrast(1.05)] transition-all duration-500 ease-out-expo group-hover:opacity-100 group-hover:[filter:saturate(1)_contrast(1)]"
              />

              {/* The caption sits on the picture rather than under it, so the
                  panel stays one object instead of an image with a label
                  floating beneath it. */}
              <figcaption className="absolute inset-x-0 bottom-0 flex items-center gap-2.5 bg-[linear-gradient(to_top,oklch(0.105_0.012_265/0.92),transparent)] px-4 pt-10 pb-3.5 font-mono text-[0.5625rem] tracking-[0.2em] text-ink-muted uppercase">
                <Camera aria-hidden size={11} className="shrink-0 text-mint-600" />
                {achievement.event}
                {achievement.note && (
                  <span className="text-obsidian-500">· {achievement.note}</span>
                )}
              </figcaption>
            </figure>
          </motion.li>
        );
      })}
    </motion.ul>
  );
}
