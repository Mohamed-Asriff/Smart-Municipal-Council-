import React, { useState } from 'react';
import { LayoutDashboard, Newspaper, Bell, FileText, Users, ArrowLeft, LogOut, Menu, X } from 'lucide-react';
import AdminNews from './AdminNews';
import AdminNotices from './AdminNotices';
import AdminComplaints from './AdminComplaints';
import AdminUsers from './AdminUsers';

export default function AdminPortal({ user, onLogout, onBackToPublic }) {
  const [activeTab, setActiveTab] = useState('news');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { id: 'news', label: 'News Articles', icon: Newspaper },
    { id: 'notices', label: 'Public Notices', icon: Bell },
    { id: 'complaints', label: 'Complaints', icon: FileText },
    { id: 'users', label: 'Citizens', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <button
            onClick={onBackToPublic}
            className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-2 rounded-xl transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Public Site</span>
          </button>
          <div className="h-5 w-[1px] bg-zinc-800 hidden sm:block" />
          <div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight">
              SMC <span className="text-red-500">Admin Console</span>
            </span>
            <p className="text-[10px] text-zinc-400 hidden md:block">
              Municipal Content & Complaint Management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-zinc-300 font-medium">Admin</span>
          </div>
          <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-red-600 to-red-800 text-white font-bold text-xs flex items-center justify-center">
              {user.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-xs font-bold text-white truncate max-w-[120px]">{user.name}</p>
              <p className="text-[10px] text-red-400 font-mono">ADMIN</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-zinc-400 hover:text-red-400 bg-zinc-900 border border-zinc-800 rounded-xl transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 bg-zinc-950 lg:bg-transparent border-r lg:border-r-0 border-zinc-800 p-6 lg:p-0 transition-transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-4 sticky top-24 space-y-1">
            <div className="px-3 py-3 mb-2 border-b border-zinc-800">
              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Admin Menu</p>
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition text-left ${
                    isActive
                      ? 'bg-red-600 text-white shadow-lg shadow-red-950/60'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 min-w-0 pb-12">
          {activeTab === 'news' && <AdminNews />}
          {activeTab === 'notices' && <AdminNotices />}
          {activeTab === 'complaints' && <AdminComplaints />}
          {activeTab === 'users' && <AdminUsers />}
        </main>
      </div>
    </div>
  );
}