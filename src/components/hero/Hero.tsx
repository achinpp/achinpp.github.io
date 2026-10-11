import { motion } from 'motion/react';
import { ArrowDown, Download } from 'lucide-react';
import { PROFILE } from '@/data/profile';
import { Portrait } from '@/components/hero/Portrait';
import { RoleRotator } from '@/components/hero/RoleRotator';
import { ScrollHint } from '@/components/hero/ScrollHint';
import { GlowButton } from '@/components/ui/GlowButton';
import { ScrambleText } from '@/components/ui/ScrambleText';
import { useBoot } from '@/hooks/useBoot';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useScrollTo } from '@/hooks/useScrollTo';
import { duration, easeOutExpo, stagger } from '@/lib/motion/easings';
import { maskReveal } from '@/lib/motion/variants';

const NAME_LINES = [PROFILE.firstName, PROFILE.name.slice(PROFILE.firstName.length).trim()];

/**
 * The hero, after the terminal and the meta rail both came out of it.
 *
 * The terminal is the boot overlay now, and the `FOCUS / BASED / AFFILIATION`
 * rail is gone at your request. What is left is the two things a hero is
 * actually for: who this is, and what to do next. Everything the rail carried
 * is still on the page: the roles in the rotator directly below the name,
 * the location in the HUD along the bottom edge and in the contact panel, the
 * IEEE chapters on the experience timeline, where they come with a role and a
 * date instead of sitting as three bare words.
 *
 * **The reveal is gated on the boot overlay, not on a typing script.** It
 * used to wait for the terminal's first line to finish, which no longer
 * exists here. `booted` is true immediately under reduced motion, so that
 * path arrives at a finished hero with nothing held back.
 */
export function Hero() {
  const reduced = useReducedMotion();
  const scrollTo = useScrollTo();
  const { booted } = useBoot();

  return (
    <section
      id="hero"
      className="relative flex min-h-svh flex-col justify-center px-5 py-28 sm:px-10"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid items-end gap-y-14 lg:grid-cols-12 lg:gap-x-10">
          {/* -------------------------------------------- name block */}
          <div className="lg:col-span-7">
            {/* Eyebrow. Ties the headline back to the whoami that ran on the
                boot screen a second ago and produced this name. */}
            <div className="h-4">
              {booted && (
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
                    animate={booted || reduced ? 'visible' : 'hidden'}
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
              animate={{ opacity: booted || reduced ? 1 : 0 }}
              transition={{ duration: duration.base, delay: 0.3 }}
              className="mt-7"
            >
              <RoleRotator start={booted} />
            </motion.div>

            {/* ------------------------------------------------ CTAs */}
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{
                opacity: booted || reduced ? 1 : 0,
                y: booted || reduced ? 0 : 12,
              }}
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

          {/* --------------------------------------------- portrait
              Last in the DOM, and last on a phone, where the stack is name,
              role, CTAs, face. Putting it first reads better on a wide
              screen but pushes the name itself below the fold at 390px, and
              the name is the one thing the first screen has to contain. On
              `lg` it is placed explicitly into the right hand columns, so
              source order costs nothing there and the visual order still
              matches the DOM. */}
          <div className="lg:col-span-4 lg:col-start-9">
            <Portrait />
          </div>
        </div>
      </div>

      <ScrollHint />
    </section>
  );
}
