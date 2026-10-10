import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, Phone, ShieldCheck, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nicOrPhone, setNicOrPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg('');
      setSuccessMsg('');
      setIsSubmitting(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      let res;
      if (mode === 'login') {
        res = await api.login({ email, password });
      } else {
        res = await api.register({ name, email, password, nic: nicOrPhone });
      }

      // HARD FAIL — no fake fallback
      if (!res || !res.user || !res.token) {
        setErrorMsg(
          mode === 'login'
            ? 'Login failed. Check your email and password.'
            : 'Registration failed. Email may already exist.'
        );
        setIsSubmitting(false);
        return;
      }

      // Store the token
      localStorage.setItem('kmc_auth_token', res.token);

      // ✅ Use the REAL backend user object (includes role)
      const backendUser = res.user;

      setSuccessMsg('Success! Redirecting…');

      setTimeout(() => {
        setIsSubmitting(false);
        if (onAuthSuccess) onAuthSuccess(backendUser);
        onClose();
        setSuccessMsg('');
      }, 800);

    } catch (err) {
      console.error('Auth error:', err);
      setErrorMsg('Unexpected error. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-950 text-white rounded-3xl max-w-md w-full border border-zinc-800 shadow-2xl overflow-hidden relative my-8">
        <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800 bg-black">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-red-500" />
            <h3 className="text-base font-bold text-white">
              {mode === 'login' ? 'Citizen Portal Login' : 'Create Citizen Account'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg bg-zinc-900 border border-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 p-1.5 bg-black border-b border-zinc-800 text-sm font-semibold">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMsg(''); }}
            className={`py-2.5 rounded-xl transition ${
              mode === 'login' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMsg(''); }}
            className={`py-2.5 rounded-xl transition ${
              mode === 'register' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400'
            }`}
          >
            Register
          </button>
        </div>

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
                  : 'Register to file complaints and pay bills online.'}
              </p>

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="text" required value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. A. Mohamed Rizwan"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              )}

              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">NIC / Mobile</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="text" required value={nicOrPhone}
                      onChange={(e) => setNicOrPhone(e.target.value)}
                      placeholder="NIC or 07XXXXXXXX"
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="password" required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl">
                  <p className="text-xs text-red-300 font-semibold">{errorMsg}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 mt-4 active:scale-95 disabled:opacity-60"
              >
                <span>{isSubmitting ? 'Authenticating…' : mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErrorMsg(''); }}
                  className="text-xs text-zinc-400 hover:text-red-400 transition"
                >
                  {mode === 'login'
                    ? "Don't have an account? Register"
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