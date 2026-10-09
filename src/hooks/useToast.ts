import { useContext } from 'react';
import { ToastContext, type ToastState } from '@/providers/toast-context';

/** Raise a short confirmation. Throws outside <ToastProvider>. */
export function useToast(): ToastState {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
