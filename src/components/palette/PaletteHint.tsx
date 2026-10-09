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
      className={`inline-flex items-center gap-1.5 font-mono tracking-[0.1em] whitespace-nowrap uppercase transition-colors duration-200 ${className ?? ''}`}
    >
      <kbd className="font-mono not-italic">{HOTKEY_LABEL}</kbd>
    </button>
  );
}
