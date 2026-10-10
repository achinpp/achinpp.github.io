import { motion } from 'motion/react';
import { ArrowUpRight, GitPullRequest } from 'lucide-react';
import { CONTRIBUTIONS } from '@/data/achievements';
import { PROFILE } from '@/data/profile';
import { useMagnetic } from '@/hooks/useMagnetic';
import { fadeUp } from '@/lib/motion/variants';

/**
 * Open source activity.
 *
 * Named contributions are listed from `CONTRIBUTIONS`, and the GitHub profile
 * sits underneath as the catch all rather than as the whole content.
 *
 * ⚠ A contribution with `href: null` renders as plain text, deliberately. The
 * IEEE Sri Lanka Section row is one of those because you asked for no link to
 * it. Every other row on this site that has no URL is a row I had nothing to
 * link; this one is a row you chose not to link, and the difference is worth
 * knowing if you come back to it later.
 */
export function ContributionStrip() {
  const { ref, x, y, handlers } = useMagnetic(0.14);

  return (
    <motion.div variants={fadeUp} className="rounded-xl bg-obsidian-850/40 p-6 hairline sm:p-7">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <GitPullRequest aria-hidden size={18} className="mt-0.5 shrink-0 text-mint-600" />
          <div>
            <h3 className="font-mono text-label text-ink uppercase">Open source activity</h3>

            <ul className="mt-4 space-y-2.5">
              {CONTRIBUTIONS.map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span aria-hidden className="text-mint-700">
                    ▸
                  </span>
                  {entry.href ? (
                    <a
                      href={entry.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-sm text-ink transition-colors duration-200 hover:text-mint-200"
                    >
                      {entry.org}
                    </a>
                  ) : (
                    <span className="text-sm text-ink">{entry.org}</span>
                  )}
                  <span className="font-mono text-[0.5625rem] tracking-[0.2em] text-obsidian-500 uppercase">
                    {entry.role}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-ink-muted">
              Commits, forks and pull requests are public on the profile, including the repository
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
          className="inline-flex shrink-0 items-center gap-2.5 self-start rounded-full border border-hairline px-5 py-3 font-mono text-[0.6875rem] tracking-[0.14em] text-ink-muted uppercase transition-colors duration-200 hover:border-mint-800 hover:text-mint-200"
        >
          @{PROFILE.handle}
          <ArrowUpRight aria-hidden size={13} />
        </motion.a>
      </div>
    </motion.div>
  );
}
