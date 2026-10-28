import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const VARIANTS = {
  success: { icon: CheckCircle2,  cls: 'border-emerald-200 bg-emerald-50 text-emerald-800', iconCls: 'text-emerald-600' },
  error:   { icon: AlertCircle,   cls: 'border-red-200 bg-red-50 text-red-800',             iconCls: 'text-red-600' },
  warning: { icon: AlertTriangle, cls: 'border-amber-200 bg-amber-50 text-amber-800',       iconCls: 'text-amber-600' },
  info:    { icon: Info,          cls: 'border-blue-200 bg-blue-50 text-blue-800',          iconCls: 'text-blue-600' },
};

export function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 w-[90vw] max-w-sm pointer-events-none">
      {toasts.map((t) => {
        const v = VARIANTS[t.variant] || VARIANTS.info;
        const Icon = v.icon;
        return (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border shadow-lg p-3 animate-in fade-in slide-in-from-top-2 ${v.cls}`}
          >
            <Icon className={`w-5 h-5 shrink-0 ${v.iconCls}`} />
            <div className="flex-1 min-w-0">
              {t.title && <p className="text-sm font-bold">{t.title}</p>}
              <p className="text-sm leading-snug break-words">{t.message}</p>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-slate-400 hover:text-slate-700 transition shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}