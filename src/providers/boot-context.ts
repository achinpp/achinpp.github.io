import { createContext } from 'react';

export type BootState = {
  /** True while the boot overlay is on the glass. */
  booting: boolean;
  /** True once the overlay has handed the page over. */
  booted: boolean;
  /** End the sequence. Idempotent, so skip paths can all call it. */
  finish: () => void;
};

export const BootContext = createContext<BootState | null>(null);
