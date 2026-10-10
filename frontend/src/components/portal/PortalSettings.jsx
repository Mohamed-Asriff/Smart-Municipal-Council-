import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Lock, 
  Globe, 
  Smartphone, 
  ShieldAlert, 
  Moon, 
  Save, 
  Check, 
  KeyRound,
  Database,
  Server
} from 'lucide-react';

export default function PortalSettings({ 
  lang, 
  setLang 
}) {
  const [notifications, setNotifications] = useState({
    smsAlerts: true,
    whatsappAlerts: true,
    emailReceipts: true,
    emergencyBroadcasts: true
  });

  const [passwordState, setPasswordState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [savedFeedback, setSavedFeedback] = useState('');
  const [backendUrl, setBackendUrl] = useState(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api');

  const handleToggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    triggerFeedback('Notification preferences updated.');
  };

  const triggerFeedback = (msg) => {
    setSavedFeedback(msg);
    setTimeout(() => setSavedFeedback(''), 3000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    setPasswordState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    triggerFeedback('Password changed successfully.');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      
      {/* Settings Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-7 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-red-500" />
            Citizen Account Settings
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Manage alerts, security preferences, language, and backend sync options.
          </p>
        </div>

        {savedFeedback && (
          <span className="bg-red-600/10 text-red-400 border border-red-600/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-3.5 h-3.5 text-red-500" />
            {savedFeedback}
          </span>
        )}
      </div>

      {/* 1. Language & Localization */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
        <h3 className="font-bold text-base text-white flex items-center gap-2 pb-3 border-b border-zinc-800">
          <Globe className="w-4 h-4 text-red-500" />
          <span>Language & Regional Display</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'en', label: 'English', sub: 'Standard' },
            { id: 'ta', label: 'தமிழ்', sub: 'Tamil' },
            { id: 'si', label: 'සිංහල', sub: 'Sinhala' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (setLang) setLang(item.id);
                triggerFeedback(`System display language set to ${item.label}`);
              }}
              className={`p-4 rounded-2xl border text-left transition ${
                lang === item.id
                  ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950/60'
                  : 'bg-zinc-950/70 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white'
              }`}
            >
              <p className="font-extrabold text-base">{item.label}</p>
              <p className={`text-xs mt-0.5 ${lang === item.id ? 'text-white/80' : 'text-zinc-400'}`}>{item.sub}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Notification Preferences */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
        <h3 className="font-bold text-base text-white flex items-center gap-2 pb-3 border-b border-zinc-800">
          <Bell className="w-4 h-4 text-red-500" />
          <span>Municipal Alert Channels</span>
        </h3>

        <div className="space-y-3">
          {[
            { key: 'smsAlerts', label: 'SMS Progress Updates', desc: 'Receive real-time text messages when council field crews work on your complaint.' },
            { key: 'whatsappAlerts', label: 'WhatsApp Municipal Alerts', desc: 'Instant WhatsApp reminders for upcoming tax due dates and waste collection changes.' },
            { key: 'emailReceipts', label: 'Email E-Receipts', desc: 'Automatically send PDF tax receipts and payment verification to your registered email.' },
            { key: 'emergencyBroadcasts', label: 'Emergency Civil Broadcasts', desc: 'High-priority SMS alerts for heavy rain, flood risks, and coastal advisory.' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3.5 bg-zinc-950/70 border border-zinc-800/80 rounded-2xl">
              <div className="pr-4">
                <p className="font-semibold text-sm text-zinc-100">{item.label}</p>
                <p className="text-xs text-zinc-400">{item.desc}</p>
              </div>

              <button
                type="button"
                onClick={() => handleToggle(item.key)}
                className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${
                  notifications[item.key] ? 'bg-red-600' : 'bg-zinc-800'
                }`}
              >
                <span className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                  notifications[item.key] ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Security & Password */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
        <h3 className="font-bold text-base text-white flex items-center gap-2 pb-3 border-b border-zinc-800">
          <Lock className="w-4 h-4 text-red-500" />
          <span>Security & Password Management</span>
        </h3>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={passwordState.currentPassword}
                onChange={(e) => setPasswordState({ ...passwordState, currentPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">New Password</label>
              <input
                type="password"
                required
                value={passwordState.newPassword}
                onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwordState.confirmPassword}
                onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-2 rounded-xl text-xs transition shadow-md"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* 4. Backend REST API Connectivity */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
        <h3 className="font-bold text-base text-white flex items-center gap-2 pb-3 border-b border-zinc-800">
          <Sliders className="w-4 h-4 text-red-500" />
          <span>Civic Cloud REST API Configuration</span>
        </h3>

        <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 text-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-red-500" />
                <span>Backend REST API Endpoint</span>
              </p>
              <p className="text-zinc-400 text-[11px] mt-0.5">
                Connected to Spring Boot application running on your server.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 font-bold">API Ready</span>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              className="flex-1 bg-black border border-zinc-800 rounded-xl px-3 py-2 text-zinc-300 font-mono text-xs focus:outline-none focus:border-red-500"
            />
            <button
              type="button"
              onClick={() => triggerFeedback(`Spring Boot endpoint set to: ${backendUrl}`)}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
            >
              Save Endpoint
            </button>
          </div>

          <div className="pt-2 text-zinc-500 text-[11px] flex flex-wrap gap-4">
            <span>Database: <strong>PostgreSQL 15+</strong></span>
            <span>Authentication: <strong>JWT / Bearer Token</strong></span>
            <span>Schema: <strong>users, complaints, payments, assessment_tax</strong></span>
          </div>
        </div>
      </div>

    </div>
  );
}
