import { useCallback } from 'react';
import { useToast } from '@/hooks/useToast';

/**
 * Copy to the clipboard and say so.
 *
 * `navigator.clipboard` is undefined outside a secure context and its
 * `writeText` rejects when the permission is denied — a copy button that
 * silently does nothing is worse than one that admits it failed, so both
 * paths raise a toast. (localhost counts as secure, so this works in dev.)
 */
export function useCopy() {
  const { show } = useToast();

  return useCallback(
    async (text: string, label: string) => {
      try {
        if (!navigator.clipboard) throw new Error('no clipboard api');
        await navigator.clipboard.writeText(text);
        show(`${label} copied`);
      } catch {
        show('Copy blocked. Select and copy manually');
      }
    },
    [show],
  );
}
