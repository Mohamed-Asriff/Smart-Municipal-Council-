import React, { useState } from 'react';
import { 
  FileText, CreditCard, AlertCircle, CheckCircle2, Clock, 
  ArrowRight, Bell, MapPin, Building2, ShieldCheck, Calendar,
  ChevronRight, X, Search, Sparkles, Megaphone, ExternalLink,
  Printer, Check, Share2, Tag, Info, AlertTriangle, Layers
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { STATUS, normalizeStatus, statusLabel } from '../../utils/statusMap';
import ComplaintAnalytics from './ComplaintAnalytics';

// Helper for Category styling & typography
const getNoticeBadgeInfo = (type = '') => {
  const norm = (type || '').toUpperCase().trim();
  if (norm.includes('FINAC') || norm.includes('FINAN') || norm.includes('TAX') || norm.includes('BUDGET') || norm.includes('REBATE')) {
    return {
      label: 'Financial',
      categoryKey: 'FINANCIAL',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
      dotClass: 'bg-emerald-500',
    };
  }
  if (norm.includes('HEALTH') || norm.includes('MEDIC') || norm.includes('DENGUE') || norm.includes('CLINIC')) {
    return {
      label: 'Health & Safety',
      categoryKey: 'HEALTH',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200/70',
      dotClass: 'bg-rose-500',
    };
  }
  if (norm.includes('URGENT') || norm.includes('ALERT') || norm.includes('EMERGENCY') || norm.includes('WARN')) {
    return {
      label: 'Urgent Alert',
      categoryKey: 'URGENT',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/70',
      dotClass: 'bg-amber-500',
    };
  }
  if (norm.includes('WATER') || norm.includes('POWER') || norm.includes('ROAD') || norm.includes('WORKS') || norm.includes('INFRA')) {
    return {
      label: 'Public Works',
      categoryKey: 'WORKS',
      badgeClass: 'bg-sky-50 text-sky-700 border-sky-200/70',
      dotClass: 'bg-sky-500',
    };
  }
  return {
    label: type || 'General Notice',
    categoryKey: 'GENERAL',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
    dotClass: 'bg-indigo-500',
  };
};

const formatNoticeDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return 'Today';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

export default function PortalDashboard({ 
  user, complaints = [], payments = [], notices = [], 
  onNavigate, onOpenReport, onOpenPayment 
}) {
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showAllNotices, setShowAllNotices] = useState(false);
  const [noticeSearch, setNoticeSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [copiedLink, setCopiedLink] = useState(false);

  // FIXED: Normalize status for accurate filtering
  const activeComplaints = complaints.filter(c => {
    const s = normalizeStatus(c.status);
    return s !== STATUS.RESOLVED && s !== STATUS.REJECTED && s !== STATUS.CLOSED;
  });
  const resolvedComplaints = complaints.filter(c => normalizeStatus(c.status) === STATUS.RESOLVED);
  
  const pendingBills = payments.filter(p => {
    const remaining = Number(p.amount || 0) - Number(p.amountPaid || 0);
    return remaining > 0 && (p.status === 'Pending' || p.status === 'Overdue');
  });
  const totalDue = pendingBills.reduce((s, p) => {
    return s + (Number(p.amount || 0) - Number(p.amountPaid || 0));
  }, 0);

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  // Filtered notices for modal
  const filteredNotices = notices.filter(n => {
    const matchesSearch = !noticeSearch || 
      n.title?.toLowerCase().includes(noticeSearch.toLowerCase()) || 
      n.summary?.toLowerCase().includes(noticeSearch.toLowerCase()) ||
      n.noticeType?.toLowerCase().includes(noticeSearch.toLowerCase());
    
    if (!matchesSearch) return false;
    if (selectedCategoryFilter === 'ALL') return true;
    const info = getNoticeBadgeInfo(n.noticeType);
    return info.categoryKey === selectedCategoryFilter;
  });

  const handleCopyNotice = (notice) => {
    const text = `${notice.title}\n${notice.summary || ''}\nPublished: ${notice.publishedAt || ''}\nKalmunai Municipal Council`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-in fade-in duration-500">

      {/* ============ HERO BANNER ============ */}
      <div className="relative rounded-2xl overflow-hidden bg-linear-to-r from-[#0B1E33] via-kmc-navy to-[#1E4268] p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-kmc-gold/10 rounded-full blur-3xl translate-x-16 -translate-y-16 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="px-3 py-1 rounded-full bg-kmc-gold text-[#0B1E33] text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Citizen
            </span>
            <span className="text-slate-300 text-xs flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5" /> {today}
            </span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
            Welcome back, <span className="text-kmc-gold">{user?.name || 'Citizen'}</span>
          </h1>
          
          <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-slate-300 font-mono">
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <span className="text-slate-400">NIC:</span> {user?.nic || '—'}
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <span className="text-slate-400">Account:</span> {user?.assessmentNo || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* ============ KPI CARDS ============ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Clock,        value: activeComplaints.length,         label: 'Active Issues',    action: () => onNavigate('complaints'), color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100' },
          { icon: CheckCircle2, value: resolvedComplaints.length,       label: 'Resolved',         action: () => onNavigate('complaints'), color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { icon: AlertCircle,  value: formatCurrency(totalDue),        label: 'Outstanding Dues', action: () => onNavigate('payments'),   color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100', isAmount: true },
          { icon: Building2,    value: user?.assessmentNo?.slice(-6) || '—', label: 'Assessment No', action: () => onNavigate('profile'),    color: 'text-slate-600',   bg: 'bg-slate-100',  border: 'border-slate-200', isSmall: true },
        ].map((kpi, i) => (
          <button 
            key={i} 
            onClick={kpi.action}
            className={`text-left bg-white rounded-xl p-4 border ${kpi.border} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group`}
          >
            <div className={`w-10 h-10 rounded-lg ${kpi.bg} ${kpi.color} flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform`}>
              <kpi.icon className="w-5 h-5" />
            </div>
            <p className={`font-black text-kmc-navy ${kpi.isSmall ? 'text-sm font-mono' : kpi.isAmount ? 'text-lg' : 'text-2xl'}`}>
              {kpi.value}
            </p>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">
              {kpi.label}
            </p>
          </button>
        ))}
      </div>

      {/* ============ CHARTS ROW ============ */}
      <ComplaintAnalytics complaints={complaints} />

      {/* ============ BOTTOM LISTS ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

        {/* Recent Complaints (Left Column) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:h-125">
            
            {/* Fixed Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-kmc-navy" />
                <h2 className="font-bold text-kmc-navy text-sm">Recent Complaints</h2>
              </div>
              <button onClick={() => onNavigate('complaints')} className="text-xs font-bold text-kmc-gold hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Scrollable List Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {complaints.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-3 border border-slate-100">
                    <FileText className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-600 font-semibold">No complaints filed yet</p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">Report your first civic issue in under 30 seconds.</p>
                  <button onClick={onOpenReport} className="inline-flex items-center gap-1.5 bg-kmc-gold hover:bg-yellow-500 text-[#0B1E33] text-xs font-bold px-4 py-2 rounded-lg transition">
                    <FileText className="w-3.5 h-3.5" /> File Your First Complaint
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {complaints.map((c) => {
                    const normStatus = normalizeStatus(c.status);
                    return (
                      <button 
                        key={c.id} 
                        onClick={() => onNavigate('complaints')} 
                        className="w-full text-left p-4 hover:bg-slate-50 transition group flex items-center gap-3"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          normStatus === STATUS.RESOLVED    ? 'bg-emerald-50 text-emerald-600' :
                          normStatus === STATUS.IN_PROGRESS ? 'bg-amber-50 text-amber-600' : 
                                                              'bg-blue-50 text-blue-600'
                        }`}>
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-[10px] font-bold text-kmc-navy bg-slate-100 px-1.5 py-0.5 rounded">
                              {c.ticketCode}
                            </span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                              normStatus === STATUS.RESOLVED    ? 'bg-emerald-50 text-emerald-700' :
                              normStatus === STATUS.IN_PROGRESS ? 'bg-amber-50 text-amber-700' : 
                                                                  'bg-blue-50 text-blue-700'
                            }`}>
                              {statusLabel(c.status)}
                            </span>
                          </div>
                          <p className="font-semibold text-xs text-kmc-navy group-hover:text-blue-600 transition truncate">{c.title}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{c.location || c.zone}</span>
                            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{formatDate(c.createdAt)}</span>
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-kmc-navy group-hover:translate-x-1 transition" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Dues & Notices) */}
        <div className="space-y-5">
          
          {/* Pending Dues */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:h-125">
            
            {/* Fixed Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-kmc-navy" />
                <h2 className="font-bold text-kmc-navy text-sm">Pending Dues</h2>
              </div>
              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                {pendingBills.length}
              </span>
            </div>

            {/* Scrollable List Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
              {pendingBills.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <p className="text-sm font-bold text-emerald-700">All Clear!</p>
                  <p className="text-xs text-slate-500">No pending dues</p>
                </div>
              ) : (
                pendingBills.map(bill => {
                  const remaining = Number(bill.amount || 0) - Number(bill.amountPaid || 0);
                  return (
                    <div key={bill.id} className="bg-amber-50/60 border border-amber-200 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <p className="text-[11px] font-bold text-kmc-navy leading-tight">{bill.service}</p>
                        <span className="text-xs font-black text-amber-700 whitespace-nowrap">
                          {formatCurrency(remaining)}
                        </span>
                      </div>
                      <button onClick={() => onOpenPayment(bill)} className="w-full bg-kmc-gold hover:bg-yellow-500 text-[#0B1E33] text-[10px] font-bold py-1.5 rounded transition">
                        Pay Now →
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ============ COUNCIL NOTICES (ENHANCED UI/UX) ============ */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
            
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-200/60 flex items-center justify-center shadow-xs shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-kmc-navy text-sm font-sans tracking-tight">Council Notices</h2>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Official Gazettes & Directives</p>
                </div>
              </div>

              {notices.length > 0 && (
                <button 
                  onClick={() => setShowAllNotices(true)}
                  className="text-[11px] font-bold text-kmc-blue hover:text-blue-700 transition flex items-center gap-1 group py-1 px-2 rounded-lg hover:bg-blue-50/70"
                >
                  <span>View All</span>
                  <span className="w-4 h-4 rounded-full bg-blue-100/70 text-blue-700 text-[9px] font-bold flex items-center justify-center">
                    {notices.length}
                  </span>
                </button>
              )}
            </div>

            {/* Notices List */}
            <div className="divide-y divide-slate-100/80">
              {notices.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/20">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                    <Bell className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-600">No notices at this time</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Official council gazettes will appear here when published.</p>
                </div>
              ) : (
                notices.slice(0, 3).map(n => {
                  const badgeInfo = getNoticeBadgeInfo(n.noticeType);
                  return (
                    <div 
                      key={n.id} 
                      onClick={() => setSelectedNotice(n)}
                      className="p-3.5 hover:bg-slate-50/80 transition-all cursor-pointer group relative border-l-2 border-l-transparent hover:border-l-kmc-blue flex items-start justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${badgeInfo.badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badgeInfo.dotClass}`}></span>
                            {badgeInfo.label}
                          </span>

                          {n.badge && n.badge !== 'Official' && (
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                              {n.badge}
                            </span>
                          )}

                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 ml-auto shrink-0 font-mono">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {formatNoticeDate(n.publishedAt)}
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-[13px] font-bold text-kmc-navy group-hover:text-kmc-blue transition-colors line-clamp-1 leading-snug">
                          {n.title}
                        </h4>

                        {n.summary && (
                          <p className="text-[11px] text-slate-500 line-clamp-1 mt-1 font-normal leading-relaxed">
                            {n.summary}
                          </p>
                        )}
                      </div>

                      <div className="w-6 h-6 rounded-full bg-slate-100/70 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-kmc-blue group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5">
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer action bar if more than 3 notices */}
            {notices.length > 3 && (
              <button
                onClick={() => setShowAllNotices(true)}
                className="w-full py-2.5 px-4 bg-slate-50/50 hover:bg-slate-100/70 text-slate-600 hover:text-kmc-navy text-xs font-semibold flex items-center justify-center gap-1.5 border-t border-slate-100 transition-colors"
              >
                <span>Browse all {notices.length} council notices</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ============ NOTICE DETAIL READER MODAL ============ */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-linear-to-r from-[#0B1E33] to-kmc-navy p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-kmc-gold/20 text-kmc-gold flex items-center justify-center border border-kmc-gold/30">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Kalmunai Municipal Council</h3>
                  <p className="text-[10px] text-slate-300 font-mono">Official Gazette & Public Directive</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedNotice(null)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
                {(() => {
                  const badgeInfo = getNoticeBadgeInfo(selectedNotice.noticeType);
                  return (
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${badgeInfo.badgeClass}`}>
                      <span className={`w-2 h-2 rounded-full ${badgeInfo.dotClass}`}></span>
                      {badgeInfo.label}
                    </span>
                  );
                })()}

                <span className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Published: {formatDate(selectedNotice.publishedAt) || selectedNotice.publishedAt}
                </span>
              </div>

              <div>
                <h2 className="text-lg sm:text-xl font-serif font-bold text-kmc-navy leading-snug">
                  {selectedNotice.title}
                </h2>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                {selectedNotice.summary || 'No detailed summary provided for this public notice.'}
              </div>

              {/* Official Seal / Advisory Callout */}
              <div className="rounded-xl p-3 bg-amber-50/70 border border-amber-200/60 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-900 leading-normal">
                  <span className="font-bold">Official Directive:</span> Issued by the Council Secretariat for citizen guidance. 
                  For verification or appeals, contact the municipal helpline at <span className="font-bold font-mono">067-2220261</span>.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <button 
                onClick={() => handleCopyNotice(selectedNotice)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-kmc-navy transition px-3 py-2 rounded-lg hover:bg-slate-200/60"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-slate-500" />
                    <span>Copy Notice</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-kmc-navy transition px-3 py-2 rounded-lg hover:bg-slate-200/60"
                >
                  <Printer className="w-4 h-4 text-slate-500" />
                  <span>Print</span>
                </button>
                <button 
                  onClick={() => setSelectedNotice(null)}
                  className="bg-kmc-navy hover:bg-kmc-navy-light text-white text-xs font-bold px-4 py-2 rounded-lg transition shadow-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ ALL NOTICES DIRECTORY MODAL ============ */}
      {showAllNotices && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-200/60 flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-kmc-navy">Official Council Notices</h3>
                  <p className="text-xs text-slate-400">Complete bulletin directory & civic announcements</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAllNotices(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search notices by title, keyword, or category..."
                  value={noticeSearch}
                  onChange={e => setNoticeSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-kmc-blue transition"
                />
              </div>

              {/* Category Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs">
                {[
                  { key: 'ALL', label: 'All Notices' },
                  { key: 'FINANCIAL', label: 'Financial' },
                  { key: 'HEALTH', label: 'Health' },
                  { key: 'WORKS', label: 'Public Works' },
                  { key: 'URGENT', label: 'Urgent' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedCategoryFilter(tab.key)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${
                      selectedCategoryFilter === tab.key
                        ? 'bg-kmc-navy text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200/80'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notice List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-100 p-2">
              {filteredNotices.length === 0 ? (
                <div className="p-8 text-center">
                  <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-600">No matching notices found</p>
                  <p className="text-xs text-slate-400 mt-1">Try refining your search terms or category filter.</p>
                </div>
              ) : (
                filteredNotices.map(n => {
                  const badgeInfo = getNoticeBadgeInfo(n.noticeType);
                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        setSelectedNotice(n);
                      }}
                      className="p-4 hover:bg-slate-50 transition cursor-pointer rounded-xl flex items-center justify-between gap-4 group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${badgeInfo.badgeClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badgeInfo.dotClass}`}></span>
                            {badgeInfo.label}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatNoticeDate(n.publishedAt)}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-kmc-navy group-hover:text-kmc-blue transition-colors line-clamp-1">
                          {n.title}
                        </h4>
                        {n.summary && (
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                            {n.summary}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-kmc-navy group-hover:translate-x-1 transition shrink-0" />
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setShowAllNotices(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
