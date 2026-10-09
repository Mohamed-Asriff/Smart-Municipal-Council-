import React, { useState } from 'react';
import { PhoneCall, Globe, Menu, X, LogIn, UserPlus, User, LayoutDashboard, LogOut } from 'lucide-react';
import { translations } from '../data/translations';

export default function Navbar({ 
  lang, 
  setLang, 
  onOpenAuth, 
  currentUser, 
  onOpenPortal, 
  onLogout 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[lang].nav;

  return (
    <header className="sticky top-0 z-50 transition-all duration-300">
      {/* Top Hotline Bar */}
      <div className="bg-black text-zinc-300 text-sm py-2 px-4 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-red-500 font-medium text-sm">
              <PhoneCall className="w-4 h-4" /> Emergency Helpline: <a href="tel:1990" className="underline font-bold text-white hover:text-red-400">1990 Suwa Seriya</a>
            </span>
            <span className="hidden md:inline text-zinc-600">|</span>
            <span className="hidden md:inline text-sm">
              KMC Secretariat: <strong className="text-white font-bold">067-2220261</strong>
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
              <Globe className="w-4 h-4 ml-1.5 text-zinc-400" />
              <button
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-xs rounded-md font-bold transition ${
                  lang === 'en' ? 'bg-red-600 text-white shadow-sm' : 'text-zinc-300 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('ta')}
                className={`px-2.5 py-1 text-xs rounded-md font-bold transition ${
                  lang === 'ta' ? 'bg-red-600 text-white shadow-sm' : 'text-zinc-300 hover:text-white'
                }`}
              >
                தமிழ்
              </button>
              <button
                onClick={() => setLang('si')}
                className={`px-2.5 py-1 text-xs rounded-md font-bold transition ${
                  lang === 'si' ? 'bg-red-600 text-white shadow-sm' : 'text-zinc-300 hover:text-white'
                }`}
              >
                සිංහල
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="glass-nav text-white shadow-xl border-b border-red-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-3.5 shrink-0">
              <div className="w-12 h-12 rounded-full p-0.5 flex items-center justify-center shadow-lg shadow-red-950/50 border-2 border-red-600 bg-black shrink-0 overflow-hidden">
                <img
                  src="/sri_lanka_emblem.jpg"
                  alt="Government of Sri Lanka Emblem"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-lg sm:text-xl lg:text-2xl tracking-tight text-white leading-tight whitespace-nowrap">
                    Kalmunai <span className="text-red-500">Municipal Council</span>
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-zinc-300 font-medium whitespace-nowrap">
                  கல்முனை மாநகர சபை | කල්මුණේ මහා නගර සභාව
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-6 text-base font-semibold text-zinc-100">
              <a href="#services" className="hover:text-red-400 transition-colors">
                {t.services}
              </a>
              <a href="#tracker" className="hover:text-red-400 transition-colors">
                {t.complaintTrack}
              </a>
              <a href="#announcements" className="hover:text-red-400 transition-colors">
                {t.announcements}
              </a>
              <a href="#contact" className="hover:text-red-400 transition-colors">
                {t.contact}
              </a>

              {/* Conditional Auth vs Portal User Actions */}
              <div className="flex items-center gap-3 pl-3 border-l border-zinc-800">
                {currentUser ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onOpenPortal}
                      className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-red-950/50 transition transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Citizen Dashboard</span>
                    </button>

                    <button
                      onClick={onLogout}
                      className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-xl transition"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => onOpenAuth && onOpenAuth('login')}
                      className="flex items-center gap-1.5 text-sm font-semibold text-zinc-200 hover:text-white px-3.5 py-2 rounded-xl hover:bg-zinc-800/80 transition"
                    >
                      <LogIn className="w-4 h-4 text-red-500" />
                      <span>{t.login}</span>
                    </button>

                    <button
                      onClick={() => onOpenAuth && onOpenAuth('register')}
                      className="flex items-center gap-1.5 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 px-4 py-2 rounded-xl shadow-lg shadow-red-950/50 transition transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{t.register}</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Mobile menu toggle */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-zinc-300 hover:text-white p-2 rounded-lg bg-zinc-900 border border-zinc-800"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-zinc-950 border-t border-zinc-800 px-4 pt-3 pb-6 space-y-3">
            <a
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-zinc-200 hover:text-red-400 font-medium"
            >
              {t.services}
            </a>
            <a
              href="#tracker"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-zinc-200 hover:text-red-400 font-medium"
            >
              {t.complaintTrack}
            </a>
            <a
              href="#announcements"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-zinc-200 hover:text-red-400 font-medium"
            >
              {t.announcements}
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-zinc-200 hover:text-red-400 font-medium"
            >
              {t.contact}
            </a>

            {/* Mobile Auth / Dashboard */}
            <div className="pt-3 border-t border-zinc-800">
              {currentUser ? (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenPortal();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-bold shadow-md transition"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Open Citizen Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-zinc-900 text-zinc-400 hover:text-red-400 text-xs font-semibold border border-zinc-800 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out ({currentUser.name})</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onOpenAuth) onOpenAuth('login');
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-zinc-900 text-zinc-200 hover:text-white text-sm font-semibold border border-zinc-800 transition"
                  >
                    <LogIn className="w-4 h-4 text-red-500" />
                    <span>{t.login}</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (onOpenAuth) onOpenAuth('register');
                    }}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-bold shadow-md transition"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{t.register}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
