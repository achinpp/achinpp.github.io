import { useEffect, type RefObject } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Keep Tab inside a container while it is open, then hand focus back.
 *
 * A modal that doesn't trap focus is worse than no modal: Tab walks straight
 * out into the page behind it, which is covered by a scrim and can't be seen,
 * so a keyboard user has no way of knowing where they are.
 *
 * Three details that matter:
 *
 * **The listener is on `document` in the capture phase.** If focus has already
 * escaped — by a click on the scrim, or a browser quirk — a listener bound to
 * the container would never fire and the trap would be silently dead.
 *
 * **The focusable list is re-read on every Tab**, not cached on open. A panel
 * whose content streams in, or whose buttons appear conditionally, would
 * otherwise trap against a stale first and last element.
 *
 * **`offsetParent` filters hidden items.** `display: none` descendants still
 * match the selector, and wrapping onto one sends focus nowhere visible.
 * (`position: fixed` elements also report a null `offsetParent`, so a fixed
 * child inside the trap would be skipped — none of the callers have one.)
 */
export function useFocusTrap(active: boolean, containerRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    if (!container) return;

    // Captured on open: by cleanup time the trigger may have re-rendered.
    const previous = document.activeElement as HTMLElement | null;

    const items = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );

    items()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const list = items();
      if (list.length === 0) {
        e.preventDefault();
        return;
      }

      const first = list[0];
      const last = list[list.length - 1];
      const focused = document.activeElement;

      if (!container.contains(focused)) {
        e.preventDefault();
        first.focus();
      } else if (!e.shiftKey && focused === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && focused === first) {
        e.preventDefault();
        last.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);

    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      previous?.focus();
    };
  }, [active, containerRef]);
}
