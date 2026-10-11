import { lazy, Suspense } from 'react';
import { Arsenal } from '@/components/arsenal/Arsenal';
import { GridBackdrop } from '@/components/backdrop/GridBackdrop';
import { ScanlineSweep } from '@/components/backdrop/ScanlineSweep';
import { BattleStation } from '@/components/battlestation/BattleStation';
import { Contact } from '@/components/contact/Contact';
import { CustomCursor } from '@/components/chrome/CustomCursor';
import { FloatingNav } from '@/components/chrome/FloatingNav';
import { Footer } from '@/components/chrome/Footer';
import { StatusHUD } from '@/components/chrome/StatusHUD';
import { Experience } from '@/components/experience/Experience';
import { Hero } from '@/components/hero/Hero';
import { Projects } from '@/components/projects/Projects';
import { BootProvider } from '@/providers/BootProvider';
import { MotionProvider } from '@/providers/MotionProvider';
import { PaletteProvider } from '@/providers/PaletteProvider';
import { PointerProvider } from '@/providers/PointerProvider';
import { SmoothScrollProvider } from '@/providers/SmoothScrollProvider';
import { ToastProvider } from '@/providers/ToastProvider';

/**
 * `?tokens` keeps the Stage 0 specimen sheet reachable without it being in
 * the way. Read once at module scope — it can't change without a reload.
 */
const SHOW_TOKENS =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('tokens');

/**
 * Stage 9: split out of the main bundle.
 *
 * The specimen sheet is a developer tool reachable only at `?tokens`, and it
 * was costing every visitor bytes they would never execute. Because
 * `SHOW_TOKENS` is read once at module scope, the branch below is static for
 * the life of the page — so the chunk is requested on exactly the loads that
 * need it and never on the others.
 */
const TokenSheet = lazy(async () => ({
  default: (await import('@/components/dev/TokenSheet')).TokenSheet,
}));

export function App() {
  return (
    <MotionProvider>
      <PointerProvider>
        <SmoothScrollProvider>
          {/* Inside <SmoothScrollProvider> because the overlay scroll locks
              the page, and the lock has to reach Lenis as well as <body>.
              Outside <PaletteProvider> because nothing should be able to
              open a command palette underneath glass nobody can see past. */}
          <BootProvider enabled={!SHOW_TOKENS}>
            <ToastProvider>
              <PaletteProvider>
                {/* Ambience, behind everything, never interactive. */}
                <GridBackdrop />
                <ScanlineSweep />

                <a
                  href="#main"
                  className="sr-only pane px-4 py-2 font-mono text-label uppercase focus-visible:not-sr-only focus-visible:fixed focus-visible:top-4 focus-visible:left-4 focus-visible:z-[var(--z-toast)] focus-visible:text-mint-300"
                >
                  Skip to content
                </a>

                {SHOW_TOKENS ? (
                  <main id="main" className="relative z-[var(--z-content)]">
                    {/* No fallback worth designing: this route is dev-only and
                      the chunk is a few kB from the same origin. */}
                    <Suspense fallback={null}>
                      <TokenSheet />
                    </Suspense>
                  </main>
                ) : (
                  <>
                    <FloatingNav />
                    <main id="main" className="relative z-[var(--z-content)]">
                      <Hero />
                      <Experience />
                      <Projects />
                      <BattleStation />
                      <Arsenal />
                      <Contact />
                    </main>
                    {/* The footer's own bottom padding clears the fixed HUD, which
                    is why <main> no longer carries any. */}
                    <Footer />
                    <StatusHUD />
                  </>
                )}

                <CustomCursor />
              </PaletteProvider>
            </ToastProvider>
          </BootProvider>
        </SmoothScrollProvider>
      </PointerProvider>
    </MotionProvider>
  );
}
