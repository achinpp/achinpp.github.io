import { motion } from 'motion/react';
import { VOLUNTEERING } from '@/data/volunteering';
import { Section } from '@/components/layout/Section';
import { SectionHeading } from '@/components/layout/SectionHeading';
import { fadeUp, revealViewport, staggerGroup } from '@/lib/motion/variants';

/**
 * Volunteering.
 *
 * This started as a block under the experience timeline, on the argument that
 * four photographs were evidence for the roles above them rather than a
 * destination of their own. You asked for it to be a section, below the
 * Arsenal, and that is the stronger call: volunteering that has to be
 * scrolled past on the way to something else is volunteering nobody counted.
 * It has a nav entry and a palette entry now, both of which it gets for free
 * from `src/data/sections.ts`.
 *
 * **The photographs are desaturated and dimmed at rest, full colour on
 * hover**, the same bargain the hero portrait makes. Four snapshots at full
 * strength on a page built from obsidian and one mint accent read as a
 * contact sheet pasted over the design. Colour on hover is for the moment
 * someone is looking closely enough to want it.
 *
 * **Every card is 4:3 and the crop is baked into the asset**, not done here
 * with `object-cover`. Three of the four sources are tall phone portraits, so
 * doing it in CSS would ship most of a megabyte of pixels the page never
 * draws. See `scripts/process-media.py`.
 */
export function Volunteering() {
  return (
    <Section id="volunteering">
      <SectionHeading
        id="volunteering"
        title="Volunteering"
        lede="Workshops, lectures and exhibitions: taking the work into rooms full of people who have not met it yet."
      />

      <motion.ul
        variants={staggerGroup()}
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        className="mt-16 grid gap-5 sm:grid-cols-2 lg:mt-24"
      >
        {VOLUNTEERING.map((entry) => (
          <motion.li key={entry.id} variants={fadeUp} className="h-full">
            <figure className="group flex h-full flex-col overflow-hidden rounded-xl border border-hairline bg-obsidian-900/40 transition-all duration-400 ease-out-expo hover:-translate-y-0.5 hover:border-mint-900 hover:shadow-glow-sm">
              <img
                src={entry.image.src}
                alt={entry.image.alt}
                width={entry.image.width}
                height={entry.image.height}
                loading="lazy"
                decoding="async"
                className="block w-full opacity-70 [filter:saturate(0.4)_contrast(1.06)_brightness(0.86)] transition-all duration-500 ease-out-expo group-hover:opacity-100 group-hover:[filter:saturate(1)_contrast(1)_brightness(1)]"
              />

              <figcaption className="flex flex-1 flex-col border-t border-hairline px-5 py-5">
                <h3 className="font-mono text-[0.8125rem] tracking-[0.08em] text-ink">
                  {entry.title}
                </h3>
                <p className="mt-2 font-mono text-[0.625rem] tracking-[0.16em] text-mint-600 uppercase">
                  {entry.where}
                </p>
                {entry.note && (
                  <p className="mt-3.5 text-sm leading-relaxed text-ink-muted">{entry.note}</p>
                )}
              </figcaption>
            </figure>
          </motion.li>
        ))}
      </motion.ul>
    </Section>
  );
}
