import React from 'react';

const VARIANTS = {
  primary: 'bg-kmc-navy text-white hover:bg-kmc-navy-light shadow-sm',
  gold:    'bg-kmc-gold text-kmc-navy hover:bg-yellow-500 shadow-sm',
  outline: 'bg-white text-kmc-navy border border-slate-300 hover:border-kmc-navy hover:bg-slate-50',
  ghost:   'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-kmc-navy',
  danger:  'bg-red-600 text-white hover:bg-red-700',
};
const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  children, variant = 'primary', size = 'md',
  className = '', loading = false, disabled, ...rest
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-kmc-blue/30';
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`${base} ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size]} ${className}`}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}