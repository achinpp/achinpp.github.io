import { motion } from 'motion/react';
import { ArrowUpRight, GitPullRequest } from 'lucide-react';
import { PROFILE } from '@/data/profile';
import { useMagnetic } from '@/hooks/useMagnetic';
import { fadeUp } from '@/lib/motion/variants';

/**
 * Open-source activity.
 *
 * No individual contributions were named in the brief, so this does not list
 * any — it points at the one source of truth that exists, which is the public
 * profile. That reads as finished rather than as a gap, and it stays true
 * whatever the commit history does next.
 *
 * If a list of specific contributions turns up, this strip is the right place
 * for it and the link becomes a footer to it rather than the whole content.
 */
export function ContributionStrip() {
  const { ref, x, y, handlers } = useMagnetic(0.14);

  return (
    <motion.div variants={fadeUp} className="rounded-xl bg-obsidian-850/40 p-6 hairline sm:p-7">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <GitPullRequest aria-hidden size={18} className="mt-0.5 shrink-0 text-mint-600" />
          <div>
            <h3 className="font-mono text-label text-ink uppercase">Open-source activity</h3>
            <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-ink-muted">
              Commits, forks and pull requests are public on the profile — including the repository
              this site is built in.
            </p>
          </div>
        </div>

        <motion.a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={PROFILE.github}
          target="_blank"
          rel="noreferrer noopener"
          {...handlers}
          style={{ x, y }}
          className="inline-flex shrink-0 items-center gap-2.5 self-start rounded-full border border-hairline px-5 py-3 font-mono text-[0.6875rem] tracking-[0.14em] text-ink-muted uppercase transition-colors duration-200 hover:border-mint-800 hover:text-mint-200 sm:self-auto"
        >
          @{PROFILE.handle}
          <ArrowUpRight aria-hidden size={13} />
        </motion.a>
      </div>

      {import.meta.env.DEV && (
        <p className="mt-6 font-mono text-[0.5625rem] leading-relaxed tracking-[0.16em] text-signal-400 uppercase">
          ⚠ dev only — no specific contributions were supplied; this strip links to the profile
          instead of listing any
        </p>
      )}
    </motion.div>
  );
}
