import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CATEGORIES, SKILLS, type Category } from '@/data/skills';
import { Section } from '@/components/layout/Section';
import { SectionHeading } from '@/components/layout/SectionHeading';
import { FilterChips } from '@/components/arsenal/FilterChips';
import { SkillPill } from '@/components/arsenal/SkillPill';
import { stagger } from '@/lib/motion/easings';
import { revealViewport, staggerGroup } from '@/lib/motion/variants';

/** Stable drift seeds: position in the full list, not in the filtered one. */
const SEED = new Map(SKILLS.map((skill, i) => [skill.name, i]));

/**
 * Arsenal.
 *
 * `AnimatePresence mode="popLayout"` is what makes the filter feel like a
 * re-layout rather than a redraw: an exiting pill is taken out of flow
 * immediately (Framer absolutely positions it) so the pills that remain start
 * sliding to their new places on the same frame, instead of waiting for a
 * gap to finish collapsing. The container carries `layout` so its height
 * animates with them rather than snapping.
 *
 * Pills are all the same size. Varying them by implied strength would be a
 * proficiency claim with no number attached to argue with — which is the same
 * thing a percentage bar does, just harder to pin down.
 */
export function Arsenal() {
  const [active, setActive] = useState<Category | null>(null);

  const visible = active ? SKILLS.filter((skill) => skill.category === active) : SKILLS;

  return (
    <Section id="arsenal">
      <SectionHeading
        id="arsenal"
        title="Arsenal"
        lede="Offensive and defensive security, AppSec, AI systems, AWS, and the things built away from a keyboard. No proficiency bars, because a percentage is a guess with a number stuck on it."
      />

      <div className="mt-12 lg:mt-16">
        <FilterChips active={active} onChange={setActive} />
      </div>

      <motion.ul
        layout
        variants={staggerGroup(stagger.tight)}
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        className="mt-10 flex flex-wrap gap-2.5 sm:mt-12 sm:gap-3"
      >
        <AnimatePresence mode="popLayout">
          {visible.map((skill) => (
            <SkillPill key={skill.name} skill={skill} seed={SEED.get(skill.name) ?? 0} />
          ))}
        </AnimatePresence>
      </motion.ul>

      {/* The filter changes the list without moving focus, so a screen reader
          gets no indication anything happened. This is that indication. */}
      <p aria-live="polite" className="sr-only">
        {visible.length} of {SKILLS.length} skills shown
        {active ? `, filtered by ${active}` : ''}
      </p>

      {import.meta.env.DEV && <ProvenanceLegend />}
    </Section>
  );
}

/**
 * Review time only: which pills you supplied and which were inferred from
 * something else. Compiled out of production.
 *
 * Every pill is currently `stated`, so the second line does not render. The
 * legend stays because the moment anything is added that you did not list,
 * it should be visible during review rather than blending in.
 */
function ProvenanceLegend() {
  const derived = SKILLS.filter((skill) => skill.source === 'derived');

  return (
    <div className="mt-12 rounded-lg border border-signal-900 bg-signal-900/10 p-4">
      <p className="font-mono text-[0.5625rem] leading-relaxed tracking-[0.16em] text-signal-400 uppercase">
        ⚠ dev only: {SKILLS.length - derived.length} supplied by you · {derived.length} inferred ·{' '}
        {CATEGORIES.length} categories
      </p>
      {derived.length > 0 && (
        <p className="mt-2.5 font-mono text-[0.5625rem] leading-relaxed tracking-[0.1em] text-signal-400/70">
          inferred: {derived.map((skill) => skill.name).join(' · ')}
        </p>
      )}
    </div>
  );
}
