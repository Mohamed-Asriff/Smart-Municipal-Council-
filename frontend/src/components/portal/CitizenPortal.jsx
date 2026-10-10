import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  User,
  Settings as SettingsIcon,
  LogOut,
  ArrowLeft,
  Menu,
  X
} from 'lucide-react';
import PortalDashboard from './PortalDashboard';
import PortalComplaints from './PortalComplaints';
import PortalPayments from './PortalPayments';
import PortalProfile from './PortalProfile';
import PortalSettings from './PortalSettings';

export default function CitizenPortal({
  user,
  onLogout,
  onBackToPublic,
  complaints,
  payments,
  notices,
  onOpenReport,
  onOpenPayment,
  onUpdateUser,
  lang,
  setLang,
  initialTab = 'dashboard'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'complaints', label: 'Complaints', icon: FileText, badge: complaints.filter(c => c.status !== 'Resolved').length },
    { id: 'payments', label: 'Payments', icon: CreditCard, badge: payments.filter(p => p.status === 'Pending').length },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-red-600 selection:text-white">

      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">

        {/* Left Brand / Back */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button
            onClick={onBackToPublic}
            className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-2 rounded-xl transition"
            title="Return to Public Municipal Council Website"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Public Website</span>
          </button>

          <div className="h-5 w-[1px] bg-zinc-800 hidden sm:block" />

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full border border-red-600 bg-black p-0.5 overflow-hidden shrink-0">
              <img src="/sri_lanka_emblem.jpg" alt="Emblem" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                Kalmunai <span className="text-red-500">Citizen Portal</span>
              </span>
              <p className="text-[10px] text-zinc-400 hidden md:block">
                e-Services & Municipal Governance Interface
              </p>
            </div>
          </div>
        </div>

        {/* Right User & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-zinc-300 font-medium">PostgreSQL Sync</span>
          </div>

          <div
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2.5 bg-zinc-900/80 hover:bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl cursor-pointer transition"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-red-600 to-red-800 text-white font-bold text-xs flex items-center justify-center">
              {user.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <p className="text-xs font-bold text-white truncate max-w-[120px]">{user.name}</p>
              <p className="text-[10px] text-zinc-400 font-mono">{user.nic}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 text-zinc-400 hover:text-red-400 bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 hover:border-red-800/50 rounded-xl transition"
            title="Log Out of Citizen Portal"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">

        {/* Left Navigation Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 bg-zinc-950 lg:bg-transparent border-r lg:border-r-0 border-zinc-800 p-6 lg:p-0 transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-4 sticky top-24 space-y-1">

            <div className="px-3 py-3 mb-2 border-b border-zinc-800">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Citizen Navigation</p>
              <p className="text-xs text-zinc-500 truncate">{user.zone}</p>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition text-left ${isActive
                    ? 'bg-red-600 text-white shadow-lg shadow-red-950/60'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive
                      ? 'bg-white text-red-600'
                      : 'bg-red-600 text-white'
                      }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Quick Public Switch */}
            <div className="pt-4 mt-4 border-t border-zinc-800 space-y-2">
              <button
                onClick={onBackToPublic}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-zinc-500" />
                <span>Return to Landing</span>
              </button>

              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/30 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>

          </div>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 min-w-0 pb-12">
          {activeTab === 'dashboard' && (
            <PortalDashboard
              user={user}
              complaints={complaints}
              payments={payments}
              notices={notices}
              onNavigate={setActiveTab}
              onOpenReport={onOpenReport}
              onOpenPayment={onOpenPayment}
            />
          )}

          {activeTab === 'complaints' && (
            <PortalComplaints
              complaints={complaints}
              onOpenReport={onOpenReport}
            />
          )}

          {activeTab === 'payments' && (
            <PortalPayments
              payments={payments}
              user={user}
              onPayBill={onOpenPayment}
            />
          )}

          {activeTab === 'profile' && (
            <PortalProfile
              user={user}
              onUpdateUser={onUpdateUser}
            />
          )}

          {activeTab === 'settings' && (
            <PortalSettings
              lang={lang}
              setLang={setLang}
            />
          )}
        </main>

      </div>

    </div>
  );
}
