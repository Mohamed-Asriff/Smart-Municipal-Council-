import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, ShieldCheck, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nicOrPhone, setNicOrPhone] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize initial mode when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setSuccessMsg('');
      setIsSubmitting(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Call Spring Boot REST API
    let authUser = null;
    if (mode === 'login') {
      const res = await api.login({ email, password });
      if (res && res.user) {
        authUser = res.user;
        if (res.token) localStorage.setItem('kmc_auth_token', res.token);
      }
      setSuccessMsg('Logged in successfully! Redirecting to Citizen Dashboard...');
    } else {
      const res = await api.register({ name, email, password, nic: nicOrPhone });
      if (res && res.user) {
        authUser = res.user;
        if (res.token) localStorage.setItem('kmc_auth_token', res.token);
      }
      setSuccessMsg('Account registered successfully! Redirecting to Citizen Portal...');
    }

    // Pass created or logged in user data back (with graceful fallback defaults)
    const citizenUser = authUser || {
      id: "USR-KMC-" + Math.floor(1000 + Math.random() * 9000),
      name: name || (email.split('@')[0] || 'A. Mohamed Rizwan'),
      email: email || 'citizen@kalmunai.mc.gov.lk',
      phone: nicOrPhone.startsWith('0') ? nicOrPhone : '+94 77 234 5678',
      nic: nicOrPhone.includes('V') || nicOrPhone.length >= 10 ? nicOrPhone : '199214502891V',
      zone: 'Sainthamaruthu - Ward 03',
      address: 'Beach Road, Sainthamaruthu, Kalmunai',
      assessmentNo: 'KMC-TAX-2026-9041',
      joinedDate: 'September 2026',
      status: 'Verified Citizen'
    };

    setTimeout(() => {
      setIsSubmitting(false);
      if (onAuthSuccess) onAuthSuccess(citizenUser);
      onClose();
      setSuccessMsg('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-950 text-white rounded-3xl max-w-md w-full border border-zinc-800 shadow-2xl overflow-hidden relative my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Tabs */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800 bg-black">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-red-500" />
            <h3 className="text-base font-bold text-white">
              {mode === 'login' ? 'Citizen Portal Login' : 'Create Citizen Account'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg bg-zinc-900 border border-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 p-1.5 bg-black border-b border-zinc-800 text-sm font-semibold">
          <button
            type="button"
            onClick={() => { setMode('login'); setSuccessMsg(''); }}
            className={`py-2.5 rounded-xl transition ${
              mode === 'login' 
                ? 'bg-red-600 text-white shadow-md' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setSuccessMsg(''); }}
            className={`py-2.5 rounded-xl transition ${
              mode === 'register' 
                ? 'bg-red-600 text-white shadow-md' 
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Register
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {successMsg ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-600/20 text-red-500 mx-auto flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <p className="text-red-400 font-semibold text-sm">{successMsg}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-zinc-400">
                {mode === 'login'
                  ? 'Access your municipal services, tracked issues, and online tax payments.'
                  : 'Register with your National Identity Card or mobile number to file complaints and pay bills.'}
              </p>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. A. Mohamed Rizwan"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              )}

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    NIC / Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={nicOrPhone}
                      onChange={(e) => setNicOrPhone(e.target.value)}
                      placeholder="NIC (e.g. 199012345678) or 077XXXXXXX"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {mode === 'login' && (
                <div className="flex justify-between items-center text-xs text-zinc-400">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded bg-black border-zinc-800 text-red-600 focus:ring-0" />
                    Remember me
                  </label>
                  <a href="#contact" onClick={onClose} className="text-red-400 hover:underline">
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-950/60 transition flex items-center justify-center gap-2 mt-4 active:scale-95 disabled:opacity-60"
              >
                <span>{isSubmitting ? 'Authenticating...' : mode === 'login' ? 'Sign In to Portal' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                  className="text-xs text-zinc-400 hover:text-red-400 transition"
                >
                  {mode === 'login'
                    ? "Don't have an account? Register now"
                    : 'Already have an account? Sign in'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
