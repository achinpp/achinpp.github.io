import { lazy, Suspense, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence } from 'motion/react';
import { PaletteContext } from '@/providers/palette-context';

/**
 * Stage 9: the palette is split out of the main bundle.
 *
 * It is the largest thing on the page that most visitors never open, and it
 * pulls in the command list — which in turn imports the clipboard, scroll and
 * motion hooks and a dozen icons. Loading it on first ⌘K costs a request of a
 * few kB from the same origin, by which point the page has long since
 * finished painting.
 *
 * It is NOT prefetched on hover of the hint chip: the chip is in the nav and
 * the HUD on every screen, so hover is a near-certainty and prefetching on it
 * would just be eager loading with extra steps.
 */
const CommandPalette = lazy(async () => ({
  default: (await import('@/components/palette/CommandPalette')).CommandPalette,
}));

/**
 * `/` must not fire while someone is typing. Without this check the slash in
 * an email address, a URL or a sentence in the contact form opens the palette
 * mid-word — and the palette's own input is caught by the same test, so a
 * slash typed into a search stays a slash.
 */
function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

/**
 * Owns whether the palette is open, so the nav chip, the HUD chip and the
 * keyboard shortcut are all operating the same thing.
 *
 * **Meta+K and Ctrl+K are both accepted on every platform.** Detecting the OS
 * to decide which to honour means being wrong for anyone on a Mac with a PC
 * keyboard, or on Linux, or in a VM — and the cost of accepting both is
 * nothing. The chip's label is the only platform-specific part, and that is
 * cosmetic.
 *
 * `preventDefault` matters here: Ctrl+K is "focus the search bar" in Chrome
 * and Firefox, so without it the browser takes the keystroke.
 *
 * The palette is mounted only while open, inside `<AnimatePresence>`. That is
 * what makes `useScrollLock(true)` and `useFocusTrap(true, …)` honest inside
 * it — they are only ever alive when the palette is, and the unmount is what
 * releases the lock and returns focus.
 */
export function PaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const toggle = useCallback(() => setOpen((previous) => !previous), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if ((event.metaKey || event.ctrlKey) && key === 'k') {
        event.preventDefault();
        setOpen((previous) => !previous);
        return;
      }

      if (key === '/' && !event.metaKey && !event.ctrlKey && !isEditable(event.target)) {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const value = useMemo(() => ({ open, setOpen, toggle }), [open, toggle]);

  return (
    <PaletteContext.Provider value={value}>
      {children}
      {/* `fallback={null}` on purpose: a spinner that flashes for 40ms is
          worse than the palette simply appearing a frame later. */}
      <AnimatePresence>
        {open && (
          <Suspense fallback={null}>
            <CommandPalette onClose={close} />
          </Suspense>
        )}
      </AnimatePresence>
    </PaletteContext.Provider>
  );
}
