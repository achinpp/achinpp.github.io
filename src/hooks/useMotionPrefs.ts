import { useContext } from 'react';
import { MotionPrefsContext, type MotionPrefs } from '@/providers/motion-context';

/** Read the global motion/grain switch. Throws outside <MotionProvider>. */
export function useMotionPrefs(): MotionPrefs {
  const ctx = useContext(MotionPrefsContext);
  if (!ctx) throw new Error('useMotionPrefs must be used inside <MotionProvider>');
  return ctx;
}
