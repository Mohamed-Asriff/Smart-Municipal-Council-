import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "inline-flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-lg shadow-sm transition-all duration-200 border border-transparent disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-kmc-navy text-white hover:bg-kmc-navy-light hover:shadow-md",
    gold: "bg-kmc-gold text-kmc-navy hover:bg-yellow-500 hover:shadow-md",
    outline: "bg-white text-kmc-navy border-slate-300 hover:bg-slate-50 hover:border-kmc-navy",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-kmc-navy shadow-none border-transparent",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};