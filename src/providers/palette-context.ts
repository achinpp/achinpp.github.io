import { createContext } from 'react';

export type PaletteState = {
  open: boolean;
  setOpen: (next: boolean) => void;
  toggle: () => void;
};

export const PaletteContext = createContext<PaletteState | null>(null);
