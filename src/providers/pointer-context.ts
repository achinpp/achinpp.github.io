import { createContext } from 'react';
import type { MotionValue } from 'motion/react';

export type PointerState = {
  /** Viewport-space cursor position as MotionValues — no re-render on move. */
  x: MotionValue<number>;
  y: MotionValue<number>;
  /** Same position, readable from a rAF loop without touching React at all. */
  posRef: { current: { x: number; y: number; inside: boolean } };
  /** True for a real mouse. False for touch, pen and coarse pointers. */
  isFine: boolean;
};

export const PointerContext = createContext<PointerState | null>(null);
