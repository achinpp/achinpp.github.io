import { useRef } from 'react';
import { useScroll } from 'motion/react';
import { EXPERIENCE } from '@/data/experience';
import { Section } from '@/components/layout/Section';
import { SectionHeading } from '@/components/layout/SectionHeading';
import { Outreach } from '@/components/experience/Outreach';
import { TimelineEntry } from '@/components/experience/TimelineEntry';
import { TimelineRail } from '@/components/experience/TimelineRail';

/**
 * Experience & Leadership.
 *
 * The scroll range is owned here rather than inside the rail, because the
 * range is a property of the *list* — it has to start when the first node
 * comes into play and end when the last one does. `start 80%` means progress
 * 0 when the top of the list crosses 80% of the viewport height; `end 55%`
 * means fully drawn once the bottom passes the middle, so the line finishes
 * slightly before the last card leaves — a line still drawing as the section
 * exits reads as unfinished.
 */
export function Experience() {
  const listRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start 80%', 'end 55%'],
  });

  return (
    <Section id="experience">
      <SectionHeading
        id="experience"
        title="Experience & Leadership"
        lede="Five roles across two IEEE chapters, a university IoT club and a school research club: committees, web presence, events, build work and media. The workshops, lectures and exhibitions those roles ran are underneath."
      />

      <div ref={listRef} className="relative mt-16 lg:mt-24">
        <TimelineRail progress={scrollYProgress} />

        <ol className="space-y-10 lg:space-y-20">
          {EXPERIENCE.map((entry, index) => (
            <TimelineEntry key={entry.id} entry={entry} index={index} />
          ))}
        </ol>
      </div>

      {/* Outside `listRef` on purpose: the rail's scroll range is a property
          of the list of roles, and stretching it over the photographs below
          would leave the line still drawing after the last card is gone. */}
      <Outreach />
    </Section>
  );
}
