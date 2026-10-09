import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useLenis } from 'lenis/react';
import { Menu, X } from 'lucide-react';
import { PaletteHint } from '@/components/palette/PaletteHint';
import { NAV_SECTIONS, SECTION_IDS, getSection } from '@/data/sections';
import { useActiveSection } from '@/hooks/useActiveSection';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import { useScrollTo } from '@/hooks/useScrollTo';
import { duration, easeOutExpo, spring, stagger } from '@/lib/motion/easings';

export function FloatingNav() {
  const { hidden, atTop } = useScrollDirection();
  const active = useActiveSection(SECTION_IDS);
  const scrollTo = useScrollTo();
  const lenis = useLenis();

  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLButtonElement>(null);

  const activeSection = getSection(active);

  const go = useCallback(
    (id: string) => {
      setMenuOpen(false);
      scrollTo(id);
    },
    [scrollTo],
  );

  // Freeze the page behind the mobile sheet. Lenis owns the scroll position,
  // so `overflow: hidden` on <body> alone wouldn't stop a wheel event.
  useEffect(() => {
    if (!menuOpen) return;

    // Captured now: by cleanup time the button may have re-rendered, and the
    // ref would point somewhere else (or nowhere).
    const trigger = triggerRef.current;

    lenis?.stop();
    document.body.classList.add('scroll-lock');
    // Move focus into the sheet so keyboard users aren't left behind it.
    firstItemRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);

    return () => {
      lenis?.start();
      document.body.classList.remove('scroll-lock');
      document.removeEventListener('keydown', onKey);
      // Hand focus back to the button that opened it.
      trigger?.focus();
    };
  }, [menuOpen, lenis]);

  return (
    <>
      {/* Outer wrapper owns the centring so Framer's `y` on the inner element
          doesn't fight a Tailwind `-translate-x-1/2` on the same transform. */}
      <div
        className="pointer-events-none fixed inset-x-0 top-3 flex justify-center px-3 sm:top-4"
        style={{ zIndex: 'var(--z-nav)' }}
      >
        <motion.nav
          aria-label="Sections"
          initial={false}
          animate={{
            y: hidden && !menuOpen ? '-180%' : '0%',
            opacity: hidden && !menuOpen ? 0 : 1,
          }}
          transition={{ duration: duration.base, ease: easeOutExpo }}
          className="pointer-events-auto flex w-full max-w-fit items-center gap-1 rounded-full border p-1.5 transition-colors duration-500 sm:gap-0.5"
          style={{
            borderColor: atTop ? 'transparent' : 'var(--color-hairline)',
            backgroundColor: atTop ? 'transparent' : 'oklch(0.14 0.013 265 / 0.72)',
            backdropFilter: atTop ? 'none' : 'blur(var(--blur-pane))',
            boxShadow: atTop ? 'none' : 'var(--shadow-elev-2)',
          }}
        >
          {/* Monogram — back to top. */}
          <button
            type="button"
            onClick={() => go('hero')}
            aria-label="Back to top"
            className="grid size-9 shrink-0 place-items-center rounded-full font-mono text-sm text-mint-400 transition-colors duration-200 ease-out-expo hover:bg-mint-950"
          >
            &gt;_
          </button>

          {/* ------------------------------------------------- desktop links */}
          <ul className="hidden items-center sm:flex">
            {NAV_SECTIONS.map((section) => {
              const isActive = section.id === active;
              return (
                <li key={section.id} className="relative">
                  <button
                    type="button"
                    onClick={() => go(section.id)}
                    aria-current={isActive ? 'true' : undefined}
                    className="relative z-10 block px-3.5 py-2.5 font-mono text-label uppercase transition-colors duration-200"
                    style={{
                      color: isActive ? 'var(--color-mint-300)' : 'var(--color-ink-faint)',
                    }}
                  >
                    {section.label}
                  </button>
                  {isActive && (
                    <motion.span
                      layoutId="nav-indicator"
                      transition={spring.indicator}
                      aria-hidden
                      className="absolute inset-0 rounded-full border border-mint-900 bg-mint-950/60"
                    />
                  )}
                </li>
              );
            })}
          </ul>

          {/* ⌘K chip. Desktop only — a keyboard shortcut is not an
              affordance on a phone, and the mobile pill has no room. */}
          <div className="hidden items-center sm:flex">
            <span aria-hidden className="mx-1 h-3 w-px bg-hairline" />
            <PaletteHint className="rounded-full px-3 py-2.5 text-[0.625rem] text-obsidian-500 hover:text-mint-300" />
          </div>

          {/* -------------------------------------------------- mobile pill */}
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:hidden">
            <span className="min-w-0 flex-1 truncate font-mono text-label text-ink-faint uppercase">
              {activeSection?.codename ?? ''}
            </span>
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="nav-sheet"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="grid size-9 shrink-0 place-items-center rounded-full text-ink"
            >
              {menuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </motion.nav>
      </div>

      {/* ---------------------------------------------------- mobile sheet */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="nav-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Sections"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.fast }}
            className="fixed inset-0 sm:hidden"
            style={{
              zIndex: 'var(--z-overlay)',
              backgroundColor: 'oklch(0.105 0.012 265 / 0.86)',
              backdropFilter: 'blur(var(--blur-shroud))',
            }}
            onClick={() => setMenuOpen(false)}
          >
            <motion.ul
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: stagger.base, delayChildren: 0.06 } },
              }}
              className="flex h-full flex-col justify-center gap-1 px-7"
              // The backdrop closes on click; the list shouldn't.
              onClick={(e) => e.stopPropagation()}
            >
              {NAV_SECTIONS.map((section, i) => {
                const isActive = section.id === active;
                return (
                  <motion.li
                    key={section.id}
                    variants={{
                      hidden: { opacity: 0, x: -16 },
                      visible: { opacity: 1, x: 0 },
                    }}
                  >
                    <button
                      ref={i === 0 ? firstItemRef : undefined}
                      type="button"
                      onClick={() => go(section.id)}
                      aria-current={isActive ? 'true' : undefined}
                      className="group flex w-full items-baseline gap-4 py-3 text-left"
                    >
                      <span
                        className="font-mono text-[0.6875rem]"
                        style={{
                          color: isActive ? 'var(--color-mint-400)' : 'var(--color-obsidian-600)',
                        }}
                      >
                        {section.index}
                      </span>
                      <span
                        className="font-display text-display-md"
                        style={{ color: isActive ? 'var(--color-mint-300)' : 'var(--color-ink)' }}
                      >
                        {section.label}
                      </span>
                    </button>
                  </motion.li>
                );
              })}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
