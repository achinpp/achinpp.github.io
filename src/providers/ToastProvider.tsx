import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ToastContext } from '@/providers/toast-context';
import { duration, easeOutExpo } from '@/lib/motion/easings';

const LIFETIME_MS = 2600;

/**
 * One toast at a time, replaced rather than stacked.
 *
 * A queue would be the obvious shape, but everything that raises a toast here
 * is a single deliberate act — copying an address, sending a message — so two
 * can only overlap if someone clicks twice, and in that case the second
 * message is the one they want to read. A stack would show them a history of
 * their own clicks.
 *
 * The `key` is a counter, not the message: clicking the same copy button twice
 * must restart the animation and the timer, and `AnimatePresence` keys off
 * identity. With the message as the key the second click would be a no-op.
 *
 * It is portalled to `<body>` for the same reason the project detail panel is
 * (Stage 4): `<main>` is a stacking context at `--z-content`, so nothing
 * inside it can paint above the nav.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const timer = useRef(0);
  const nextId = useRef(0);

  const show = useCallback((message: string) => {
    window.clearTimeout(timer.current);
    nextId.current += 1;
    setToast({ id: nextId.current, message });
    timer.current = window.setTimeout(() => setToast(null), LIFETIME_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {createPortal(
        <div
          className="pointer-events-none fixed inset-x-0 flex justify-center px-4"
          style={{
            zIndex: 'var(--z-toast)',
            // Clears the fixed HUD strip (Stage 1) plus the iOS home bar.
            bottom: 'calc(2.75rem + env(safe-area-inset-bottom))',
          }}
        >
          <AnimatePresence>
            {toast && (
              <motion.output
                key={toast.id}
                // `role="status"` on <output> is implicit and polite, so the
                // message is announced without interrupting.
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: duration.base, ease: easeOutExpo }}
                className="flex items-center gap-2.5 rounded-full border border-mint-900 bg-obsidian-900/95 px-5 py-2.5 font-mono text-[0.6875rem] tracking-[0.12em] text-mint-200 uppercase shadow-elev-2 backdrop-blur-[var(--blur-veil)]"
              >
                <span aria-hidden className="size-1.5 rounded-full bg-mint-400" />
                {toast.message}
              </motion.output>
            )}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}
