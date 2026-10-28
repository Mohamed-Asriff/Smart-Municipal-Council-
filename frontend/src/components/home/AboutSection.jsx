import React from 'react';
import { ShieldCheck, Target, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function AboutSection() {
  const { dict } = useLanguage();
  const t = dict?.about || {};

  return (
    <section id="about" className="py-20 bg-transparent relative overflow-hidden border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img src="/kmc_building_clear.jpg" alt="KMC Building" className="w-full h-100 object-cover" />
              <div className="absolute inset-0 bg-linear-to-t from-kmc-navy/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl flex items-center gap-4">
                  <img src="/sri_lanka_emblem.jpg" alt="Emblem" className="w-12 h-12 rounded-full bg-white p-1" />
                  <div>
                    <p className="text-white font-bold text-sm">Official Municipal Authority</p>
                    <p className="text-slate-300 text-xs">Government of Sri Lanka</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-kmc-navy tracking-tight leading-tight mb-4">{t.title}</h2>
              <p className="text-lg text-slate-600 leading-relaxed font-light">{t.subtitle}</p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-kmc-gold rounded-l-2xl"></div>
              <h3 className="font-bold text-kmc-navy mb-2 flex items-center gap-2">
                <Target className="w-5 h-5 text-kmc-blue" />{t.missionTitle}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">{t.missionText}</p>
            </div>

            
          </div>
        </div>
      </div>
    </section>
  );
}