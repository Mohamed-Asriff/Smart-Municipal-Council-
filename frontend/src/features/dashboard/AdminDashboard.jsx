import React, { useState, useEffect } from 'react';
import { 
  FileText, CreditCard, AlertCircle, CheckCircle2, 
  TrendingUp, Users, ArrowRight, ShieldAlert
} from 'lucide-react';
import { api } from '../../api';
import { formatCurrency } from '../../utils/formatters';
import { STATUS, normalizeStatus } from '../../utils/statusMap';

export default function AdminDashboard({ setActiveTab }) {
  const [stats, setStats] = useState({ complaints: [], payments: null, isLoading: true });

  useEffect(() => {
    (async () => {
      try {
        const [complaints, kpis] = await Promise.all([
          api.adminGetAllComplaints(),
          api.adminGetPaymentKpis()
        ]);
        
        setStats({
          complaints: Array.isArray(complaints) ? complaints : [],
          payments: kpis,
          isLoading: false
        });
      } catch (err) {
        console.error('Failed to load admin dashboard', err);
        setStats(s => ({ ...s, isLoading: false }));
      }
    })();
  }, []);

  if (stats.isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading dashboard...</div>;
  }

  const activeComplaints = stats.complaints.filter(c => {
    const s = normalizeStatus(c.status);
    return s !== STATUS.RESOLVED && s !== STATUS.REJECTED && s !== STATUS.CLOSED;
  }).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-kmc-navy to-[#1E4268] rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-serif font-bold text-kmc-gold mb-2">Welcome to KMC Admin Console</h1>
          <p className="text-slate-300 max-w-2xl">Manage grievances, monitor treasury collections, and oversee municipal operations all from one unified dashboard.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => setActiveTab('complaints')} className="card-gov p-5 text-left border-l-4 border-l-amber-500 hover:-translate-y-1 transition-transform group">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600"><ShieldAlert className="w-5 h-5"/></div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transition" />
          </div>
          <p className="text-3xl font-black text-kmc-navy">{activeComplaints}</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Active Grievances</p>
        </button>

        <button onClick={() => setActiveTab('complaints')} className="card-gov p-5 text-left border-l-4 border-l-emerald-500 hover:-translate-y-1 transition-transform group">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-5 h-5"/></div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition" />
          </div>
          <p className="text-3xl font-black text-kmc-navy">{stats.complaints.filter(c => normalizeStatus(c.status) === STATUS.RESOLVED).length}</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Resolved Tickets</p>
        </button>

        <button onClick={() => setActiveTab('payments')} className="card-gov p-5 text-left border-l-4 border-l-blue-500 hover:-translate-y-1 transition-transform group">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600"><TrendingUp className="w-5 h-5"/></div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition" />
          </div>
          <p className="text-2xl font-black text-kmc-navy">{formatCurrency(stats.payments?.totalRevenue || 0)}</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Total Collected</p>
        </button>

        <button onClick={() => setActiveTab('payments')} className="card-gov p-5 text-left border-l-4 border-l-red-500 hover:-translate-y-1 transition-transform group">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-600"><AlertCircle className="w-5 h-5"/></div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-red-500 transition" />
          </div>
          <p className="text-2xl font-black text-kmc-navy">{formatCurrency(stats.payments?.pendingCollections || 0)}</p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Pending Collections</p>
        </button>
      </div>

      {/* Recent Activity (Mocked layout for visual balance) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-gov p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <FileText className="w-5 h-5 text-kmc-blue" />
            <h2 className="font-bold text-kmc-navy">Recent Complaints</h2>
          </div>
          <div className="space-y-4">
            {stats.complaints.slice(0, 4).map(c => (
              <div key={c.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0">
                <div>
                  <p className="font-bold text-kmc-navy truncate w-48">{c.title}</p>
                  <p className="text-xs text-slate-500">{c.ticketCode} • {c.location}</p>
                </div>
                <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded">{c.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-gov p-6 flex flex-col items-center justify-center text-center border-dashed border-2 bg-slate-50/50">
          <Users className="w-12 h-12 text-slate-300 mb-3" />
          <h2 className="font-bold text-kmc-navy mb-1">Citizen Directory</h2>
          <p className="text-sm text-slate-500 mb-4">Manage registered citizens and accounts.</p>
          <button onClick={() => setActiveTab('users')} className="btn-gov-outline text-sm py-2">View Directory</button>
        </div>
      </div>
    </div>
  );
}