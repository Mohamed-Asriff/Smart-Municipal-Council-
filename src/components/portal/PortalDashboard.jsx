import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle2, 
  CreditCard, 
  FileText, 
  PlusCircle, 
  ArrowUpRight, 
  Bell, 
  ShieldCheck,
  Building2,
  Calendar
} from 'lucide-react';

export default function PortalDashboard({ 
  user, 
  complaints, 
  payments, 
  notices, 
  onNavigate, 
  onOpenReport, 
  onOpenPayment 
}) {
  const pendingComplaints = complaints.filter(c => c.status !== 'Resolved');
  const resolvedComplaints = complaints.filter(c => c.status === 'Resolved');
  const pendingBills = payments.filter(p => p.status === 'Pending');
  const totalDue = pendingBills.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-red-950 border border-zinc-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Kalmunai Municipal Council Citizen Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-red-500">{user.name}</span>
            </h1>
            <p className="text-zinc-400 text-sm max-w-xl">
              Citizen ID: <strong className="text-zinc-200 font-mono">{user.nic}</strong> | Ward: <span className="text-zinc-300 font-medium">{user.zone}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenReport}
              className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-red-950/60 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>File Complaint</span>
            </button>
            <button
              onClick={() => onNavigate('payments')}
              className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl border border-zinc-700 transition"
            >
              <CreditCard className="w-4 h-4 text-red-400" />
              <span>Pay Taxes</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4 hover:border-red-600/50 transition">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Active Issues</p>
            <h4 className="text-2xl font-black text-white">{pendingComplaints.length}</h4>
            <p className="text-xs text-zinc-400">In review / progress</p>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4 hover:border-red-600/50 transition">
          <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-600/30 text-red-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Resolved</p>
            <h4 className="text-2xl font-black text-white">{resolvedComplaints.length}</h4>
            <p className="text-xs text-red-400 font-medium">100% completion rate</p>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4 hover:border-red-600/50 transition">
          <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-600/30 text-white flex items-center justify-center shrink-0">
            <CreditCard className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Taxes & Dues</p>
            <h4 className="text-2xl font-black text-white">LKR {totalDue.toLocaleString()}</h4>
            <p className="text-xs text-zinc-300 font-medium">{pendingBills.length} invoices pending</p>
          </div>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 p-5 rounded-2xl flex items-center gap-4 hover:border-red-600/50 transition">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Assessment No</p>
            <h4 className="text-base font-bold text-white font-mono truncate">{user.assessmentNo}</h4>
            <p className="text-xs text-zinc-300 font-medium">Linked & Verified</p>
          </div>
        </div>
      </div>

      {/* Main Split: Recent Complaints & Pending Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Tracked Issues (2 cols) */}
        <div className="lg:col-span-2 bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-lg text-white">My Reported Issues</h3>
              </div>
              <button
                onClick={() => onNavigate('complaints')}
                className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 transition"
              >
                <span>View All ({complaints.length})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-zinc-800/60 mt-2">
              {complaints.slice(0, 3).map((item) => (
                <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800/40">
                        {item.id}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        item.status === 'Resolved' 
                          ? 'bg-red-600/20 text-white border border-red-500/40'
                          : item.status === 'In Progress'
                          ? 'bg-red-950 text-red-300 border border-red-800/60'
                          : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-xs text-zinc-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {item.date}
                      </span>
                    </div>
                    <p className="font-semibold text-sm text-zinc-200 group-hover:text-white transition">
                      {item.title}
                    </p>
                    <p className="text-xs text-zinc-400">
                      Assigned to: <strong className="text-zinc-300">{item.officer || item.department}</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigate('complaints')}
                    className="self-start sm:self-center text-xs font-semibold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg border border-zinc-700 transition"
                  >
                    View Status
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-zinc-800/60 flex items-center justify-between">
            <span className="text-xs text-zinc-400">Want to report another civil or utility concern?</span>
            <button
              onClick={onOpenReport}
              className="text-xs font-bold text-red-400 hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report New</span>
            </button>
          </div>
        </div>

        {/* Pending Invoices / Quick Pay (1 col) */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-lg text-white">Upcoming Dues</h3>
              </div>
              <button
                onClick={() => onNavigate('payments')}
                className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 transition"
              >
                <span>All Bills</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {pendingBills.length > 0 ? (
                pendingBills.map((bill) => (
                  <div key={bill.id} className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 hover:border-zinc-700 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-white">{bill.service}</p>
                        <p className="text-[11px] text-zinc-400">{bill.billingPeriod}</p>
                      </div>
                      <span className="text-sm font-extrabold text-white">
                        LKR {bill.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800 text-xs">
                      <span className="text-red-400 text-[11px] font-medium">Due: {bill.dueDate}</span>
                      <button
                        onClick={() => onOpenPayment && onOpenPayment(bill)}
                        className="bg-red-600 hover:bg-red-500 text-white font-bold px-2.5 py-1 rounded-lg text-xs transition"
                      >
                        Pay Online
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-zinc-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  All taxes & council fees are up to date!
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800 mt-4">
            <div className="flex justify-between text-xs text-zinc-400 mb-2">
              <span>Total Payable</span>
              <strong className="text-white font-bold">LKR {totalDue.toLocaleString()}</strong>
            </div>
            <p className="text-[11px] text-zinc-500">
              Official electronic receipts with digital council stamps are generated immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Council Public Notices for Citizen's Ward */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-red-500" />
          <h3 className="font-bold text-lg text-white">Ward & Municipal Council Notices</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {notices.map((n) => (
            <div key={n.id} className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700 transition space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-red-400 font-semibold">{n.type}</span>
                <span className="text-zinc-500 text-[11px]">{n.date}</span>
              </div>
              <h5 className="font-bold text-sm text-zinc-100">{n.title}</h5>
              <p className="text-xs text-zinc-400 line-clamp-2">{n.summary}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
