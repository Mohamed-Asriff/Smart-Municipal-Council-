import React, { useState, useRef, useEffect } from 'react';
import { Globe, Menu, X, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onOpenPortal }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const langDropdownRef = useRef(null);

  const { lang, setLang, dict } = useLanguage();
  const { user } = useAuth();

  // Handle Scroll Effect & Active Section Tracking
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      const sections = ['home', 'about', 'services', 'tracker', 'announcements', 'contact'];
      
      // Force 'contact' active if near the bottom of the page
      const scrollBottom = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      if (scrollBottom >= documentHeight - 300) {
        setActiveSection('contact');
        return;
      }

      // Force 'home' active if at the very top
      if (window.scrollY < 100) {
        setActiveSection('home');
        return;
      }

      // Standard detection for middle sections
      const scrollPosition = window.scrollY + 150;

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Click Outside for Language Dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const nav = dict?.nav || {};
  const t = {
    home: nav.home || 'Home',
    about: nav.about || 'About Us',
    services: nav.services || 'Services',
    complaintTrack: nav.complaintTrack || 'Track Issue',
    announcements: nav.announcements || 'Announcements',
    contact: nav.contact || 'Contact Us',
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'si', label: 'සිංහල (Sinhala)' },
  ];

  const navLinks = [
    { id: 'home', href: '#home', label: t.home },
    { id: 'about', href: '#about', label: t.about },
    { id: 'services', href: '#services', label: t.services },
    { id: 'tracker', href: '#tracker', label: t.complaintTrack },
    { id: 'announcements', href: '#announcements', label: t.announcements },
    { id: 'contact', href: '#contact', label: t.contact },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 transition-all duration-300">
      <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Glassmorphic Container */}
        <div 
          className={`mt-4 flex items-center justify-between px-6 py-3 rounded-2xl transition-all duration-300 border ${
            isScrolled 
              ? 'bg-[#0B1E33]/95 backdrop-blur-xl border-white/10 shadow-lg' 
              : 'bg-white/10 backdrop-blur-md border-white/20 shadow-sm'
          }`}
        >
          
          {/* --- Branding --- */}
          <a href="#home" className="flex items-center gap-3 shrink-0 group">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center overflow-hidden border border-white/20">
    <img
      src="/sri_lanka_emblem.jpg"
      alt="KMC Logo"
      className="w-full h-full object-cover scale-125" 
      // scale-125 zooms it in slightly to cut off the white edges of the original image
    />
              <div className="w-px h-6 bg-white/30 hidden sm:block"></div>
            </div>
            <div className="flex flex-col ml-1">
              <h1 className="font-serif font-bold text-2xl text-white leading-tight tracking-wide drop-shadow-md">
                Kalmunai Municipal Council
              </h1>
            </div>
          </a>

          {/* --- Desktop Nav Links --- */}
          <nav className="hidden lg:flex items-center justify-center gap-6 flex-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  className={`relative flex flex-col items-center justify-center text-[13px] font-semibold uppercase tracking-wider transition-colors duration-200 ${
                    isActive ? 'text-kmc-gold' : 'text-white hover:text-kmc-gold'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-2 w-1.5 h-1.5 bg-kmc-gold rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]"></span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* --- Right Actions (Language & Mobile) --- */}
          <div className="flex items-center gap-3 shrink-0">
            
            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg backdrop-blur-sm transition"
              >
                <Globe size={14} />
                <span className="uppercase">{lang}</span>
                <ChevronDown size={12} className={`transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
                  <div className="p-1">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLang(l.code);
                          setIsLangOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition ${
                          lang === l.code
                            ? 'bg-blue-50 text-kmc-navy font-bold'
                            : 'text-slate-600 hover:bg-slate-50 font-medium'
                        }`}
                      >
                        <span>{l.label}</span>
                        {lang === l.code && <Check size={14} className="text-kmc-navy" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg backdrop-blur-sm transition"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- Mobile Dropdown Menu --- */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-4 right-4 mt-2 bg-[#0B1E33] rounded-2xl shadow-2xl border border-white/10 overflow-hidden backdrop-blur-xl">
          <div className="flex flex-col p-4 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  activeSection === link.id
                    ? 'bg-kmc-gold/10text-[#D4AF37]'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 mt-2 border-t border-white/10">
              {user ? (
                <button
                  onClick={() => {
                    onOpenPortal();
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-3 bg-kmc-gold text-[#0B1E33] font-bold text-sm rounded-xl shadow-md"
                >
                  Go to Portal
                </button>
              ) : (
                <p className="text-center text-xs text-slate-400 py-2">
                  Use the Hero section to Log In or Register.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}