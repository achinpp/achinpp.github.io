import { useContext } from 'react';
import { PointerContext, type PointerState } from '@/providers/pointer-context';

/** Read the shared cursor position. Throws outside <PointerProvider>. */
export function usePointer(): PointerState {
  const ctx = useContext(PointerContext);
  if (!ctx) throw new Error('usePointer must be used inside <PointerProvider>');
  return ctx;
}
