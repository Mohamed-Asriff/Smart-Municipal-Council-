import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, subtitle, icon: Icon, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-kmc-navy/70 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl w-full ${maxWidth} shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || Icon) && (
          <div className="bg-kmc-navy p-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-kmc-gold border border-white/20">
                  <Icon className="w-5 h-5" />
                </div>
              )}
              <div>
                {title    && <h2 className="text-white font-serif font-bold text-lg leading-tight">{title}</h2>}
                {subtitle && <p className="text-[10px] text-slate-300 uppercase tracking-wider font-bold mt-0.5">{subtitle}</p>}
              </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition p-1" aria-label="Close">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
}