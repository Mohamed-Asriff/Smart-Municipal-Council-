import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, CreditCard, AlertCircle, CheckCircle2, 
  TrendingUp, ArrowRight, ShieldAlert, BarChart3, PieChart 
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { api } from '../../api';
import { formatCurrency } from '../../utils/formatters';
import { STATUS, normalizeStatus } from '../../utils/statusMap';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AdminDashboard({ setActiveTab }) {
  const [stats, setStats] = useState({ 
    complaints: [], 
    payments: null, 
    recentPayments: [], 
    isLoading: true 
  });

  const [donutView, setDonutView] = useState('status'); // 'status' | 'revenue'

  useEffect(() => {
    (async () => {
      try {
        const [complaints, kpis, allPayments] = await Promise.all([
          api.adminGetAllComplaints().catch(() => []),
          api.adminGetPaymentKpis().catch(() => null),
          api.adminGetAllPayments().catch(() => [])
        ]);
        
        setStats({
          complaints: Array.isArray(complaints) ? complaints : [],
          payments: kpis,
          recentPayments: Array.isArray(allPayments) ? allPayments : [],
          isLoading: false
        });
      } catch (err) {
        console.error('Failed to load admin dashboard', err);
        setStats(s => ({ ...s, isLoading: false }));
      }
    })();
  }, []);

  // 1. Complaint Categories aggregation
  const categoryCounts = useMemo(() => {
    const counts = {};
    stats.complaints.forEach(c => {
      const cat = c.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [stats.complaints]);

  // 2. Complaint Status aggregation
  const statusCounts = useMemo(() => {
    let resolved = 0;
    let inProgress = 0;
    let submitted = 0;

    stats.complaints.forEach(c => {
      const s = normalizeStatus(c.status);
      if (s === STATUS.RESOLVED) resolved++;
      else if (s === STATUS.IN_PROGRESS || s === STATUS.DISPATCHED) inProgress++;
      else submitted++;
    });

    return { resolved, inProgress, submitted };
  }, [stats.complaints]);

  // 3. Payment Revenue by Category aggregation
  const paymentRevenueByCategory = useMemo(() => {
    const map = {};
    stats.recentPayments.forEach(p => {
      const cat = p.category || 'Taxes';
      map[cat] = (map[cat] || 0) + Number(p.amount || 0);
    });
    return map;
  }, [stats.recentPayments]);

  if (stats.isLoading) {
    return (
      <div className="p-16 text-center text-slate-500 font-medium animate-pulse">
        Loading analytics dashboard...
      </div>
    );
  }

  const activeComplaints = stats.complaints.filter(c => {
    const s = normalizeStatus(c.status);
    return s !== STATUS.RESOLVED && s !== STATUS.REJECTED && s !== STATUS.CLOSED;
  }).length;

  const totalComplaints = stats.complaints.length;
  const resolutionRate = totalComplaints > 0 
    ? Math.round((statusCounts.resolved / totalComplaints) * 100) 
    : 0;

  // Chart 1: Bar Chart (Complaints by Department / Category)
  const categoryLabels = Object.keys(categoryCounts);
  const categoryValues = Object.values(categoryCounts);
  const barChartData = {
    labels: categoryLabels.length ? categoryLabels : ['Electrical', 'Drainage', 'Waste', 'Roads'],
    datasets: [{
      label: 'Complaints',
      data: categoryValues.length ? categoryValues : [0, 0, 0, 0],
      backgroundColor: [
        '#16324F', // Navy
        '#0284c7', // Sky
        '#f59e0b', // Amber
        '#10b981', // Emerald
        '#8b5cf6', // Violet
        '#ec4899', // Pink
      ],
      borderRadius: 8,
      borderSkipped: false,
      maxBarThickness: 42
    }]
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#16324F',
        padding: 10,
        cornerRadius: 8,
        titleFont: { size: 12, weight: 'bold' },
        callbacks: {
          label: (context) => ` ${context.raw} complaint${context.raw === 1 ? '' : 's'}`
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#64748b', font: { size: 11 } },
        grid: { color: '#f1f5f9' }
      },
      x: {
        ticks: { color: '#475569', font: { size: 11, weight: 'bold' } },
        grid: { display: false }
      }
    }
  };

  // Chart 2: Donut Chart (Resolution Status or Revenue)
  const statusDoughnutData = {
    labels: ['Resolved', 'In Progress', 'Submitted / Open'],
    datasets: [{
      data: [statusCounts.resolved, statusCounts.inProgress, statusCounts.submitted],
      backgroundColor: ['#10b981', '#f59e0b', '#3b82f6'],
      hoverBackgroundColor: ['#059669', '#d97706', '#2563eb'],
      borderWidth: 3,
      borderColor: '#ffffff'
    }]
  };

  const revenueCategories = Object.keys(paymentRevenueByCategory);
  const revenueValues = Object.values(paymentRevenueByCategory);
  const revenueDoughnutData = {
    labels: revenueCategories.length ? revenueCategories : ['Taxes', 'Licenses', 'Utilities'],
    datasets: [{
      data: revenueValues.length ? revenueValues : [0, 0, 0],
      backgroundColor: ['#16324F', '#0284c7', '#10b981', '#f59e0b', '#8b5cf6'],
      hoverBackgroundColor: ['#0f2236', '#0369a1', '#059669', '#d97706', '#7c3aed'],
      borderWidth: 3,
      borderColor: '#ffffff'
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12, padding: 14, font: { size: 11, weight: '600' }, color: '#475569' }
      },
      tooltip: {
        backgroundColor: '#16324F',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            if (donutView === 'revenue') {
              return ` ${context.label}: ${formatCurrency(context.raw)}`;
            }
            return ` ${context.label}: ${context.raw} tickets`;
          }
        }
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-kmc-navy to-[#1E4268] rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-serif font-bold text-kmc-gold mb-2">Welcome to KMC Admin Console</h1>
          <p className="text-slate-300 max-w-2xl">Manage complaints, monitor treasury collections, and oversee municipal operations all from one unified dashboard.</p>
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
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">Active Complaints</p>
        </button>

        <button onClick={() => setActiveTab('complaints')} className="card-gov p-5 text-left border-l-4 border-l-emerald-500 hover:-translate-y-1 transition-transform group">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-5 h-5"/></div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition" />
          </div>
          <p className="text-3xl font-black text-kmc-navy">{statusCounts.resolved}</p>
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

      {/* ANALYTICS & GRAPHS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Chart: Complaints by Department/Category (3 cols) */}
        <div className="lg:col-span-3 card-gov p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-kmc-blue flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-kmc-navy text-base leading-tight">Complaints by Category</h2>
                  <p className="text-xs text-slate-500">Distribution across municipal divisions</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                {totalComplaints} Total Reports
              </span>
            </div>

            <div className="h-64 relative">
              <Bar data={barChartData} options={barOptions} />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Highest reports: <strong className="text-kmc-navy">{categoryLabels[0] || 'N/A'}</strong></span>
            <button onClick={() => setActiveTab('complaints')} className="text-kmc-blue font-bold hover:underline">
              View Grievance Queue →
            </button>
          </div>
        </div>

        {/* Right Chart: Resolution Status / Revenue Donut (2 cols) */}
        <div className="lg:col-span-2 card-gov p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <PieChart className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-kmc-navy text-base leading-tight">
                    {donutView === 'status' ? 'Resolution Status' : 'Revenue by Service'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {donutView === 'status' ? `${resolutionRate}% resolved successfully` : 'Treasury collection distribution'}
                  </p>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                <button
                  onClick={() => setDonutView('status')}
                  className={`px-2 py-1 rounded-md transition ${
                    donutView === 'status' ? 'bg-white text-kmc-navy shadow-xs' : 'text-slate-500 hover:text-kmc-navy'
                  }`}
                >
                  Status
                </button>
                <button
                  onClick={() => setDonutView('revenue')}
                  className={`px-2 py-1 rounded-md transition ${
                    donutView === 'revenue' ? 'bg-white text-kmc-navy shadow-xs' : 'text-slate-500 hover:text-kmc-navy'
                  }`}
                >
                  Revenue
                </button>
              </div>
            </div>

            <div className="h-64 relative flex items-center justify-center">
              <Doughnut 
                data={donutView === 'status' ? statusDoughnutData : revenueDoughnutData} 
                options={doughnutOptions} 
              />
              {/* Centered Stat Badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-8 pointer-events-none text-center">
                {donutView === 'status' ? (
                  <>
                    <p className="text-2xl font-black text-kmc-navy">{resolutionRate}%</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resolved</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-black text-kmc-navy">{revenueCategories.length}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Services</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            {donutView === 'status' ? (
              <span>Active: <strong className="text-amber-600">{activeComplaints} tickets</strong></span>
            ) : (
              <span>Total: <strong className="text-kmc-navy">{formatCurrency(stats.payments?.totalRevenue || 0)}</strong></span>
            )}
            <button 
              onClick={() => setActiveTab(donutView === 'status' ? 'complaints' : 'payments')} 
              className="text-kmc-blue font-bold hover:underline"
            >
              Details →
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Complaints */}
        <div className="card-gov p-6">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-kmc-blue" />
              <h2 className="font-bold text-kmc-navy">Recent Complaints</h2>
            </div>
            <button 
              onClick={() => setActiveTab('complaints')} 
              className="text-xs font-bold text-kmc-blue hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-4">
            {stats.complaints.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recent complaints.</p>
            ) : (
              stats.complaints.slice(0, 4).map(c => (
                <div key={c.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0">
                  <div>
                    <p className="font-bold text-kmc-navy truncate w-48">{c.title}</p>
                    <p className="text-xs text-slate-500 font-mono">{c.ticketCode} • {c.location || 'Kalmunai'}</p>
                  </div>
                  <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                    {c.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Recent Payments */}
        <div className="card-gov p-6">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-kmc-navy">Recent Payments</h2>
            </div>
            <button 
              onClick={() => setActiveTab('payments')} 
              className="text-xs font-bold text-kmc-blue hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-4">
            {stats.recentPayments.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No recent payment transactions.</p>
            ) : (
              stats.recentPayments.slice(0, 4).map(p => {
                const totalAmount = Number(p.amount || 0);
                const isPaid = (p.status || '').toUpperCase() === 'PAID' || Number(p.amountPaid || 0) >= totalAmount;
                const isPendingVerification = (p.status || '').toUpperCase() === 'PENDING_VERIFICATION';

                return (
                  <div key={p.id} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0">
                    <div>
                      <p className="font-bold text-kmc-navy truncate w-48">{p.service || 'Assessment Tax'}</p>
                      <p className="text-xs text-slate-500 font-mono">{p.billCode} • {p.assessmentNo || 'Account'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-kmc-navy text-xs">{formatCurrency(totalAmount)}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        isPaid ? 'bg-emerald-50 text-emerald-700' :
                        isPendingVerification ? 'bg-purple-50 text-purple-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {p.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}