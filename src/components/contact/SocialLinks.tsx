import { motion } from 'motion/react';
import { Copy, Crosshair, Github, Linkedin, Mail, ShieldHalf, type LucideIcon } from 'lucide-react';
import { SOCIALS, type Social } from '@/data/contact';
import { PROFILE } from '@/data/profile';
import { useCopy } from '@/hooks/useCopy';
import { useMagnetic } from '@/hooks/useMagnetic';
import { fadeUp } from '@/lib/motion/variants';

const ICON: Record<Social['icon'], LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  mail: Mail,
  shield: ShieldHalf,
  target: Crosshair,
};

/**
 * One channel. Its own component because `useMagnetic` is a hook and a hook
 * can't be called inside a `map`.
 */
function ChannelRow({ social }: { social: Social }) {
  const Icon = ICON[social.icon];
  const { ref, x, y, handlers } = useMagnetic(0.1);

  return (
    <li>
      <motion.a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={social.href ?? undefined}
        target={social.icon === 'mail' ? undefined : '_blank'}
        rel="noreferrer noopener"
        {...handlers}
        style={{ x, y }}
        className="group flex items-center gap-4 rounded-lg border border-hairline bg-obsidian-900/40 px-4 py-3.5 transition-[border-color,box-shadow] duration-300 ease-out-expo hover:border-mint-800 hover:shadow-glow-xs"
      >
        <Icon
          aria-hidden
          size={16}
          className="shrink-0 text-ink-faint transition-colors duration-300 group-hover:text-mint-300"
        />
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[0.5625rem] tracking-[0.2em] text-obsidian-500 uppercase">
            {social.label}
          </span>
          <span className="mt-1 block truncate font-mono text-[0.8125rem] text-ink-muted transition-colors duration-300 group-hover:text-mint-100">
            {social.display}
          </span>
        </span>
      </motion.a>
    </li>
  );
}

export function SocialLinks() {
  const copy = useCopy();

  const live = SOCIALS.filter((social) => social.href !== null);
  const missing = SOCIALS.filter((social) => social.href === null);

  return (
    <motion.div variants={fadeUp}>
      <h3 className="font-mono text-label text-mint-600 uppercase">Channels</h3>

      <ul className="mt-5 space-y-2.5">
        {live.map((social) => (
          <ChannelRow key={social.label} social={social} />
        ))}
      </ul>

      <button
        type="button"
        onClick={() => copy(PROFILE.email, 'Address')}
        className="mt-4 inline-flex items-center gap-2.5 rounded-full border border-hairline px-4 py-2.5 font-mono text-[0.625rem] tracking-[0.14em] text-ink-faint uppercase transition-colors duration-200 hover:border-mint-800 hover:text-mint-200"
      >
        <Copy aria-hidden size={12} />
        Copy address
      </button>

      {/* `href: null` renders nothing rather than a dead link. This says which
          ones, during review only. */}
      {import.meta.env.DEV && missing.length > 0 && (
        <p className="mt-6 font-mono text-[0.5625rem] leading-relaxed tracking-[0.16em] text-signal-400 uppercase">
          ⚠ dev only: no handle supplied for {missing.map((s) => s.label).join(' · ')}
        </p>
      )}
    </motion.div>
  );
}
