import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { ExternalLink, Github, X } from 'lucide-react';
import type { Project } from '@/data/projects';
import { Tag } from '@/components/ui/Tag';
import { STATUS_TONE } from '@/components/projects/status';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useScrollLock } from '@/hooks/useScrollLock';
import { duration, easeOutExpo, spring } from '@/lib/motion/easings';

type Props = {
  project: Project;
  onClose: () => void;
};

/**
 * The expanded briefing.
 *
 * **It is portalled to `<body>`.** `<main>` is positioned with
 * `z-index: var(--z-content)`, which makes it a stacking context — a child of
 * it can ask for `--z-overlay` all it likes and still paint under the nav,
 * which is `--z-nav` but a sibling of `<main>`. The portal is the only way
 * out. `layoutId` is unaffected: Framer measures in viewport coordinates, and
 * React context (which carries the shared-layout registry) passes through a
 * portal normally.
 *
 * **The frame morphs, the content cross-fades.** The `layoutId` element is a
 * bare background span, and the text is a sibling that fades in on a delay.
 * If the text lived inside the morphing element it would be scaled from card
 * size to panel size on the way across; if it faded in immediately it would
 * overflow a frame that hasn't finished growing. The delay is what keeps the
 * morph free of a layout flash.
 *
 * Under reduced motion `layoutId` is dropped entirely, so this opens as a
 * plain centred panel with no flight path.
 */
export function ProjectDetail({ project, onClose }: Props) {
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  useScrollLock(true);
  // Also restores focus to the card that opened this, on unmount.
  useFocusTrap(true, panelRef);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const titleId = `briefing-${project.id}-title`;

  // Review markers, compiled out of production builds. A list rather than
  // one sentence with separators in it, because a classified briefing earns
  // neither note: its badge is yours rather than my guess, and it is never
  // going to carry a repo link.
  const devNotes = [
    !project.statusConfirmed && 'status badge unconfirmed',
    project.status !== 'CLASSIFIED' &&
      !project.repo &&
      !project.demo &&
      'no repo or demo link supplied',
  ].filter((note): note is string => typeof note === 'string');

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4 sm:p-8"
      style={{ zIndex: 'var(--z-overlay)' }}
    >
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: duration.fast }}
        onClick={onClose}
        className="absolute inset-0"
        style={{
          backgroundColor: 'oklch(0.105 0.012 265 / 0.86)',
          backdropFilter: 'blur(var(--blur-veil))',
        }}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-3xl"
      >
        <motion.span
          aria-hidden
          layoutId={reduced ? undefined : `briefing-${project.id}`}
          transition={spring.morph}
          style={{ borderRadius: 'var(--radius-2xl)', backgroundClip: 'padding-box' }}
          className="absolute inset-0 border border-hairline-strong bg-surface shadow-elev-3"
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: duration.instant } }}
          transition={{
            duration: duration.base,
            ease: easeOutExpo,
            // Waits for the frame to be most of the way to its final size.
            delay: reduced ? 0 : 0.16,
          }}
          className="relative max-h-[82svh] overflow-y-auto p-6 sm:p-9"
        >
          <header className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <span className="font-mono text-[0.5625rem] tracking-[0.2em] text-mint-700 uppercase">
                // {project.index}
              </span>
              <h3 id={titleId} className="mt-4 text-display-md text-ink">
                {project.title}
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close briefing"
              className="grid size-9 shrink-0 place-items-center rounded-full border border-hairline text-ink-faint transition-colors duration-200 hover:border-mint-800 hover:text-mint-300"
            >
              <X size={15} />
            </button>
          </header>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Tag tone={project.kind === 'RESEARCH' ? 'accent' : 'neutral'}>{project.kind}</Tag>
            <Tag tone={STATUS_TONE[project.status]}>{project.status}</Tag>
            <span className="font-mono text-[0.625rem] tracking-[0.12em] text-ink-faint">
              {project.tagline}
            </span>
          </div>

          <div className="mt-7 h-px bg-hairline" />

          <p className="mt-7 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-muted">
            {project.brief}
          </p>

          {/* Every capture, at full size. Eager here, unlike on the card:
              this panel only exists because someone asked for it, so the
              images are the point rather than an extra.

              The caption used to read `capture · briefing_04`, which told a
              reader what they already knew from the header above. With two
              captures on one briefing it had to say which was which, so it
              names the picture instead. */}
          {project.media.map((capture) => (
            <figure key={capture.src} className="mt-8">
              <div className="overflow-hidden rounded-lg border border-hairline bg-obsidian-950">
                <img
                  src={capture.src}
                  alt={capture.alt}
                  width={capture.width}
                  height={capture.height}
                  decoding="async"
                  className="block w-full"
                />
              </div>
              <figcaption className="mt-3 flex items-center gap-2.5 font-mono text-[0.5625rem] tracking-[0.18em] text-obsidian-500 uppercase">
                <span aria-hidden className="h-px w-5 bg-hairline-strong" />
                capture · {capture.label}
              </figcaption>
            </figure>
          ))}

          {/* Both sections are guarded, because a classified briefing
              publishes neither. A heading with nothing under it is a worse
              answer than no heading: it reads as a section that failed
              rather than one that was deliberately left out. */}
          {project.capabilities.length > 0 && (
            <section className="mt-9">
              <h4 className="font-mono text-label text-mint-600 uppercase">Capabilities</h4>
              <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {project.capabilities.map((item) => (
                  <li
                    key={item}
                    className="flex items-baseline gap-2.5 text-sm leading-relaxed text-ink-muted"
                  >
                    <span aria-hidden className="text-mint-600">
                      ▸
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {project.stack.length > 0 && (
            <section className="mt-9">
              <h4 className="font-mono text-label text-mint-600 uppercase">Stack</h4>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {project.stack.map((item) => (
                  <Tag key={item}>{item}</Tag>
                ))}
              </div>
            </section>
          )}

          {(project.repo || project.demo) && (
            <div className="mt-9 flex flex-wrap gap-3">
              {project.repo && (
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2.5 rounded-full border border-hairline px-5 py-3 font-mono text-[0.6875rem] tracking-[0.14em] text-ink-muted uppercase transition-colors duration-200 hover:border-mint-800 hover:text-mint-200"
                >
                  <Github size={14} />
                  Source
                </a>
              )}
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2.5 rounded-full border border-hairline px-5 py-3 font-mono text-[0.6875rem] tracking-[0.14em] text-ink-muted uppercase transition-colors duration-200 hover:border-mint-800 hover:text-mint-200"
                >
                  <ExternalLink size={14} />
                  Live
                </a>
              )}
            </div>
          )}

          {import.meta.env.DEV && devNotes.length > 0 && (
            <p className="mt-9 font-mono text-[0.5625rem] leading-relaxed tracking-[0.16em] text-signal-400 uppercase">
              ⚠ dev only: {devNotes.join(' · ')}
            </p>
          )}
        </motion.div>
      </div>
    </div>,
    document.body,
  );
}
