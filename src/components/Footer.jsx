import { MapPin, Phone, Mail, ExternalLink, Globe } from 'lucide-react';
import { translations } from '../data/translations';

export default function Footer({ lang }) {
  const t = translations[lang].footer;

  return (
    <footer id="contact" className="bg-black text-zinc-400 text-sm border-t border-zinc-800">
      
      {/* Top emergency hotline bar */}
      <div className="bg-red-950/80 border-b border-red-600/30 py-3 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center items-center gap-6 text-white font-semibold text-sm">
          <span>{t.helpline}</span>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          
          {/* Col 1: Brand & Municipal Secretariat */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full p-0.5 flex items-center justify-center border-2 border-red-600 bg-black shrink-0 overflow-hidden shadow-md shadow-red-950/50">
                <img
                  src="/sri_lanka_emblem.jpg"
                  alt="Government of Sri Lanka Emblem"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h3 className="text-white font-bold text-lg leading-tight">
                Kalmunai Municipal Council <br />
                <span className="text-sm text-zinc-400 font-normal">கல்முனை மாநகர சபை</span>
              </h3>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Empowering the residents of Kalmunai through smart digital services, AI complaint tracking, and real-time environmental monitoring.
            </p>
          </div>

          {/* Col 2: Contact & Address */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-base uppercase tracking-wider">Secretariat Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span className="text-sm leading-relaxed text-zinc-300">{t.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-sm text-zinc-300">{t.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-red-500 shrink-0" />
                <span className="text-sm text-zinc-300">{t.email}</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Sri Lanka Government External Portals */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-base uppercase tracking-wider">Sri Lanka e-Gov Portals</h4>
            <ul className="space-y-3">
              <li>
                <a href="https://www.gov.lk" target="_blank" rel="noreferrer" className="text-sm text-zinc-300 hover:text-white transition flex items-center gap-2">
                  <Globe className="w-4 h-4 text-red-500 shrink-0" /> Government Information Center (gov.lk) <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                </a>
              </li>
              <li>
                <a href="https://www.icta.lk" target="_blank" rel="noreferrer" className="text-sm text-zinc-300 hover:text-white transition flex items-center gap-2">
                  <Globe className="w-4 h-4 text-red-500 shrink-0" /> ICT Agency of Sri Lanka (ICTA) <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                </a>
              </li>
              <li>
                <a href="https://www.uda.gov.lk" target="_blank" rel="noreferrer" className="text-sm text-zinc-300 hover:text-white transition flex items-center gap-2">
                  <Globe className="w-4 h-4 text-red-500 shrink-0" /> Urban Development Authority (UDA) <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 mt-8 border-t border-zinc-800 text-center text-zinc-500 text-xs">
          <p>{t.copyright}</p>
        </div>
      </div>

    </footer>
  );
}
