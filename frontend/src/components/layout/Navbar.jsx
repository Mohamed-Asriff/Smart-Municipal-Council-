import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Globe, Menu, X, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const SECTION_IDS = ['home', 'about', 'services', 'tracker', 'announcements'];
const SCROLL_PROBE_OFFSET = 200; // px from top of viewport used to decide the active section

export default function Navbar({ onOpenPortal }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  const langDropdownRef = useRef(null);
  const rafRef = useRef(null);

  const { lang, setLang, dict } = useLanguage();
  const { user } = useAuth();

  // --- Active section tracking (rAF-throttled) ---
  const updateActiveSection = useCallback(() => {
    setIsScrolled(window.scrollY > 20);

    if (window.scrollY < 100) {
      setActiveSection('home');
      return;
    }

    const contactEl = document.getElementById('contact');
    const contactRect = contactEl?.getBoundingClientRect();
    const scrollBottom = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (
      scrollBottom >= documentHeight - 70 ||
      (contactRect && contactRect.top <= window.innerHeight * 0.45)
    ) {
      setActiveSection('contact');
      return;
    }

    // Use getBoundingClientRect() (relative to the viewport) instead of offsetTop,
    // which is unreliable when an ancestor is position:relative.
    for (const id of SECTION_IDS) {
      const el = document.getElementById(id);
      if (!el) continue;

      const rect = el.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const bottom = top + rect.height;

      if (window.scrollY + SCROLL_PROBE_OFFSET >= top && window.scrollY + SCROLL_PROBE_OFFSET < bottom) {
        setActiveSection(id);
        return;
      }
    }
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        updateActiveSection();
        rafRef.current = null;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateActiveSection();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateActiveSection]);

  // --- Close the language dropdown on outside click / Escape ---
  useEffect(() => {
    const onPointerDown = (event) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    };
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setIsLangOpen(false);
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // --- Navigation ---
  const handleNavClick = (e, href) => {
    e.preventDefault();
    setIsMenuOpen(false);

    const sectionId = href.replace('#', '');
    const targetPath = sectionId === 'home' ? '/home' : `/${sectionId}`;

    // Only push if the URL actually changes — avoids duplicate history entries.
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }

    // Optimistic UI update; the scroll listener will confirm it.
    setActiveSection(sectionId);

    if (sectionId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
          {/* Branding */}
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, '#home')}
            className="flex items-center gap-3 shrink-0 group"
          >
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center overflow-hidden border border-white/20">
              <img
                src="/sri_lanka_emblem.jpg"
                alt="KMC Logo"
                className="w-full h-full object-cover scale-125"
              />
              <div className="w-px h-6 bg-white/30 hidden sm:block" />
            </div>
            <div className="flex flex-col ml-1">
              <h1 className="font-serif font-bold text-2xl text-white leading-tight tracking-wide drop-shadow-md">
                Kalmunai Municipal Council
              </h1>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center justify-center gap-6 flex-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative flex flex-col items-center justify-center text-[13px] font-semibold uppercase tracking-wider transition-colors duration-200 ${
                    isActive ? 'text-kmc-gold' : 'text-white hover:text-kmc-gold'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-2 w-1.5 h-1.5 bg-kmc-gold rounded-full shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setIsLangOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={isLangOpen}
                aria-label="Change language"
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg backdrop-blur-sm transition"
              >
                <Globe size={14} />
                <span className="uppercase">{lang}</span>
                <ChevronDown
                  size={12}
                  className={`transition-transform ${isLangOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isLangOpen && (
                <div
                  role="listbox"
                  className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
                >
                  <div className="p-1">
                    {languages.map((l) => {
                      const selected = lang === l.code;
                      return (
                        <button
                          key={l.code}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          onClick={() => {
                            setLang(l.code);
                            setIsLangOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition ${
                            selected
                              ? 'bg-blue-50 text-kmc-navy font-bold'
                              : 'text-slate-600 hover:bg-slate-50 font-medium'
                          }`}
                        >
                          <span>{l.label}</span>
                          {selected && <Check size={14} className="text-kmc-navy" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsMenuOpen((o) => !o)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
              className="lg:hidden p-2 text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg backdrop-blur-sm transition"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-full left-4 right-4 mt-2 bg-[#0B1E33] rounded-2xl shadow-2xl border border-white/10 overflow-hidden backdrop-blur-xl">
          <div className="flex flex-col p-4 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  activeSection === link.id
                    ? 'bg-kmc-gold/10 text-[#D4AF37]'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 mt-2 border-t border-white/10">
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    onOpenPortal?.();
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