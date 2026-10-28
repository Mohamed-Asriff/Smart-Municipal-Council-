import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function ServicesSection({ onOpenReport, onOpenPay, onOpenWaste }) {
  const { dict } = useLanguage();
  const t = dict?.services || { items: [] };

  return (
    <section id="services" className="py-16 bg-transparent relative overflow-hidden border-b border-slate-200/50 flex flex-col justify-center min-h-[calc(100vh-80px)]">
      <div className="relative max-w-325 mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-kmc-navy tracking-tight leading-tight">
            {t.title}
          </h2>
          <p className="text-base text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Services Grid (3 Columns x 2 Rows = 6 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {t.items?.map((item) => {
            return (
              <div
                key={item.id}
                className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg hover:border-kmc-blue/30 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Title */}
                  <h3 className="font-serif text-[18px] font-bold text-kmc-navy mb-2 leading-tight">
                    {item.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[13px] text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                {/* Action Button */}
                <div className="pt-4 mt-4 border-t border-slate-100">
                  {(item.id === 'waste' || item.id === 'smartBins') && (
                    <button
                      onClick={onOpenWaste}
                      className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#10B981] hover:text-[#059669] transition-colors group/btn"
                    >
                      <span>{t.btnWaste}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  )}
                  {item.id === 'tax' && (
                    <button
                      onClick={onOpenPay}
                      className="inline-flex items-center gap-1.5 text-[13px] font-bold text-kmc-blue hover:text-[#1D4ED8] transition-colors group/btn"
                    >
                      <span>{t.btnPay}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  )}
                  {item.id === 'roads' && (
                    <button
                      onClick={onOpenReport}
                      className="inline-flex items-center gap-1.5 text-[13px] font-bold text-kmc-blue hover:text-[#1D4ED8] transition-colors group/btn"
                    >
                      <span>{t.btnComplaint}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  )}
                  {(item.id === 'ai' || item.id === 'analytics') && (
                    <a
                      href="#tracker"
                      className="inline-flex items-center gap-1.5 text-[13px] font-bold text-kmc-blue hover:text-[#1D4ED8] transition-colors group/btn"
                    >
                      <span>{t.btnLearn}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}