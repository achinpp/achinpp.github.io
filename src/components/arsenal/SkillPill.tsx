import { motion } from 'motion/react';
import { CATEGORY_DOT, type Skill } from '@/data/skills';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { spring } from '@/lib/motion/easings';

/**
 * Idle drift parameters, seeded from the skill's index in the full list.
 *
 * Deterministic on purpose. `Math.random()` would re-roll on every render, so
 * a pill would jump to a new point in its cycle each time the filter changed.
 * The seed is the position in `SKILLS`, not in the filtered array, so it stays
 * stable while pills come and go.
 *
 * The delay is **negative**, which starts each animation partway through its
 * own cycle — otherwise all twenty pills begin at keyframe zero and the cloud
 * pulses in unison like a heartbeat.
 */
function driftStyle(seed: number) {
  const duration = 7 + ((seed * 1.37) % 5);
  const delay = -((seed * 0.83) % 9);
  return {
    animationDuration: `${duration.toFixed(2)}s`,
    animationDelay: `${delay.toFixed(2)}s`,
  };
}

/**
 * One skill.
 *
 * **The drift and the layout animation are on different elements, and have to
 * be.** Framer's `layout` writes to `transform`, and so does the `drift`
 * keyframe — and a running CSS animation beats an inline style in the
 * cascade, so a single element would have its re-layout silently overwritten
 * every frame. The `<li>` moves; the `<span>` inside it floats.
 *
 * `layout="position"` rather than plain `layout`: pills never change size, so
 * there is nothing to measure, and Framer's own guidance is that size
 * measurement and `scale` interfere. For the same reason entry and exit are
 * opacity-only — a `scale` on an element that is also being laid out is the
 * documented way to get the wrong rectangle.
 *
 * The drift is `translate3d` only (see `@keyframes drift`), so it can never
 * contribute layout shift — which is this stage's acceptance criterion.
 */
export function SkillPill({ skill, seed }: { skill: Skill; seed: number }) {
  const reduced = useReducedMotion();

  return (
    <motion.li
      layout="position"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={spring.morph}
      className="inline-flex"
    >
      <span
        style={reduced ? undefined : driftStyle(seed)}
        className="group inline-flex items-center gap-2.5 rounded-full border border-hairline bg-obsidian-850/60 px-4 py-2.5 font-mono text-[0.75rem] tracking-[0.04em] text-ink-muted transition-[color,border-color,box-shadow] duration-300 ease-out-expo hover:border-mint-800 hover:text-mint-200 hover:shadow-glow-xs motion-ok:animate-drift"
      >
        <span
          aria-hidden
          className="size-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: CATEGORY_DOT[skill.category] }}
        />
        {skill.name}
      </span>
    </motion.li>
  );
}
