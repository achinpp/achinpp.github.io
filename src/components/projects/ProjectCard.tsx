import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import type { Project, ProjectSpan, ProjectStatus } from '@/data/projects';
import { Tag, type TagTone } from '@/components/ui/Tag';
import { useCardPointer } from '@/hooks/useCardPointer';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { duration, easeOutExpo, spring } from '@/lib/motion/easings';
import { fadeUp } from '@/lib/motion/variants';

/**
 * Note on the reveal: these use `fadeUp`, not `scaleIn`. A layout animation
 * measures against its ancestors, and Framer cannot measure correctly through
 * an ancestor that is mid-`scale` — so a click during the entrance stagger
 * would morph from the wrong rectangle. Opacity and translate are safe.
 */

/** Bento weight → grid spans. 4 columns × 2 rows from `lg`. */
const SPAN: Record<ProjectSpan, string> = {
  feature: 'md:col-span-2 lg:col-span-2 lg:row-span-2',
  wide: 'md:col-span-2 lg:col-span-2',
  standard: '',
};

const STATUS_TONE: Record<ProjectStatus, TagTone> = {
  ACTIVE: 'signal',
  DEPLOYED: 'accent',
  DELIVERED: 'accent',
  ARCHIVED: 'neutral',
};

/**
 * The tracked border. Sits one pixel outside the frame, and the frame's
 * background is clipped to its padding box — so this gradient is what you see
 * through the 1px border, rather than a halo sitting behind an opaque edge.
 */
const BORDER_GLOW =
  'radial-gradient(240px circle at var(--mx) var(--my), oklch(0.888 0.145 168 / 0.95), oklch(0.888 0.145 168 / 0.3) 36%, transparent 70%)';

/** The inner highlight — the same centre, far weaker, spread wider. */
const INNER_GLOW =
  'radial-gradient(420px circle at var(--mx) var(--my), oklch(0.888 0.145 168 / 0.08), transparent 70%)';

type Props = {
  project: Project;
  /** True while this card's briefing is expanded. */
  isOpen: boolean;
  onOpen: (id: string) => void;
};

export function ProjectCard({ project, isOpen, onOpen }: Props) {
  const reduced = useReducedMotion();
  const { ref, enabled, rotateX, rotateY, handlers } = useCardPointer();

  const isFeature = project.span === 'feature';
  const shownStack = isFeature ? project.stack : project.stack.slice(0, 3);
  const hiddenStack = project.stack.length - shownStack.length;

  return (
    <motion.article
      ref={ref}
      {...handlers}
      variants={fadeUp}
      className={`group relative ${SPAN[project.span]}`}
      style={
        {
          // The tilt needs a perspective on a non-transformed ancestor.
          perspective: enabled ? '1400px' : undefined,
          // Defaults so the gradient is valid before the first pointer move.
          // React won't rewrite these on re-render (the prop value never
          // changes), so the imperative writes in useCardPointer survive.
          '--mx': '50%',
          '--my': '50%',
        } as CSSProperties
      }
    >
      <motion.div style={{ rotateX, rotateY }} className="relative h-full">
        {enabled && (
          <span
            aria-hidden
            style={{ background: BORDER_GLOW }}
            className="pointer-events-none absolute -inset-px rounded-[1.0625rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}

        {/* The frame, and the only thing that morphs into the detail panel.
            Content is deliberately NOT inside it — a layout animation scales
            its subtree, which would squash and stretch every line of text on
            the way across. */}
        <motion.span
          aria-hidden
          layoutId={reduced ? undefined : `briefing-${project.id}`}
          transition={spring.morph}
          style={{ borderRadius: 'var(--radius-xl)', backgroundClip: 'padding-box' }}
          // The border brighten is plain CSS, so the card still has a hover
          // affordance where the tracked glow is switched off — touch, coarse
          // pointers and reduced motion.
          className="absolute inset-0 border border-hairline bg-surface shadow-elev-2 transition-colors duration-300 group-hover:border-mint-900"
        />

        {enabled && (
          <span
            aria-hidden
            style={{ background: INNER_GLOW, borderRadius: 'var(--radius-xl)' }}
            className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        {/* ------------------------------------------------------- content */}
        <motion.div
          animate={{ opacity: isOpen ? 0 : 1 }}
          transition={{ duration: duration.fast, ease: easeOutExpo }}
          className="relative flex h-full flex-col p-5 sm:p-6"
        >
          <header className="flex items-start justify-between gap-3">
            {/* The classification stamp carries the kind under the index, on
                its own line, on every card.

                Both on one line is what this was first, and the two narrow
                bento tiles are 235px of inner width against a stamp of 180px
                and a status chip of 60px, so `// BRIEFING_03 · RESEARCH`
                wrapped mid stamp and read as a bug. Two deliberate lines read
                as a stamp. A second chip beside the status was the other
                option and it is worse: `PROJECT` says nothing on three cards
                out of four, where down here it is quiet enough to ignore
                until the one that says `RESEARCH` catches the eye. */}
            <span className="flex flex-col gap-1 font-mono text-[0.5625rem] tracking-[0.2em] uppercase">
              <span className="text-obsidian-500 transition-colors duration-300 group-hover:text-mint-700">
                // {project.index}
              </span>
              <span className={project.kind === 'RESEARCH' ? 'text-mint-600' : 'text-obsidian-600'}>
                {project.kind}
              </span>
            </span>
            <Tag tone={STATUS_TONE[project.status]}>{project.status}</Tag>
          </header>

          <h3
            className={`mt-6 text-ink ${isFeature ? 'text-display-md' : 'text-[1.3125rem] leading-[1.15] font-semibold tracking-[-0.02em]'}`}
          >
            {project.title}
          </h3>

          <p
            className={`mt-3 text-ink-muted ${isFeature ? 'max-w-md text-[0.9375rem] leading-relaxed' : 'text-[0.8125rem] leading-relaxed'}`}
          >
            {project.tagline}
          </p>

          {/* The feature tile has the room to show what it actually does. */}
          {isFeature && (
            <ul className="mt-7 space-y-2">
              {project.capabilities.map((item) => (
                <li
                  key={item}
                  className="flex items-baseline gap-2.5 font-mono text-[0.6875rem] tracking-[0.04em] text-ink-faint"
                >
                  <span aria-hidden className="text-mint-700">
                    ▸
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          )}

          {/* ----------------------------------------------- the capture
              Natural aspect ratio, no crop. A fixed band with `object-cover`
              was the first attempt and it is wrong for these two in
              particular: the Packet Tracer topology runs edge to edge, so any
              crop takes a router off the end of it, and a diagram missing its
              ISP link is not a smaller diagram but a wrong one.

              It sits here, directly under the copy, and NOT in the `mt-auto`
              block below. In the bottom block it was pushed to the foot of a
              card that stretches to match its row, which on the feature tile
              opened a 200px hole between the capability list and the
              screenshot. Down here the slack collects under the picture
              instead, where it reads as a margin above a footer rather than
              as a gap in the middle of the card.

              Dimmed at rest and full strength on card hover, the same bargain
              the hero portrait makes: quiet until someone is actually looking
              at it. `loading="lazy"` because every one of these is well below
              the fold, and both dimensions on the element because a lazy
              image with no reserved box is a layout shift that arrives mid
              scroll, which is the kind CLS counts and visitors notice most. */}
          {project.media && (
            <div className="mt-7 overflow-hidden rounded-lg border border-hairline bg-obsidian-950">
              <img
                src={project.media.src}
                alt={project.media.alt}
                width={project.media.width}
                height={project.media.height}
                loading="lazy"
                decoding="async"
                className="block w-full opacity-75 transition-opacity duration-500 ease-out-expo group-hover:opacity-100"
              />
            </div>
          )}

          <div className="mt-auto pt-7">
            <div className="flex flex-wrap gap-1.5">
              {shownStack.map((item) => (
                <Tag key={item}>{item}</Tag>
              ))}
              {hiddenStack > 0 && <Tag>+{hiddenStack}</Tag>}
            </div>

            {/* Visual affordance only. The real control is the overlay
                button below, which covers the whole card. */}
            <span
              aria-hidden
              className="mt-5 flex items-center gap-2 font-mono text-[0.625rem] tracking-[0.18em] text-mint-600 uppercase transition-colors duration-300 group-hover:text-mint-300"
            >
              open briefing
              <ArrowUpRight
                size={13}
                className="transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>

            {import.meta.env.DEV && !project.statusConfirmed && (
              <p className="mt-4 font-mono text-[0.5625rem] tracking-[0.18em] text-signal-400 uppercase">
                ⚠ status unconfirmed, dev only
              </p>
            )}
          </div>
        </motion.div>

        {/* The hit target. A full-cover button rather than wrapping the card
            in one: a <button> may only contain phrasing content, and this card
            has an <h3> in it. */}
        <button
          type="button"
          onClick={() => onOpen(project.id)}
          aria-label={`Open briefing: ${project.title}`}
          aria-expanded={isOpen}
          className="absolute inset-0 z-10 rounded-xl"
        />
      </motion.div>
    </motion.article>
  );
}
