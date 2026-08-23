import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';
type ToastOptions = { duration?: number; action?: { label: string; onClick: () => void } };
type ToastItem = ToastOptions & { id: number; message: string; type: ToastType };

const ToastContext = createContext<{ showToast: (message: string, type?: ToastType, options?: ToastOptions) => void }>({
  showToast: () => undefined,
});

const toastStyles: Record<ToastType, { background: string; icon: string }> = {
  success: { background: 'linear-gradient(135deg, #10b981, #059669)', icon: 'ti-circle-check' },
  error: { background: 'linear-gradient(135deg, #ef4444, #dc2626)', icon: 'ti-alert-circle' },
  warning: { background: 'linear-gradient(135deg, #f59e0b, #d97706)', icon: 'ti-alert-triangle' },
  info: { background: 'linear-gradient(135deg, #3b82f6, #2563eb)', icon: 'ti-info-circle' },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const dismiss = useCallback((id: number) => setToasts(items => items.filter(item => item.id !== id)), []);
  const showToast = useCallback((message: string, type: ToastType = 'success', options: ToastOptions = {}) => {
    const id = ++nextId.current;
    setToasts(items => [...items, { id, message, type, ...options }].slice(-4));
    if (options.duration !== 0) window.setTimeout(() => dismiss(id), options.duration ?? 3800);
  }, [dismiss]);

  return <ToastContext.Provider value={{ showToast }}>
    {children}
    <div aria-live="polite" aria-atomic="true" style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, maxWidth: 'calc(100vw - 32px)', pointerEvents: 'none' }}>
      {toasts.map(toast => {
        const style = toastStyles[toast.type];
        return <div key={toast.id} className="fadeIn" role={toast.type === 'error' ? 'alert' : 'status'} style={{ pointerEvents: 'auto', background: style.background, color: '#fff', padding: '12px 14px 12px 16px', borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,0.4)', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 9, width: 'fit-content', maxWidth: 380 }}>
          <i className={`ti ${style.icon}`} style={{ fontSize: 18, flexShrink: 0 }} />
          <span style={{ lineHeight: 1.35 }}>{toast.message}</span>
          {toast.action && <button onClick={() => { toast.action?.onClick(); dismiss(toast.id); }} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.45)', color: '#fff', borderRadius: 6, padding: '5px 8px', fontSize: 11, fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>{toast.action.label}</button>}
          <button onClick={() => dismiss(toast.id)} aria-label="Dismiss notification" style={{ background: 'transparent', border: 'none', color: '#fff', padding: 2, cursor: 'pointer', opacity: 0.85, lineHeight: 1 }}><i className="ti ti-x" style={{ fontSize: 16 }} /></button>
        </div>;
      })}
    </div>
  </ToastContext.Provider>;
}

export const useToast = () => useContext(ToastContext);
