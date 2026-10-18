import { motion } from 'motion/react';
import { Camera } from 'lucide-react';
import { OUTREACH } from '@/data/outreach';
import { duration, easeOutExpo } from '@/lib/motion/easings';
import { fadeUp, revealViewport, staggerGroup } from '@/lib/motion/variants';

/**
 * Volunteering, under the timeline.
 *
 * It is here and not in a section of its own for two reasons. A seventh nav
 * entry for four photographs would promise a destination and deliver a
 * gallery. And these four are what the roles above actually did on the day:
 * the IoT Club entry ran the workshop, the dev team entry built the platform.
 * Directly under the rail they read as evidence for the list they follow.
 *
 * **The photographs are desaturated at rest and full colour on hover**, the
 * same bargain the hero portrait makes. Four snapshots at full saturation on
 * a page built from obsidian and one mint accent read as a contact sheet
 * pasted over the design. Colour on hover is for the moment someone is
 * looking closely enough to want it.
 *
 * **Every card is 4:3 and the crop is baked into the asset**, not done here
 * with `object-cover`. Three of the four sources are tall phone portraits, so
 * doing it in CSS would ship most of a megabyte of pixels the page never
 * draws. See `scripts/process-media.py`.
 */
export function Outreach() {
  return (
    <section aria-labelledby="outreach-heading" className="mt-24 lg:mt-32">
      <div className="flex items-center gap-4">
        <Camera aria-hidden size={13} className="shrink-0 text-mint-600" />
        <h3
          id="outreach-heading"
          className="font-mono text-label whitespace-nowrap text-ink uppercase"
        >
          In the field
        </h3>
        <motion.span
          aria-hidden
          variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1 } }}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          transition={{ duration: duration.cinematic, ease: easeOutExpo }}
          style={{ originX: 0 }}
          className="h-px flex-1 bg-gradient-to-r from-hairline-strong to-transparent"
        />
      </div>

      <motion.ul
        variants={staggerGroup()}
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        className="mt-9 grid gap-5 sm:grid-cols-2"
      >
        {OUTREACH.map((entry) => (
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
                <h4 className="font-mono text-[0.8125rem] tracking-[0.08em] text-ink">
                  {entry.title}
                </h4>
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
    </section>
  );
}
