import React from 'react';
import { 
  Trash2, 
  Construction, 
  Receipt, 
  Bot, 
  BarChart3, 
  Cpu, 
  ArrowRight 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const getServiceStyle = (id) => {
  switch (id) {
    case 'waste':
      return { icon: Trash2, color: 'text-emerald-600', bg: 'bg-emerald-50', hoverBg: 'group-hover:bg-emerald-600' };
    case 'roads':
      return { icon: Construction, color: 'text-amber-600', bg: 'bg-amber-50', hoverBg: 'group-hover:bg-amber-600' };
    case 'tax':
      return { icon: Receipt, color: 'text-blue-600', bg: 'bg-blue-50', hoverBg: 'group-hover:bg-blue-600' };
    case 'ai':
      return { icon: Bot, color: 'text-purple-600', bg: 'bg-purple-50', hoverBg: 'group-hover:bg-purple-600' };
    case 'analytics':
      return { icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-50', hoverBg: 'group-hover:bg-indigo-600' };
    case 'smartBins':
      return { icon: Cpu, color: 'text-cyan-600', bg: 'bg-cyan-50', hoverBg: 'group-hover:bg-cyan-600' };
    default:
      return { icon: ArrowRight, color: 'text-slate-600', bg: 'bg-slate-50', hoverBg: 'group-hover:bg-slate-600' };
  }
};

export default function ServicesSection({ onOpenReport, onOpenPay, onOpenWaste }) {
  const { dict } = useLanguage();
  const t = dict?.services || { items: [] };

  return (
    <section id="services" className="h-screen w-full bg-slate-50 relative overflow-hidden flex flex-col justify-center py-10 sm:py-16">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-white to-transparent pointer-events-none"></div>
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-kmc-gold/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-kmc-blue/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 flex flex-col h-full justify-center">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-8 shrink-0">
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-kmc-navy tracking-tight leading-tight">
            {t.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Services Grid (3 Columns x 2 Rows) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full flex-1 min-h-0 auto-rows-fr">
          {t.items?.map((item) => {
            const style = getServiceStyle(item.id);
            const Icon = style.icon;
            
            const isWaste = item.id === 'waste' || item.id === 'smartBins';
            const isTax = item.id === 'tax';
            const isRoads = item.id === 'roads';

            return (
              <div
                key={item.id}
                className="group relative bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden h-full"
              >
                {/* Top Accent Line */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-transparent transition-colors duration-300 ${style.hoverBg}`}></div>

                <div className="flex flex-col h-full">
                  {/* Icon Container */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 shrink-0 ${style.bg} ${style.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>

                  {/* Title */}
                  <h3 className="font-serif text-lg font-bold text-kmc-navy mb-2 leading-tight shrink-0">
                    {item.title}
                  </h3>

                  {/* Description (flex-1 ensures it takes available space gracefully) */}
                  <p className="text-sm text-slate-500 leading-relaxed flex-1">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}