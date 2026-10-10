import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Download, 
  Printer, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  Receipt,
  X
} from 'lucide-react';

export default function PortalPayments({ 
  payments, 
  user, 
  onPayBill 
}) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [receiptModal, setReceiptModal] = useState(null);

  const pendingBills = payments.filter(p => p.status === 'Pending');
  const paidBills = payments.filter(p => p.status === 'Paid');
  const totalOutstanding = pendingBills.reduce((sum, item) => sum + item.amount, 0);

  const filteredBills = payments.filter(p => {
    if (activeTab === 'ALL') return true;
    return p.status.toLowerCase() === activeTab.toLowerCase();
  });

  const handleOpenReceipt = (bill) => {
    setReceiptModal(bill);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Payments Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-6 rounded-3xl">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>Outstanding Assessment & Fees</span>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <h3 className="text-3xl font-black text-white">
            LKR {totalOutstanding.toLocaleString()}
          </h3>
          <p className="text-xs text-red-400 mt-2 font-medium">
            {pendingBills.length} pending bill(s) awaiting payment
          </p>
        </div>

        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-6 rounded-3xl">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>Registered Assessment Unit</span>
            <ShieldCheck className="w-4 h-4 text-red-500" />
          </div>
          <h3 className="text-xl font-bold font-mono text-white truncate">
            {user.assessmentNo}
          </h3>
          <p className="text-xs text-zinc-400 mt-2">
            Ward: {user.zone}
          </p>
        </div>

        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 p-6 rounded-3xl">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>Official Digital Receipts</span>
            <Receipt className="w-4 h-4 text-red-500" />
          </div>
          <h3 className="text-3xl font-black text-white">
            {paidBills.length}
          </h3>
          <p className="text-xs text-zinc-300 mt-2 font-medium">
            100% LankaPay & Gov certified transactions
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          {['ALL', 'Pending', 'Paid'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === tab
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {tab === 'ALL' ? `All Invoices (${payments.length})` : tab === 'Pending' ? `Pending (${pendingBills.length})` : `Paid Receipts (${paidBills.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-3">
        {filteredBills.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 text-center text-zinc-500 text-sm">
            No bills found in this category.
          </div>
        ) : (
          filteredBills.map((bill) => {
            const isPending = bill.status === 'Pending';
            return (
              <div
                key={bill.id}
                className="bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isPending 
                      ? 'bg-red-600/10 text-red-400 border border-red-600/20' 
                      : 'bg-white/10 text-white border border-white/20'
                  }`}>
                    {isPending ? <Clock className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6 text-red-500" />}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-base text-white">{bill.service}</h4>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isPending 
                          ? 'bg-red-950 text-red-300 border border-red-800/50' 
                          : 'bg-red-600/20 text-white border border-red-500/40'
                      }`}>
                        {bill.status}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-400">
                      Ref: <span className="font-mono text-zinc-300">{bill.assessmentNo}</span> | Period: <strong className="text-zinc-200">{bill.billingPeriod}</strong>
                    </p>

                    <p className="text-xs text-zinc-500">
                      {isPending ? `Payment Due By: ${bill.dueDate}` : `Paid on: ${bill.paidAt || '2026'} | Receipt: ${bill.receiptNo}`}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                  <span className="text-xl font-extrabold text-white">
                    LKR {bill.amount.toLocaleString()}
                  </span>

                  {isPending ? (
                    <button
                      onClick={() => onPayBill(bill)}
                      className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-red-950/50 transition active:scale-95 flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Pay Now</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenReceipt(bill)}
                      className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-zinc-700 transition flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>View Receipt</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Official Receipt Modal */}
      {receiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-zinc-950 text-white rounded-3xl max-w-md w-full border border-zinc-800 shadow-2xl overflow-hidden relative">
            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-800 bg-black">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-red-500" />
                <h4 className="font-bold text-sm text-white">Official Council E-Receipt</h4>
              </div>
              <button
                onClick={() => setReceiptModal(null)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg bg-zinc-900 border border-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-sans">
              <div className="text-center pb-3 border-b border-zinc-800">
                <p className="font-extrabold text-sm text-white uppercase tracking-wider">
                  Kalmunai Municipal Council
                </p>
                <p className="text-[11px] text-zinc-400">Government of Sri Lanka - Eastern Province</p>
                <p className="text-red-400 font-bold mt-1 text-xs">Payment Verification: SUCCESSFUL</p>
              </div>

              <div className="space-y-2 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/80">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Receipt No:</span>
                  <span className="font-mono font-bold text-white">{receiptModal.receiptNo || 'REC-KMC-994201'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Date & Time:</span>
                  <span className="text-zinc-200">{receiptModal.paidAt || new Date().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Citizen Name:</span>
                  <span className="text-zinc-200 font-semibold">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Assessment / Account:</span>
                  <span className="font-mono text-zinc-200">{receiptModal.assessmentNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Service Category:</span>
                  <span className="text-zinc-200">{receiptModal.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Billing Period:</span>
                  <span className="text-zinc-200">{receiptModal.billingPeriod}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-zinc-800 text-sm font-bold">
                  <span className="text-white">Amount Paid:</span>
                  <span className="text-white">LKR {receiptModal.amount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => alert('Printing official e-receipt...')}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2.5 rounded-xl border border-zinc-700 flex items-center justify-center gap-2 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => alert('Receipt downloaded as PDF (Verified digital signature)')}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
