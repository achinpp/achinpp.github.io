import { useContext } from 'react';
import { PaletteContext, type PaletteState } from '@/providers/palette-context';

/** Open, close or toggle the command palette. Throws outside <PaletteProvider>. */
export function usePalette(): PaletteState {
  const ctx = useContext(PaletteContext);
  if (!ctx) throw new Error('usePalette must be used inside <PaletteProvider>');
  return ctx;
}
