import { useContext } from 'react';
import { BootContext, type BootState } from '@/providers/boot-context';

/** Where the boot sequence has got to. Throws outside <BootProvider>. */
export function useBoot(): BootState {
  const ctx = useContext(BootContext);
  if (!ctx) throw new Error('useBoot must be used inside <BootProvider>');
  return ctx;
}
