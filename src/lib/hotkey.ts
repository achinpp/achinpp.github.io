/**
 * The label printed on the palette chips.
 *
 * Cosmetic only — the binding itself accepts both Meta+K and Ctrl+K on every
 * platform (see `<PaletteProvider />`), because guessing wrong about someone's
 * keyboard and then refusing their shortcut is worse than showing the other
 * label.
 *
 * `navigator.platform` is deprecated, so this reads the user agent, once at
 * module scope: it cannot change without a reload.
 *
 * It lives in its own module rather than beside the component because a file
 * that exports both a component and a constant breaks React Fast Refresh —
 * every edit to it would do a full reload instead of a hot swap.
 */
const IS_APPLE =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

export const HOTKEY_LABEL = IS_APPLE ? '⌘K' : 'Ctrl K';
