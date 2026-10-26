import React from 'react';

export const Input = ({ label, icon: Icon, error, className = '', ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">{label}</label>}
      <div className="relative">
        {Icon && <Icon className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />}
        <input 
          className={`w-full px-4 py-3 bg-white border ${error ? 'border-red-400' : 'border-slate-300'} rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-kmc-blue/20 focus:border-kmc-blue transition-all text-sm ${Icon ? 'pl-10' : ''} ${className}`}
          {...props} 
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};