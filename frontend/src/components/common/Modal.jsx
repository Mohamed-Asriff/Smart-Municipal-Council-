import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, subtitle, icon: Icon, children, maxWidth = 'max-w-lg' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-kmc-navy/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`bg-white rounded-2xl w-full ${maxWidth} shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]`}>
        {/* Header */}
        <div className="bg-kmc-navy p-5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-kmc-gold border border-white/20">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              <h2 className="text-white font-serif font-bold text-lg leading-tight">{title}</h2>
              {subtitle && <p className="text-[10px] text-slate-300 uppercase tracking-wider font-bold mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition"><X className="w-5 h-5" /></button>
        </div>
        
        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};