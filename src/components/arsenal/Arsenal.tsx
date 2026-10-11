import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SKILLS, type Category } from '@/data/skills';
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
 * proficiency claim with no number attached to argue with, which is the same
 * thing a percentage bar does, just harder to pin down.
 *
 * A review only legend used to sit at the foot of this section, counting how
 * many pills you supplied against how many were inferred. It is gone with the
 * field that fed it; see the header of `src/data/skills.ts` for why.
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
    </Section>
  );
}
