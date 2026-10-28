import React from 'react';
import { 
  FileText, CreditCard, AlertCircle, CheckCircle2, Clock, 
  ArrowRight, Bell, MapPin, Building2, ShieldCheck, Calendar 
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { STATUS, normalizeStatus, statusLabel } from '../../utils/statusMap';
import ComplaintAnalytics from './ComplaintAnalytics';

export default function PortalDashboard({ 
  user, complaints = [], payments = [], notices = [], 
  onNavigate, onOpenReport, onOpenPayment 
}) {
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

  return (
    <div className="max-w-6xl mx-auto space-y-5 animate-in fade-in duration-500">

      {/* ============ HERO BANNER ============ */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0B1E33] via-[#16324F] to-[#1E4268] p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl translate-x-16 -translate-y-16 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="px-3 py-1 rounded-full bg-[#D4AF37] text-[#0B1E33] text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Citizen
            </span>
            <span className="text-slate-300 text-xs flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5" /> {today}
            </span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
            Welcome back, <span className="text-[#D4AF37]">{user?.name || 'Citizen'}</span>
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
            <p className={`font-black text-[#16324F] ${kpi.isSmall ? 'text-sm font-mono' : kpi.isAmount ? 'text-lg' : 'text-2xl'}`}>
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:h-[500px]">
            
            {/* Fixed Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#16324F]" />
                <h2 className="font-bold text-[#16324F] text-sm">Recent Complaints</h2>
              </div>
              <button onClick={() => onNavigate('complaints')} className="text-xs font-bold text-[#D4AF37] hover:underline flex items-center gap-1">
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
                  <button onClick={onOpenReport} className="inline-flex items-center gap-1.5 bg-[#D4AF37] hover:bg-yellow-500 text-[#0B1E33] text-xs font-bold px-4 py-2 rounded-lg transition">
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
                            <span className="font-mono text-[10px] font-bold text-[#16324F] bg-slate-100 px-1.5 py-0.5 rounded">
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
                          <p className="font-semibold text-xs text-[#16324F] group-hover:text-blue-600 transition truncate">{c.title}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{c.location || c.zone}</span>
                            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{formatDate(c.createdAt)}</span>
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#16324F] group-hover:translate-x-1 transition" />
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
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col lg:h-[500px]">
            
            {/* Fixed Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#16324F]" />
                <h2 className="font-bold text-[#16324F] text-sm">Pending Dues</h2>
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
        <p className="text-[11px] font-bold text-[#16324F] leading-tight">{bill.service}</p>
        <span className="text-xs font-black text-amber-700 whitespace-nowrap">
          {formatCurrency(remaining)}
        </span>
      </div>
      <button onClick={() => onOpenPayment(bill)} className="w-full bg-[#D4AF37] hover:bg-yellow-500 text-[#0B1E33] text-[10px] font-bold py-1.5 rounded transition">
        Pay Now →
      </button>
    </div>
  );
})
              )}
            </div>
          </div>

          {/* Council Notices (Sits below Dues normally) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#16324F]" />
              <h2 className="font-bold text-[#16324F] text-sm">Council Notices</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {notices.length === 0 ? (
                <div className="p-5 text-center">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No notices available</p>
                </div>
              ) : (
                notices.slice(0, 3).map(n => (
                  <div key={n.id} className="p-3.5 hover:bg-slate-50 transition cursor-pointer">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">
                        {n.noticeType || 'General'}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono flex items-center gap-0.5">
                        <Calendar className="w-2.5 h-2.5" />{n.publishedAt}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#16324F] line-clamp-2 leading-snug">{n.title}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}