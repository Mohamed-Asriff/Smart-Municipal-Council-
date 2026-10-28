import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, FileText, CreditCard, User, 
  LogOut, Menu, X, ShieldCheck, ChevronDown, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../api';
import { STATUS, normalizeStatus } from '../utils/statusMap';
import { formatCurrency } from '../utils/formatters';
import PortalDashboard from '../components/portal/PortalDashboard';
import CitizenProfile from '../components/portal/CitizenProfile';
import CitizenComplaints from '../features/complaints/CitizenComplaints';
import ReportComplaintModal from '../components/ReportComplaintModal';
import PaymentModal from '../features/payments/PaymentModal';

export default function CitizenPortal({ onBackToPublic }) {
  const { user, logout } = useAuth();
  const { dict } = useLanguage();
  
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('kmc_citizen_tab') || 'dashboard';
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  
  const [complaints, setComplaints] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notices, setNotices] = useState([]);
  
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('kmc_citizen_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    (async () => {
      try {
        const [c, p, n] = await Promise.all([
          api.getComplaints(),
          api.getPayments(),
          api.getNotices(),
        ]);
        setComplaints(Array.isArray(c) ? c : []);
        setPayments(Array.isArray(p) ? p : []);
        setNotices(Array.isArray(n) ? n : []);
      } catch (e) { 
        console.warn('Failed to fetch citizen data:', e); 
      }
    })();
  }, [activeTab]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const pendingComplaints = complaints.filter(c => {
    const s = normalizeStatus(c.status);
    return s !== STATUS.RESOLVED && s !== STATUS.REJECTED && s !== STATUS.CLOSED;
  }).length;
  
  const pendingBillsCount = payments.filter(p => {
    const remaining = Number(p.amount || 0) - Number(p.amountPaid || 0);
    return remaining > 0 && p.status !== 'PENDING_VERIFICATION';
  }).length;

  const navItems = [
    { id: 'dashboard',  label: 'Dashboard',       icon: LayoutDashboard },
    { id: 'complaints', label: 'My Complaints',   icon: FileText,  badge: pendingComplaints },
    { id: 'payments',   label: 'Payments',        icon: CreditCard, badge: pendingBillsCount },
    { id: 'profile',    label: 'My Profile',      icon: User },
  ];

  const openPaymentModal = (bill) => {
    setSelectedBill(bill);
    setIsPayModalOpen(true);
  };

  const handlePaymentSuccess = async () => {
    const p = await api.getPayments();
    setPayments(Array.isArray(p) ? p : []);
    setIsPayModalOpen(false);
    setSelectedBill(null);
  };

  const handleComplaintCreated = async () => {
    const c = await api.getComplaints();
    setComplaints(Array.isArray(c) ? c : []);
    setIsReportModalOpen(false);
    setActiveTab('complaints');
  };

  const handleSignOut = () => {
    setIsProfileOpen(false);
    localStorage.removeItem('kmc_citizen_tab'); 
    localStorage.removeItem('kmc_active_view'); 
    logout();             
    if (onBackToPublic) onBackToPublic();   
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0B1E33] text-white flex flex-col transition-transform duration-300 shadow-2xl shrink-0 h-full
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-20 flex items-center gap-3 px-6 border-b border-white/5 shrink-0">
          <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center shadow-lg shrink-0">
            <img src="/sri_lanka_emblem.jpg" alt="Sri Lanka Emblem" className="w-full h-full object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-serif font-bold text-base text-white leading-tight truncate">Kalmunai Council</h1>
            <p className="text-[10px] text-kmc-gold uppercase tracking-widest font-bold mt-0.5">Citizen Portal</p>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white p-1" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 custom-scrollbar-dark">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Services</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-all duration-200 relative group ${
                  isActive ? 'bg-kmc-gold/10 text-kmc-gold border border-kmc-gold/20 shadow-sm' : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-kmc-gold rounded-r-md"></span>}
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-kmc-gold' : 'text-slate-400 group-hover:text-white'}`} />
                  <span className="font-semibold">{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-kmc-gold text-[#0B1E33]' : 'bg-red-500 text-white'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 text-center border-t border-white/5 shrink-0">
           <p className="text-[9px] text-slate-500 font-mono">© 2026 KMC</p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 lg:px-10 shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-serif font-bold text-kmc-navy leading-tight">
                {navItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Manage your municipal services</p>
            </div>
          </div>

          <div className="flex items-center gap-4">

            <div className="relative" ref={profileDropdownRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition group"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-kmc-navy">{user?.zone || 'Kalmunai'}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{user?.assessmentNo || 'N/A'}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-kmc-navy flex items-center justify-center text-kmc-gold font-black border-2 border-kmc-gold/30 shadow-sm group-hover:scale-105 transition-transform">
                  {user?.name?.charAt(0) || 'C'}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 hidden sm:block transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                  <div className="px-5 py-4 bg-slate-50 border-b border-slate-200">
                    <p className="font-bold text-sm text-kmc-navy truncate">{user?.name || 'Citizen'}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">{user?.email || 'No email'}</p>
                  </div>
                  <div className="p-2">
                    <button 
                      onClick={() => { setActiveTab('profile'); setIsProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-kmc-navy transition"
                    >
                      <User className="w-4 h-4 text-slate-400" /> My Profile
                    </button>
                  </div>
                  <div className="h-px bg-slate-100 mx-2"></div>
                  <div className="p-2">
                    <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar bg-slate-50/50">
          {activeTab === 'dashboard' && (
            <PortalDashboard 
              user={user}
              complaints={complaints}
              payments={payments}
              notices={notices}
              onNavigate={setActiveTab}
              onOpenReport={() => setIsReportModalOpen(true)}
              onOpenPayment={openPaymentModal}
            />
          )}
          
          {activeTab === 'complaints' && (
            <CitizenComplaints complaints={complaints} onOpenReport={() => setIsReportModalOpen(true)} />
          )}

          {activeTab === 'payments' && (
            <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-kmc-navy">Payment History</h1>
                  <p className="text-sm text-slate-500 mt-1">View all your municipal bills and settle pending dues.</p>
                </div>
              </div>
              
              {payments.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                  <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-semibold">No payment records found.</p>
                  <p className="text-xs text-slate-400 mt-1">Your municipal bills will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map(p => {
                    const totalAmount = Number(p.amount || 0);
                    const paidAmount = Number(p.amountPaid || 0);
                    const remaining = totalAmount - paidAmount;

                    return (
                      <div key={p.id} className="bg-white rounded-xl p-5 border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            p.status === 'PENDING_VERIFICATION' ? 'bg-amber-50 text-amber-600' : 
                            remaining <= 0 ? 'bg-emerald-50 text-emerald-600' : 
                            'bg-blue-50 text-blue-600'
                          }`}>
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-kmc-navy">{p.service}</p>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{p.billingPeriod} • {p.assessmentNo}</p>
                            {p.paidAt && <p className="text-[10px] text-slate-400 mt-0.5">Paid on {new Date(p.paidAt).toLocaleDateString()}</p>}
                          </div>
                        </div>
                        
                        <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                          <div>
                            <p className="font-black text-lg text-kmc-navy">{formatCurrency(totalAmount)}</p>
                            {paidAmount > 0 && remaining > 0 && (
                              <p className="text-[10px] font-bold text-amber-600 mt-0.5 bg-amber-50 px-1.5 py-0.5 rounded">
                                Paid: {formatCurrency(paidAmount)} | Due: {formatCurrency(remaining)}
                              </p>
                            )}
                          </div>
                          
                          {/* FIXED LOGIC ORDER: Check for verification FIRST */}
                          {p.status === 'PENDING_VERIFICATION' ? (
                            <span className="text-xs text-amber-600 font-bold flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100">
                              <Clock className="w-3.5 h-3.5" /> Verifying Slip
                            </span>
                          ) : remaining <= 0 ? (
                            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                              <ShieldCheck className="w-3.5 h-3.5" /> Fully Paid
                            </span>
                          ) : (
                            <button onClick={() => openPaymentModal(p)} className="text-xs font-bold bg-kmc-gold hover:bg-yellow-500 text-[#0B1E33] px-4 py-1.5 rounded-lg transition shadow-sm">
                              Pay {paidAmount > 0 ? 'Remaining' : 'Now'} →
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && <CitizenProfile user={user} />}
        </main>
      </div>

      <ReportComplaintModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} onTicketCreated={handleComplaintCreated} />
      <PaymentModal isOpen={isPayModalOpen} onClose={() => { setIsPayModalOpen(false); setSelectedBill(null); }} prefillBill={selectedBill} onPaymentSuccess={handlePaymentSuccess} />
    </div>
  );
}
