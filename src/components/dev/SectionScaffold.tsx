import { motion } from 'motion/react';
import { SECTIONS } from '@/data/sections';
import { fadeUp, maskReveal, maskRevealGroup, revealViewport } from '@/lib/motion/variants';

/**
 * Sections that have shipped and no longer need a placeholder. Each stage
 * adds its own id here; the file is deleted once the list is complete.
 */
const BUILT = new Set(['hero', 'experience', 'projects', 'battlestation']);

/** Which stage replaces each remaining placeholder. */
const FILLED_BY: Record<string, string> = {
  arsenal: 'STAGE 6 — Arsenal (tech stack)',
  contact: 'STAGE 7 — Secure Channel (contact + footer)',
};

/**
 * Placeholder anchors for the sections that don't exist yet, so the shell has
 * something real to navigate. The nav indicator, the active-section detection
 * band and the HUD readout can't be judged against a single blank page.
 *
 * Stages 2 to 5 replaced `hero`, `experience`, `projects` and `battlestation`
 * with the real sections. Each remaining section drops off this list as its
 * own stage lands.
 *
 * Each section is replaced wholesale by its own stage; this file is deleted
 * once Stage 7 lands.
 */
export function SectionScaffold() {
  return (
    <>
      {SECTIONS.filter((s) => !BUILT.has(s.id)).map((section) => (
        <section
          key={section.id}
          id={section.id}
          // min-h-svh matters: useActiveSection needs each section to cross
          // the middle of the viewport to ever become active.
          className="relative flex min-h-svh flex-col justify-center border-b border-hairline px-5 py-28 sm:px-10"
        >
          <motion.div
            variants={maskRevealGroup()}
            initial="hidden"
            whileInView="visible"
            viewport={revealViewport}
            className="mx-auto w-full max-w-6xl"
          >
            <span className="mask-line">
              <motion.span
                variants={maskReveal}
                className="block font-mono text-label text-mint-600"
              >
                {section.index} / {section.codename}
              </motion.span>
            </span>

            <h2 className="mt-4">
              <span className="mask-line">
                <motion.span
                  variants={maskReveal}
                  className="block text-gradient-ink text-display-xl"
                >
                  {section.label}
                </motion.span>
              </span>
            </h2>

            <motion.p
              variants={fadeUp}
              className="mt-8 font-mono text-[0.6875rem] tracking-[0.14em] text-ink-faint uppercase"
            >
              Placeholder · {FILLED_BY[section.id]}
            </motion.p>

            {/* A couple of interactive targets, so the cursor ring and the
                focus ring have something to react to on every section. */}
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                className="pane px-4 py-2.5 font-mono text-label text-mint-300 uppercase transition-all duration-200 ease-out-expo hover:border-mint-800 hover:shadow-glow-sm"
              >
                Interactive target
              </button>
              <button
                type="button"
                className="rounded-xl border border-hairline px-4 py-2.5 font-mono text-label text-ink-faint uppercase transition-colors duration-200 hover:text-ink"
              >
                Secondary
              </button>
            </motion.div>
          </motion.div>
        </section>
      ))}
    </>
  );
}
