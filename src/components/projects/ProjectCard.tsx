import type { CSSProperties } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import type { Project, ProjectStatus } from '@/data/projects';
import { Tag, type TagTone } from '@/components/ui/Tag';
import { useCardPointer } from '@/hooks/useCardPointer';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { duration, easeOutExpo, spring } from '@/lib/motion/easings';
import { fadeUp } from '@/lib/motion/variants';

/**
 * Note on the reveal: these use `fadeUp`, not `scaleIn`. A layout animation
 * measures against its ancestors, and Framer cannot measure correctly through
 * an ancestor that is mid `scale`, so a click during the entrance stagger
 * would morph from the wrong rectangle. Opacity and translate are safe.
 */

const STATUS_TONE: Record<ProjectStatus, TagTone> = {
  ACTIVE: 'signal',
  DEPLOYED: 'accent',
  DELIVERED: 'accent',
  ARCHIVED: 'neutral',
};

/**
 * The tracked border. Sits one pixel outside the frame, and the frame's
 * background is clipped to its padding box, so this gradient is what you see
 * through the 1px border rather than a halo sitting behind an opaque edge.
 */
const BORDER_GLOW =
  'radial-gradient(240px circle at var(--mx) var(--my), oklch(0.888 0.145 168 / 0.95), oklch(0.888 0.145 168 / 0.3) 36%, transparent 70%)';

/** The inner highlight. The same centre, far weaker, spread wider. */
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

  const capture = project.media[0] ?? null;

  return (
    <motion.article
      ref={ref}
      {...handlers}
      variants={fadeUp}
      className="group relative"
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
            Content is deliberately NOT inside it: a layout animation scales
            its subtree, which would squash and stretch every line of text on
            the way across. */}
        <motion.span
          aria-hidden
          layoutId={reduced ? undefined : `briefing-${project.id}`}
          transition={spring.morph}
          style={{ borderRadius: 'var(--radius-xl)', backgroundClip: 'padding-box' }}
          // The border brighten is plain CSS, so the card still has a hover
          // affordance where the tracked glow is switched off: touch, coarse
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
                its own line, on every card. Both on one line was what this
                started as, and `// BRIEFING_03 · RESEARCH` wrapped mid stamp
                in the narrow tiles this grid used to have. Two deliberate
                lines read as a stamp, and they survived the regrid because
                they are also the only fixed height thing in the card, which
                is what puts all four captures on one baseline. */}
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

          {/* ----------------------------------------------- the capture
              Directly under the stamp, so every card in a row starts its
              picture on the same line. Under the copy, which is where this
              used to sit, each picture started wherever its own title and
              tagline happened to end and the row read as four unrelated
              tiles.

              CLAMPED, NOT CROPPED TO A SHAPE. The band is the picture's own
              aspect ratio until it passes `max-h`, and then the overflow is
              cut off the bottom. A fixed band would have to pick between
              `cover`, which takes a router off the end of the Packet Tracer
              topology, and `contain`, which puts 190px of dead plate either
              side of the near square pipeline run. A clamp needs neither: a
              wide picture is untouched and a tall one is shown from the top,
              which on the pipeline run is the jobs list with the failing
              gate in it. Every picture is whole in the briefing panel, which
              is where someone has asked to see it.

              The clamp is also what stops a card setting its own height
              against the one beside it. 240px against the tallest capture's
              natural 415px is the difference between a 250px hole in this
              row and a 50px one. It is set where it is because only one
              capture of the four is tall enough to reach it: a clamp that
              bites three pictures is a crop pretending to be a clamp.

              Dimmed at rest and full strength on card hover, the same bargain
              the hero portrait makes: quiet until someone is actually looking
              at it. `loading="lazy"` because every one of these is well below
              the fold, and both dimensions on the element because a lazy
              image with no reserved box is a layout shift that arrives mid
              scroll, which is the kind CLS counts and visitors notice most.

              The first capture and only the first, even where a briefing has
              two. A card is a thumbnail of a briefing, not a gallery. */}
          {capture && (
            <figure className="mt-6 overflow-hidden rounded-lg border border-hairline bg-obsidian-950">
              <div className="max-h-60 overflow-hidden">
                <img
                  src={capture.src}
                  alt={capture.alt}
                  width={capture.width}
                  height={capture.height}
                  loading="lazy"
                  decoding="async"
                  className="block w-full opacity-80 transition-opacity duration-500 ease-out-expo group-hover:opacity-100"
                />
              </div>
              {/* A solid strip rather than a gradient over the picture. It
                  names what is on screen, and it finishes a clamped capture
                  with an edge instead of leaving it looking torn. */}
              <figcaption className="flex items-center gap-2 border-t border-hairline px-3 py-2 font-mono text-[0.5rem] tracking-[0.18em] text-obsidian-500 uppercase transition-colors duration-300 group-hover:text-mint-700">
                <span aria-hidden className="h-px w-4 bg-hairline-strong" />
                {capture.label}
              </figcaption>
            </figure>
          )}

          <h3 className="mt-6 text-[1.375rem] leading-[1.15] font-semibold tracking-[-0.02em] text-ink">
            {project.title}
          </h3>

          <p className="mt-3 text-[0.875rem] leading-relaxed text-ink-muted">{project.tagline}</p>

          {/* On every card now, not just a feature tile. Four cards of one
              size have the room for it, and a card that says only what a
              project is called and one line about it is a card that makes
              the reader open it to learn anything. */}
          <ul className="mt-6 space-y-2">
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

          <div className="mt-auto pt-7">
            {/* The whole stack, not the first three and a counter. The
                counter was there because a narrow tile could not hold five
                pills; this card can, and `+2` is a worse thing to read than
                the two words it was hiding. */}
            <div className="flex flex-wrap gap-1.5">
              {project.stack.map((item) => (
                <Tag key={item}>{item}</Tag>
              ))}
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
