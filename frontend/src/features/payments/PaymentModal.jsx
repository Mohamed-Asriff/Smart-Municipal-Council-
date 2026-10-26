import React, { useState, useEffect } from 'react';
import { 
  X, CreditCard, CheckCircle2, Download, 
  Landmark, AlertTriangle, QrCode, ChevronRight, Loader2, Upload
} from 'lucide-react';
import { api } from '../../api';
import { formatCurrency } from '../../utils/formatters';

export default function PaymentModal({ isOpen, onClose, prefillBill, onPaymentSuccess }) {
  const [method, setMethod] = useState('card');
  const [payAmount, setPayAmount] = useState('');
  const [slipBase64, setSlipBase64] = useState(null); // Base64 string state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && prefillBill) {
      setMethod('card');
      setPayAmount(prefillBill.amount); 
      setSlipBase64(null);
      setIsProcessing(false);
      setIsSuccess(false);
      setReceipt(null);
      setError('');
    }
  }, [isOpen, prefillBill]);

  if (!isOpen || !prefillBill) return null;

  const isPartial = Number(payAmount) < Number(prefillBill.amount);

  // Convert uploaded file to Base64
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSlipBase64(reader.result); // e.g. "data:image/jpeg;base64,..."
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePay = async (e) => {
    e.preventDefault();
    if (Number(payAmount) <= 0 || Number(payAmount) > Number(prefillBill.amount)) {
      return setError('Please enter a valid amount between 1 and the total due.');
    }
    if (method === 'bank' && !slipBase64) {
      return setError('Please upload your bank deposit slip.');
    }

    setIsProcessing(true);
    setError('');

    setTimeout(async () => {
      try {
        const payload = {
          paymentId: prefillBill.id,
          assessmentNo: prefillBill.assessmentNo,
          service: prefillBill.service,
          amount: Number(payAmount),
          payerName: 'Citizen',
          paymentMethod: method === 'card' ? 'Visa/Mastercard' : method === 'qr' ? 'LankaQR' : 'Bank Transfer'
        };

        let res;
        if (method === 'bank') {
          payload.slipData = slipBase64; // Attach Base64 string
          res = await api.submitManualPayment(payload);
        } else {
          res = await api.submitPayment(payload);
        }
        
        setReceipt(res);
        setIsSuccess(true);
        if (onPaymentSuccess) onPaymentSuccess();
      } catch (err) {
        setError(err.message || 'Payment failed. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }, 1500);
  };

  const handleDownload = () => {
    const content = `
KALMUNAI MUNICIPAL COUNCIL
OFFICIAL PAYMENT RECEIPT
----------------------------------------
Receipt No : ${receipt?.receiptNo || 'REC-PENDING'}
Date       : ${new Date().toLocaleString()}
Account    : ${prefillBill.assessmentNo}
Service    : ${prefillBill.service}
----------------------------------------
TOTAL BILL : LKR ${Number(prefillBill.amount).toLocaleString()}
AMOUNT PAID: LKR ${Number(payAmount).toLocaleString()}
STATUS     : ${method === 'bank' ? 'PENDING ADMIN VERIFICATION' : 'PAID'}
----------------------------------------
Thank you for your payment.
    `;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KMC_Receipt_${prefillBill.assessmentNo}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-kmc-navy/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col md:flex-row max-h-[90vh]">
        
        {/* LEFT SIDE: SUMMARY */}
        <div className="w-full md:w-5/12 bg-slate-50 p-6 sm:p-8 flex flex-col border-b md:border-b-0 md:border-r border-slate-200">
          <div className="flex items-center gap-2 text-kmc-navy mb-6">
            <Landmark className="w-6 h-6 text-kmc-gold" />
            <h2 className="font-serif font-bold text-xl">KMC Treasury</h2>
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Service</p>
              <p className="font-bold text-kmc-navy">{prefillBill.service}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Account Ref</p>
              <p className="font-mono text-sm text-slate-700">{prefillBill.assessmentNo}</p>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total Due</p>
            <p className="text-3xl font-black text-kmc-navy">{formatCurrency(prefillBill.amount)}</p>
          </div>
        </div>

        {/* RIGHT SIDE: PAYMENT GATEWAY */}
        <div className="w-full md:w-7/12 flex flex-col relative bg-white">
          <button onClick={onClose} className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-700 bg-white/80 rounded-full p-1 backdrop-blur">
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 sm:p-8 flex-1 overflow-y-auto custom-scrollbar">
            {!isSuccess ? (
              <form onSubmit={handlePay} className="space-y-6">
                
                <div>
                  <label className="block text-sm font-bold text-kmc-navy mb-2">Amount to Pay (LKR)</label>
                  <input 
                    type="number" 
                    value={payAmount} 
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full text-2xl font-black text-kmc-navy bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:border-kmc-blue"
                    max={prefillBill.amount - (prefillBill.amountPaid || 0)}
                    min="1"
                  />
                  {isPartial && (
                    <p className="text-xs text-amber-600 mt-1 font-medium">
                      Note: This is a partial payment. Remaining balance will be LKR {(prefillBill.amount - payAmount).toLocaleString()}.
                    </p>
                  )}
                </div>

                <div className="h-px bg-slate-100"></div>

                <div>
                  <h3 className="text-sm font-bold text-kmc-navy mb-3">Select Payment Method</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <button type="button" onClick={() => setMethod('card')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition ${method === 'card' ? 'border-kmc-blue bg-blue-50 text-kmc-blue' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                      <CreditCard className="w-6 h-6" /> <span className="text-[10px] font-bold">Card</span>
                    </button>
                    <button type="button" onClick={() => setMethod('qr')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition ${method === 'qr' ? 'border-kmc-blue bg-blue-50 text-kmc-blue' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                      <QrCode className="w-6 h-6" /> <span className="text-[10px] font-bold">LankaQR</span>
                    </button>
                    <button type="button" onClick={() => setMethod('bank')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition ${method === 'bank' ? 'border-kmc-blue bg-blue-50 text-kmc-blue' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                      <Landmark className="w-6 h-6" /> <span className="text-[10px] font-bold">Bank Slip</span>
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-sm text-red-700">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> <p>{error}</p>
                  </div>
                )}

                {method === 'card' && (
                  <div className="space-y-3 animate-in fade-in">
                    <input type="text" placeholder="Card Number" className="input-gov font-mono" required />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="MM/YY" className="input-gov font-mono" required />
                      <input type="password" placeholder="CVC" className="input-gov font-mono" required />
                    </div>
                  </div>
                )}

                {method === 'qr' && (
                  <div className="flex flex-col items-center py-4 bg-slate-50 rounded-xl border border-slate-200">
                    <QrCode className="w-24 h-24 text-kmc-navy mb-2" />
                    <p className="text-xs font-bold text-kmc-navy">Scan with Banking App</p>
                  </div>
                )}

                {method === 'bank' && (
                  <div className="space-y-4 animate-in fade-in">
                    <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <p className="font-bold text-kmc-navy mb-2">Bank Deposit Instructions:</p>
                      <div className="flex justify-between"><span className="text-slate-500">Bank:</span><span className="font-semibold">Bank of Ceylon</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Account Name:</span><span className="font-semibold">Kalmunai Municipal Council</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Account No:</span><span className="font-mono font-bold">0001234567</span></div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Upload Deposit Slip (Required)</label>
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-4 cursor-pointer hover:bg-slate-50 hover:border-kmc-blue transition">
                        <Upload className="w-6 h-6 text-slate-400 mb-2" />
                        <span className="text-xs text-slate-500 font-medium">
                          {slipBase64 ? 'Image attached ✓' : 'Click to upload JPG/PNG'}
                        </span>
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      </label>
                    </div>
                  </div>
                )}

                <button type="submit" disabled={isProcessing} className="btn-gold w-full py-3.5 text-base shadow-lg flex items-center justify-center gap-2">
                  {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</> : <>Pay {formatCurrency(payAmount)} <ChevronRight className="w-5 h-5" /></>}
                </button>
              </form>
            ) : (
              /* SUCCESS SCREEN */
              <div className="text-center space-y-6 animate-in zoom-in-95 py-4">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-inner ${method === 'bank' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                  {method === 'bank' ? <AlertTriangle className="w-10 h-10" /> : <CheckCircle2 className="w-10 h-10" />}
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-kmc-navy">
                    {method === 'bank' ? 'Verification Pending' : 'Payment Successful'}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-xs mx-auto">
                    {method === 'bank' 
                      ? 'Your deposit slip has been uploaded. The Treasury will verify it within 24 hours.' 
                      : 'Your municipal dues have been settled successfully.'}
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm space-y-3 text-left">
                  <div className="flex justify-between border-b border-slate-200 pb-3">
                    <span className="text-slate-500">Receipt No:</span>
                    <span className="font-mono font-bold text-kmc-blue">{receipt?.receiptNo || 'PENDING'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Amount Paid:</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(payAmount)}</span>
                  </div>
                  {isPartial && (
                    <div className="flex justify-between text-amber-600">
                      <span className="font-bold">Remaining Balance:</span>
                      <span className="font-bold">{formatCurrency(prefillBill.amount - payAmount)}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={handleDownload} className="btn-gov-outline flex-1 py-3 text-sm shadow-none">
                    <Download className="w-4 h-4" /> Download Receipt
                  </button>
                  <button onClick={onClose} className="btn-gov flex-1 py-3 text-sm">Done</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}