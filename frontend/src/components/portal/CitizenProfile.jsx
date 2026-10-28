import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, ShieldCheck, Building2, CreditCard, Save, Camera } from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function CitizenProfile({ user }) {
  const { login } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    zone: user?.zone || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateProfile(form);
      if (updated) {
        login(updated, localStorage.getItem('kmc_auth_token'));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) { console.warn(e); }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-[#0B1E33] via-[#16324F] to-[#1E4268] relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(212,175,55,0.2),transparent_60%)]"></div>
        </div>
        
        <div className="px-6 sm:px-8 pb-6 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16">
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-yellow-600 flex items-center justify-center text-[#0B1E33] font-black text-4xl shadow-2xl border-4 border-white">
                {user?.name?.charAt(0) || 'C'}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#0B1E33] text-white flex items-center justify-center shadow-lg hover:bg-[#16324F] transition">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 text-center sm:text-left pb-2">
              <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
                <h1 className="text-2xl font-bold text-[#16324F]">{user?.name || 'Citizen'}</h1>
                <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  <ShieldCheck className="w-3 h-3" /> Verified
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">Citizen since {new Date().getFullYear()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-[#16324F]">Personal Information</h2>
          {saved && <span className="text-xs text-emerald-600 font-bold">✓ Changes saved</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { key: 'name', label: 'Full Name', icon: User, type: 'text' },
            { key: 'email', label: 'Email Address', icon: Mail, type: 'email' },
            { key: 'phone', label: 'Phone Number', icon: Phone, type: 'tel' },
            { key: 'zone', label: 'Municipal Ward', icon: MapPin, type: 'text' },
          ].map(({ key, label, icon: Icon, type }) => (
            <div key={key}>
              <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                {label}
              </label>
              <div className="relative">
                <Icon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#16324F] font-medium focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition"
                />
              </div>
            </div>
          ))}

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
              Residential Address
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-[#16324F] font-medium focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
              Assessment Account (Locked)
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={user?.assessmentNo || ''}
                disabled
                className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 font-mono cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-[#D4AF37] hover:bg-yellow-500 text-[#0B1E33] font-bold px-6 py-3 rounded-xl shadow-md transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}