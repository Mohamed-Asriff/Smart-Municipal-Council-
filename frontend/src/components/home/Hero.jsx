import React from 'react';
import { UserPlus, User } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Hero({ onOpenAuth }) {
  const { dict } = useLanguage();
  const h = dict?.hero || {};
  const s = dict?.stats || {};

  return (
    <section id="home" className="relative overflow-hidden bg-[#0B1E33] min-h-[calc(100vh-80px)] flex flex-col justify-center">
      <div className="absolute inset-0 z-0">
        <img src="/kmc_building_clear.jpg" alt="KMC Building" className="w-full h-full object-cover object-center opacity-60" />
        <div className="absolute inset-0 bg-linear-to-r from-[#0B1E33] via-[#0B1E33]/90 to-transparent"></div>
        <div className="absolute inset-0 bg-linear-to-t from-[#0B1E33] via-transparent to-[#0B1E33]/40"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32 pb-16">
        <div className="max-w-3xl space-y-6">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.15] drop-shadow-lg">
            {h.titlePrefix}{' '}<br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-kmc-gold via-kmc-gold-light to-kmc-gold">{h.titleHighlight}</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-light">{h.subTitle}</p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button onClick={() => onOpenAuth('register')} className="group flex items-center gap-2 bg-linear-to-r from-kmc-gold to-kmc-gold-light hover:from-[#E6C24A] hover:to-[#FFF5D0] text-[#0B1E33] font-bold px-8 py-3.5 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 transform hover:-translate-y-0.5">
              <UserPlus className="w-5 h-5" />
              <span>{h.registerBtn || 'Register'}</span>
            </button>
            <button onClick={() => onOpenAuth('login')} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white font-semibold px-8 py-3.5 rounded-xl backdrop-blur-md border border-white/20 transition-all duration-300">
              <User className="w-5 h-5 text-kmc-gold" />
              <span>{h.signInBtn || 'Sign In'}</span>
            </button>
          </div>

          <div className="pt-2">
            <a href="#tracker" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors border-b border-transparent hover:border-kmc-gold pb-0.5">
              {h.trackPrompt || 'Already have a ticket?'}{' '}
              <span className="font-semibold text-kmc-gold">{h.trackLink || 'Track your complaint'}</span>
            </a>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {[
            { value: s.resolutionRate, label: s.resolutionLabel, color: 'from-emerald-500/80' },
            { value: s.activeSensors, label: s.activeSensorsLabel, color: 'from-blue-500/80' },
            { value: s.avgResponse, label: s.avgResponseLabel, color: 'from-amber-500/80' },
            { value: s.citizensServed, label: s.citizensServedLabel, color: 'from-[#D4AF37]' },
          ].map((stat, idx) => (
            <div key={idx} className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${stat.color} to-transparent`}></div>
              <div className="text-2xl sm:text-3xl font-black text-white font-sans mb-1">{stat.value}</div>
              <div className="text-sm text-slate-300 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}