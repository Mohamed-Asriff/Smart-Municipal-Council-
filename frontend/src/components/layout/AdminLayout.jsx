import React, { useState, useEffect, useRef } from 'react';
import { 
  Newspaper, Bell, FileText, Users, CreditCard, Trash2, 
  LogOut, Menu, X, ShieldCheck, LayoutDashboard, User, ChevronDown
} from 'lucide-react';

export default function AdminLayout({ user, onLogout, activeTab, setActiveTab, children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Handle click outside to close the profile dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'complaints', label: 'Grievances', icon: FileText },
    { id: 'payments', label: 'Treasury & Revenue', icon: CreditCard },
    { id: 'wastebins', label: 'Smart Waste IoT', icon: Trash2 },
    { id: 'news', label: 'News & Media', icon: Newspaper },
    { id: 'notices', label: 'Public Notices', icon: Bell },
    { id: 'users', label: 'Citizen Directory', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-kmc-navy/60 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-kmc-navy text-white flex flex-col transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Branding */}
        <div className="h-20 flex items-center gap-3 px-6 border-b border-white/10 shrink-0">
          <img src="/kmc_logo.png" alt="KMC" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="font-serif font-bold text-lg leading-tight">KMC Admin</h1>
            <p className="text-[10px] text-kmc-gold uppercase tracking-wider font-bold mt-0.5">Console</p>
          </div>
          <button className="ml-auto lg:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar-dark">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Management</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-kmc-gold text-kmc-navy shadow-md' 
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-kmc-navy' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer (Clean, no public website button) */}
        <div className="p-4 text-center border-t border-white/5 shrink-0">
           <p className="text-[9px] text-slate-500 font-mono">© 2026 KMC</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-8 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-slate-600 bg-slate-100 rounded-lg" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-kmc-navy hidden sm:block">
              {navItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* System Status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">System Online</span>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition group"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-kmc-navy leading-tight">{user?.name || 'Administrator'}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{user?.role || 'ADMIN'}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-kmc-navy text-kmc-gold flex items-center justify-center font-bold border-2 border-kmc-gold/30 shadow-sm group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 hidden sm:block transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                  
                  <div className="px-5 py-4 bg-slate-50 border-b border-slate-200">
                    <p className="font-bold text-sm text-kmc-navy truncate">{user?.name || 'Administrator'}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{user?.email || 'admin@kalmunaimc.gov.lk'}</p>
                  </div>

                  <div className="p-2">
                    <button 
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-kmc-navy transition"
                      onClick={() => { setIsProfileOpen(false); /* Add profile view logic if needed */ }}
                    >
                      <User className="w-4 h-4 text-slate-400" /> My Profile
                    </button>
                  </div>

                  <div className="h-px bg-slate-100 mx-2"></div>

                  <div className="p-2">
                    <button 
                      onClick={() => { setIsProfileOpen(false); onLogout(); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}