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
 * Bento rather than a uniform grid: from `lg` the layout is 4 columns × 2
 * rows, and the four projects fill it exactly — the feature tile takes 2×2,
 * the second takes a 2×1 strip beside it, and the last two take one cell
 * each. `md` collapses to two columns with the first two tiles full-width,
 * and below that it is a single column. The weights live in the data as
 * `span`, so re-ordering or re-weighting is a data edit.
 *
 * The rows are `minmax(17rem, auto)`, not `grid-rows-2`. Tailwind's
 * `grid-rows-2` is `repeat(2, minmax(0, 1fr))`, and a `1fr` row with a `0`
 * floor does not grow for content that overflows it — a standard tile with a
 * long title would spill straight out of its own frame, since the frame is
 * absolutely positioned to the tile and the content is in flow.
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
        className="mt-16 grid gap-4 sm:gap-5 md:grid-cols-2 lg:mt-24 lg:grid-cols-4 lg:grid-rows-[repeat(2,minmax(17rem,auto))]"
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
