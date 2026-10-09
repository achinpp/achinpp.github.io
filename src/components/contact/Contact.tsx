import { motion } from 'motion/react';
import { PROFILE } from '@/data/profile';
import { Section } from '@/components/layout/Section';
import { SectionHeading } from '@/components/layout/SectionHeading';
import { ContactForm } from '@/components/contact/ContactForm';
import { SocialLinks } from '@/components/contact/SocialLinks';
import { revealViewport, staggerGroup } from '@/lib/motion/variants';

/**
 * Secure Channel.
 *
 * The form and the channel list are side by side rather than stacked, because
 * the form is the thing that may not be wired to an inbox — and when it isn't,
 * the working alternative needs to be visible at the same moment as the
 * notice saying so, not a scroll away.
 */
export function Contact() {
  return (
    <Section id="contact">
      <SectionHeading
        id="contact"
        title="Secure Channel"
        lede="Open to opportunities, collaborations and anything that needs breaking before someone else breaks it."
      />

      <motion.div
        variants={staggerGroup()}
        initial="hidden"
        whileInView="visible"
        viewport={revealViewport}
        className="mt-14 grid gap-x-12 gap-y-12 lg:mt-20 lg:grid-cols-12"
      >
        <div className="lg:col-span-7">
          <ContactForm />
        </div>

        <div className="lg:col-span-5 lg:col-start-9">
          <SocialLinks />

          <motion.dl
            variants={staggerGroup()}
            className="mt-10 flex flex-col divide-y divide-hairline border-t border-hairline"
          >
            {[
              { label: 'Status', value: PROFILE.availability },
              { label: 'Based', value: `${PROFILE.location} · ${PROFILE.timezone}` },
            ].map((row) => (
              <div key={row.label} className="flex items-baseline gap-4 py-3">
                <dt className="w-20 shrink-0 font-mono text-[0.5625rem] tracking-[0.2em] text-obsidian-500 uppercase">
                  {row.label}
                </dt>
                <dd className="font-mono text-[0.6875rem] tracking-[0.06em] text-ink-muted">
                  {row.value}
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </motion.div>
    </Section>
  );
}
