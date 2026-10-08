import { createContext } from 'react';

export type MotionPrefs = {
  /** True when animation is allowed to run. The single source of truth. */
  motionEnabled: boolean;
  /** True when the film-grain overlay is painted. */
  grainEnabled: boolean;
  /** What the OS asked for, before any in-page override. */
  systemReducedMotion: boolean;
  /** Null = follow the OS. Boolean = the user overrode it in-page. */
  motionOverride: boolean | null;
  toggleMotion: () => void;
  toggleGrain: () => void;
  /** Drop the in-page override and go back to following the OS. */
  resetMotion: () => void;
};

export const MotionPrefsContext = createContext<MotionPrefs | null>(null);

export const MOTION_STORAGE_KEY = 'scc.motion';
export const GRAIN_STORAGE_KEY = 'scc.grain';
