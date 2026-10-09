import { createContext } from 'react';

export type ToastState = {
  /** Show a short confirmation. Replaces any toast already on screen. */
  show: (message: string) => void;
};

export const ToastContext = createContext<ToastState | null>(null);
