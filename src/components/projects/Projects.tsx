import { lazy, Suspense, useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PROJECTS } from '@/data/projects';
import { Section } from '@/components/layout/Section';
import { SectionHeading } from '@/components/layout/SectionHeading';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { revealViewport, staggerGroup } from '@/lib/motion/variants';

/**
 * Stage 9: the detail panel is split out of the main bundle. It only ever
 * renders after a click, and the shared-layout morph is measured from the
 * card's live position at that moment — so a chunk arriving a frame late
 * changes nothing about where the animation starts from.
 */
const ProjectDetail = lazy(async () => ({
  default: (await import('@/components/projects/ProjectDetail')).ProjectDetail,
}));

/**
 * Mission Briefings.
 *
 * Two columns from `md`, one below it, and four cards of one size.
 *
 * THIS WAS A BENTO, AND THE BENTO WAS THE STRETCH. The feature tile stood two
 * rows tall beside a column of two stacked cards, so its height was whatever
 * those two came to: about 1060px against 720px of content, and the slack
 * went into a 340px hole between the screenshot and the tags. The fourth card
 * had no picture at all and sat 250px short of the one next to it. Neither
 * was fixable in the tile, because a grid row is as tall as its tallest cell
 * whatever the cell would have liked.
 *
 * The bento was also designed for a set of briefings where one had a
 * screenshot and three did not, and the one with the picture had to be the
 * big tile for the grid to balance at all. All four carry one now, so the
 * weighting has nothing left to say and every card can be the same shape.
 *
 * What makes the row heights agree is in the card: a fixed height stamp at
 * the top, then a capture clamped to 240px. Across the four briefings that
 * leaves about 50px between the tallest card in a row and the shortest, which
 * collects above the tag block where a card is expected to breathe.
 *
 * Which briefing is open is held here, not in the cards: the detail panel
 * morphs out of one specific card, so exactly one id can be open and the
 * cards must agree on which.
 */
export function Projects() {
  const [openId, setOpenId] = useState<string | null>(null);
  const close = useCallback(() => setOpenId(null), []);

  const open = openId ? (PROJECTS.find((p) => p.id === openId) ?? null) : null;

  return (
    <Section id="projects">
      <SectionHeading
        id="projects"
        title="Mission Briefings"
        lede="Three projects and one research effort. An AI study agent, an enterprise network redesign, detection that survives adversarial patches, and a pipeline that fails the build on a committed secret."
      />

      <motion.div
        variants={staggerGroup()}
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        className="mt-16 grid gap-4 sm:gap-5 md:grid-cols-2 lg:mt-24 lg:gap-6"
      >
        {PROJECTS.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            isOpen={project.id === openId}
            onOpen={setOpenId}
          />
        ))}
      </motion.div>

      <AnimatePresence>
        {open && (
          <Suspense fallback={null}>
            <ProjectDetail key={open.id} project={open} onClose={close} />
          </Suspense>
        )}
      </AnimatePresence>
    </Section>
  );
}
