import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, FileText, CreditCard, User, 
  LogOut, Menu, X, ShieldCheck, ChevronDown, Clock, Search, Printer
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
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [paymentSort, setPaymentSort] = useState('newest');
  const [detailModalBill, setDetailModalBill] = useState(null);
  const [receiptModalBill, setReceiptModalBill] = useState(null);

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

  // Payments metrics calculations for summary cards
  const outstandingBalance = payments.reduce((sum, p) => {
    if (p.status?.toUpperCase() === 'PAID') return sum;
    const total = Number(p.amount || 0);
    const paid = Number(p.amountPaid || 0);
    const remaining = Math.max(0, total - paid);
    return sum + remaining;
  }, 0);

  const settledBills = payments
    .filter(p => p.status?.toUpperCase() === 'PAID' || (Number(p.amountPaid || 0) > 0 && Number(p.amount || 0) <= Number(p.amountPaid || 0)))
    .sort((a, b) => new Date(b.paidAt || b.updatedAt || 0) - new Date(a.paidAt || a.updatedAt || 0));

  const mostRecentPaid = settledBills[0] || payments
    .filter(p => Number(p.amountPaid || 0) > 0)
    .sort((a, b) => new Date(b.paidAt || b.updatedAt || 0) - new Date(a.paidAt || a.updatedAt || 0))[0];

  const lastPaidAmount = mostRecentPaid 
    ? Number(mostRecentPaid.amountPaid || mostRecentPaid.amount || 0) 
    : 0;

  const lastPaidDate = mostRecentPaid?.paidAt 
    ? new Date(mostRecentPaid.paidAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) 
    : (mostRecentPaid?.updatedAt 
        ? new Date(mostRecentPaid.updatedAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) 
        : 'N/A');

  const lastPaidRef = mostRecentPaid?.billCode || (mostRecentPaid ? `BILL-${mostRecentPaid.id}` : '');

  const filteredPayments = payments.filter(p => {
    const totalAmount = Number(p.amount || 0);
    const paidAmount = Number(p.amountPaid || 0);
    const remaining = totalAmount - paidAmount;
    const isFullyPaid = p.status?.toUpperCase() === 'PAID' || remaining <= 0;
    const isVerifying = p.status === 'PENDING_VERIFICATION';
    const isPending = !isFullyPaid && !isVerifying;

    if (paymentStatusFilter === 'paid' && !isFullyPaid) return false;
    if (paymentStatusFilter === 'pending' && !isPending) return false;
    if (paymentStatusFilter === 'verifying' && !isVerifying) return false;

    if (paymentSearch.trim()) {
      const term = paymentSearch.toLowerCase();
      const matches = 
        (p.service || '').toLowerCase().includes(term) ||
        (p.category || '').toLowerCase().includes(term) ||
        (p.billCode || '').toLowerCase().includes(term) ||
        (p.assessmentNo || '').toLowerCase().includes(term) ||
        (p.billingPeriod || '').toLowerCase().includes(term);
      if (!matches) return false;
    }

    return true;
  }).sort((a, b) => {
    if (paymentSort === 'newest') {
      const dateA = new Date(a.dueDate || a.createdAt || 0);
      const dateB = new Date(b.dueDate || b.createdAt || 0);
      return dateB - dateA;
    }
    if (paymentSort === 'oldest') {
      const dateA = new Date(a.dueDate || a.createdAt || 0);
      const dateB = new Date(b.dueDate || b.createdAt || 0);
      return dateA - dateB;
    }
    if (paymentSort === 'amount_desc') {
      return Number(b.amount || 0) - Number(a.amount || 0);
    }
    if (paymentSort === 'amount_asc') {
      return Number(a.amount || 0) - Number(b.amount || 0);
    }
    return 0;
  });

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
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in">
              {/* Header */}
              <div>
                <h1 className="text-2xl font-serif font-bold text-kmc-navy">Payment History</h1>
                <p className="text-sm text-slate-500 mt-1">View all your municipal bills and settle pending dues.</p>
              </div>

              {/* Summary on the top */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Outstanding Balance */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">OUTSTANDING BALANCE</span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                      {formatCurrency(outstandingBalance)}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                    Calculated from verified payments. Submitted slips remain due until approved.
                  </p>
                </div>

                {/* Last Paid */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">LAST PAID</span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                      {formatCurrency(lastPaidAmount)}
                    </h2>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs text-slate-500">
                      Most recently settled bill • {lastPaidDate}
                    </p>
                    {lastPaidRef && (
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{lastPaidRef}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    placeholder="Search bill, category, account or reference..."
                    value={paymentSearch}
                    onChange={(e) => setPaymentSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-kmc-navy/10 focus:border-kmc-navy shadow-sm transition"
                  />
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <select 
                    value={paymentStatusFilter}
                    onChange={(e) => setPaymentStatusFilter(e.target.value)}
                    className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-kmc-navy/10 focus:border-kmc-navy shadow-sm cursor-pointer"
                  >
                    <option value="all">All payment statuses</option>
                    <option value="paid">Fully Paid</option>
                    <option value="pending">Pending / Due</option>
                    <option value="verifying">Verifying Slip</option>
                  </select>

                  <select 
                    value={paymentSort}
                    onChange={(e) => setPaymentSort(e.target.value)}
                    className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-kmc-navy/10 focus:border-kmc-navy shadow-sm cursor-pointer"
                  >
                    <option value="newest">Due date: newest</option>
                    <option value="oldest">Due date: oldest</option>
                    <option value="amount_desc">Amount: high to low</option>
                    <option value="amount_asc">Amount: low to high</option>
                  </select>
                </div>
              </div>

              {/* Bills List */}
              {filteredPayments.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                  <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-semibold">No payment records found.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {paymentSearch.trim() || paymentStatusFilter !== 'all' 
                      ? 'Try adjusting your search query or filter.' 
                      : 'Your municipal bills will appear here.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPayments.map(p => {
                    const totalAmount = Number(p.amount || 0);
                    const paidAmount = Number(p.amountPaid || 0);
                    const remaining = Math.max(0, totalAmount - paidAmount);
                    const isFullyPaid = p.status?.toUpperCase() === 'PAID' || remaining <= 0;

                    return (
                      <div key={p.id} className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isFullyPaid ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                            p.status === 'PENDING_VERIFICATION' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                            'bg-blue-50 text-blue-600 border border-blue-100'
                          }`}>
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-slate-900">{p.service}</h3>
                            <p className="text-xs text-slate-500 font-mono mt-1 flex flex-wrap items-center gap-1.5">
                              <span>{p.billCode || `BILL-2026-${String(p.id).padStart(8, '0')}`}</span>
                              <span>•</span>
                              <span>{p.billingPeriod || '2026'}</span>
                              <span>•</span>
                              <span>{p.assessmentNo || user?.citizenId || 'KMC-TAX-2026-9041'}</span>
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              {p.paidAt 
                                ? `Paid on ${new Date(p.paidAt).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}` 
                                : p.dueDate 
                                  ? `Due on ${new Date(p.dueDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}`
                                  : 'Payable upon issue'}
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end gap-1.5 flex-shrink-0">
                          <div>
                            <p className="text-xl font-black text-slate-900">{formatCurrency(totalAmount)}</p>
                            {paidAmount > 0 && remaining > 0 && (
                              <p className="text-[10px] font-bold text-amber-600 mt-0.5 bg-amber-50 px-2 py-0.5 rounded">
                                Paid: {formatCurrency(paidAmount)} | Due: {formatCurrency(remaining)}
                              </p>
                            )}
                          </div>

                          {p.status === 'PENDING_VERIFICATION' ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                              <Clock className="w-3.5 h-3.5" /> Verifying Slip
                            </span>
                          ) : isFullyPaid ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
                              <ShieldCheck className="w-3.5 h-3.5" /> Fully Paid
                            </span>
                          ) : (
                            <button 
                              onClick={() => openPaymentModal(p)} 
                              className="inline-flex items-center justify-center text-xs font-bold bg-[#E5A83B] hover:bg-[#D4972A] text-slate-900 px-5 py-2 rounded-lg transition shadow-sm font-semibold"
                            >
                              Pay {paidAmount > 0 ? 'Remaining' : 'Now'} →
                            </button>
                          )}

                          <div className="flex items-center gap-3 text-xs text-blue-600 font-medium mt-1">
                            <button onClick={() => setDetailModalBill({ bill: p, type: 'history' })} className="hover:underline">
                              Submission history
                            </button>
                            <button onClick={() => setDetailModalBill({ bill: p, type: 'details' })} className="hover:underline">
                              Bill details
                            </button>
                            {isFullyPaid && (
                              <button onClick={() => setReceiptModalBill(p)} className="hover:underline">
                                Print receipt
                              </button>
                            )}
                          </div>
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

      {isReportModalOpen && (
        <ReportComplaintModal 
          isOpen={isReportModalOpen} 
          onClose={() => setIsReportModalOpen(false)} 
          onTicketCreated={handleComplaintCreated} 
        />
      )}
      <PaymentModal isOpen={isPayModalOpen} onClose={() => { setIsPayModalOpen(false); setSelectedBill(null); }} prefillBill={selectedBill} onPaymentSuccess={handlePaymentSuccess} />

      {/* Bill Details / Submission History Modal */}
      {detailModalBill && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
            <button 
              onClick={() => setDetailModalBill(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {detailModalBill.type === 'history' ? 'Submission History' : 'Bill Details'}
                </h3>
                <p className="text-xs text-slate-500 font-mono">{detailModalBill.bill.service} • {detailModalBill.bill.billCode || `BILL-${detailModalBill.bill.id}`}</p>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl text-sm border border-slate-100">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Service:</span>
                <span className="font-semibold text-slate-800">{detailModalBill.bill.service}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Assessment No:</span>
                <span className="font-mono text-slate-800">{detailModalBill.bill.assessmentNo || user?.citizenId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Billing Period:</span>
                <span className="font-semibold text-slate-800">{detailModalBill.bill.billingPeriod || 'Current'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Total Bill Amount:</span>
                <span className="font-bold text-slate-900">{formatCurrency(detailModalBill.bill.amount)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Amount Settled:</span>
                <span className="font-bold text-emerald-600">{formatCurrency(detailModalBill.bill.amountPaid || 0)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Payment Status:</span>
                <span className="font-bold text-slate-800">{detailModalBill.bill.status}</span>
              </div>
              {detailModalBill.bill.paidAt && (
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Paid Date:</span>
                  <span className="text-slate-800">{new Date(detailModalBill.bill.paidAt).toLocaleString()}</span>
                </div>
              )}
              {detailModalBill.bill.receiptNo && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Receipt No:</span>
                  <span className="font-mono font-semibold text-blue-600">{detailModalBill.bill.receiptNo}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setDetailModalBill(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Receipt Modal */}
      {receiptModalBill && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative print:p-0 print:border-none print:shadow-none">
            <button 
              onClick={() => setReceiptModalBill(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition print:hidden"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-4 border-b border-slate-200">
              <h2 className="text-lg font-serif font-bold text-kmc-navy tracking-wide">KALMUNAI MUNICIPAL COUNCIL</h2>
              <p className="text-xs text-slate-500">Official Municipal Payment Receipt</p>
              <div className="inline-block mt-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                PAYMENT VERIFIED & SETTLED
              </div>
            </div>

            <div className="my-5 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt Number:</span>
                <span className="font-mono font-bold text-slate-900">{receiptModalBill.receiptNo || `REC-2026-${receiptModalBill.id}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bill Reference:</span>
                <span className="font-mono text-slate-800">{receiptModalBill.billCode || `BILL-${receiptModalBill.id}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-semibold text-slate-800">{receiptModalBill.service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Citizen / Assessment:</span>
                <span className="font-medium text-slate-800">{user?.name || 'Citizen'} ({receiptModalBill.assessmentNo || user?.citizenId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Billing Period:</span>
                <span className="text-slate-800">{receiptModalBill.billingPeriod || '2026'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Date:</span>
                <span className="text-slate-800">{receiptModalBill.paidAt ? new Date(receiptModalBill.paidAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm">
                <span className="font-bold text-slate-700">Total Amount Paid:</span>
                <span className="text-lg font-black text-kmc-navy">{formatCurrency(receiptModalBill.amountPaid || receiptModalBill.amount)}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2.5 print:hidden">
              <button 
                onClick={() => setReceiptModalBill(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Close
              </button>
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 bg-kmc-navy hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
