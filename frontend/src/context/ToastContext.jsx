import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { ToastViewport } from '../components/ui/Toast';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((variant, message, opts = {}) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, variant, message, title: opts.title }]);
    const duration = opts.duration ?? 4500;
    if (duration > 0) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const value = {
    toasts,
    dismiss,
    success: (msg, o) => push('success', msg, o),
    error:   (msg, o) => push('error', msg, o),
    warning: (msg, o) => push('warning', msg, o),
    info:    (msg, o) => push('info', msg, o),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}