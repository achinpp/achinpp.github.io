import type { ReactNode } from 'react';

type Props = {
  /** Must be an id from `src/data/sections.ts` — the nav and HUD scroll to it. */
  id: string;
  children: ReactNode;
  /** Extra classes on the inner container, not the <section>. */
  className?: string;
};

/**
 * The shell every content section sits in, so the page-level invariants live
 * in one place instead of being retyped per stage.
 *
 * `min-h-svh` is not cosmetic — `useActiveSection` (Stage 1) detects the
 * active section with a 1px band through the middle of the viewport, so a
 * section shorter than half a viewport could never become active and the nav
 * indicator would skip it. Any section that opts out of full height breaks
 * the nav, which is why the height is here and not in each caller.
 */
export function Section({ id, children, className }: Props) {
  return (
    <section
      id={id}
      className="relative min-h-svh border-b border-hairline px-5 py-28 sm:px-10 lg:py-36"
    >
      <div className={`mx-auto w-full max-w-6xl ${className ?? ''}`}>{children}</div>
    </section>
  );
}
