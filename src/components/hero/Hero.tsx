import { motion } from 'motion/react';
import { ArrowDown, Download } from 'lucide-react';
import { PROFILE, TERMINAL_SCRIPT } from '@/data/profile';
import { RoleRotator } from '@/components/hero/RoleRotator';
import { ScrollHint } from '@/components/hero/ScrollHint';
import { TerminalWindow } from '@/components/hero/TerminalWindow';
import { GlowButton } from '@/components/ui/GlowButton';
import { ScrambleText } from '@/components/ui/ScrambleText';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useScrollTo } from '@/hooks/useScrollTo';
import { useTypewriter } from '@/hooks/useTypewriter';
import { duration, easeOutExpo, stagger } from '@/lib/motion/easings';
import { maskReveal } from '@/lib/motion/variants';

/** Grounded in the brief — nothing here is invented. */
const META = [
  { label: 'Focus', value: 'AppSec · Cloud · Adversarial ML' },
  { label: 'Based', value: PROFILE.location },
  { label: 'Affiliation', value: 'IEEE SIGHT · IEEE IAS' },
] as const;

const NAME_LINES = [PROFILE.firstName, PROFILE.name.slice(PROFILE.firstName.length).trim()];

export function Hero() {
  const reduced = useReducedMotion();
  const scrollTo = useScrollTo();

  const typing = useTypewriter(TERMINAL_SCRIPT, { enabled: true, instant: reduced });

  /**
   * The name appears once `whoami` has finished executing — line 0 of the
   * script — rather than after the whole transcript.
   *
   * That ordering is the point: the brief asked for the terminal to run
   * `whoami` and *then* render the name. Waiting for all six lines would put
   * Largest Contentful Paint even later, since the hero grid keeps growing as
   * each piece of it lands.
   *
   * Stage 10 measured this properly for the first time. The Stage 2 figure
   * (~1654ms) was arithmetic, and it was measuring the wrong moment: LCP
   * tracks the hero *grid*, which keeps being re-reported as larger content
   * paints inside it, so the real number is when the CTAs finish — not when
   * the name starts revealing.
   */
  const revealName = typing.lineIndex >= 1;

  return (
    <section
      id="hero"
      className="relative flex min-h-svh flex-col justify-center px-5 py-28 sm:px-10"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-y-12 lg:grid-cols-12 lg:gap-x-8">
          {/* ------------------------------------------------- terminal */}
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: duration.slow, ease: easeOutExpo, delay: 0.1 }}
            className="lg:col-span-6 xl:col-span-5"
          >
            <TerminalWindow typing={typing} />
          </motion.div>

          {/* --------------------------------------------- meta rail */}
          <motion.dl
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: duration.slow, delay: 0.35 }}
            className="flex flex-col divide-y divide-hairline lg:col-span-4 lg:col-start-9 lg:self-end"
          >
            {META.map((row) => (
              <div key={row.label} className="flex items-baseline gap-4 py-2.5">
                <dt className="w-24 shrink-0 font-mono text-[0.5625rem] tracking-[0.2em] text-obsidian-500 uppercase">
                  {row.label}
                </dt>
                <dd className="font-mono text-[0.6875rem] tracking-[0.08em] text-ink-muted">
                  {row.value}
                </dd>
              </div>
            ))}
          </motion.dl>

          {/* -------------------------------------------- name block */}
          <div className="lg:col-span-12">
            {/* Eyebrow — ties the headline back to the whoami that produced it. */}
            <div className="h-4">
              {revealName && (
                <ScrambleText
                  text="identity confirmed"
                  tickMs={26}
                  lockPerTick={1.1}
                  className="font-mono text-label text-mint-600 uppercase"
                />
              )}
            </div>

            <h1 className="mt-4">
              <span className="sr-only">{PROFILE.name}</span>
              {NAME_LINES.map((word, i) => (
                <span key={word} className="mask-line" aria-hidden>
                  <motion.span
                    variants={maskReveal}
                    initial={reduced ? false : 'hidden'}
                    animate={revealName || reduced ? 'visible' : 'hidden'}
                    transition={{
                      duration: duration.reveal,
                      ease: easeOutExpo,
                      delay: i * stagger.loose,
                    }}
                    className={`block text-display-xl uppercase ${
                      i === 0 ? 'text-gradient-ink' : 'text-gradient-accent'
                    }`}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.div
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: revealName || reduced ? 1 : 0 }}
              transition={{ duration: duration.base, delay: 0.3 }}
              className="mt-7"
            >
              <RoleRotator start={revealName} />
            </motion.div>

            {/* ------------------------------------------------ CTAs */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{
                opacity: revealName || reduced ? 1 : 0,
                y: revealName || reduced ? 0 : 12,
              }}
              // Stage 10: delay 0.45 -> 0.22, which brings the résumé button
              // forward without changing the fade itself. Shortening the fade
              // as well was tried and measured at zero benefit, so it was
              // reverted — see the Stage 10 notes on what actually moved LCP.
              transition={{ duration: duration.slow, ease: easeOutExpo, delay: 0.22 }}
              className="mt-11 flex flex-wrap items-center gap-4"
            >
              <GlowButton
                href={PROFILE.resumePath}
                download={PROFILE.resumeFileName}
                icon={<Download size={16} />}
              >
                Download Resume
              </GlowButton>

              <button
                type="button"
                onClick={() => scrollTo('projects')}
                className="group inline-flex items-center gap-2.5 rounded-full border border-hairline px-6 py-4 font-mono text-label-lg text-ink-muted uppercase transition-colors duration-200 hover:border-hairline-strong hover:text-ink"
              >
                View Projects
                <ArrowDown
                  size={14}
                  className="transition-transform duration-300 ease-out-expo group-hover:translate-y-0.5"
                />
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      <ScrollHint />
    </section>
  );
}
