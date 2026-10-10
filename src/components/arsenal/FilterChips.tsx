import { motion } from 'motion/react';
import {
  CATEGORIES,
  CATEGORY_DOT,
  CATEGORY_LABEL,
  SKILLS,
  type Category,
  countIn,
} from '@/data/skills';
import { spring } from '@/lib/motion/easings';

type Props = {
  active: Category | null;
  onChange: (next: Category | null) => void;
};

/**
 * One chip. The active background is a `layoutId` element that slides between
 * chips rather than one highlight per chip fading in and out — the same
 * indicator pattern as the nav (Stage 1), so the two read as the same control.
 */
function Chip({
  label,
  fullLabel,
  count,
  dot,
  isActive,
  onClick,
}: {
  label: string;
  /** The unabbreviated name, when the visible label is shortened. */
  fullLabel?: string;
  count: number;
  dot?: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <li className="relative">
      <button
        type="button"
        onClick={onClick}
        aria-pressed={isActive}
        aria-label={fullLabel}
        title={fullLabel}
        className="relative z-10 inline-flex items-center gap-2 rounded-full px-4 py-2.5 font-mono text-[0.6875rem] tracking-[0.12em] uppercase transition-colors duration-200"
        style={{ color: isActive ? 'var(--color-mint-200)' : 'var(--color-ink-faint)' }}
      >
        {dot && (
          <span
            aria-hidden
            className="size-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: dot }}
          />
        )}
        {label}
        <span
          aria-hidden
          className="tabular-nums"
          style={{ color: isActive ? 'var(--color-mint-600)' : 'var(--color-obsidian-600)' }}
        >
          {count}
        </span>
      </button>

      {isActive && (
        <motion.span
          layoutId="arsenal-filter"
          transition={spring.indicator}
          aria-hidden
          className="absolute inset-0 rounded-full border border-mint-900 bg-mint-950/60"
        />
      )}
    </li>
  );
}

export function FilterChips({ active, onChange }: Props) {
  return (
    <ul
      role="group"
      aria-label="Filter skills by category"
      // `rounded-2xl` at every width, not `sm:rounded-full`. Nine chips wrap
      // on anything narrower than a desktop, and a pill shaped container with
      // two rows inside it reads as a mistake.
      className="flex flex-wrap gap-1 rounded-2xl border border-hairline bg-obsidian-900/40 p-1.5"
    >
      <Chip
        label="All"
        count={SKILLS.length}
        isActive={active === null}
        onClick={() => onChange(null)}
      />
      {CATEGORIES.map((category) => (
        <Chip
          key={category}
          label={CATEGORY_LABEL[category]}
          fullLabel={category}
          count={countIn(category)}
          dot={CATEGORY_DOT[category]}
          isActive={active === category}
          // Clicking the active chip clears the filter. Otherwise the only
          // way back to everything is to find the "All" chip again.
          onClick={() => onChange(active === category ? null : category)}
        />
      ))}
    </ul>
  );
}
