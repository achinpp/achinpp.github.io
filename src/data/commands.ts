import {
  ArrowDownToLine,
  Clapperboard,
  Copy,
  Film,
  Github,
  Mail,
  Monitor,
  Navigation,
  Terminal,
  type LucideIcon,
} from 'lucide-react';
import { NAV_SECTIONS } from '@/data/sections';
import { PROFILE } from '@/data/profile';
import { useCopy } from '@/hooks/useCopy';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { useScrollTo } from '@/hooks/useScrollTo';
import { useToast } from '@/hooks/useToast';

export const GROUPS = ['Recent', 'Navigate', 'Actions', 'Display', 'System'] as const;
export type Group = (typeof GROUPS)[number];

export type Command = {
  id: string;
  label: string;
  group: Exclude<Group, 'Recent'>;
  icon: LucideIcon;
  /** Searchable but not displayed — synonyms and section codenames. */
  keywords?: string;
  /** Right-aligned state, e.g. whether a toggle is currently on. */
  hint?: string;
  run: () => void;
  /** Toggles stay open so the effect can be seen and reversed in place. */
  keepOpen?: boolean;
  /**
   * Not listed until the query asks for it by name. One command uses this.
   */
  secret?: boolean;
};

/**
 * Builds the command list.
 *
 * A hook rather than a constant because every action needs something only a
 * hook can provide — the Lenis instance behind `useScrollTo`, the clipboard
 * wrapper, the motion switch, the toast channel. The alternative is passing
 * four callbacks into a static array from the component, which puts the
 * palette's behaviour in two files instead of one.
 *
 * Downloading uses a detached anchor rather than assigning
 * `window.location`: a navigation to a PDF is a navigation, and some browsers
 * will render it in place and lose the page. An `<a download>` click is the
 * only reliable way to get a file instead of a page.
 */
export function useCommands(): Command[] {
  const scrollTo = useScrollTo();
  const copy = useCopy();
  const { show } = useToast();
  const { motionEnabled, grainEnabled, toggleMotion, toggleGrain } = useMotionPrefs();

  const navigate: Command[] = NAV_SECTIONS.map((section) => ({
    id: `go:${section.id}`,
    label: section.label,
    group: 'Navigate',
    icon: Navigation,
    keywords: `${section.codename} ${section.index} jump scroll go to`,
    hint: section.index,
    run: () => scrollTo(section.id),
  }));

  return [
    ...navigate,

    {
      id: 'action:resume',
      label: 'Download résumé',
      group: 'Actions',
      icon: ArrowDownToLine,
      keywords: 'cv pdf hire',
      run: () => {
        const anchor = document.createElement('a');
        anchor.href = PROFILE.resumePath;
        anchor.download = PROFILE.resumeFileName;
        document.body.append(anchor);
        anchor.click();
        anchor.remove();
      },
    },
    {
      id: 'action:copy-email',
      label: 'Copy email address',
      group: 'Actions',
      icon: Copy,
      keywords: `clipboard contact ${PROFILE.email}`,
      hint: PROFILE.email,
      run: () => void copy(PROFILE.email, 'Address'),
    },
    {
      id: 'action:email',
      label: 'Compose email',
      group: 'Actions',
      icon: Mail,
      keywords: 'mailto write message contact',
      run: () => {
        window.location.href = `mailto:${PROFILE.email}`;
      },
    },
    {
      id: 'action:github',
      label: 'Open GitHub profile',
      group: 'Actions',
      icon: Github,
      keywords: `source code repos ${PROFILE.handle}`,
      hint: `@${PROFILE.handle}`,
      run: () => window.open(PROFILE.github, '_blank', 'noopener,noreferrer'),
    },

    {
      id: 'display:motion',
      label: motionEnabled ? 'Disable animation' : 'Enable animation',
      group: 'Display',
      icon: Clapperboard,
      keywords: 'motion reduce accessibility prefers-reduced-motion animation',
      hint: motionEnabled ? 'on' : 'off',
      keepOpen: true,
      run: toggleMotion,
    },
    {
      id: 'display:grain',
      label: grainEnabled ? 'Disable film grain' : 'Enable film grain',
      group: 'Display',
      icon: Film,
      keywords: 'noise texture overlay',
      hint: grainEnabled ? 'on' : 'off',
      keepOpen: true,
      run: toggleGrain,
    },
    {
      id: 'display:tokens',
      label: 'Open design token sheet',
      group: 'Display',
      icon: Monitor,
      keywords: 'palette colours type scale specimen dev',
      run: () => {
        window.location.search = '?tokens';
      },
    },

    {
      id: 'system:sudo',
      label: 'sudo',
      group: 'System',
      icon: Terminal,
      secret: true,
      run: () => show(`${PROFILE.handle} is not in the sudoers file`),
    },
  ];
}
