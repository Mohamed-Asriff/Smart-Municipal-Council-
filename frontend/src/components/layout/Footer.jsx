import React from 'react';
import { MapPin, Phone, Mail, ExternalLink, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { dict } = useLanguage();
  const t = dict?.footer || {};

  return (
    <footer id="contact" className="bg-[#0B1E33] text-slate-300 font-sans border-t-4 border-kmc-gold">
      <div className="bg-red-900/90 text-white py-2 px-4 text-center text-xs font-semibold tracking-wide flex justify-center items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>{t.helpline}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1 space-y-4" >
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border justify-center border-white/10 w-fit mx-auto">
              <img src="/sri_lanka_emblem.jpg" alt="KMC Logo" className=" w-16 h-16 object-cover scale-125"/>
            </div>
            <h3 className="font-serif font-bold text-white text-lg leading-tight">Kalmunai Municipal Council</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Committed to transparent governance, digital citizen services, and sustainable urban development for the people of Kalmunai.</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider font-sans">{t.secretariat}</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3"><MapPin className="w-5 h-5 text-kmc-gold shrink-0" /><span className="whitespace-pre-line">{t.address}</span></li>
              <li className="flex items-center gap-3"><Phone className="w-5 h-5 text-kmc-gold shrink-0" /><span>{t.phone}</span></li>
              <li className="flex items-center gap-3"><Mail className="w-5 h-5 text-kmc-goldshrink-0" /><span>{t.email}</span></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider font-sans">{t.servicesTitle}</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#services" className="hover:text-kmc-gold transition-colors">Report an Issue</a></li>
              <li><a href="#tracker" className="hover:text-kmc-goldtransition-colors">Track Complaint Status</a></li>
              <li><a href="#services" className="hover:text-kmc-gold transition-colors">Pay Assessment Tax</a></li>
              <li><a href="#services" className="hover:text-kmc-goldtransition-colors">Trade License Renewal</a></li>
              <li><a href="#services" className="hover:text-kmc-gold transition-colors">Smart Waste Bins</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider font-sans">{t.portalsTitle}</h4>
            <ul className="space-y-3 text-sm">
              <li><a href="https://www.gov.lk" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-kmc-gold transition-colors"><Globe className="w-4 h-4" /> Gov.lk <ExternalLink className="w-3 h-3 ml-auto opacity-50" /></a></li>
              <li><a href="https://www.icta.lk" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-kmc-gold transition-colors"><Globe className="w-4 h-4" /> ICTA Sri Lanka <ExternalLink className="w-3 h-3 ml-auto opacity-50" /></a></li>
              <li><a href="https://www.uda.gov.lk" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-kmc-gold transition-colors"><Globe className="w-4 h-4" /> Urban Development Authority <ExternalLink className="w-3 h-3 ml-auto opacity-50" /></a></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>{t.copyright}</p>
          <p>{t.poweredBy}</p>
        </div>
      </div>
    </footer>
  );
}