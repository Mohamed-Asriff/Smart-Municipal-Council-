import React, { useState, useEffect } from 'react';
import { 
  Search, Plus, X, Loader2, Landmark, Image as ImageIcon, Check, XCircle, CheckCircle2
} from 'lucide-react';
import { api } from '../../api';
import { formatCurrency } from '../../utils/formatters';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSlip, setSelectedSlip] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [form, setForm] = useState({
    assessmentNo: '', service: 'Property Assessment Tax', amount: '', billingPeriod: 'Q4 2026', dueDate: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [paymentsData, kpiData] = await Promise.all([
        api.adminGetAllPayments(),
        api.adminGetPaymentKpis()
      ]);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);
      setKpis(kpiData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleIssueBill = async (e) => {
    e.preventDefault();
    setIsIssuing(true);
    try {
      await api.adminIssueBill({ ...form, amount: parseFloat(form.amount), category: 'Taxes' });
      setIsModalOpen(false);
      setForm({ assessmentNo: '', service: 'Property Assessment Tax', amount: '', billingPeriod: 'Q4 2026', dueDate: '' });
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to issue bill');
    } finally {
      setIsIssuing(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm("Approve this payment?")) return;
    try {
      await api.adminUpdatePaymentStatus(id, 'Paid');
      fetchData();
    } catch (err) { 
      alert('Failed to approve: ' + err.message); 
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this slip?")) return;
    try {
      await api.adminUpdatePaymentStatus(id, 'Pending');
      fetchData();
    } catch (err) { 
      alert('Failed to reject: ' + err.message); 
    }
  };

  const handleViewSlip = (slipData) => {
    if (!slipData) {
      alert("No slip data found for this payment.");
      return;
    }
    setSelectedSlip(slipData);
  };

  const filteredPayments = payments.filter(p => 
    p.assessmentNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.billCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col animate-in fade-in duration-300">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-serif font-bold text-kmc-navy">Treasury & Revenue</h1>
          <p className="text-sm text-slate-500 mt-1">Manage bills, verify deposits, and track revenue.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input type="text" placeholder="Search Bill..." className="input-gov pl-9 py-2.5 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto btn-gold py-2.5 px-4 text-sm shadow-md flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Issue New Bill
          </button>
        </div>
      </div>

      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 shrink-0">
          <div className="card-gov p-5 border-l-4 border-l-emerald-500">
            <p className="text-xs font-bold text-slate-500 uppercase">Total Revenue</p>
            <p className="text-2xl font-black text-kmc-navy">{formatCurrency(kpis.totalRevenue)}</p>
          </div>
          <div className="card-gov p-5 border-l-4 border-l-amber-500">
            <p className="text-xs font-bold text-slate-500 uppercase">Pending Collections</p>
            <p className="text-2xl font-black text-kmc-navy">{formatCurrency(kpis.pendingCollections)}</p>
          </div>
          <div className="card-gov p-5 border-l-4 border-l-kmc-blue">
             <p className="text-xs font-bold text-slate-500 uppercase">Awaiting Approval</p>
             <p className="text-2xl font-black text-kmc-navy">{payments.filter(p => p.status === 'PENDING_VERIFICATION').length}</p>
          </div>
        </div>
      )}

      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs sticky top-0 border-b border-slate-200 z-10">
              <tr>
                <th className="p-4">Bill Code</th>
                <th className="p-4">Service</th>
                <th className="p-4">Amount / Paid</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Required Action</th>
              </tr>
            </thead>
                        <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p) => {
                const totalAmount = Number(p.amount || 0);
                const paidAmount = Number(p.amountPaid || 0);
                const remaining = totalAmount - paidAmount;
                
                const isFullyPaid = remaining <= 0;
                const isPendingVerification = p.status === 'PENDING_VERIFICATION';
                const isUnpaid = !isFullyPaid && !isPendingVerification && paidAmount === 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-mono text-xs font-bold text-kmc-blue">
                      {p.billCode}<br/><span className="text-[10px] text-slate-400">{p.assessmentNo}</span>
                    </td>
                    <td className="p-4 font-medium text-kmc-navy">{p.service}</td>
                    <td className="p-4">
                      <p className="font-bold">{formatCurrency(totalAmount)}</p>
                      {paidAmount > 0 && remaining > 0 && (
                        <p className="text-[10px] font-bold text-amber-600 mt-0.5">
                          Paid: {formatCurrency(paidAmount)}
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      {/* FIXED BADGE ORDER */}
                      <span className={`badge-gov text-[10px] ${
                        isPendingVerification ? 'badge-warning' : 
                        isFullyPaid ? 'badge-success' : 
                        isUnpaid ? 'badge-info' : 'badge-warning'
                      }`}>
                        {isPendingVerification ? 'Verify Slip' : 
                         isFullyPaid ? 'PAID' : 
                         isUnpaid ? 'PENDING' : 'PARTIALLY PAID'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {/* FIXED ACTION LOGIC */}
                      {isPendingVerification ? (
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleViewSlip(p.slipData)} className="text-kmc-blue bg-blue-50 px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1 hover:bg-blue-100 transition border border-blue-200">
                            <ImageIcon className="w-3.5 h-3.5" /> View Slip
                          </button>
                          <button onClick={() => handleApprove(p.id)} className="text-white bg-emerald-500 p-1.5 rounded-md hover:bg-emerald-600 transition shadow-sm" title="Approve">
                            <Check className="w-4 h-4"/>
                          </button>
                          <button onClick={() => handleReject(p.id)} className="text-white bg-red-500 p-1.5 rounded-md hover:bg-red-600 transition shadow-sm" title="Reject">
                            <XCircle className="w-4 h-4"/>
                          </button>
                        </div>
                      ) : isFullyPaid ? (
                         <span className="text-xs text-emerald-600 font-bold flex items-center justify-center gap-1"><CheckCircle2 className="w-4 h-4"/> Fully Paid</span>
                      ) : isUnpaid ? (
                        <span className="text-xs text-slate-400 italic">Awaiting Citizen Payment</span>
                      ) : (
                        <span className="text-xs text-amber-500 font-bold italic">Awaiting Remaining Payment</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Slip Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-kmc-navy/80 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedSlip(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-kmc-navy flex items-center gap-2"><ImageIcon className="w-4 h-4"/> Bank Deposit Slip</h3>
              <button onClick={() => setSelectedSlip(null)} className="text-slate-500 hover:text-red-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-2 bg-slate-200 flex justify-center items-center min-h-[400px]">
              <img 
                src={selectedSlip} 
                alt="Deposit Slip" 
                className="max-w-full max-h-[70vh] object-contain shadow-md bg-white border border-slate-300" 
                onError={(e) => {
                  e.target.onerror = null; 
                  e.target.src = 'https://via.placeholder.com/400x600?text=Image+Not+Found';
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Issue Bill Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-kmc-navy/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-kmc-navy p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2 text-white">
                <Landmark className="w-5 h-5 text-kmc-gold" />
                <h3 className="font-serif font-bold text-lg">Issue New Bill</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleIssueBill} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assessment / Account No</label>
                <input required type="text" className="input-gov" placeholder="e.g. KMC-TAX-2026-9041"
                  value={form.assessmentNo} onChange={e => setForm({...form, assessmentNo: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Type</label>
                <select className="input-gov" value={form.service} onChange={e => setForm({...form, service: e.target.value})}>
                  <option>Property Assessment Tax</option>
                  <option>Trade License Fee</option>
                  <option>Waste Management Fee</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount (LKR)</label>
                  <input required type="number" className="input-gov" placeholder="5000"
                    value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                  <input required type="date" className="input-gov"
                    value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
                </div>
              </div>
              
              <button type="submit" disabled={isIssuing} className="btn-gov w-full py-3 mt-2">
                {isIssuing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : 'Generate Invoice'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}