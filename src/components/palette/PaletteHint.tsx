import { usePalette } from '@/hooks/usePalette';
import { HOTKEY_LABEL } from '@/lib/hotkey';

/**
 * The discoverability chip. A palette nobody knows about is a palette nobody
 * uses, so the shortcut is printed in two places — the nav and the HUD — and
 * both are buttons, because the shortcut is useless to anyone without a
 * keyboard.
 */
export function PaletteHint({ className }: { className?: string }) {
  const { toggle } = usePalette();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Open command palette"
      // No `display` utility here on purpose. Tailwind emits `.inline-flex`
      // AFTER `.hidden`, so a base `inline-flex` silently beat the caller's
      // `hidden sm:inline-flex` and the chip showed at 390px — where a
      // keyboard shortcut is useless. Caught by the browser pass. Display is
      // the caller's to set.
      className={`items-center gap-1.5 font-mono tracking-[0.1em] whitespace-nowrap uppercase transition-colors duration-200 ${className ?? ''}`}
    >
      <kbd className="font-mono not-italic">{HOTKEY_LABEL}</kbd>
    </button>
  );
}
