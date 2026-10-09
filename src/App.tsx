import { GridBackdrop } from '@/components/backdrop/GridBackdrop';
import { ScanlineSweep } from '@/components/backdrop/ScanlineSweep';
import { CustomCursor } from '@/components/chrome/CustomCursor';
import { FloatingNav } from '@/components/chrome/FloatingNav';
import { StatusHUD } from '@/components/chrome/StatusHUD';
import { SectionScaffold } from '@/components/dev/SectionScaffold';
import { Experience } from '@/components/experience/Experience';
import { Hero } from '@/components/hero/Hero';
import { Projects } from '@/components/projects/Projects';
import { TokenSheet } from '@/components/dev/TokenSheet';
import { MotionProvider } from '@/providers/MotionProvider';
import { PointerProvider } from '@/providers/PointerProvider';
import { SmoothScrollProvider } from '@/providers/SmoothScrollProvider';

/**
 * `?tokens` keeps the Stage 0 specimen sheet reachable without it being in
 * the way. Read once at module scope — it can't change without a reload.
 */
const SHOW_TOKENS =
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('tokens');

export function App() {
  return (
    <MotionProvider>
      <PointerProvider>
        <SmoothScrollProvider>
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
              <TokenSheet />
            </main>
          ) : (
            <>
              <FloatingNav />
              {/* pb clears the fixed HUD so the last section isn't cut off. */}
              <main id="main" className="relative z-[var(--z-content)] pb-7">
                <Hero />
                <Experience />
                <Projects />
                <SectionScaffold />
              </main>
              <StatusHUD />
            </>
          )}

          <CustomCursor />
        </SmoothScrollProvider>
      </PointerProvider>
    </MotionProvider>
  );
}
