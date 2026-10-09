import { motion } from 'motion/react';
import { ACHIEVEMENTS, BADGE_SLOTS } from '@/data/achievements';
import { Section } from '@/components/layout/Section';
import { SectionHeading } from '@/components/layout/SectionHeading';
import { AchievementBadge, LockedSlot } from '@/components/battlestation/AchievementBadge';
import { ContributionStrip } from '@/components/battlestation/ContributionStrip';
import { StatGrid } from '@/components/battlestation/StatGrid';
import { stagger } from '@/lib/motion/easings';
import { revealViewport, staggerGroup } from '@/lib/motion/variants';

/**
 * Battle Station.
 *
 * The badge wall and the counters share a row rather than the badge wall
 * sitting next to a one-entry "milestone timeline" as the plan had it. With a
 * single confirmed achievement a timeline is a line with one dot on it, which
 * looks broken; the counters put something substantial beside the wall and
 * the date lives under its own badge instead. Add more achievements and this
 * is still the right shape.
 *
 * Empty frames beyond `ACHIEVEMENTS.length` are locked slots. See the header
 * of `src/data/achievements.ts` for why they are empty rather than invented.
 */
export function BattleStation() {
  const lockedCount = Math.max(0, BADGE_SLOTS - ACHIEVEMENTS.length);

  return (
    <Section id="battlestation">
      <SectionHeading
        id="battlestation"
        title="Battle Station"
        lede="Competition record and open-source footprint. Unfilled frames are slots, not omissions."
      />

      <div className="mt-16 grid gap-x-10 gap-y-14 lg:mt-24 lg:grid-cols-12">
        {/* ------------------------------------------------- badge wall */}
        <motion.ul
          variants={staggerGroup(stagger.loose)}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          className="flex flex-wrap items-start gap-x-8 gap-y-11 lg:col-span-7"
        >
          {ACHIEVEMENTS.map((achievement, i) => (
            <AchievementBadge key={achievement.id} achievement={achievement} hero={i === 0} />
          ))}
          {Array.from({ length: lockedCount }, (_, i) => (
            <LockedSlot key={i} index={ACHIEVEMENTS.length + i + 1} />
          ))}
        </motion.ul>

        {/* ---------------------------------------------------- counters */}
        <div className="lg:col-span-5 lg:self-start">
          <StatGrid />
        </div>

        {/* ------------------------------------------- open-source strip */}
        <motion.div
          variants={staggerGroup()}
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          className="lg:col-span-12"
        >
          <ContributionStrip />
        </motion.div>
      </div>
    </Section>
  );
}
