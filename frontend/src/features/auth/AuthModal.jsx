import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, Mail, Lock, User, Phone, ArrowRight, 
  Eye, EyeOff, CheckCircle2, AlertCircle, CreditCard, Loader2,
  AtSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../api';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onAuthSuccess }) {
  const { login } = useAuth();
  const { dict } = useLanguage();
  
  const [mode, setMode] = useState(initialMode);
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState(''); // NEW
  const [nic, setNic] = useState('');
  const [email, setEmail] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg('');
      setSuccessMsg('');
      setIdentifier('');
      setPassword('');
      setConfirmPassword('');
      setName('');
      setUsername(''); // NEW
      setNic('');
      setEmail('');
      setPhoneDigits('');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setTouched({});
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrorMsg('');
    setSuccessMsg('');
    setTouched({});
  };

  const markTouched = (field) => setTouched((prev) => ({ ...prev, [field]: true }));

  // ============ PASSWORD STRENGTH ============
  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };
  const passwordScore = Object.values(passwordRules).filter(Boolean).length;

  // ============ NIC DECODER (Sri Lanka) ============
  const decodeNIC = (nicValue) => {
    if (!nicValue) return { valid: false, error: 'NIC is required' };
    const clean = nicValue.trim().toUpperCase();

    // Old format: 9 digits + V or X
    if (/^[0-9]{9}[VX]$/.test(clean)) {
      const yearShort = parseInt(clean.slice(0, 2), 10);
      let dayOfYear = parseInt(clean.slice(2, 5), 10);
      const voting = clean[9] === 'V';
      const birthYear = 1900 + yearShort;

      let gender = 'Male';
      if (dayOfYear > 500) {
        gender = 'Female';
        dayOfYear -= 500;
      }

      if (dayOfYear < 1 || dayOfYear > 366) {
        return { valid: false, error: 'Invalid day of year in NIC' };
      }

      const currentYear = new Date().getFullYear();
      if (birthYear > currentYear || birthYear < 1900) {
        return { valid: false, error: 'Invalid birth year in NIC' };
      }

      const date = new Date(birthYear, 0, dayOfYear);
      if (date.getFullYear() !== birthYear) {
        return { valid: false, error: 'Invalid day of year' };
      }

      return {
        valid: true,
        format: 'old',
        birthYear,
        birthday: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        gender,
        voting,
        error: null,
      };
    }

    // New format: 12 digits
    if (/^[0-9]{12}$/.test(clean)) {
      const birthYear = parseInt(clean.slice(0, 4), 10);
      let dayOfYear = parseInt(clean.slice(4, 7), 10);

      let gender = 'Male';
      if (dayOfYear > 500) {
        gender = 'Female';
        dayOfYear -= 500;
      }

      if (dayOfYear < 1 || dayOfYear > 366) {
        return { valid: false, error: 'Invalid day of year in NIC' };
      }

      const currentYear = new Date().getFullYear();
      if (birthYear > currentYear || birthYear < 1900) {
        return { valid: false, error: 'Invalid birth year in NIC' };
      }

      const date = new Date(birthYear, 0, dayOfYear);
      if (date.getFullYear() !== birthYear) {
        return { valid: false, error: 'Invalid day of year' };
      }

      return {
        valid: true,
        format: 'new',
        birthYear,
        birthday: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
        gender,
        voting: true,
        error: null,
      };
    }

    return { valid: false, error: 'NIC must be 9 digits + V/X or 12 digits' };
  };

  // ============ VALIDATIONS ============
  
  const validateName = (val) => {
    if (!val.trim()) return 'Full name is required';
    if (val.trim().length < 2) return 'Name must be at least 2 characters';
    if (!/^[A-Za-z\s.'-]+$/.test(val)) return 'Only letters, spaces, dots, and hyphens allowed';
    return '';
  };

  // NEW: Username validation
  const validateUsername = (val) => {
    if (!val.trim()) return 'Username is required';
    if (val.length < 3) return 'Username must be at least 3 characters';
    if (val.length > 30) return 'Username must be 30 characters or fewer';
    if (!/^[a-zA-Z0-9_]+$/.test(val)) return 'Only letters, numbers, and underscores allowed';
    return '';
  };

  const validateNIC = (val) => {
    const result = decodeNIC(val);
    return result.valid ? '' : result.error;
  };

  const validateEmail = (val) => {
    if (!val.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return 'Enter a valid email (e.g. name@domain.com)';
    return '';
  };

  const validatePhone = (val) => {
    if (!val) return 'Mobile number is required';
    if (!/^[0-9]{9}$/.test(val)) return 'Enter exactly 9 digits after +94';
    if (!/^7[0-9]{8}$/.test(val)) return 'Sri Lankan mobile must start with 7 (e.g. 71, 72, 76, 77)';
    return '';
  };

  const validatePassword = (val) => {
    if (!val) return 'Password is required';
    if (val.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(val)) return 'Must include at least one uppercase letter';
    if (!/[a-z]/.test(val)) return 'Must include at least one lowercase letter';
    if (!/[0-9]/.test(val)) return 'Must include at least one number';
    if (!/[^A-Za-z0-9]/.test(val)) return 'Must include at least one special symbol';
    return '';
  };

  const validateConfirmPassword = (val) => {
    if (!val) return 'Please confirm your password';
    if (val !== password) return 'Passwords do not match';
    return '';
  };

  const errors = {
    name: validateName(name),
    username: validateUsername(username), // NEW
    nic: validateNIC(nic),
    email: validateEmail(email),
    phone: validatePhone(phoneDigits),
    password: validatePassword(password),
    confirmPassword: validateConfirmPassword(confirmPassword),
  };

  const isFormValid = 
    mode === 'login' 
      ? identifier.trim() && password 
      : !errors.name && !errors.username && !errors.nic && !errors.email && !errors.phone && !errors.password && !errors.confirmPassword;

  const nicInfo = decodeNIC(nic);

  // ============ INPUT FORMATTERS ============

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
    setPhoneDigits(digits);
    markTouched('phone');
  };

  const formatPhoneDisplay = (digits) => {
    if (!digits) return '';
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  };

  const handleNICChange = (e) => {
    let value = e.target.value.toUpperCase().replace(/[^0-9VX]/g, '');
    if (value.length > 12) value = value.slice(0, 12);
    setNic(value);
    markTouched('nic');
  };

  const handleNameChange = (e) => {
    const value = e.target.value.replace(/[^A-Za-z\s.'-]/g, '');
    setName(value);
    markTouched('name');
  };

  // NEW: Username formatter
  const handleUsernameChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '').slice(0, 30);
    setUsername(value);
    markTouched('username');
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value.replace(/\s/g, ''));
    markTouched('email');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!isFormValid) {
      setErrorMsg('Please fix the highlighted fields before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await api.login({ identifier: identifier.trim(), password });
        if (res.error || !res.user) throw new Error(res.error || 'Invalid credentials.');
        setSuccessMsg(`Welcome back, ${res.user.name || 'Citizen'}!`);
        login(res.user, res.token);
        setTimeout(() => { if (onAuthSuccess) onAuthSuccess(res.user); onClose(); }, 800);
      } else {
        const fullPhone = `+94${phoneDigits}`;
        const res = await api.register({
          name: name.trim(),
          username: username.trim().toLowerCase(), // NEW
          nic: nic.trim().toUpperCase(),
          email: email.trim().toLowerCase(),
          phone: fullPhone,
          password,
          confirmPassword
        });
        if (res.error || !res.user) throw new Error(res.error || 'Registration failed.');
        setSuccessMsg(`Account created successfully for ${res.user.name}!`);
        login(res.user, res.token);
        setTimeout(() => { if (onAuthSuccess) onAuthSuccess(res.user); onClose(); }, 1000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderError = (field) => {
    if (!touched[field] || !errors[field]) return null;
    return (
      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" /> {errors[field]}
      </p>
    );
  };

  const renderSuccess = (field, value) => {
    if (!touched[field] || errors[field] || !value) return null;
    return <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-3.5" />;
  };

  const strengthColor = 
    passwordScore <= 2 ? 'bg-red-500' :
    passwordScore === 3 ? 'bg-amber-500' :
    passwordScore === 4 ? 'bg-blue-500' : 'bg-emerald-500';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-kmc-navy/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
        
        {/* Header */}
        <div className="bg-kmc-navy px-6 py-5 flex items-center justify-between relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-32 h-32 bg-kmc-gold/10 rounded-bl-full pointer-events-none"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-kmc-gold border border-white/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-white font-serif font-bold text-lg leading-tight">
                {mode === 'login' ? 'Citizen Sign In' : 'Register Citizen'}
              </h2>
              <p className="text-slate-300 text-[10px] font-medium tracking-wider uppercase mt-0.5">
                Kalmunai Municipal Council
              </p>
            </div>
          </div>
          <button onClick={onClose} className="relative z-10 text-slate-400 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar max-h-[75vh]">
          
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><p>{errorMsg}</p>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2 text-sm text-emerald-700">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /><p>{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* LOGIN */}
            {mode === 'login' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Email, Username or NIC</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input type="text" className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-kmc-blue/20 focus:border-kmc-blue transition-all text-sm pl-10" placeholder="Email, username, or NIC" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Password</label>
                    <button type="button" className="text-xs text-kmc-blue hover:underline font-semibold">Forgot?</button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input type={showPassword ? 'text' : 'password'} className="w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-kmc-blue/20 focus:border-kmc-blue transition-all text-sm pl-10 pr-10" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* REGISTER */}
            {mode === 'register' && (
              <>
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Full Legal Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input type="text" className={`w-full px-4 py-3 bg-white border rounded-lg text-sm transition-all pl-10 ${touched.name && errors.name ? 'border-red-300 focus:ring-2 focus:ring-red-100 focus:border-red-400' : 'border-slate-300 focus:outline-none focus:ring-2 focus:ring-kmc-blue/20 focus:border-kmc-blue'}`} placeholder="e.g. A. Mohamed Rizwan" value={name} onChange={handleNameChange} onBlur={() => markTouched('name')} />
                    {renderSuccess('name', name)}
                  </div>
                  {renderError('name')}
                </div>

                {/* NEW: Username */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    Username <span className="text-slate-400 font-normal lowercase tracking-normal">(letters, numbers, underscore)</span>
                  </label>
                  <div className="relative">
                    <AtSign className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input 
                      type="text" 
                      className={`w-full px-4 py-3 bg-white border rounded-lg text-sm font-mono transition-all pl-10 ${
                        touched.username && errors.username 
                          ? 'border-red-300 focus:ring-2 focus:ring-red-100 focus:border-red-400' 
                          : 'border-slate-300 focus:outline-none focus:ring-2 focus:ring-kmc-blue/20 focus:border-kmc-blue'
                      }`}
                      placeholder="e.g. rizwan_kmc" 
                      value={username} 
                      onChange={handleUsernameChange}
                      onBlur={() => markTouched('username')}
                      maxLength={30}
                    />
                    {renderSuccess('username', username)}
                  </div>
                  {renderError('username')}
                </div>

                {/* NIC */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    NIC Number
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input 
                      type="text" 
                      className={`w-full px-4 py-3 bg-white border rounded-lg text-sm font-mono transition-all pl-10 ${
                        touched.nic && errors.nic 
                          ? 'border-red-300 focus:ring-2 focus:ring-red-100 focus:border-red-400' 
                          : 'border-slate-300 focus:outline-none focus:ring-2 focus:ring-kmc-blue/20 focus:border-kmc-blue'
                      }`}
                      placeholder="921450289V or 199214502891" 
                      value={nic} 
                      onChange={handleNICChange} 
                      onBlur={() => markTouched('nic')} 
                      maxLength={12} 
                    />
                    {touched.nic && !errors.nic && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 absolute right-3 top-3.5" />
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input type="email" className={`w-full px-4 py-3 bg-white border rounded-lg text-sm transition-all pl-10 ${touched.email && errors.email ? 'border-red-300 focus:ring-2 focus:ring-red-100 focus:border-red-400' : 'border-slate-300 focus:outline-none focus:ring-2 focus:ring-kmc-blue/20 focus:border-kmc-blue'}`} placeholder="citizen@example.com" value={email} onChange={handleEmailChange} onBlur={() => markTouched('email')} />
                    {renderSuccess('email', email)}
                  </div>
                  {renderError('email')}
                </div>

                {/* Phone with +94 prefix */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                    Mobile Number 
                  </label>
                  <div className={`flex items-stretch bg-white border rounded-lg overflow-hidden transition-all ${
                    touched.phone && errors.phone 
                      ? 'border-red-300 focus-within:ring-2 focus-within:ring-red-100 focus-within:border-red-400' 
                      : 'border-slate-300 focus-within:ring-2 focus-within:ring-kmc-blue/20 focus-within:border-kmc-blue'
                  }`}>
                    <div className="flex items-center gap-1 px-3 py-3 bg-slate-50 border-r border-slate-200 text-slate-600 text-sm font-mono font-bold select-none">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span>+94</span>
                    </div>
                    <input 
                      type="tel" 
                      className="flex-1 px-4 py-3 bg-white text-sm font-mono focus:outline-none"
                      placeholder="77 123 4567" 
                      value={formatPhoneDisplay(phoneDigits)} 
                      onChange={handlePhoneChange}
                      onBlur={() => markTouched('phone')}
                      inputMode="numeric"
                      maxLength={11}
                    />
                    {touched.phone && !errors.phone && phoneDigits.length === 9 && (
                      <div className="flex items-center pr-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Password with strength */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      className={`w-full px-4 py-3 bg-white border rounded-lg text-sm transition-all pr-10 ${
                        touched.password && errors.password 
                          ? 'border-red-300 focus:ring-2 focus:ring-red-100 focus:border-red-400' 
                          : 'border-slate-300 focus:outline-none focus:ring-2 focus:ring-kmc-blue/20 focus:border-kmc-blue'
                      }`}
                      placeholder="Min. 8 chars with A-z, 0-9 & symbol" 
                      value={password} 
                      onChange={(e) => { setPassword(e.target.value); markTouched('password'); }}
                      onBlur={() => markTouched('password')}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {password.length > 0 && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div 
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                              passwordScore >= level ? strengthColor : 'bg-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'} 
                      className={`w-full px-4 py-3 bg-white border rounded-lg text-sm transition-all pr-10 ${
                        touched.confirmPassword && errors.confirmPassword 
                          ? 'border-red-300 focus:ring-2 focus:ring-red-100 focus:border-red-400' 
                          : 'border-slate-300 focus:outline-none focus:ring-2 focus:ring-kmc-blue/20 focus:border-kmc-blue'
                      }`}
                      placeholder="Re-enter your password" 
                      value={confirmPassword} 
                      onChange={(e) => { setConfirmPassword(e.target.value); markTouched('confirmPassword'); }}
                      onBlur={() => markTouched('confirmPassword')}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {renderError('confirmPassword')}
                </div>
              </>
            )}

            <button type="submit" disabled={isSubmitting || !isFormValid} className="w-full flex items-center justify-center gap-2 px-6 py-3 mt-4 bg-kmc-navy text-white font-semibold rounded-lg shadow-sm hover:bg-kmc-navy-light hover:shadow-md transition-all duration-200 border border-transparent disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
              ) : (
                <>{mode === 'login' ? 'Sign In to Portal' : 'Create Account'}<ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-slate-100 pt-4">
            {mode === 'login' ? (
              <p className="text-sm text-slate-500">
                Don't have an account?{' '}
                <button onClick={() => switchMode('register')} className="text-kmc-blue font-bold hover:underline">Register here</button>
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                Already registered?{' '}
                <button onClick={() => switchMode('login')} className="text-kmc-blue font-bold hover:underline">Sign In</button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
