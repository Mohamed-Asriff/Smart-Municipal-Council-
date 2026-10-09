import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Building, 
  CreditCard, 
  Edit3, 
  Save, 
  Check, 
  FileCheck2
} from 'lucide-react';

export default function PortalProfile({ 
  user, 
  onUpdateUser 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdateUser(formData);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl">
      
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-red-600 to-red-800 p-1 shadow-lg shadow-red-950/60">
              <div className="w-full h-full rounded-2xl bg-zinc-900 flex items-center justify-center text-red-500 font-extrabold text-3xl">
                {user.name.charAt(0)}
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 bg-red-600 text-white p-1 rounded-full shadow" title="Verified Citizen">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>

          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-black text-white">{user.name}</h2>
              <span className="bg-red-600/10 text-red-400 border border-red-600/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Check className="w-3 h-3 text-red-500" />
                {user.status || 'Verified Citizen'}
              </span>
            </div>

            <p className="text-sm text-zinc-400">
              Citizen NIC: <strong className="text-zinc-200 font-mono">{user.nic}</strong>
            </p>

            <p className="text-xs text-zinc-500">
              Municipal Ward: <span className="text-zinc-300 font-medium">{user.zone}</span> • Member since {user.joinedDate || '2025'}
            </p>
          </div>

          <div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-zinc-700 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditing ? 'Cancel Editing' : 'Edit Profile'}</span>
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="mt-4 p-3 bg-red-600/10 border border-red-600/30 rounded-xl text-red-400 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>Profile information successfully updated in the municipal database.</span>
          </div>
        )}
      </div>

      {/* Form or Information Display */}
      <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="font-bold text-lg text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
          <FileCheck2 className="w-5 h-5 text-red-500" />
          <span>Official Civic Credentials</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="text"
                disabled={!isEditing}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* National Identity Card (NIC) - Non editable */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 flex items-center justify-between">
              <span>National Identity Card (NIC)</span>
              <span className="text-[10px] text-zinc-500">Government Locked</span>
            </label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="text"
                disabled
                value={formData.nic}
                className="w-full bg-zinc-950/50 border border-zinc-800/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-400 cursor-not-allowed font-mono"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Official Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="email"
                disabled={!isEditing}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Mobile Contact (SMS Notifications)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="text"
                disabled={!isEditing}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
          </div>

          {/* Municipal Ward / Zone */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Municipal Ward / Administrative Zone
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="text"
                disabled={!isEditing}
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          {/* Assessment Account Number */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 flex items-center justify-between">
              <span>Primary Assessment Account No.</span>
              <span className="text-[10px] text-zinc-500">KMC Treasury Link</span>
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="text"
                disabled={!isEditing}
                value={formData.assessmentNo}
                onChange={(e) => setFormData({ ...formData, assessmentNo: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none focus:border-red-500 font-mono"
              />
            </div>
          </div>

          {/* Residential Address */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Permanent Residential / Business Address
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3" />
              <input
                type="text"
                disabled={!isEditing}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

        </div>

        {isEditing && (
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => { setFormData({ ...user }); setIsEditing(false); }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-red-950/60 transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </form>

    </div>
  );
}
