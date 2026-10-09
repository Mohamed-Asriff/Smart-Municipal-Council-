import React from 'react';
import { 
  FileText, 
  Trash2, 
  CreditCard, 
  Droplet, 
  Building2, 
  BarChart3, 
  ArrowUpRight 
} from 'lucide-react';
import { translations } from '../data/translations';

export default function ServicesSection({ lang, onOpenReport, onOpenPay }) {
  const t = translations[lang].services;

  const iconMap = {
    complaint: <FileText className="w-6 h-6 text-red-600" />,
    waste: <Trash2 className="w-6 h-6 text-zinc-900" />,
    payments: <CreditCard className="w-6 h-6 text-red-600" />,
    water: <Droplet className="w-6 h-6 text-red-700" />,
    permits: <Building2 className="w-6 h-6 text-zinc-900" />,
    analytics: <BarChart3 className="w-6 h-6 text-red-600" />
  };

  return (
    <section id="services" className="py-20 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-sm font-extrabold uppercase tracking-widest text-red-600 bg-red-50 px-3.5 py-1.5 rounded-full border border-red-200">
            {t.tagline}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-950 tracking-tight">
            {t.title}
          </h2>
          <p className="text-zinc-600 text-lg sm:text-xl font-normal">
            {t.subtitle}
          </p>
        </div>

        {/* Grid of Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {t.items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl border border-zinc-200 hover:border-red-500/60 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between group"
            >
              <div>
                <div className="w-14 h-14 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center mb-6 group-hover:bg-red-600 group-hover:border-red-600 group-hover:scale-110 transition-all duration-300">
                  <span className="group-hover:text-white transition-colors">
                    {React.cloneElement(iconMap[item.id], {
                      className: `w-6 h-6 ${iconMap[item.id].props.className} group-hover:text-white transition-colors`
                    })}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-zinc-950 mb-3 group-hover:text-red-600 transition-colors">
                  {item.title}
                </h3>
                <p className="text-zinc-600 text-base leading-relaxed mb-6">
                  {item.desc}
                </p>
              </div>

              <div>
                {item.id === 'complaint' && (
                  <button
                    onClick={onOpenReport}
                    className="inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 transition"
                  >
                    <span>File Complaint Now</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                )}
                {item.id === 'payments' && (
                  <button
                    onClick={onOpenPay}
                    className="inline-flex items-center gap-2 text-sm font-bold text-zinc-900 hover:text-red-600 transition"
                  >
                    <span>Pay Online Treasury</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                )}
                {item.id === 'waste' && (
                  <a
                    href="#tracker"
                    className="inline-flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700 transition"
                  >
                    <span>Request Waste Pickup</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                )}
                {['water', 'permits', 'analytics'].includes(item.id) && (
                  <a
                    href="#tracker"
                    className="inline-flex items-center gap-2 text-sm font-bold text-zinc-900 hover:text-red-600 transition"
                  >
                    <span>Learn More & Access</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
